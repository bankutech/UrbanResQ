import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { query } from '../config/db';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (q.length < 2) return res.json({ disasters: [], requests: [], hospitals: [], shelters: [], teams: [], vehicles: [] });
  const like = `%${q}%`;

  const [disasters, requests, hospitals, shelters, teams, vehicles] = await Promise.all([
    query(`SELECT disaster_id, title, disaster_type, severity, status FROM disasters WHERE title LIKE ? OR disaster_type LIKE ? LIMIT 8`, [like, like]),
    query(`SELECT request_id, category, description, status, urgency FROM emergency_requests WHERE MATCH(description) AGAINST (? IN NATURAL LANGUAGE MODE) OR request_id = ? LIMIT 8`, [q, q]),
    query(`SELECT hospital_id, hospital_code, name FROM hospitals WHERE name LIKE ? OR hospital_code LIKE ? LIMIT 8`, [like, like]),
    query(`SELECT shelter_id, shelter_code, name FROM shelters WHERE name LIKE ? OR shelter_code LIKE ? LIMIT 8`, [like, like]),
    query(`SELECT team_id, team_code, team_name FROM rescue_teams WHERE team_name LIKE ? OR team_code LIKE ? LIMIT 8`, [like, like]),
    query(`SELECT vehicle_id, vehicle_code, vehicle_type FROM vehicles WHERE vehicle_code LIKE ? LIMIT 8`, [like]),
  ]);

  res.json({ disasters, requests, hospitals, shelters, teams, vehicles });
}));

export default router;
