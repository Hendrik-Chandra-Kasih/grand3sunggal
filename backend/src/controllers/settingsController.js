import { query, queryOne } from '../config/query.js';

const handleError = (res, error) => {
  console.error('❌ SettingsController error:', error);
  res.status(500).json({ success: false, message: error.message });
};

// Helper: cek apakah user adalah owner/pemilik
const isOwner = async (userId) => {
  const user = await queryOne(
    `SELECT role FROM users WHERE id_user = ? LIMIT 1`,
    [userId]
  );
  return user && user.role === 'pemilik';
};

// GET /api/settings
export const getAllSettings = async (req, res) => {
  try {
    const rows = await query(
      `SELECT setting_key, setting_value, description, updated_at
       FROM app_settings
       ORDER BY setting_key ASC`
    );

    const settings = {};
    rows.forEach((row) => {
      settings[row.setting_key] = {
        value: row.setting_value,
        description: row.description,
        updated_at: row.updated_at,
      };
    });

    res.json({ success: true, data: settings });
  } catch (error) {
    handleError(res, error);
  }
};

// GET /api/settings/:key
export const getSettingByKey = async (req, res) => {
  try {
    const { key } = req.params;

    const row = await queryOne(
      `SELECT setting_key, setting_value, description, updated_at
       FROM app_settings
       WHERE setting_key = ?`,
      [key]
    );

    if (!row) {
      return res.status(404).json({ success: false, message: 'Setting tidak ditemukan' });
    }

    res.json({
      success: true,
      data: {
        [row.setting_key]: {
          value: row.setting_value,
          description: row.description,
          updated_at: row.updated_at,
        },
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

// PUT /api/settings — update satu atau banyak settings (owner only)
export const updateSettings = async (req, res) => {
  try {
    if (!(await isOwner(req.userId))) {
      return res.status(403).json({
        success: false,
        message: 'Hanya owner yang dapat mengubah pengaturan',
      });
    }

    const { settings } = req.body; // { key: value, ... }

    if (!settings || typeof settings !== 'object' || Object.keys(settings).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Data settings wajib diisi dalam format { key: value }',
      });
    }

    const validKeys = [
      'biaya_pendaftaran',
      'bonus_kehadiran_enabled',
      'bonus_kehadiran_nominal',
      'bonus_kehadiran_maks_absen',
      'infal_enabled',
      'infal_nominal',
      'persentase_gaji_tutor',
      'hari_kerja_per_bulan',
    ];

    for (const [key, value] of Object.entries(settings)) {
      if (!validKeys.includes(key)) {
        return res.status(400).json({
          success: false,
          message: `Setting key '${key}' tidak valid`,
        });
      }

      await query(
        `UPDATE app_settings SET setting_value = ?, updated_by = ? WHERE setting_key = ?`,
        [String(value), req.userId, key]
      );
    }

    res.json({ success: true, message: 'Pengaturan berhasil diperbarui' });
  } catch (error) {
    handleError(res, error);
  }
};

// PUT /api/settings/:key — update single setting (owner only)
export const updateSettingByKey = async (req, res) => {
  try {
    if (!(await isOwner(req.userId))) {
      return res.status(403).json({
        success: false,
        message: 'Hanya owner yang dapat mengubah pengaturan',
      });
    }

    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined || value === null) {
      return res.status(400).json({
        success: false,
        message: 'Nilai setting (value) wajib diisi',
      });
    }

    const existing = await queryOne(
      `SELECT id_setting FROM app_settings WHERE setting_key = ?`,
      [key]
    );

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Setting tidak ditemukan' });
    }

    await query(
      `UPDATE app_settings SET setting_value = ?, updated_by = ? WHERE setting_key = ?`,
      [String(value), req.userId, key]
    );

    res.json({ success: true, message: `Pengaturan ${key} berhasil diperbarui` });
  } catch (error) {
    handleError(res, error);
  }
};
