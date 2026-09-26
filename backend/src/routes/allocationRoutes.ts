import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, ApiError } from '../utils/asyncHandler';
import { requireAuth, requireRole } from '../middleware/auth';
import * as allocationService from '../services/allocationService';
import { emitUpdate } from '../socket';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(async (req, res) => {
  res.json(await allocationService.listAllocations({
    status: req.query.status as string | undefined,
    requestId: req.query.requestId ? req.query.requestId as string : undefined,
  }));
}));

const generateSchema = z.object({
  disasterId: z.string().optional(),
  dryRun: z.boolean().optional(),
});

// Runs the real MySQL allocation engine (sp_generate_resource_allocation_plan).
router.post('/generate', requireRole('EMERGENCY_MANAGER', 'RESOURCE_MANAGER'), asyncHandler(async (req, res) => {
  const parsed = generateSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', parsed.error.issues[0].message);
  const result = await allocationService.runAllocationPlan(
    parsed.data.disasterId ?? null,
    parsed.data.dryRun ?? false,
    req.user!.userId
  );
  if (!parsed.data.dryRun) emitUpdate('database_updated');
  res.json(result);
}));

router.patch('/:id/status', requireRole('EMERGENCY_MANAGER', 'RESOURCE_MANAGER'), asyncHandler(async (req, res) => {
  const status = z.enum(['PROPOSED', 'APPROVED', 'DISPATCHED', 'DELIVERED', 'CANCELLED']).parse(req.body.status);
  const result = await allocationService.updateAllocationStatus(req.params.id, status, req.user!.userId);
  emitUpdate('database_updated');
  res.json(result);
}));

export default router;
