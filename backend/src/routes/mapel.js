import { Router } from 'express';
import { getAllMapel, getMapelById } from '../controllers/mapelController.js';

const router = Router();

router.get('/', getAllMapel);
router.get('/:id', getMapelById);

export default router;
