import { prisma } from "../libs/prisma.js";
import bcrypt from "bcryptjs";

export const createUser = async (req, res) => {
  try {
    const payload = req.body;

    // TODO: Create validation middleware

    const storedUser = await prisma.users.findUnique({
      where: {
        email: payload.email,
      },
    });

    if (storedUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(payload.password, 12);

    const newUser = await prisma.users.create({
      data: {
        name: payload.name,
        email: payload.email,
        password: hashedPassword,
        fullname: userData.fullname,
        phoneNumber: phoneNumber,
        dateOfBirth: dateOfBirth,
        role: payload.role,
      },
    });

    const {
      password,
      googleId,
      refreshTokens,
      resetToken,
      ...neccessaryUserInfo
    } = newUser;

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: neccessaryUserInfo,
    });
  } catch (err) {
    console.log("Error in createUser function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Create user error: ${err.message}`,
    });
  }
};

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const storedUser = await prisma.users.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!storedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const {
      password,
      googleId,
      refreshTokens,
      resetToken,
      ...neccessaryUserInfo
    } = storedUser;

    res.status(200).json({
      success: true,
      data: neccessaryUserInfo,
    });
  } catch (err) {
    console.log("Error in getUser function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Get user error: ${err.message}`,
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const storedUsers = await prisma.users.findMany();

    const users = storedUsers.map((user) => {
      const {
        password,
        googleId,
        refreshTokens,
        resetToken,
        ...neccessaryUserInfo
      } = user;

      return neccessaryUserInfo;
    });

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (err) {
    console.log("Error in getUsers function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Get users error: ${err.message}`,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    // TODO: Create validation middleware

    const storedUser = await prisma.users.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!storedUser) {
      return res.status(404).json({
        success: false,
        message: "Not found user to update",
      });
    }

    const hashedPassword = await bcrypt.hash(payload.password, 12);

    const updatedUser = await prisma.users.update({
      where: {
        id: parseInt(id),
      },
      data: {
        name: payload.name,
        email: payload.email,
        password: hashedPassword,
        fullname: userData.fullname,
        phoneNumber: phoneNumber,
        dateOfBirth: dateOfBirth,
        role: payload.role,
        status: payload.status,
        updatedAt: Date.now(),
      },
    });

    const {
      password,
      googleId,
      refreshTokens,
      resetToken,
      ...neccessaryUserInfo
    } = updatedUser;

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: neccessaryUserInfo,
    });
  } catch (err) {
    console.log("Error in updateUser function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Update user error: ${err.message}`,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const storedUser = await prisma.users.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!storedUser) {
      return res.status(404).json({
        success: false,
        message: "Not found user to delete",
      });
    }

    const deletedUser = await prisma.users.delete({
      where: {
        id: parseInt(id),
      },
    });

    const {
      password,
      googleId,
      refreshTokens,
      resetToken,
      ...neccessaryUserInfo
    } = deletedUser;

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: neccessaryUserInfo,
    });
  } catch (err) {
    console.log("Error in deleteUser function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Delete user error: ${err.message}`,
    });
  }
};
