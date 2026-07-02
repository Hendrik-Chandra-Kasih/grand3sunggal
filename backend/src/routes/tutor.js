import { Router } from 'express';
import {
  getAllTutor,
  getTutorById,
  getTutorByUserId,
  createTutor,
  updateTutor,
  deleteTutor,
} from '../controllers/tutorController.js';

const router = Router();

router.get('/', getAllTutor);
router.get('/by-user/:id_user', getTutorByUserId);
router.get('/:id', getTutorById);
router.post('/', createTutor);
router.put('/:id', updateTutor);
router.delete('/:id', deleteTutor);

export default router;
