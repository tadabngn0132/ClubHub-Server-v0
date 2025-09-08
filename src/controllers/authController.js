import { prisma } from '../lib/prisma.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

const createRefreshToken = async (userId) => {
    const jti = uuidv4()

    const refreshToken = jwt.sign(
        { 
            jti,
            userId: userId,
            type: 'refresh'
        }, 
        process.env.REFRESH_TOKEN_SECRET, 
        { expiresIn: '15d' }
    )

    await prisma.refreshToken.create({
        data: {
            token: jti,
            userId: userId,
            expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
        }
    })

    return refreshToken
}

const verifyRefreshToken = async (token) => {
    try {
        const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)

        const storedToken = await prisma.refreshToken.findUnique({
            where: {
                id: decodedToken.jti,
                isRevoked: false,
                expiresAt: {
                    gt: new Date()
                }
            }
        })

        if (!storedToken) {
            throw new Error('Refresh token is expired or revoked')
        }

        await prisma.refreshToken.update({
            where: { id: decodedToken.jti },
            data: { lastUsedAt: new Date() }
        })

        return storedToken.userId 
    } catch (error) {
        console.error("Error verifying refresh token:", error)
        throw new Error('Invalid refresh token')
    }
}

const revokeRefreshToken = async (jti) => {
    await prisma.refreshToken.update({
        where: { id: jti },
        data: { 
            isRevoked: true,
            revokedAt: new Date()
        }
    })
}

const createAccessToken = async (userId) => {
    return accessToken = jwt.sign(
        { 
            userId: userId,
            type: 'access'
        }, 
        process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: '30m' }
    )
}

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