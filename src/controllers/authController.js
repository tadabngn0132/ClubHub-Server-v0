import { prisma } from '../lib/prisma.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { 
    createRefreshToken,
    verifyRefreshToken,
    revokeRefreshToken,
    createAccessToken 
} from '../utils/handleToken.js'

export const refreshAccessToken = async (req, res) => {
    const { refreshToken } = req.cookies

    if (!refreshToken) {
        return res.status(401).json({ 
            success: false, 
            message: "No refresh token provided" 
        })
    }

    try {
        const userId = await verifyRefreshToken(refreshToken)

        const newAccessToken = createAccessToken(userId)

        res.status(200).json({
            success: true,
            message: "Access token refreshed successfully",
            data: {
                accessToken: newAccessToken
            }
        })
    } catch (error) {
        console.log("Error in refreshAccessToken function", error)
        res.status(500).json({
            success: false,
            message: `Internal Server Error / Refresh Token Error: ${error.message}`
        })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body

    try {
        // TODO: Add authentication logic here
        // Check email and password against database
        const storedUser = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        if (!storedUser) {
            return res.status(401).json({ 
                success: false,
                message: "User with this email does not exist"
            })
        }

        const correctPassword = await bcrypt.compare(password, storedUser.password)

        if (!correctPassword) {
            return res.status(401).json({ 
                success: false,
                message: "Incorrect password"
            })
        }
        
        // If valid, sign a JWT token and send it in response
        const accessToken = createAccessToken(storedUser.id)
        const refreshToken = await createRefreshToken(storedUser.id)

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
            maxAge: 15 * 24 * 60 * 60 * 1000
        })

        res.status(200).json({ 
            success: true, 
            message: "Login successful",
            data: {
                accessToken,
                storedUser
            }
        })
    } catch (error) {
        console.log("Error in login function", error)
        res.status(500).json({ 
            success: false, 
            message: `Internal Server Error / Login Error: ${error.message}` 
        })
    }
}

export const register = async (req, res) => {
    const { username, email, password } = req.body

    try {
        // TODO: Add registration logic here
        // Check if user already exists
        const hashedPassword = bcrypt.hash(password)

        const createdUser = await prisma.user.create({
            data: {
                username: username,
                email: email,
                password: hashedPassword
            }
        })

        const accessToken = await createAccessToken(createdUser.id)
        const refreshToken = await createRefreshToken(createdUser.id)

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
            maxAge: 15 * 24 * 60 * 60 * 1000
        })

        // Hash password and store user in database
        res.status(201).json({ 
            success: true, 
            message: "Registration successful",
            data: {
                accessToken,
                createdUser
            }
        })
    } catch (error) {
        console.log("Error in register function", error)
        res.status(500).json({ 
            success: false, 
            message: `Internal Server Error / Register Error: ${error.message}` 
        })
    }
}

export const logout = async (req, res) => {
    try {
        // TODO: Add logout logic here
        const { refreshToken } = req.cookies

        const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)

        await revokeRefreshToken(decodedToken.jti)

        res.status(200).json({ 
            success: true, 
            message: "Logout successful" 
        })
    } catch (error) {
        console.log("Error in logout function", error)
        res.status(500).json({ 
            success: false, 
            message: `Internal Server Error / Logout Error: ${error.message}` 
        })
    }
}

export const resetPassword = async (req, res) => {
    const { email } = req.body
    
    try {
        // TODO: Add reset password logic here
        // Generate a password reset token and send it via email
        // Send email with reset link
        res.status(200).json({ 
            success: true, 
            message: "Password reset link sent" 
        })
    } catch (error) {
        console.log("Error in resetPassword function", error)
        res.status(500).json({ 
            success: false, 
            message: `Internal Server Error / Reset Password Error: ${error.message}` 
        })
    }
}

export const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body

    try {
        // TODO: Implement change password functionality
        // Verify current password
        // Hash new password and update in database
        res.status(200).json({ 
            success: true, 
            message: "Password changed successfully" 
        })
    } catch (error) {
        console.log("Error in changePassword function", error)
        res.status(500).json({ 
            success: false, 
            message: `Internal Server Error / Change Password Error: ${error.message}` 
        })
    }
}

export const googleAuth = async (req, res) => {
    try {
        // TODO: Implement Google authentication logic
        res.status(200).json({ 
            success: true, 
            message: "Google authentication initiated" 
        })
    } catch (error) {
        console.log("Error in googleAuth function", error)
        res.status(500).json({ 
            success: false, 
            message: `Internal Server Error / Google Auth Error: ${error.message}` 
        })
    }
}

export const googleAuthCallback = async (req, res) => {
    try {
        // TODO: Implement Google authentication callback logic
        res.status(200).json({ 
            success: true, 
            message: "Google authentication callback successful" 
        })
    } catch (error) {
        console.log("Error in googleAuthCallback function", error)
        res.status(500).json({ 
            success: false, 
            message: `Internal Server Error / Google Auth Callback Error: ${error.message}` 
        })
    }
}