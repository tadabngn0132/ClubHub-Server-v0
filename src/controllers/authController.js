import { prisma } from "../libs/prisma.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  createRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  createAccessToken,
  createResetPasswordToken,
  verifyResetPasswordToken,
} from "../utils/jwtUtil.js";
import {
  sendResetPasswordEmail,
  sendChangePasswordConfirmationEmail,
} from "../utils/emailUtil.js";
import { createOAuthClient, roleBasedScopes } from "../libs/google.js";
import { upsertUserGoogleCredential } from "../services/userGoogleCredentialService.js";
import crypto from "crypto";
import { google } from "googleapis";
import {
  removeSensitiveUserData,
  hashedDefaultPassword,
  userIncludeSystemRoleOptions,
  userIncludeOptions,
} from "../utils/userUtil.js";
import {
  PROVIDER,
  ROLE,
  USER_STATUS,
  AVATAR_PROVIDERS,
} from "../utils/constant.js";
import { logSystemAction } from "../services/auditLogService.js";
import { BadRequestError } from "../utils/AppError.js";

const GOOGLE_SCOPE_UPGRADE_ATTEMPTED = "googleScopeUpgradeAttempted";
const GOOGLE_LINK_CONTEXT_KEY = "googleLinkContext";
const DEFAULT_GOOGLE_LINK_RETURN_PATH = "/member/setting";

const isSafeRelativePath = (value) => {
  return (
    typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//")
  );
};

const buildClientRedirectUrl = (path, params = {}) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const safePath = isSafeRelativePath(path)
    ? path
    : DEFAULT_GOOGLE_LINK_RETURN_PATH;
  const redirectUrl = new URL(safePath, clientUrl);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      redirectUrl.searchParams.set(key, String(value));
    }
  });

  return redirectUrl.toString();
};

const getScopeKeyBySystemRole = (systemRole) => {
  const normalizedRole = String(systemRole || ROLE.MEMBER).toUpperCase();

  if (normalizedRole === ROLE.ADMIN) {
    return "admin";
  }

  if (normalizedRole === ROLE.MODERATOR) {
    return "moderator";
  }

  return "member";
};

const splitScopeString = (scopeString = "") => {
  return scopeString
    .split(" ")
    .map((item) => item.trim())
    .filter(Boolean);
};

const hasAllScopes = (grantedScopeString, requiredScopes = []) => {
  const grantedScopes = new Set(splitScopeString(grantedScopeString));
  return requiredScopes.every((scope) => grantedScopes.has(scope));
};

const userRole = (user) => {
  const primaryPosition = user.userPosition?.find((up) => up.isPrimary);
  return primaryPosition?.position?.systemRole || null;
};

// Xử lý logic cơ chế cấp lại access token để duy trì đăng nhập
export const refreshAccessToken = async (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "No refresh token provided",
    });
  }

  try {
    const userId = await verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: userIncludeSystemRoleOptions,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.userPosition || user.userPosition.length === 0) {
      return res.status(403).json({
        success: false,
        message: "User does not have an assigned position",
      });
    }

    if (userRole(user) === null) {
      return res.status(403).json({
        success: false,
        message: "User does not have an assigned role. Please contact admin.",
      });
    }

    const newAccessToken = await createAccessToken(userId, userRole(user));

    res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
      data: {
        newAccessToken,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// Xử lý logic đăng nhập kiểm tra, xác thực email, mật khẩu, trả về thông tin và token
export const login = async (req, res, next) => {
  try {
    const { email, password, rememberMe, rememberForDays } = req.body;

    const storedUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!storedUser) {
      return res.status(401).json({
        success: false,
        message: "User with this email does not exist",
      });
    }

    if (storedUser.lockedUntil && storedUser.lockedUntil > new Date()) {
      return res.status(403).json({
        success: false,
        message: `Account is locked until ${storedUser.lockedUntil.toLocaleString()}`,
      });
    }

    const correctPassword = await bcrypt.compare(
      password,
      storedUser.hashedPassword,
    );

    if (!correctPassword) {
      const attempts = storedUser.failedLoginAttempts + 1;
      const lockoutThreshold = 5;
      const lockoutDuration = 30 * 60 * 1000; // 30 minutes

      await prisma.user.update({
        where: {
          id: storedUser.id,
        },
        data: {
          failedLoginAttempts: attempts,
          lockedUntil:
            attempts >= lockoutThreshold
              ? new Date(Date.now() + lockoutDuration)
              : null,
        },
      });

      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: storedUser.id,
      },
      data: {
        lastLogin: new Date(),
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
      include: userIncludeSystemRoleOptions,
    });

    if (userRole(updatedUser) === null) {
      return res.status(403).json({
        success: false,
        message: "User does not have an assigned role. Please contact admin.",
      });
    }

    const accessToken = await createAccessToken(
      updatedUser.id,
      userRole(updatedUser),
    );
    const refreshToken = await createRefreshToken(
      updatedUser.id,
      userRole(updatedUser),
    );

    const parsedRememberDays = Number(rememberForDays);
    const safeRememberDays = [1, 7, 30].includes(parsedRememberDays)
      ? parsedRememberDays
      : 7;
    const shouldRemember = Boolean(rememberMe);

    const refreshCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      ...(shouldRemember
        ? { maxAge: safeRememberDays * 24 * 60 * 60 * 1000 }
        : {}),
    };

    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    const necessaryUserData = removeSensitiveUserData(updatedUser);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        accessToken,
        necessaryUserData,
      },
    });

    void logSystemAction(updatedUser.id, "auth.login", {
      email: updatedUser.email,
      rememberMe: shouldRemember,
    });
  } catch (err) {
    return next(err);
  }
};

