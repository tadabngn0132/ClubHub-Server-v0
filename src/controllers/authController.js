import { prisma } from '../lib/prisma.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { 
    createRefreshToken,
    verifyRefreshToken,
    revokeRefreshToken,
    createAccessToken,
    createResetPasswordToken,
    verifyResetPasswordToken
} from '../utils/handleToken.js'
import { sendResetPasswordEmail } from '../utils/handleEmail.js'
import { oauth2Client, roleBasedScopes } from '../lib/google.js'
import crypto from 'crypto'

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
        const storedUser = await prisma.users.findUnique({
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
            secure: process.env.NODE_ENV === 'production',
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

// Tạm thời giữ lại trong quá trình dev để test authController
// Khi nào test xong hoạt triển khai được phần CRUD cho user thì loại bỏ
export const register = async (req, res) => {
    const userData = req.body

    try {
        // TODO: Add registration logic here
        // Check if user already exists
        const hashedPassword = bcrypt.hash(userData.password)

        const createdUser = await prisma.users.create({
            data: {
                fullname: userData.fullname,
                email: userData.email,
                password: hashedPassword,
                phoneNumber: phoneNumber,
                dateOfBirth: dateOfBirth
            }
        })

        const accessToken = await createAccessToken(createdUser.id)
        const refreshToken = await createRefreshToken(createdUser.id)

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
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

export const forgotPassword = async (req, res) => {
    const { email } = req.body
    
    try {
        // TODO: Add reset password logic here
        const storedUser = await prisma.users.findUnique({
            where: {
                email: email
            }
        })

        // Generate a password reset token and send it via email
        const resetToken = createResetPasswordToken(storedUser.id)

        // Send reset password email with reset token url
        sendResetPasswordEmail(resetToken, email)
        
        res.status(200).json({ 
            success: true, 
            message: "Password reset link sent. Please check your email to reset password" 
        })

    } catch (error) {
        console.log("Error in forgotPassword function", error)
        res.status(500).json({ 
            success: false, 
            message: `Internal Server Error / Reset Password Error: ${error.message}` 
        })
    }
}

export const resetPassword = async (req, res) => {
    const { newPassword } = req.body
    const { resetToken, email } = req.query

    try {
        const storedUser = await prisma.users.findUnique({
            where: {
                email: email
            }
        })
    
        try {
            verifyResetPasswordToken(resetToken, storedUser.id)

        } catch (error) {
            return res.status(401).json({
                success: false,
                message: error.message
            })
        }

        const hashedNewPassword = bcrypt.hash(newPassword)

        await prisma.users.update({
            where: {
                id: storedUser.id
            },
            data: {
                password: hashedNewPassword
            }
        })

        return res.status(200).json({
            success: true,
            message: 'Reset password successfully'
        })
    } catch (error) {
        console.log("Error in resetPassword function", error)
        return res.status(500).json({
            success: false,
            message: `Internal Server Error / Reset Password Error: ${error.message}`
        })
    }
}

export const changePassword = async (req, res) => {
    const { email, currentPassword, newPassword } = req.body

    try {
        // TODO: Implement change password functionality
        // Verify current password
        const storedUser = await prisma.users.findUnique({
            where: {
                email: email
            }
        })
        
        // Hash new password and update in database
        const correctPassword = bcrypt.compare(currentPassword, storedUser.password)

        if (!correctPassword) {
            return res.status(401).json({
                success: false,
                message: "Current password is wrong"
            })
        }

        const hashedNewPassword = bcrypt.hash(newPassword)

        await prisma.users.update({
            where: {
                id: storedUser.id
            },
            data: {
                password: hashedNewPassword
            }
        })

        res.status(200).json({ 
            success: true, 
            message: "Password changed successfully",
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
        const state = crypto.randomBytes(32).toString('hex')

        req.session.state = state

        const authorizationUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            include_granted_scopes: true,
            state: state
        })

        res.redirect(authorizationUrl)

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
    const { code, state, error } = req.query

    try {
        // TODO: Implement Google authentication callback logic
        // Handle the OAuth 2.0 server response
        if (error) {
            return res.status(400).json({
                error: 'Access denied'
            })
        }
        
        if (state !== req.session.state) {
            return res.status(400).json({
                error: 'State mismatch'
            })
        }

        const { tokens } = await oauth2Client.getToken(code)
        oauth2Client.setCredentials(tokens)

        oauth2Client.on('token', (tokens) => {
            if (tokens.refresh_token) {
                console.log(tokens.refresh_token)
                process.env.GOOGLE_REFRESH_TOKEN = tokens.refresh_token
            }
            console.log(tokens.access_token)
            process.env.GOOGLE_ACCESS_TOKEN = tokens.access_token
        })
        
        const oauth2 = google.oauth2({
            version: "v2",
            auth: oauth2Client
        })

        const { data: userInfo } = await oauth2.userInfo.get()

        const storedUser = prisma.users.findFirst({
            where: {
                email: userInfo.email
            }
        })

        let user

        if (!storedUser) {
            user = await prisma.users.create({
                data: {
                    fullname: userInfo.name,
                    googleId: userInfo.id,
                    email: userInfo.email,
                    locate: userInfo.locale,
                    firstName: userInfo.given_name,
                    lastName: userInfo.family_name,
                    isEmailVerified: userInfo.verified_email
                }
            })
        } else if (!storedUser.googleId || storedUser.googleId !== userInfo.id) {
            user = await prisma.users.update({
                where: {
                    id: storedUser.id
                },
                data: {
                    fullname: userInfo.name,
                    googleId: userInfo.id,
                    locate: userInfo.locale,
                    firstName: userInfo.firstName,
                    lastName: userInfo.lastName,
                    isEmailVerified: userInfo.verifiedEmail
                }
            })
        } else {
            user = storedUser
        }

        const access_token = createAccessToken(user.id)
        const refresh_token = createRefreshToken(user.id)

        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 15 * 24 * 60 * 60 * 1000
        })

        res.status(200).json({ 
            success: true,
            access_token,
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