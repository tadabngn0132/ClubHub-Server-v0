import { prisma } from "../libs/prisma.js"
import bcrypt from "bcryptjs"
import { removeSensitiveUserData } from "../utils/userUtil.js"

export const createUser = async (req, res) => {
  try {
    const payload = req.body;

    // TODO: Create validation middleware

    const storedUser = await prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    })

    if (storedUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      })
    }

    const hashedPassword = await bcrypt.hash("WelcometoGDC22%^&", 12);

    const newUser = await prisma.user.create({
      data: {
        email: payload.email,
        hashedPassword: hashedPassword,
        fullname: payload.fullName,
        phoneNumber: payload.phoneNumber,
        dateOfBirth: new Date(payload.dateOfBirth),
        gender: payload.gender,
        major: payload.major,
        studentId: payload.studentId,
        generation: Number(payload.generation),
        role: payload.role,
        joinedAt: payload.joinedAt,
        bio: payload.bio,
      },
    })

    const necessaryUserData = removeSensitiveUserData(newUser)

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: necessaryUserData,
    })
  } catch (err) {
    console.log("Error in createUser function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Create user error: ${err.message}`,
    })
  }
}

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const storedUser = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    })

    if (!storedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    const necessaryUserData = removeSensitiveUserData(storedUser)

    res.status(200).json({
      success: true,
      data: necessaryUserData,
    })
  } catch (err) {
    console.log("Error in getUser function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Get user error: ${err.message}`,
    })
  }
}

export const getUsers = async (req, res) => {
  try {
    const storedUsers = await prisma.user.findMany();

    const users = storedUsers.map((user) => removeSensitiveUserData(user))

    res.status(200).json({
      success: true,
      data: users,
    })
  } catch (err) {
    console.log("Error in getUsers function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Get users error: ${err.message}`,
    })
  }
}

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    // TODO: Create validation middleware

    const storedUser = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    })

    if (!storedUser) {
      return res.status(404).json({
        success: false,
        message: "Not found user to update",
      })
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        email: payload.email,
        fullname: payload.fullName,
        phoneNumber: payload.phoneNumber,
        dateOfBirth: new Date(payload.dateOfBirth),
        status: payload.status,
        updatedAt: new Date(),
        gender: payload.gender,
        major: payload.major,
        studentId: payload.studentId,
        generation: Number(payload.generation),
        role: payload.role,
        joinedAt: payload.joinedAt,
        bio: payload.bio,
      },
    })

    const necessaryUserData = removeSensitiveUserData(updatedUser)

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: necessaryUserData,
    })
  } catch (err) {
    console.log("Error in updateUser function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Update user error: ${err.message}`,
    })
  }
}

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const storedUser = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    })

    if (!storedUser) {
      return res.status(404).json({
        success: false,
        message: "Not found user to delete",
      })
    }

    const deletedUser = await prisma.user.delete({
      where: {
        id: Number(id),
      },
    })

    const necessaryUserData = removeSensitiveUserData(deletedUser)

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: necessaryUserData,
    })
  } catch (err) {
    console.log("Error in deleteUser function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Delete user error: ${err.message}`,
    })
  }
}
