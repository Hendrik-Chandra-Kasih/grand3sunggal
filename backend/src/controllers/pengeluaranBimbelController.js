import { PengeluaranBimbelRepository } from '../repository/pengeluaranBimbel/pengeluaranBimbelRepository.js';

const pengeluaranBimbelRepository = new PengeluaranBimbelRepository();

const handleError = (res, error) => {
  console.error('PengeluaranBimbelController error:', error);
  res.status(500).json({ success: false, message: error.message });
};

export const getAllPengeluaranBimbel = async (req, res) => {
  try {
    const { sortBy, order, startDate, endDate } = req.query;
    const data = await pengeluaranBimbelRepository.findAll({ sortBy, order, startDate, endDate });
    res.json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
};

export const getPengeluaranBimbelById = async (req, res) => {
  try {
    const item = await pengeluaranBimbelRepository.findById(parseInt(req.params.id, 10));
    if (!item) {
      return res.status(404).json({ success: false, message: 'Data pengeluaran tidak ditemukan' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    handleError(res, error);
  }
};

export const createPengeluaranBimbel = async (req, res) => {
  try {
    const { nominal, tanggal_pengeluaran, keterangan } = req.body;
    if (nominal === undefined || nominal === null || nominal === '') {
      return res.status(400).json({ success: false, message: 'Nominal wajib diisi' });
    }
    if (!tanggal_pengeluaran) {
      return res.status(400).json({ success: false, message: 'Tanggal pengeluaran wajib diisi' });
    }
    const numericNominal = Number(nominal);
    if (Number.isNaN(numericNominal) || numericNominal < 0) {
      return res.status(400).json({ success: false, message: 'Nominal harus berupa angka >= 0' });
    }
    const item = await pengeluaranBimbelRepository.create({
      nominal: numericNominal,
      tanggal_pengeluaran,
      keterangan: (keterangan || '').trim(),
    });
    res.status(201).json({
      success: true,
      message: 'Pengeluaran berhasil ditambahkan',
      data: item,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const updatePengeluaranBimbel = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await pengeluaranBimbelRepository.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Data pengeluaran tidak ditemukan' });
    }
    const payload = {};
    const { nominal, tanggal_pengeluaran, keterangan } = req.body;
    if (nominal !== undefined) {
      const numericNominal = Number(nominal);
      if (Number.isNaN(numericNominal) || numericNominal < 0) {
        return res.status(400).json({ success: false, message: 'Nominal harus berupa angka >= 0' });
      }
      payload.nominal = numericNominal;
    }
    if (tanggal_pengeluaran) payload.tanggal_pengeluaran = tanggal_pengeluaran;
    if (keterangan !== undefined) payload.keterangan = String(keterangan).trim();

    const item = await pengeluaranBimbelRepository.update(id, payload);
    res.json({
      success: true,
      message: 'Pengeluaran berhasil diperbarui',
      data: item,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const deletePengeluaranBimbel = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await pengeluaranBimbelRepository.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Data pengeluaran tidak ditemukan' });
    }
    await pengeluaranBimbelRepository.delete(id);
    res.json({ success: true, message: 'Pengeluaran berhasil dihapus' });
  } catch (error) {
    handleError(res, error);
  }
};

export const getPengeluaranBimbelSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const result = await pengeluaranBimbelRepository.sumByDateRange({ startDate, endDate });
    res.json({
      success: true,
      data: {
        total_nominal: Number(result?.total || 0),
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};
