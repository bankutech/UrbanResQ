import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, ApiError } from '../utils/asyncHandler';
import { requireAuth, requireRole } from '../middleware/auth';
import * as requestService from '../services/requestService';
import { emitUpdate } from '../socket';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(async (req, res) => {
  const { disasterId, status, urgency, category, search, page, pageSize } = req.query;
  res.json(await requestService.listRequests({
    disasterId: disasterId as string | undefined,
    status: status as string | undefined,
    urgency: urgency as string | undefined,
    category: category as string | undefined,
    search: search as string | undefined,
    page: page ? Number(page) : undefined,
    pageSize: pageSize ? Number(pageSize) : undefined,
  }));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  res.json(await requestService.getRequestById(req.params.id));
}));

const createSchema = z.object({
  disasterId: z.string().optional(),
  zoneId: z.string().optional(),
  locationId: z.string().optional(),
  requesterType: z.enum(['CITIZEN', 'OFFICER', 'HOSPITAL', 'SHELTER', 'RESCUE_TEAM']),
  citizenId: z.string().optional(),
  requesterName: z.string().optional(),
  requesterContact: z.string().optional(),
  category: z.enum(['MEDICAL', 'RESCUE', 'WATER', 'FOOD', 'SHELTER', 'EVACUATION', 'SUPPLIES', 'SECURITY', 'OTHER']),
  description: z.string().min(5),
  peopleAffected: z.number().int().nonnegative().optional(),
  vulnerableCount: z.number().int().nonnegative().optional(),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  requiredResources: z.array(z.object({ resource_type_id: z.string(), quantity: z.number() })).optional(),
});

router.post('/', requireRole('EMERGENCY_MANAGER', 'DISASTER_OFFICER', 'MEDICAL_COORDINATOR'), asyncHandler(async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', parsed.error.issues[0].message);
  const created = await requestService.createRequest(parsed.data);
  emitUpdate('database_updated');
  res.status(201).json(created);
}));

router.patch('/:id/status', requireRole('EMERGENCY_MANAGER', 'DISASTER_OFFICER', 'RESOURCE_MANAGER'), asyncHandler(async (req, res) => {
  const status = z.enum(['PENDING', 'ACKNOWLEDGED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED']).parse(req.body.status);
  const result = await requestService.updateRequestStatus(req.params.id, status, req.user!.userId, req.body.note);
  emitUpdate('database_updated');
  res.json(result);
}));

export default router;
