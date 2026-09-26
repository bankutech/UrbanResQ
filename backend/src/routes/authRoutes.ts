import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { asyncHandler, ApiError } from '../utils/asyncHandler';
import * as authService from '../services/authService';
import { requireAuth } from '../middleware/auth';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX_AUTH) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many login attempts. Try again later.' } },
});

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });

router.post('/login', loginLimiter, asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', parsed.error.issues[0].message);
  const result = await authService.login(parsed.data.email, parsed.data.password);
  res.json(result);
}));

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
