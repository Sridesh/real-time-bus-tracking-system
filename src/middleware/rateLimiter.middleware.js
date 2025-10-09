const rateLimit = require('express-rate-limit');

const loginRateLimiter = rateLimit({
  windowMs: 1000 * 60 * 15, // 15 minutes
  max: 15, //requests limit per IP
  message: 'Too many unsuccessful requests. Please try again.',
  skipSuccessfulRequests: true,
});

const commonRateLimiter = rateLimit({
  windowMs: 1000 * 60 * 15,
  max: 100,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginRateLimiter, commonRateLimiter };
