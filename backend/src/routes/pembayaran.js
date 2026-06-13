import { Router } from 'express';
import {
  getAllPembayaran,
  getPembayaranById,
  getTunggakanSiswa,
  createPembayaran,
  updatePembayaran,
  verifyPembayaran,
  bulkVerify,
  deletePembayaran,
} from '../controllers/pembayaranController.js';

const router = Router();

// Static route harus lebih dulu
router.patch('/bulk-verify', bulkVerify);
router.get('/tunggakan/:id_siswa', getTunggakanSiswa);

router.get('/', getAllPembayaran);
router.get('/:id', getPembayaranById);
router.post('/', createPembayaran);
router.put('/:id', updatePembayaran);
router.patch('/:id/verify', verifyPembayaran);
router.delete('/:id', deletePembayaran);

export default router;
