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
  resetPasswordLimiter,
} from "../middlewares/rateLimiting.js";
import {
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
} from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.post("/refresh-access-token", refreshAccessToken);
router.post("/login", validateLogin, login);
router.post("/register", register);
router.post("/logout", logout);
router.post("/forgot-password", validateForgotPassword, forgotPassword);
router.put(
  "/reset-password",
  resetPasswordLimiter,
  validateResetPassword,
  resetPassword,
);
router.put("/change-password", validateChangePassword, changePassword);
router.get("/google-auth", googleAuth);
router.get("/google-auth/callback", googleAuthCallback);

export default router;
