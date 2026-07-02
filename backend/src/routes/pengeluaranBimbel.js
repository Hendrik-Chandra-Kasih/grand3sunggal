import { Router } from 'express';
import {
  getAllPengeluaranBimbel,
  getPengeluaranBimbelById,
  createPengeluaranBimbel,
  updatePengeluaranBimbel,
  deletePengeluaranBimbel,
  getPengeluaranBimbelSummary,
} from '../controllers/pengeluaranBimbelController.js';

const router = Router();

router.get('/summary', getPengeluaranBimbelSummary);
router.get('/', getAllPengeluaranBimbel);
router.get('/:id', getPengeluaranBimbelById);
router.post('/', createPengeluaranBimbel);
router.put('/:id', updatePengeluaranBimbel);
router.delete('/:id', deletePengeluaranBimbel);

export default router;
