import rateLimit from 'express-rate-limit';

export const rateLimiter = new rateLimit({
  windowMs: 60 * 100,
  max: 40,
});
