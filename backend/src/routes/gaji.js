import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  getPerhitunganGaji,
  getPerhitunganGajiByIdTutor,
  getAllGaji,
  getBonusAssignments,
  saveBonusAssignment,
  sendGaji,
} from '../controllers/gajiController.js';

const router = Router();

router.get('/perhitungan', authMiddleware, getPerhitunganGaji);

router.get('/perhitungan/:id_tutor', authMiddleware, getPerhitunganGajiByIdTutor);

router.get('/all', authMiddleware, getAllGaji);

router.get('/bonus', authMiddleware, getBonusAssignments);

router.post('/bonus', authMiddleware, saveBonusAssignment);

router.post('/send', authMiddleware, sendGaji);

export default router;
