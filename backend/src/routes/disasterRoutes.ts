import { Router } from 'express';
import { z } from 'zod';
import * as disasterService from '../services/disasterService';
import { requireAuth } from '../middleware/auth';
import { asyncHandler, ApiError } from '../utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const status = req.query.status as string | undefined;
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  const offset = req.query.offset ? Number(req.query.offset) : 0;
  res.json(await disasterService.listDisasters(status, limit, offset));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  res.json(await disasterService.getDisasterById(req.params.id));
}));

const createSchema = z.object({
  title: z.string().min(2),
  disasterType: z.string().optional(),
  severity: z.string().optional(),
  affectedPopulation: z.number().int().nonnegative().optional(),
  estimatedDamage: z.number().nonnegative().optional(),
  latitude: z.number(),
  longitude: z.number()
});

router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, 'VALIDATION_ERROR', parsed.error.issues[0]?.message || 'Invalid disaster payload');
  }
  const result = await disasterService.createDisaster(parsed.data, req.user!.userId as string);
  res.status(201).json(result);
}));

const statusSchema = z.enum(['REPORTED', 'ACTIVE', 'CONTAINED', 'RESOLVED', 'ARCHIVED']);

router.patch('/:id/status', requireAuth, asyncHandler(async (req, res) => {
  const parsed = statusSchema.safeParse(req.body.status);
  if (!parsed.success) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid status. Must be one of: REPORTED, ACTIVE, CONTAINED, RESOLVED, ARCHIVED');
  }
  res.json(await disasterService.updateDisasterStatus(req.params.id, parsed.data, req.user!.userId as string));
}));

export default router;
