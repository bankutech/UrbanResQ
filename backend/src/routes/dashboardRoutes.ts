import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middleware/auth';
import * as dashboardService from '../services/dashboardService';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(async (_req, res) => {
  const [status, disasters, severity, trend, activity, utilization] = await Promise.all([
    dashboardService.getCityStatus(),
    dashboardService.getActiveDisasters(),
    dashboardService.getSeverityDistribution(),
    dashboardService.getRequestTrend(),
    dashboardService.getRecentActivity(),
    dashboardService.getResourceUtilizationSummary(),
  ]);
  res.json({ status, disasters, severity, trend, activity, utilization });
}));

export default router;
