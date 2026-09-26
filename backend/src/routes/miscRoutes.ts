import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, ApiError } from '../utils/asyncHandler';
import { requireAuth, requireRole } from '../middleware/auth';
import * as resourceService from '../services/resourceService';
import * as facilityService from '../services/facilityService';
import * as simulationService from '../services/simulationService';
import * as analyticsService from '../services/analyticsService';
import * as auditService from '../services/auditService';

export const resourceRouter = Router();
resourceRouter.use(requireAuth);
resourceRouter.get('/', asyncHandler(async (_req, res) => res.json(await resourceService.listAvailableResources())));
resourceRouter.get('/utilization', asyncHandler(async (_req, res) => res.json(await resourceService.listResourceUtilization())));

export const inventoryRouter = Router();
inventoryRouter.use(requireAuth);
inventoryRouter.get('/', asyncHandler(async (req, res) => {
  res.json(await resourceService.listInventory({
    category: req.query.category as string | undefined,
    locationId: req.query.locationId ? req.query.locationId as string : undefined,
  }));
}));
inventoryRouter.post('/:id/adjust', requireRole('RESOURCE_MANAGER'), asyncHandler(async (req, res) => {
  const schema = z.object({ delta: z.number(), reason: z.string().default('ADJUSTMENT') });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', parsed.error.issues[0].message);
  res.json(await resourceService.adjustInventory(req.params.id, parsed.data.delta, parsed.data.reason, req.user!.userId));
}));

export const hospitalRouter = Router();
hospitalRouter.use(requireAuth);
hospitalRouter.get('/', asyncHandler(async (_req, res) => res.json(await facilityService.listHospitals())));
hospitalRouter.post('/admit', requireRole('MEDICAL_COORDINATOR', 'EMERGENCY_MANAGER'), asyncHandler(async (req, res) => {
  const schema = z.object({
    hospitalId: z.string(), requestId: z.string().optional(), patientName: z.string().min(2),
    condition: z.enum(['STABLE', 'SERIOUS', 'CRITICAL']), needsIcu: z.boolean().default(false),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', parsed.error.issues[0].message);
  const result = await facilityService.admitPatient(parsed.data);
  if (result.result !== 'ADMITTED') {
    throw new ApiError(409, result.result, `Admission failed: ${result.result}`);
  }
  res.status(201).json(result);
}));

export const shelterRouter = Router();
shelterRouter.use(requireAuth);
shelterRouter.get('/', asyncHandler(async (_req, res) => res.json(await facilityService.listShelters())));
shelterRouter.post('/:id/check-in', requireRole('EMERGENCY_MANAGER', 'DISASTER_OFFICER', 'MEDICAL_COORDINATOR'), asyncHandler(async (req, res) => {
  const schema = z.object({ fullName: z.string().min(2), citizenId: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', parsed.error.issues[0].message);
  try {
    const result = await facilityService.checkInResident(req.params.id, parsed.data.fullName, parsed.data.citizenId);
    res.status(201).json(result);
  } catch (err: any) {
    if (err.status) throw new ApiError(err.status, err.code, err.message);
    throw err;
  }
}));

export const teamRouter = Router();
teamRouter.use(requireAuth);
teamRouter.get('/', asyncHandler(async (_req, res) => res.json(await facilityService.listRescueTeams())));

export const vehicleRouter = Router();
vehicleRouter.use(requireAuth);
vehicleRouter.get('/', asyncHandler(async (req, res) => {
  res.json(await facilityService.listVehicles(req.query.status as string | undefined));
}));
vehicleRouter.post('/:id/deploy', requireRole('EMERGENCY_MANAGER', 'RESCUE_COORDINATOR'), asyncHandler(async (req, res) => {
  const schema = z.object({ requestId: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', parsed.error.issues[0].message);
  res.json(await facilityService.deployVehicle(req.params.id, parsed.data.requestId, req.user!.userId));
}));

export const shortageRouter = Router();
shortageRouter.use(requireAuth);
shortageRouter.get('/', asyncHandler(async (_req, res) => res.json(await facilityService.listShortages())));

export const volunteerRouter = Router();
volunteerRouter.use(requireAuth);
volunteerRouter.get('/', asyncHandler(async (_req, res) => res.json(await facilityService.listVolunteers())));
volunteerRouter.post('/:id/assign', requireRole('EMERGENCY_MANAGER', 'DISASTER_OFFICER', 'RESCUE_COORDINATOR'), asyncHandler(async (req, res) => {
  const schema = z.object({ requestId: z.string().optional(), shelterId: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', parsed.error.issues[0].message);
  res.json(await facilityService.assignVolunteer(req.params.id, parsed.data.requestId, parsed.data.shelterId));
}));
volunteerRouter.post('/:id/release', requireRole('EMERGENCY_MANAGER', 'DISASTER_OFFICER', 'RESCUE_COORDINATOR'), asyncHandler(async (req, res) => {
  res.json(await facilityService.releaseVolunteer(req.params.id));
}));

export const supplierRouter = Router();
supplierRouter.use(requireAuth);
supplierRouter.get('/', asyncHandler(async (_req, res) => res.json(await facilityService.listSuppliers())));

export const simulationRouter = Router();
simulationRouter.use(requireAuth);
simulationRouter.post('/', requireRole('EMERGENCY_MANAGER', 'RESOURCE_MANAGER'), asyncHandler(async (req, res) => {
  const schema = z.object({
    disasterId: z.string(),
    resourceTypeId: z.string().optional(),
    quantityDelta: z.number().optional(),
    additionalPeopleAffected: z.number().optional(),
    hospitalIdAtCapacity: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', parsed.error.issues[0].message);
  res.json(await simulationService.runWhatIf(parsed.data, req.user!.userId));
}));

export const analyticsRouter = Router();
analyticsRouter.use(requireAuth);
analyticsRouter.get('/response-performance', asyncHandler(async (_req, res) => res.json(await analyticsService.getResponsePerformance())));
analyticsRouter.get('/requests-by-severity', asyncHandler(async (_req, res) => res.json(await analyticsService.getRequestsBySeverity())));
analyticsRouter.get('/requests-by-category', asyncHandler(async (_req, res) => res.json(await analyticsService.getRequestsByCategory())));
analyticsRouter.get('/requests-by-zone', asyncHandler(async (_req, res) => res.json(await analyticsService.getRequestsByZone())));
analyticsRouter.get('/resolution-rate', asyncHandler(async (_req, res) => res.json(await analyticsService.getResolutionRate())));
analyticsRouter.get('/resource-consumption-trend', asyncHandler(async (_req, res) => res.json(await analyticsService.getResourceConsumptionTrend())));

export const auditRouter = Router();
auditRouter.use(requireAuth, requireRole('ADMIN', 'EMERGENCY_MANAGER', 'VIEWER'));
auditRouter.get('/', asyncHandler(async (req, res) => {
  res.json(await auditService.listAuditLogs({
    entityType: req.query.entityType as string | undefined,
    userId: req.query.userId as string | undefined,
    page: req.query.page ? Number(req.query.page) : undefined,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
  }));
}));
