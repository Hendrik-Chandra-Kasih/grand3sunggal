import { query, queryOne } from '../config/query.js';

const HARI_MAP_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const VALID_STATUS = ['Hadir', 'Absen'];

const pad = (value) => String(value).padStart(2, '0');

const formatDateOnly = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const formatJam = (value) => String(value || '').slice(0, 5) || '-';

const formatPenempatanLabel = (namaKelas, namaMapel) => {
  if (namaMapel && namaKelas && namaMapel !== namaKelas) {
    return `${namaMapel} - ${namaKelas}`;
  }
  return namaKelas || namaMapel || '-';
};

const handleError = (res, error) => {
  console.error('AbsensiTutorController error:', error);
  res.status(500).json({ success: false, message: error.message });
};

// GET /api/absensi-tutor/today
export const getTutorAttendanceToday = async (req, res) => {
  try {
    const today = new Date();
    const todayName = HARI_MAP_ID[today.getDay()];
    const todayDate = formatDateOnly(today);

    const rows = await query(
      `SELECT
         t.id_tutor,
         t.nama_tutor,
         k.id_kelas,
         k.nama_kelas,
         k.id_mapel,
         m.nama_mapel,
         j.jam,
         att.status AS status_kehadiran
       FROM jadwal j
       INNER JOIN tutor t ON t.id_tutor = j.id_tutor
       INNER JOIN kelas k ON k.id_kelas = j.id_kelas
       LEFT JOIN mapel m ON m.id_mapel = k.id_mapel
       LEFT JOIN absensi_tutor att
         ON att.id_tutor = t.id_tutor
        AND att.tanggal = ?
       WHERE j.hari = ?
         AND t.status = 'Aktif'
       ORDER BY j.jam ASC, t.nama_tutor ASC, m.nama_mapel ASC, k.nama_kelas ASC`,
      [todayDate, todayName]
    );

    const tutorMap = new Map();

    rows.forEach((row) => {
      if (!tutorMap.has(row.id_tutor)) {
        tutorMap.set(row.id_tutor, {
          id_tutor: row.id_tutor,
          nama_tutor: row.nama_tutor,
          status: row.status_kehadiran || null,
          penempatan: [],
          sesi: [],
        });
      }

      const entry = tutorMap.get(row.id_tutor);

      if (!entry.penempatan.some((item) => item.id_kelas === row.id_kelas)) {
        entry.penempatan.push({
          id_kelas: row.id_kelas,
          id_mapel: row.id_mapel,
          nama_kelas: row.nama_kelas,
          nama_mapel: row.nama_mapel,
        });
      }

      const jamLabel = formatJam(row.jam);
      if (!entry.sesi.some((item) => item.jam === jamLabel)) {
        entry.sesi.push({
          label: `Sesi ${entry.sesi.length + 1}`,
          jam: jamLabel,
        });
      }
    });

    const data = Array.from(tutorMap.values()).map((item) => ({
      ...item,
      displayPenempatan: item.penempatan
        .map((kelas) => formatPenempatanLabel(kelas.nama_kelas, kelas.nama_mapel))
        .join(', '),
      displaySesi: item.sesi.map((sesi) => `${sesi.label} (${sesi.jam})`).join(', '),
    }));

    res.json({
      success: true,
      data,
      meta: {
        hari: todayName,
        tanggal: todayDate,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

// POST /api/absensi-tutor/bulk
export const saveTutorAttendanceBulk = async (req, res) => {
  try {
    const targetDate = req.body?.tanggal ? formatDateOnly(req.body.tanggal) : formatDateOnly(new Date());
    const absensi = Array.isArray(req.body?.absensi) ? req.body.absensi : [];

    if (absensi.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Data absensi tutor wajib diisi.',
      });
    }

    for (const item of absensi) {
      const idTutor = Number(item?.id_tutor);
      const status = String(item?.status || '').trim();

      if (!idTutor || !VALID_STATUS.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Setiap data absensi harus memiliki id_tutor dan status yang valid.',
        });
      }

      const existing = await queryOne(
        `SELECT id_absensi_tutor
         FROM absensi_tutor
         WHERE id_tutor = ?
           AND tanggal = ?
         LIMIT 1`,
        [idTutor, targetDate]
      );

      if (existing) {
        await query(
          `UPDATE absensi_tutor
           SET status = ?
           WHERE id_absensi_tutor = ?`,
          [status, existing.id_absensi_tutor]
        );
      } else {
        await query(
          `INSERT INTO absensi_tutor (id_tutor, tanggal, status)
           VALUES (?, ?, ?)`,
          [idTutor, targetDate, status]
        );
      }
    }

    res.json({
      success: true,
      message: `Presensi tutor tanggal ${targetDate} berhasil disimpan.`,
      data: {
        saved: absensi.length,
        tanggal: targetDate,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};
