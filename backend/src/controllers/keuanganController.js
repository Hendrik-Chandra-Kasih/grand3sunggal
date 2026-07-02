import { query, queryOne } from '../config/query.js';

const handleError = (res, error) => {
  console.error('❌ KeuanganController error:', error);
  res.status(500).json({ success: false, message: error.message });
};

export const getRekapKeuangan = async (req, res) => {
  try {
    const { bulan, tahun } = req.query;
    const targetMonth = bulan ? parseInt(bulan, 10) : new Date().getMonth() + 1;
    const targetYear = tahun ? parseInt(tahun, 10) : new Date().getFullYear();

    const pendapatanRow = await queryOne(
      `SELECT COALESCE(SUM(jumlah), 0) AS total
       FROM pembayaran
       WHERE MONTH(tanggal_bayar) = ? AND YEAR(tanggal_bayar) = ? AND status = 'Verified'`,
      [targetMonth, targetYear]
    );
    const totalPendapatan = Number(pendapatanRow?.total || 0);

    const periodeStart = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01 00:00:00`;
    const [gajiRow, bimbelRow] = await Promise.all([
      queryOne(
        `SELECT COALESCE(SUM(total_gaji), 0) AS total
         FROM gaji_tutor
         WHERE periode = ?`,
        [periodeStart]
      ),
      queryOne(
        `SELECT COALESCE(SUM(nominal), 0) AS total
         FROM pengeluaran_bimbel
         WHERE MONTH(tanggal_pengeluaran) = ? AND YEAR(tanggal_pengeluaran) = ?`,
        [targetMonth, targetYear]
      ),
    ]);
    const gajiTotal = Number(gajiRow?.total || 0);
    const bimbelTotal = Number(bimbelRow?.total || 0);
    const totalPengeluaran = gajiTotal + bimbelTotal;
    const labaBersih = totalPendapatan - totalPengeluaran;

    res.json({
      success: true,
      data: {
        total_pendapatan: totalPendapatan,
        total_pengeluaran: totalPengeluaran,
        // Rincian agar frontend bisa menampilkan breakdown
        gaji_tutor_total: gajiTotal,
        pengeluaran_bimbel_total: bimbelTotal,
        laba_bersih: labaBersih,
        periode: { bulan: targetMonth, tahun: targetYear },
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getTahunanKeuangan = async (req, res) => {
  try {
    const { tahun } = req.query;
    const targetYear = tahun ? parseInt(tahun, 10) : new Date().getFullYear();

    const months = [];
    for (let m = 1; m <= 12; m++) {
      const periodeStart = `${targetYear}-${String(m).padStart(2, '0')}-01 00:00:00`;

      const [pendapatanRow, gajiRow, bimbelRow] = await Promise.all([
        queryOne(
          `SELECT COALESCE(SUM(jumlah), 0) AS total
           FROM pembayaran
           WHERE MONTH(tanggal_bayar) = ? AND YEAR(tanggal_bayar) = ? AND status = 'Verified'`,
          [m, targetYear]
        ),
        queryOne(
          `SELECT COALESCE(SUM(total_gaji), 0) AS total
           FROM gaji_tutor
           WHERE periode = ?`,
          [periodeStart]
        ),
        queryOne(
          `SELECT COALESCE(SUM(nominal), 0) AS total
           FROM pengeluaran_bimbel
           WHERE MONTH(tanggal_pengeluaran) = ? AND YEAR(tanggal_pengeluaran) = ?`,
          [m, targetYear]
        ),
      ]);

      const pendapatan = Number(pendapatanRow?.total || 0);
      const gajiTotal = Number(gajiRow?.total || 0);
      const bimbelTotal = Number(bimbelRow?.total || 0);
      const pengeluaran = gajiTotal + bimbelTotal;

      months.push({
        bulan: m,
        pendapatan,
        pengeluaran,
        gaji_tutor_total: gajiTotal,
        pengeluaran_bimbel_total: bimbelTotal,
      });
    }

    res.json({ success: true, data: months, tahun: targetYear });
  } catch (error) {
    handleError(res, error);
  }
};
