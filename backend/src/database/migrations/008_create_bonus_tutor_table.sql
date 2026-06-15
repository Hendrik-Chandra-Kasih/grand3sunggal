-- ============================================================
-- Migration 008: Create bonus_tutor table for manual bonus assignment
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS bonus_tutor (
    id_bonus    INT          AUTO_INCREMENT PRIMARY KEY,
    id_tutor    INT          NOT NULL,
    bulan       INT          NOT NULL,
    tahun       INT          NOT NULL,
    nominal     BIGINT       NOT NULL DEFAULT 0,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_bonus (id_tutor, bulan, tahun),
    FOREIGN KEY (id_tutor) REFERENCES tutor(id_tutor) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
