-- ============================================================
-- Migration 007: Add jam_selesai field to jadwal table
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

ALTER TABLE jadwal
  ADD COLUMN jam_selesai TIME NULL AFTER jam;

SET FOREIGN_KEY_CHECKS = 1;
