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
import { oauth2Client, roleBasedScopes } from "../libs/google.js";
import crypto from "crypto";
import { google } from "googleapis";
import {
  removeSensitiveUserData,
  hashedDefaultPassword,
  userIncludeSystemRoleOptions,
  userIncludeOptions,
} from "../utils/userUtil.js";
import { PROVIDER, USER_STATUS } from "../utils/constant.js";

// Xử lý logic cơ chế cấp lại access token để duy trì đăng nhập
export const refreshAccessToken = async (req, res) => {
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

    const newAccessToken = await createAccessToken(
      userId,
      user.userPosition[0].position.systemRole,
    );

    res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
      data: {
        newAccessToken,
      },
    });
  } catch (error) {
    console.log("Error in refreshAccessToken function", error);
    res.status(500).json({
      success: false,
      message: `Internal server error / Refresh token error: ${error.message}`,
    });
  }
};

// Xử lý logic đăng nhập kiểm tra, xác thực email, mật khẩu, trả về thông tin và token
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

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

    const correctPassword = await bcrypt.compare(
      password,
      storedUser.hashedPassword,
    );

    if (!correctPassword) {
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
      },
      include: userIncludeSystemRoleOptions,
    });

    const accessToken = await createAccessToken(
      updatedUser.id,
      updatedUser.userPosition[0].position.systemRole,
    );
    const refreshToken = await createRefreshToken(
      updatedUser.id,
      updatedUser.userPosition[0].position.systemRole,
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });

    const necessaryUserData = removeSensitiveUserData(updatedUser);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        accessToken,
        necessaryUserData,
      },
    });
  } catch (err) {
    console.log("Error in login function", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Login error: ${err.message}`,
    });
  }
};

// Tạm thời giữ lại trong quá trình dev để test authController
// Khi nào test xong hoạt triển khai được phần CRUD cho user thì loại bỏ
export const register = async (req, res) => {
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
    console.log("Error in register function", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Register error: ${err.message}`,
    });
  }
};

export const logout = async (req, res) => {
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
  } catch (err) {
    console.log("Error in logout function", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Logout error: ${err.message}`,
    });
  }
};

export const forgotPassword = async (req, res) => {
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
  } catch (err) {
    console.log("Error in forgotPassword function", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Reset password error: ${err.message}`,
    });
  }
};

export const resetPassword = async (req, res) => {
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

    await prisma.user.update({
      where: {
        id: storedUser.id,
      },
      data: {
        hashedPassword: hashedNewPassword,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Reset password successfully",
    });
  } catch (err) {
    console.log("Error in resetPassword function", err);

    if (err.message === "Reset token is used or has expired") {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: `Internal server error / Reset password error: ${err.message}`,
    });
  }
};

export const changePassword = async (req, res) => {
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
  } catch (err) {
    console.log("Error in changePassword function", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Change password error: ${err.message}`,
    });
  }
};

export const googleAuth = async (req, res) => {
  try {
    // TODO: Implement Google authentication logic
    const state = crypto.randomBytes(32).toString("hex");

    req.session.state = state;

    const authorizationUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: roleBasedScopes.member,
      include_granted_scopes: true,
      state: state,
    });

    res.redirect(authorizationUrl);
  } catch (err) {
    console.log("Error in googleAuth function", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Google auth error: ${err.message}`,
    });
  }
};

export const googleAuthCallback = async (req, res) => {
  const { code, state, error } = req.query;

  try {
    // TODO: Implement Google authentication callback logic
    // Handle the OAuth 2.0 server response
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Access denied",
      });
    }

    if (state !== req.session.state) {
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
      return res.status(403).json({
        success: false,
        message: "Only FPT email addresses are allowed",
      });
    }

    console.log("Google user info:", userInfo);

    const storedUser = await prisma.user.findFirst({
      where: {
        email: userInfo.email,
      },
    });

    let user;

    if (!storedUser) {
      res.redirect(
        `${process.env.CLIENT_URL}/auth/callback?success=false&message=${encodeURIComponent(
          "No account associated with this email. Please contact admin to create an account for you.",
        )}`,
      );

      return;
    } else if (!storedUser.googleId || storedUser.googleId !== userInfo.id) {
      user = await prisma.user.update({
        where: {
          id: storedUser.id,
        },
        data: {
          fullname: userInfo.name,
          hashedPassword: await hashedDefaultPassword(),
          googleId: userInfo.id,
          locale: userInfo.locale,
          provider: PROVIDER.BOTH,
          firstName: userInfo.given_name,
          lastName: userInfo.family_name,
          isEmailVerified: userInfo.verified_email,
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

    const accessToken = await createAccessToken(
      user.id,
      user.userPosition[0].position.systemRole,
    );
    const refreshToken = await createRefreshToken(
      user.id,
      user.userPosition[0].position.systemRole,
    );

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
    console.log("Error in googleAuthCallback function", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Google auth callback error: ${err.message}`,
    });
  }
};
