import { rateLimit } from 'express-rate-limit'

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  ipv6Subnet: 56,
  message: 'Too many requests from this IP, please try again later.'
})

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again after 15 minutes'
})

export const resetPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  message: 'Too many password reset attempts'
})