// Tạm thời giữ lại trong quá trình dev để test authController
// Khi nào test xong hoạt triển khai được phần CRUD cho user thì loại bỏ
export const register = async (req, res, next) => {
  try {
    const userData = req.body;

    // Check if user already exists
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const createdUser = await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          hashedPassword: hashedPassword,
          fullname: userData.fullname,
          phoneNumber: userData.phoneNumber,
          dateOfBirth: userData.dateOfBirth
            ? new Date(userData.dateOfBirth)
            : null,
          gender: userData.gender,
          major: userData.major,
          generation: Number(userData.generation),
          joinedAt: userData.joinedAt,
          status:
            userData.status.trim().toLowerCase() === "active"
              ? USER_STATUS.ACTIVE
              : USER_STATUS.INACTIVE,
          studentId: userData.studentId,
          avatarUrl: userData.avatarUrl,
          bio: userData.bio,
          rootDepartmentId: Number(userData.rootDepartmentId),
        },
      });

      await prisma.userPosition.create({
        data: {
          userId: user.id,
          positionId: Number(userData.positionId),
          isPrimary: true,
        },
      });

      return prisma.user.findUnique({
        where: { id: user.id },
        include: userIncludeOptions,
      });
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        createdUser,
      },
    });
  } catch (err) {
    return next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    // TODO: Add logout logic here
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      res.clearCookie("refreshToken");
      return res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    }

    try {
      const decodedToken = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
      );

      await revokeRefreshToken(decodedToken.jti);
    } catch (tokenError) {
      // Token hỏng/hết hạn thì vẫn coi như logout thành công phía client
      if (
        tokenError.name !== "JsonWebTokenError" &&
        tokenError.name !== "TokenExpiredError"
      ) {
        throw tokenError;
      }
    }

    res.clearCookie("refreshToken");

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });

    void logSystemAction(req.userId ?? null, "auth.logout", {
      hasRefreshToken: Boolean(refreshToken),
    });
  } catch (err) {
    return next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const storedUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!storedUser) {
      return res.status(404).json({
        success: false,
        message: "User with this email does not exist",
      });
    }

    // Generate a password reset token and send it via email
    const resetToken = await createResetPasswordToken(storedUser.id);

    // Send reset password email with reset token url
    await sendResetPasswordEmail(resetToken, email);

    res.status(200).json({
      success: true,
      message:
        "Password reset link sent. Please check your email to reset password",
    });

    void logSystemAction(storedUser.id, "auth.forgot_password", {
      email: storedUser.email,
    });
  } catch (err) {
    return next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    const { token, email } = req.query;

    const storedUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!storedUser) {
      return res.status(404).json({
        success: false,
        message: "User with this email does not exist",
      });
    }

    verifyResetPasswordToken(token, storedUser.id);

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: storedUser.id,
        },
        data: {
          hashedPassword: hashedNewPassword,
        },
      });

      await tx.resetPasswordToken.updateMany({
        where: {
          userId: storedUser.id,
          isUsed: false,
        },
        data: {
          isUsed: true,
          usedAt: new Date(),
        },
      });
    });

    res.status(200).json({
      success: true,
      message: "Reset password successfully",
    });

    await sendChangePasswordConfirmationEmail(storedUser.email).catch(
      console.error,
    );

    void logSystemAction(storedUser.id, "auth.reset_password", {
      email: storedUser.email,
    });
  } catch (err) {
    if (err.message === "Reset token is used or has expired") {
      return next(new BadRequestError(err.message));
    }

    return next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    // Verify current password
    const storedUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!storedUser) {
      return res.status(404).json({
        success: false,
        message: "User with this email does not exist",
      });
    }

    // Hash new password and update in database
    const correctPassword = await bcrypt.compare(
      currentPassword,
      storedUser.hashedPassword,
    );

    if (!correctPassword) {
      return res.status(401).json({
        success: false,
        message: "Current password is wrong",
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: {
        id: storedUser.id,
      },
      data: {
        hashedPassword: hashedNewPassword,
      },
    });

    await sendChangePasswordConfirmationEmail(storedUser.email);

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });

    void logSystemAction(storedUser.id, "auth.change_password", {
      email: storedUser.email,
    });
  } catch (err) {
    return next(err);
  }
};

