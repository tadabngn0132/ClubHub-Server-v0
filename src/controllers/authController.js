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
import { authorizationUrl } from '../lib/google.js'
import url from 'url'

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

export const forgotPassword = async (req, res) => {
    const { email } = req.body
    
    try {
        // TODO: Add reset password logic here
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
            message: `Internal Server Error / Reset Password Error: ${error.message}` 
        })
    }
}

export const resetPassword = async (req, res) => {
    const { newPassword } = req.body
    const { resetToken, email } = req.query

    try {
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

        const hashedNewPassword = bcrypt.hash(newPassword)

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
            message: `Internal Server Error / Reset Password Error: ${error.message}`
        })
    }
}

export const changePassword = async (req, res) => {
    const { email, currentPassword, newPassword } = req.body

    try {
        // TODO: Implement change password functionality
        // Verify current password
        const storedUser = await prisma.user.findUnique({
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

        await prisma.user.update({
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
    try {
        // TODO: Implement Google authentication callback logic
        let q = url.parse(req.url, true).query;

        if (q.error) { // An error response e.g. error=access_denied
            console.log('Error:' + q.error);
        } else if (q.state !== req.session.state) { //check state value
            console.log('State mismatch. Possible CSRF attack');
            res.end('State mismatch. Possible CSRF attack');
        } else { // Get access and refresh tokens (if access_type is offline)
            let { tokens } = await oauth2Client.getToken(q.code);
            oauth2Client.setCredentials(tokens);
        }

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