import { Router } from 'express';
import { z } from 'zod';
import * as disasterService from '../services/disasterService';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const status = req.query.status as string | undefined;
  res.json(await disasterService.listDisasters(status));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  res.json(await disasterService.getDisasterById(req.params.id));
}));

const createSchema = z.object({
  title: z.string(),
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
    return res.status(400).json({ error: parsed.error });
  }
  const result = await disasterService.createDisaster(parsed.data, req.user!.userId as string);
  res.json(result);
}));

router.patch('/:id/status', requireAuth, asyncHandler(async (req, res) => {
  const status = z.enum(['REPORTED', 'ACTIVE', 'CONTAINED', 'RESOLVED', 'ARCHIVED']).parse(req.body.status);
  res.json(await disasterService.updateDisasterStatus(req.params.id, status, req.user!.userId as string));
}));

export default router;
