-- ============================================================
-- Migration 010: Add NIK (nomor induk kependudukan) to tutor
-- Idempotent — skips if column already exists.
-- ============================================================

SET @db = (SELECT DATABASE());

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'tutor' AND COLUMN_NAME = 'nik');

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE tutor ADD COLUMN nik VARCHAR(20) NULL UNIQUE AFTER id_user',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
