import bcrypt from "bcryptjs";
import { DEFAULT_PASSWORD } from "./constant";

export const removeSensitiveUserData = (user) => {
  const {
    hashedPassword,
    googleId,
    refreshTokens,
    resetToken,
    ...neccesaryUserData
  } = user;

  return neccesaryUserData;
};

export const hashedDefaultPassword = async () => {
  const defaultPassword = DEFAULT_PASSWORD;
  const hashedPassword = await bcrypt.hash(defaultPassword, 12);
  return hashedPassword;
};

export const userIncludeOptions = {
  rootDepartment: {
    select: {
      id: true,
      name: true,
    },
  },
  userPosition: {
    include: {
      position: {
        select: {
          id: true,
          title: true,
          level: true,
          systemRole: true,
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  },
};

export const userIncludeSystemRoleOptions = {
  userPosition: {
    include: {
      position: {
        select: {
          systemRole: true,
        },
      },
    },
  },
};
