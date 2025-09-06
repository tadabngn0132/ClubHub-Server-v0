import express from "express"
import {
    login,
    register,
    logout,
    resetPassword,
    changePassword,
    googleAuth,
    googleAuthCallback
} from "../controllers/authController.js"

const router = express.Router()

router.post("/login", login)
router.post("/register", register)
router.post("/logout", logout)
router.post("/reset-password", resetPassword)
router.post("/change-password", changePassword)
router.get("/google-auth", googleAuth)
router.get("/google-auth/callback", googleAuthCallback)

export default router