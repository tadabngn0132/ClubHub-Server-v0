import { rateLimit, ipKeyGenerator } from "express-rate-limit";

const getKey = (req) => {
  const email = req.body.email || "anonymous";
  return `${ipKeyGenerator(req)}_${email}`;
};

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later.",
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: getKey,
  message: "Too many login attempts, please try again after 15 minutes",
});

export const resetPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  delayAfter: 3,
  delayMs: 500,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: getKey,
  message: "Too many password reset attempts, please try again after an hour",
});
