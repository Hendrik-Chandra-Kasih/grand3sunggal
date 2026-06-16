-- ============================================================
-- Migration 009: Change jadwal.hari from ENUM to JSON array
-- Allows storing multiple days for a single schedule entry.
-- Example: '["Senin", "Rabu", "Jumat"]'
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Ubah kolom hari dari ENUM menjadi JSON
-- Data existing akan dikonversi: 'Senin' -> '["Senin"]'
ALTER TABLE jadwal
  MODIFY COLUMN hari JSON NOT NULL;

SET FOREIGN_KEY_CHECKS = 1;
