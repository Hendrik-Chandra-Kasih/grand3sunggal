-- ============================================================
-- Migration 014: Create table pengeluaran_bimbel (bimbel expenses)
-- ============================================================

CREATE TABLE IF NOT EXISTS pengeluaran_bimbel (
  id_pengeluaran       INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  nominal              BIGINT          NOT NULL DEFAULT 0,
  tanggal_pengeluaran  DATE            NOT NULL,
  keterangan           VARCHAR(255)    NOT NULL DEFAULT '',
  created_at           TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tanggal_pengeluaran (tanggal_pengeluaran)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
