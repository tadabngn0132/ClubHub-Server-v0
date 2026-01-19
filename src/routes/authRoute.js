import express from "express"
import {
    refreshAccessToken,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
    googleAuth,
    googleAuthCallback
} from "../controllers/authController.js"

const router = express.Router()

router.get("/refresh-access-token", refreshAccessToken)
router.post("/login", login)
router.post("/register", register)
router.post("/logout", logout)
router.post("/forgot-password", forgotPassword)
router.put("/reset-password", resetPassword)
router.put("/change-password", changePassword)
router.get("/google-auth", googleAuth)
router.get("/google-auth/callback", googleAuthCallback)

export default router