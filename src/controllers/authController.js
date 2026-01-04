import { prisma } from '../libs/prisma.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import {
    createRefreshToken,
    verifyRefreshToken,
    revokeRefreshToken,
    createAccessToken,
    createResetPasswordToken,
    verifyResetPasswordToken
} from '../utils/jwtUtil.js'
import { sendResetPasswordEmail } from '../utils/emailUtil.js'
import { oauth2Client, roleBasedScopes } from '../libs/google.js'
import crypto from 'crypto'
import { google } from 'googleapis'
import { removeSensitiveUserData } from '../utils/userUtil.js'


// Xử lý logic cơ chế cấp lại access token để duy trì đăng nhập
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
                newAccessToken
            }
        })
    } catch (error) {
        console.log("Error in refreshAccessToken function", error)
        res.status(500).json({
            success: false,
            message: `Internal server error / Refresh token error: ${error.message}`
        })
    }
}

// Xử lý logic đăng nhập kiểm tra, xác thực email, mật khẩu, trả về thông tin và token
export const login = async (req, res) => {
    try {
        const { email, password } = req.body
    
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email cannot be empty'
            })
        } else if (!/^[A-Za-z0-9]+@fpt\.edu\.vn$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Email must be Example123456@fpt.edu.vn'
            })
        }
    
        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password cannot be empty'
            })
        }
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

        const correctPassword = await bcrypt.compare(password, storedUser.hashedPassword)

        if (!correctPassword) {
            return res.status(401).json({ 
                success: false,
                message: "Incorrect password"
            })
        }
        
        
        const updatedUser = await prisma.user.update({
            where: {
                id: storedUser.id
            },
            data: {
                lastLogin: new Date()
            }
        })

        const accessToken = await createAccessToken(updatedUser.id)
        // const refreshToken = await createRefreshToken(updatedUser.id)
        
        // res.cookie('refreshToken', refreshToken, {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV === 'production',
        //     sameSite: 'Strict',
        //     maxAge: 15 * 24 * 60 * 60 * 1000
        // })

        const necessaryUserData = removeSensitiveUserData(updatedUser)

        res.status(200).json({ 
            success: true, 
            message: "Login successful",
            data: {
                accessToken,
                necessaryUserData
            }
        })
    } catch (error) {
        console.log("Error in login function", error)
        res.status(500).json({ 
            success: false, 
            message: `Internal server error / Login error: ${error.message}` 
        })
    }
}

// Tạm thời giữ lại trong quá trình dev để test authController
// Khi nào test xong hoạt triển khai được phần CRUD cho user thì loại bỏ
export const register = async (req, res) => {
    try {
        const userData = req.body

        // Check if user already exists
        const hashedPassword = await bcrypt.hash(userData.password, 12)

        const createdUser = await prisma.user.create({
            data: {
                fullname: userData.fullname,
                email: userData.email,
                hashedPassword: hashedPassword,
                phoneNumber: userData.phoneNumber,
                role: userData.role,
                position: userData.position,
                department: userData.department
            }
        })

        res.status(201).json({ 
            success: true, 
            message: "Registration successful",
            data: {
                createdUser
            }
        })
    } catch (error) {
        console.log("Error in register function", error)
        res.status(500).json({ 
            success: false, 
            message: `Internal server error / Register error: ${error.message}` 
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
            message: `Internal server error / Logout error: ${error.message}` 
        })
    }
}

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body

        const storedUser = await prisma.user.findUnique({
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
            message: `Internal server error / Reset password error: ${error.message}` 
        })
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { newPassword } = req.body
        const { resetToken, email } = req.query

        // TODO: Create validation middleware

        const storedUser = await prisma.user.findUnique({
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

        const hashedNewPassword = await bcrypt.hash(newPassword, 12)

        await prisma.user.update({
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
            message: `Internal server error / Reset password error: ${error.message}`
        })
    }
}

export const changePassword = async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body

        // Verify current password
        const storedUser = await prisma.user.findUnique({
            where: {
                email: email
            }
        })
        
        // Hash new password and update in database
        const correctPassword = await bcrypt.compare(currentPassword, storedUser.hashedPassword)

        if (!correctPassword) {
            return res.status(401).json({
                success: false,
                message: "Current password is wrong"
            })
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 12)

        await prisma.user.update({
            where: {
                id: storedUser.id
            },
            data: {
                hashedPassword: hashedNewPassword
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
            message: `Internal server error / Change password error: ${error.message}` 
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
            message: `Internal server error / Google auth error: ${error.message}` 
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

        const storedUser = prisma.user.findFirst({
            where: {
                email: userInfo.email
            }
        })

        let user

        if (!storedUser) {
            user = await prisma.user.create({
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
            user = await prisma.user.update({
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

        const accessToken = createAccessToken(user.id)
        const refreshToken = createRefreshToken(user.id)

        const necessaryUserData = removeSensitiveUserData(user)

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 15 * 24 * 60 * 60 * 1000
        })

        res.status(200).json({ 
            success: true,
            message: "Google authentication callback successful",
            data: {
                accessToken,
                necessaryUserData
            } 
        })
    } catch (error) {
        console.log("Error in googleAuthCallback function", error)
        res.status(500).json({ 
            success: false, 
            message: `Internal server error / Google auth callback error: ${error.message}` 
        })
    }
}