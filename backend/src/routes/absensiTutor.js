import { Router } from 'express';
import {
  getTutorAttendanceToday,
  saveTutorAttendanceBulk,
} from '../controllers/absensiTutorController.js';

const router = Router();

router.get('/today', getTutorAttendanceToday);
router.post('/bulk', saveTutorAttendanceBulk);

export default router;
