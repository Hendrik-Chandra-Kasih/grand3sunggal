import { Router } from 'express';
import {
  getTutorAttendanceToday,
  saveTutorAttendanceBulk,
  getTutorAttendanceRecap,
} from '../controllers/absensiTutorController.js';

const router = Router();

router.get('/today', getTutorAttendanceToday);
router.get('/recap', getTutorAttendanceRecap);
router.post('/bulk', saveTutorAttendanceBulk);

export default router;
