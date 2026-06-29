-- ============================================================
-- Migration 011: Add NIS (nomor induk siswa) to siswa table
-- Idempotent — skips if column already exists.
-- ============================================================

SET @db = (SELECT DATABASE());

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'siswa' AND COLUMN_NAME = 'nis');

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE siswa ADD COLUMN nis VARCHAR(30) NULL UNIQUE AFTER id_user',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
