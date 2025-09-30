import express from "express"
import {
    // ==========TÍNH NĂNG NÂNG CAO (Tạm thời backup)==========
    // refreshAccessToken,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
    // ==========TÍNH NĂNG NÂNG CAO (Tạm thời backup)==========
    // googleAuth,
    // googleAuthCallback
} from "../controllers/authController.js"

const router = express.Router()

// ==========TÍNH NĂNG NÂNG CAO (Tạm thời backup)==========
// router.get("/refresh-access-token", refreshAccessToken)
router.post("/login", login)
router.post("/register", register)
router.post("/logout", logout)
router.post("forgot-password", forgotPassword)
router.put("/reset-password", resetPassword)
router.put("/change-password", changePassword)
// ==========TÍNH NĂNG NÂNG CAO (Tạm thời backup)==========
// router.get("/google-auth", googleAuth)
// router.get("/google-auth/callback", googleAuthCallback)

export default router