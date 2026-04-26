import express from "express";
import {
  refreshAccessToken,
  login,
  register,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  googleAuth,
  googleAuthCallback,
} from "../controllers/authController.js";
import {
  loginLimiter,
  forgotPasswordLimiter,
} from "../middlewares/rateLimiting.js";
import {
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
} from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.post("/refresh-access-token", refreshAccessToken);
router.post("/login", loginLimiter, validateLogin, login);
router.post("/register", register);
router.post("/logout", logout);
router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  validateForgotPassword,
  forgotPassword,
);
router.put("/reset-password", validateResetPassword, resetPassword);
router.put("/change-password", validateChangePassword, changePassword);
router.get("/google-auth", googleAuth);
router.get("/google-auth/callback", googleAuthCallback);

export default router;
