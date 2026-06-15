import { JadwalRepository } from '../repository/jadwal/jadwalRepository.js';

const jadwalRepository = new JadwalRepository();

const handleError = (res, error) => {
  console.error('❌ JadwalController error:', error);
  res.status(500).json({ success: false, message: error.message });
};

export const getAllJadwal = async (req, res) => {
  try {
    const { hari, id_kelas, id_tutor, id_mapel } = req.query;
    const filters = {};
    if (hari) filters.hari = hari;
    if (id_kelas) filters.id_kelas = parseInt(id_kelas, 10);
    if (id_tutor) filters.id_tutor = parseInt(id_tutor, 10);
    if (id_mapel) filters.id_mapel = parseInt(id_mapel, 10);

    const jadwal = await jadwalRepository.findAll({ where: filters });
    res.json({ success: true, data: jadwal });
  } catch (error) {
    handleError(res, error);
  }
};

export const getJadwalBySiswa = async (req, res) => {
  try {
    const jadwal = await jadwalRepository.findBySiswa(parseInt(req.params.id_siswa, 10));
    res.json({ success: true, data: jadwal });
  } catch (error) {
    handleError(res, error);
  }
};

export const getJadwalByTutor = async (req, res) => {
  try {
    const jadwal = await jadwalRepository.findByTutor(parseInt(req.params.id_tutor, 10));
    res.json({ success: true, data: jadwal });
  } catch (error) {
    handleError(res, error);
  }
};

export const getJadwalById = async (req, res) => {
  try {
    const jadwal = await jadwalRepository.findById(parseInt(req.params.id, 10));
    if (!jadwal) {
      return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan' });
    }
    res.json({ success: true, data: jadwal });
  } catch (error) {
    handleError(res, error);
  }
};

export const createJadwal = async (req, res) => {
  try {
    const { id_kelas, id_tutor, id_mapel, hari, jam, jam_selesai } = req.body;
    if (!id_kelas || !id_tutor || !id_mapel || !hari || !jam) {
      return res.status(400).json({ success: false, message: 'id_kelas, id_tutor, id_mapel, hari, jam wajib diisi' });
    }

    // Validasi: jam_selesai harus setelah jam mulai
    if (jam_selesai) {
      if (jam_selesai <= jam) {
        return res.status(400).json({
          success: false,
          message: 'Jam selesai harus lebih besar dari jam mulai',
        });
      }
    }

    const payload = {
      ...req.body,
      id_kelas: parseInt(id_kelas, 10),
      id_tutor: parseInt(id_tutor, 10),
      id_mapel: parseInt(id_mapel, 10),
      jam_selesai: jam_selesai || null,
    };
    const jadwal = await jadwalRepository.create(payload);
    res.status(201).json({ success: true, message: 'Jadwal berhasil ditambahkan', data: jadwal });
  } catch (error) {
    handleError(res, error);
  }
};

export const updateJadwal = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.id_kelas) payload.id_kelas = parseInt(payload.id_kelas, 10);
    if (payload.id_tutor) payload.id_tutor = parseInt(payload.id_tutor, 10);
    if (payload.id_mapel) payload.id_mapel = parseInt(payload.id_mapel, 10);

    // Validasi jam_selesai
    if (payload.jam_selesai) {
      const jamMulai = payload.jam || (await getJamMulai(req.params.id));
      if (payload.jam_selesai <= jamMulai) {
        return res.status(400).json({
          success: false,
          message: 'Jam selesai harus lebih besar dari jam mulai',
        });
      }
    }

    const jadwal = await jadwalRepository.update(parseInt(req.params.id, 10), payload);
    res.json({ success: true, message: 'Jadwal berhasil diperbarui', data: jadwal });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan' });
    }
    handleError(res, error);
  }
};

// Helper untuk ambil jam mulai saat edit
async function getJamMulai(id_jadwal) {
  try {
    const { queryOne } = await import('../config/query.js');
    const row = await queryOne('SELECT jam FROM jadwal WHERE id_jadwal = ?', [parseInt(id_jadwal, 10)]);
    return row?.jam || null;
  } catch {
    return null;
  }
}

export const deleteJadwal = async (req, res) => {
  try {
    await jadwalRepository.delete(parseInt(req.params.id, 10));
    res.json({ success: true, message: 'Jadwal berhasil dihapus' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan' });
    }
    handleError(res, error);
  }
};
