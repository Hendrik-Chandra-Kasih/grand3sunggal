-- ============================================================
-- Migration 003: Add "topik" field to absensi_siswa
-- NOTE: Idempotent — skips if column already exists (e.g. when
--       base tables are created by migration 000).
-- ============================================================

SET @db = (SELECT DATABASE());
SET @col_exists = (SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'absensi_siswa' AND COLUMN_NAME = 'topik');

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE absensi_siswa ADD COLUMN topik VARCHAR(255) NULL AFTER id_mapel',
  'SELECT 1 AS column_already_exists');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
