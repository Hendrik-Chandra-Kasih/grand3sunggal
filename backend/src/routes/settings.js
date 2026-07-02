import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  getAllSettings,
  getSettingByKey,
  updateSettings,
  updateSettingByKey,
} from '../controllers/settingsController.js';

const router = Router();

router.get('/', authMiddleware, getAllSettings);
router.get('/:key', authMiddleware, getSettingByKey);
router.put('/', authMiddleware, updateSettings);
router.put('/:key', authMiddleware, updateSettingByKey);

export default router;
