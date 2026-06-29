-- ============================================================
-- Migration 007: Add jam_selesai field to jadwal table
-- Idempotent — skips if column already exists.
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET @db = (SELECT DATABASE());

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'jadwal' AND COLUMN_NAME = 'jam_selesai');

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE jadwal ADD COLUMN jam_selesai TIME NULL AFTER jam',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET FOREIGN_KEY_CHECKS = 1;
