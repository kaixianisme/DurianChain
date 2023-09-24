const rateLimit = require('express-rate-limit');

// Define a rate-limiting middleware for the admin login route
const adminLoginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 5, // 5 requests per windowMs
  message: 'Too many login attempts. Please try again later.',
});

const reqLimitter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 30, // 30 requests per windowMs
  message: 'Too many request!',
});

module.exports = {
  adminLoginLimiter,
  reqLimitter,
};