export const googleAuth = async (req, res, next) => {
  try {
    // TODO: Implement Google authentication logic
    const state = crypto.randomBytes(32).toString("hex");
    const oauth2Client = createOAuthClient();

    req.session.state = state;

    const authorizationUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: roleBasedScopes.member,
      include_granted_scopes: true,
      state: state,
    });

    res.redirect(authorizationUrl);
  } catch (err) {
    return next(err);
  }
};

export const googleLinkStart = async (req, res, next) => {
  try {
    const state = crypto.randomBytes(32).toString("hex");
    const oauth2Client = createOAuthClient();
    const scopeKey = getScopeKeyBySystemRole(req.userRole);
    const requiredScopes = roleBasedScopes[scopeKey] || roleBasedScopes.member;
    const returnTo = isSafeRelativePath(req.body?.returnTo)
      ? req.body.returnTo
      : DEFAULT_GOOGLE_LINK_RETURN_PATH;

    req.session.state = state;
    req.session[GOOGLE_LINK_CONTEXT_KEY] = {
      userId: req.userId,
      role: req.userRole,
      returnTo,
    };

    req.session.save((saveError) => {
      if (saveError) {
        return next(saveError);
      }

      const authorizationUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        include_granted_scopes: true,
        prompt: "consent",
        scope: requiredScopes,
        state,
      });

      return res.status(200).json({
        success: true,
        message: "Google account linking started successfully",
        data: {
          authorizationUrl,
        },
      });
    });
  } catch (err) {
    return next(err);
  }
};

