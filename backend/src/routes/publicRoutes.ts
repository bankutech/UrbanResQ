import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import { asyncHandler, ApiError } from '../utils/asyncHandler';
import * as requestService from '../services/requestService';
import { analyzeEmergencyImage } from '../services/aiAssessmentService';
import { emitUpdate } from '../socket';
import { query } from '../config/db';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const publicCreateSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(5),
  category: z.enum(['MEDICAL', 'RESCUE', 'WATER', 'FOOD', 'SHELTER', 'EVACUATION', 'SUPPLIES', 'SECURITY', 'OTHER']),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  zone_id: z.string(),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
});

router.post('/emergency-requests', upload.single('image'), asyncHandler(async (req, res) => {
  const parsed = publicCreateSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', parsed.error.issues[0].message);

  const data = parsed.data;

  // We need a disasterId for the request to be valid according to the schema.
  // In a real app, this might be inferred geographically, but for now we'll pick the first active disaster.
  const disasters = await query(`SELECT disaster_id FROM disasters WHERE status IN ('REPORTED', 'ACTIVE') ORDER BY disaster_id LIMIT 1`);
  if (!disasters || disasters.length === 0) {
    throw new ApiError(400, 'NO_ACTIVE_DISASTER', 'Cannot report emergency when no disasters are active.');
  }

  let finalCategory = data.category;
  let finalUrgency = data.urgency;
  let aiAssessed = false;
  let aiNotes = null;
  let imageUrl = null;

  if (req.file) {
    // We have an image, let's pass it to the AI
    const assessment = await analyzeEmergencyImage(req.file.buffer, req.file.originalname);
    finalCategory = assessment.category;
    finalUrgency = assessment.urgency;
    aiAssessed = true;
    aiNotes = assessment.ai_notes;
    // For demo purposes, we don't save the image to S3, we just pretend we did
    imageUrl = `https://urbanresq.local/uploads/mock_${Date.now()}.jpg`;
  }

  // Validate or resolve a valid zoneId
  let validZoneId: string | null = null;
  if (data.zone_id) {
    const zones: any[] = await query(`SELECT zone_id FROM disaster_zones WHERE zone_id = ?`, [data.zone_id]);
    if (zones && zones.length > 0) {
      validZoneId = data.zone_id;
    } else {
      const firstZone: any[] = await query(`SELECT zone_id FROM disaster_zones LIMIT 1`);
      if (firstZone && firstZone.length > 0) validZoneId = firstZone[0].zone_id;
    }
  }

  const created = await requestService.createRequest({
    disasterId: (disasters[0] as any).disaster_id,
    zoneId: validZoneId,
    locationId: '1', // Adyar Depot default triage hub
    requesterType: 'CITIZEN',
    requesterName: 'Anonymous Citizen',
    category: finalCategory,
    description: data.description,
    urgency: finalUrgency,
    peopleAffected: 1,
    vulnerableCount: 0,
    requiredResources: []
  });

  // If AI assessed, update those fields
  if (aiAssessed) {
    await query(
      `UPDATE emergency_requests SET ai_assessed = ?, ai_notes = ?, image_url = ?, urgency = ?, category = ? WHERE request_id = ?`,
      [true, aiNotes, imageUrl, finalUrgency, finalCategory, created.request_id]
    );
  }

  emitUpdate('database_updated');
  res.status(201).json({ ...created, ai_assessed: aiAssessed, ai_notes: aiNotes });
}));

export default router;
