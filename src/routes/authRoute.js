import express from "express"
import {
    login,
    resetPassword,
    changePassword
} from "../controllers/authController.js"

const router = express.Router()

router.post("/login", login)
router.post("/reset-password", resetPassword)
router.post("/change-password", changePassword)

export default router