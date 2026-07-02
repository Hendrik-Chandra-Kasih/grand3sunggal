-- ============================================================
-- Migration 006: Add infal_tutor table, app_settings, 
--                and new columns for gaji_tutor
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- 1. Tabel infal_tutor — mencatat tutor pengganti (infal)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS infal_tutor (
    id_infal           INT          AUTO_INCREMENT PRIMARY KEY,
    id_tutor_pengganti INT          NOT NULL,
    id_tutor_absen     INT          NOT NULL,
    id_kelas           INT          NOT NULL,
    id_jadwal          INT          NULL,
    tanggal            DATE         NOT NULL,
    nominal            BIGINT       DEFAULT 15000,
    keterangan         TEXT,
    created_at         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tutor_pengganti) REFERENCES tutor(id_tutor) ON DELETE CASCADE,
    FOREIGN KEY (id_tutor_absen)     REFERENCES tutor(id_tutor) ON DELETE CASCADE,
    FOREIGN KEY (id_kelas)           REFERENCES kelas(id_kelas) ON DELETE CASCADE,
    FOREIGN KEY (id_jadwal)          REFERENCES jadwal(id_jadwal) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. Tabel app_settings — konfigurasi dinamis oleh owner
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS app_settings (
    id_setting    INT          AUTO_INCREMENT PRIMARY KEY,
    setting_key   VARCHAR(50)  NOT NULL UNIQUE,
    setting_value TEXT         NOT NULL,
    description   VARCHAR(255),
    updated_by    INT          NULL,
    updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id_user) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3. Tambah kolom baru di gaji_tutor
-- ------------------------------------------------------------
ALTER TABLE gaji_tutor
  ADD COLUMN total_infal    BIGINT DEFAULT 0 AFTER bonus,
  ADD COLUMN status_gaji    ENUM('Draft','Dikonfirmasi','Dibayar') DEFAULT 'Draft' AFTER total_gaji;

-- ------------------------------------------------------------
-- 4. Seed data awal untuk app_settings
-- ------------------------------------------------------------
INSERT INTO app_settings (setting_key, setting_value, description) VALUES
('bonus_kehadiran_enabled',   'true',   'Aktifkan/nonaktifkan bonus kehadiran tutor'),
('bonus_kehadiran_nominal',   '65000',  'Nominal bonus kehadiran per bulan'),
('bonus_kehadiran_maks_absen','2',      'Maksimal absen agar bonus tetap diberikan (dalam hari)'),
('infal_enabled',             'true',   'Aktifkan/nonaktifkan fitur infal'),
('infal_nominal',             '15000',  'Nominal per infal'),
('persentase_gaji_tutor',     '40',     'Persentase gaji tutor dari total SPP'),
('hari_kerja_per_bulan',      '20',     'Jumlah hari kerja normal per bulan')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

SET FOREIGN_KEY_CHECKS = 1;