export const googleAuthCallback = async (req, res, next) => {
  const { code, state, error } = req.query;
  const googleLinkContext = req.session?.[GOOGLE_LINK_CONTEXT_KEY] || null;

  try {
    const oauth2Client = createOAuthClient();

    // TODO: Implement Google authentication callback logic
    // Handle the OAuth 2.0 server response
    if (error) {
      if (googleLinkContext) {
        return res.redirect(
          buildClientRedirectUrl(googleLinkContext.returnTo, {
            googleLink: "error",
            message: "Google access was denied",
          }),
        );
      }

      return res.status(400).json({
        success: false,
        message: "Access denied",
      });
    }

    if (state !== req.session.state) {
      if (googleLinkContext) {
        return res.redirect(
          buildClientRedirectUrl(googleLinkContext.returnTo, {
            googleLink: "error",
            message: "State mismatch",
          }),
        );
      }

      return res.status(400).json({
        success: false,
        message: "State mismatch",
      });
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      version: "v2",
      auth: oauth2Client,
    });

    const { data: userInfo } = await oauth2.userinfo.get();

    if (!userInfo.email.endsWith("@fpt.edu.vn")) {
      return res.redirect(
        `${process.env.CLIENT_URL}/auth/callback?success=false&message=${encodeURIComponent(
          "Only FPT email addresses are allowed",
        )}`,
      );
    }

    console.log("Google user info:", userInfo);

    const storedUser = await prisma.user.findFirst({
      where: {
        email: userInfo.email,
      },
    });

    if (!storedUser) {
      if (googleLinkContext) {
        return res.redirect(
          buildClientRedirectUrl(googleLinkContext.returnTo, {
            googleLink: "error",
            message: "Linked user account was not found",
          }),
        );
      }

      res.redirect(
        `${process.env.CLIENT_URL}/auth/callback?success=false&message=${encodeURIComponent(
          "No account associated with this email. Please contact admin to create an account for you.",
        )}`,
      );

      return;
    }

    if (googleLinkContext) {
      if (Number(googleLinkContext.userId) !== storedUser.id) {
        return res.redirect(
          buildClientRedirectUrl(googleLinkContext.returnTo, {
            googleLink: "error",
            message: "Google link session does not match the active user",
          }),
        );
      }

      if (storedUser.email !== userInfo.email) {
        return res.redirect(
          buildClientRedirectUrl(googleLinkContext.returnTo, {
            googleLink: "error",
            message: "The Google account email must match your portal email",
          }),
        );
      }

      const userScopeKey = getScopeKeyBySystemRole(
        googleLinkContext.role || userRole(storedUser),
      );
      const requiredScopes =
        roleBasedScopes[userScopeKey] || roleBasedScopes.member;
      const grantedScopeString = tokens.scope || "";
      const alreadyAttemptedScopeUpgrade = Boolean(
        req.session[GOOGLE_SCOPE_UPGRADE_ATTEMPTED],
      );

      if (
        !hasAllScopes(grantedScopeString, requiredScopes) &&
        !alreadyAttemptedScopeUpgrade
      ) {
        req.session[GOOGLE_SCOPE_UPGRADE_ATTEMPTED] = true;

        const reauthorizeState = crypto.randomBytes(32).toString("hex");
        req.session.state = reauthorizeState;

        const reauthorizeUrl = oauth2Client.generateAuthUrl({
          access_type: "offline",
          include_granted_scopes: true,
          prompt: "consent",
          scope: requiredScopes,
          state: reauthorizeState,
        });

        return res.redirect(reauthorizeUrl);
      }

      delete req.session[GOOGLE_SCOPE_UPGRADE_ATTEMPTED];

      try {
        const existingCredentialForOtherUser =
          await prisma.userGoogleCredential.findFirst({
            where: {
              googleId: userInfo.id,
              userId: {
                not: storedUser.id,
              },
            },
          });

        if (existingCredentialForOtherUser) {
          return res.redirect(
            buildClientRedirectUrl(googleLinkContext.returnTo, {
              googleLink: "error",
              message: "This Google account is already linked to another user",
            }),
          );
        }

        const scopeString = grantedScopeString || requiredScopes.join(" ");
        await upsertUserGoogleCredential(
          storedUser.id,
          userInfo.id,
          tokens,
          scopeString,
        );

        await prisma.user.update({
          where: {
            id: storedUser.id,
          },
          data: {
            provider: PROVIDER.BOTH,
          },
        });
      } catch (err) {
        const isMissingRefreshToken =
          err instanceof Error &&
          err.message.includes(
            "Google refresh_token is required for first-time credential creation",
          );

        if (isMissingRefreshToken && !alreadyAttemptedScopeUpgrade) {
          req.session[GOOGLE_SCOPE_UPGRADE_ATTEMPTED] = true;

          const reauthorizeState = crypto.randomBytes(32).toString("hex");
          req.session.state = reauthorizeState;

          const reauthorizeUrl = oauth2Client.generateAuthUrl({
            access_type: "offline",
            include_granted_scopes: true,
            prompt: "consent",
            scope: requiredScopes,
            state: reauthorizeState,
          });

          return res.redirect(reauthorizeUrl);
        }

        return res.redirect(
          buildClientRedirectUrl(googleLinkContext.returnTo, {
            googleLink: "error",
            message:
              isMissingRefreshToken && alreadyAttemptedScopeUpgrade
                ? "Google linking failed: missing refresh token"
                : err.message || "Google linking failed",
          }),
        );
      }

      delete req.session.state;
      delete req.session[GOOGLE_LINK_CONTEXT_KEY];

      return res.redirect(
        buildClientRedirectUrl(googleLinkContext.returnTo, {
          googleLink: "success",
          message: "Google account linked successfully",
        }),
      );
    }

    const existingGoogleCredential =
      await prisma.userGoogleCredential.findFirst({
        where: {
          userId: storedUser ? storedUser.id : undefined,
        },
      });

    let user;

    if (
      !existingGoogleCredential ||
      existingGoogleCredential.googleId !== userInfo.id
    ) {
      user = await prisma.user.update({
        where: {
          id: storedUser.id,
        },
        data: {
          fullname: storedUser.fullname || userInfo.name,
          hashedPassword: await hashedDefaultPassword(),
          locale: userInfo.locale,
          provider: PROVIDER.BOTH,
          firstName: userInfo.given_name,
          lastName: userInfo.family_name,
          isEmailVerified: userInfo.verified_email,
          avatarUrl:
            storedUser.avatarProvider !== AVATAR_PROVIDERS.CLOUDINARY
              ? userInfo.picture
              : storedUser.avatarUrl,
          avatarProvider:
            storedUser.avatarProvider !== AVATAR_PROVIDERS.CLOUDINARY
              ? AVATAR_PROVIDERS.GOOGLE
              : storedUser.avatarProvider,
          lastLogin: new Date(),
        },
        include: userIncludeSystemRoleOptions,
      });
    } else {
      user = await prisma.user.update({
        where: {
          id: storedUser.id,
        },
        data: {
          lastLogin: new Date(),
          provider: PROVIDER.BOTH,
        },
        include: userIncludeSystemRoleOptions,
      });
    }

    if (userRole(user) === null) {
      return res.status(403).json({
        success: false,
        message: "User does not have an assigned role",
      });
    }

    const userSystemRole = userRole(user);
    const scopeKey = getScopeKeyBySystemRole(userSystemRole);
    const requiredScopes = roleBasedScopes[scopeKey] || roleBasedScopes.member;
    const grantedScopeString = tokens.scope || "";
    const alreadyAttemptedScopeUpgrade = Boolean(
      req.session[GOOGLE_SCOPE_UPGRADE_ATTEMPTED],
    );

    if (
      !hasAllScopes(grantedScopeString, requiredScopes) &&
      !alreadyAttemptedScopeUpgrade
    ) {
      req.session[GOOGLE_SCOPE_UPGRADE_ATTEMPTED] = true;

      const reauthorizeState = crypto.randomBytes(32).toString("hex");
      req.session.state = reauthorizeState;

      const reauthorizeUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        include_granted_scopes: true,
        prompt: "consent",
        scope: requiredScopes,
        state: reauthorizeState,
      });

      return res.redirect(reauthorizeUrl);
    }

    delete req.session[GOOGLE_SCOPE_UPGRADE_ATTEMPTED];

    try {
      const scopeString = grantedScopeString || requiredScopes.join(" ");
      await upsertUserGoogleCredential(
        user.id,
        userInfo.id,
        tokens,
        scopeString,
      );
    } catch (err) {
      const isMissingRefreshToken =
        err instanceof Error &&
        err.message.includes(
          "Google refresh_token is required for first-time credential creation",
        );

      if (isMissingRefreshToken && !alreadyAttemptedScopeUpgrade) {
        req.session[GOOGLE_SCOPE_UPGRADE_ATTEMPTED] = true;

        const reauthorizeState = crypto.randomBytes(32).toString("hex");
        req.session.state = reauthorizeState;

        const reauthorizeUrl = oauth2Client.generateAuthUrl({
          access_type: "offline",
          include_granted_scopes: true,
          prompt: "consent",
          scope: requiredScopes,
          state: reauthorizeState,
        });

        return res.redirect(reauthorizeUrl);
      }

      if (isMissingRefreshToken) {
        return res.redirect(
          `${process.env.CLIENT_URL}/auth/callback?success=false&message=${encodeURIComponent(
            "Google authentication failed: missing refresh token. Please remove Google app access and try again.",
          )}`,
        );
      }

      return next(err);
    }

    const accessToken = await createAccessToken(user.id, userRole(user));
    const refreshToken = await createRefreshToken(user.id, userRole(user));

    const necessaryUserData = removeSensitiveUserData(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });

    delete req.session.state;

    const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(
      `${frontendUrl}/auth/callback?success=true&user=${encodeURIComponent(JSON.stringify(necessaryUserData))}&accessToken=${accessToken}`,
    );
  } catch (err) {
    return next(err);
  }
};
