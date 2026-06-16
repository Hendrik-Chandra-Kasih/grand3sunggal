-- ============================================================
-- Migration 002: Restructure Mapel and Relations
-- Idempotent — aman dijalankan berulang kali.
-- ============================================================

-- 1. Nonaktifkan foreign key checks sementara
SET FOREIGN_KEY_CHECKS = 0;

-- Simpan nama database
SET @db = (SELECT DATABASE());

-- ============================================================
-- 2. Seed data mapel (hapus lama, isi ulang dengan data master)
-- ============================================================
TRUNCATE TABLE mapel;
INSERT INTO mapel (nama_mapel) VALUES
  ('SD'),
  ('SMP'),
  ('SMA'),
  ('Bahasa Inggris'),
  ('calistung'),
  ('MAFIA');

-- ============================================================
-- 3. Siswa: ganti jenis_kelas → mapel (hanya jika jenis_kelas masih ada)
-- ============================================================
SET @siswa_jenis_kelas = (SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'siswa' AND COLUMN_NAME = 'jenis_kelas');

SET @siswa_mapel = (SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'siswa' AND COLUMN_NAME = 'mapel');

-- Jika jenis_kelas masih ada, rename ke mapel
-- Jika jenis_kelas sudah tidak ada tapi mapel belum ada, ADD COLUMN
SET @siswa_sql = IF(@siswa_jenis_kelas > 0,
  'ALTER TABLE siswa CHANGE COLUMN jenis_kelas mapel VARCHAR(255) NULL',
  IF(@siswa_mapel = 0,
    'ALTER TABLE siswa ADD COLUMN mapel VARCHAR(255) NULL',
    'SELECT 1 AS siswa_ok'));
PREPARE stmt FROM @siswa_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================
-- 4. Tutor: tambahkan field mapel jika belum ada
-- ============================================================
SET @tutor_mapel = (SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'tutor' AND COLUMN_NAME = 'mapel');

SET @tutor_sql = IF(@tutor_mapel = 0,
  'ALTER TABLE tutor ADD COLUMN mapel VARCHAR(255) NULL AFTER status',
  'SELECT 1 AS tutor_ok');
PREPARE stmt FROM @tutor_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================
-- 5. Kelas: update id_mapel dari jenjang lama, lalu hapus kolom jenjang
--    (hanya jika kolom jenjang masih ada)
-- ============================================================
SET @kelas_jenjang = (SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'kelas' AND COLUMN_NAME = 'jenjang');

SET @kelas_sql = IF(@kelas_jenjang > 0,
  CONCAT(
    "UPDATE kelas SET id_mapel = (SELECT id_mapel FROM mapel WHERE nama_mapel = 'SD' LIMIT 1) WHERE jenjang = 'SD';",
    "UPDATE kelas SET id_mapel = (SELECT id_mapel FROM mapel WHERE nama_mapel = 'SMP' LIMIT 1) WHERE jenjang = 'SMP';",
    "UPDATE kelas SET id_mapel = (SELECT id_mapel FROM mapel WHERE nama_mapel = 'SMA' LIMIT 1) WHERE jenjang = 'SMA' OR jenjang = 'SMA/SMK';",
    "UPDATE kelas SET id_mapel = (SELECT id_mapel FROM mapel WHERE nama_mapel = 'calistung' LIMIT 1) WHERE LOWER(jenjang) = 'calistung';",
    "UPDATE kelas SET id_mapel = (SELECT id_mapel FROM mapel WHERE nama_mapel = 'MAFIA' LIMIT 1) WHERE LOWER(jenjang) = 'mafia';",
    "UPDATE kelas SET id_mapel = (SELECT id_mapel FROM mapel WHERE nama_mapel = 'SD' LIMIT 1) WHERE id_mapel IS NULL OR id_mapel = 0;",
    'ALTER TABLE kelas DROP COLUMN jenjang;'
  ),
  'SELECT 1 AS kelas_ok');
PREPARE stmt FROM @kelas_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================
-- 6. Jadwal: tambahkan id_mapel jika belum ada
-- ============================================================
SET @jadwal_id_mapel = (SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'jadwal' AND COLUMN_NAME = 'id_mapel');

SET @jadwal_sql = IF(@jadwal_id_mapel = 0,
  'ALTER TABLE jadwal ADD COLUMN id_mapel INT NULL AFTER id_tutor',
  'SELECT 1 AS jadwal_ok');
PREPARE stmt FROM @jadwal_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Isi jadwal.id_mapel dari kelas.id_mapel (hanya jika masih NULL)
UPDATE jadwal j
INNER JOIN kelas k ON k.id_kelas = j.id_kelas
SET j.id_mapel = k.id_mapel
WHERE j.id_mapel IS NULL;

-- Jadikan NOT NULL & tambah FK hanya jika kolom masih nullable
SET @jadwal_is_nullable = (SELECT IS_NULLABLE
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'jadwal' AND COLUMN_NAME = 'id_mapel');

SET @jadwal_fk_exists = (SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = @db AND TABLE_NAME = 'jadwal'
    AND CONSTRAINT_NAME = 'fk_jadwal_mapel' AND CONSTRAINT_TYPE = 'FOREIGN KEY');

SET @jadwal_mod = 'ALTER TABLE jadwal';
SET @jadwal_mod = IF(@jadwal_is_nullable = 'YES',
  CONCAT(@jadwal_mod, ' MODIFY COLUMN id_mapel INT NOT NULL,'),
  @jadwal_mod);
SET @jadwal_mod = IF(@jadwal_fk_exists = 0,
  CONCAT(@jadwal_mod,
    ' ADD CONSTRAINT fk_jadwal_mapel',
    '   FOREIGN KEY (id_mapel) REFERENCES mapel(id_mapel)',
    '   ON UPDATE CASCADE ON DELETE RESTRICT'),
  @jadwal_mod);
SET @jadwal_mod = IF(@jadwal_fk_exists > 0 AND RIGHT(@jadwal_mod, 1) = ',',
  LEFT(@jadwal_mod, CHAR_LENGTH(@jadwal_mod) - 1),
  @jadwal_mod);

SET @jadwal_has_changes = (SELECT
  CASE WHEN @jadwal_is_nullable = 'YES' OR @jadwal_fk_exists = 0 THEN 1 ELSE 0 END);
SET @jadwal_final = IF(@jadwal_has_changes = 1, @jadwal_mod, 'SELECT 1 AS jadwal_done');
PREPARE stmt FROM @jadwal_final;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================
-- 7. Absensi_siswa: tambahkan id_mapel, lalu hapus topik_pembelajaran
-- ============================================================
SET @absensi_id_mapel = (SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'absensi_siswa' AND COLUMN_NAME = 'id_mapel');

SET @absensi_sql = IF(@absensi_id_mapel = 0,
  'ALTER TABLE absensi_siswa ADD COLUMN id_mapel INT NULL AFTER status',
  'SELECT 1 AS absensi_ok');
PREPARE stmt FROM @absensi_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Isi absensi_siswa.id_mapel dari jadwal (hanya jika masih NULL)
UPDATE absensi_siswa a
INNER JOIN jadwal j ON j.id_jadwal = a.id_jadwal
SET a.id_mapel = j.id_mapel
WHERE a.id_mapel IS NULL;

-- Tambah FK hanya jika belum ada
SET @absensi_fk_exists = (SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = @db AND TABLE_NAME = 'absensi_siswa'
    AND CONSTRAINT_NAME = 'fk_absensi_siswa_mapel' AND CONSTRAINT_TYPE = 'FOREIGN KEY');

SET @absensi_fk_sql = IF(@absensi_fk_exists = 0,
  'ALTER TABLE absensi_siswa ADD CONSTRAINT fk_absensi_siswa_mapel FOREIGN KEY (id_mapel) REFERENCES mapel(id_mapel) ON UPDATE CASCADE ON DELETE SET NULL',
  'SELECT 1 AS absensi_fk_ok');
PREPARE stmt FROM @absensi_fk_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Hapus kolom topik_pembelajaran hanya jika masih ada
SET @absensi_topik = (SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'absensi_siswa' AND COLUMN_NAME = 'topik_pembelajaran');

SET @absensi_drop_sql = IF(@absensi_topik > 0,
  'ALTER TABLE absensi_siswa DROP COLUMN topik_pembelajaran',
  'SELECT 1 AS absensi_drop_ok');
PREPARE stmt FROM @absensi_drop_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================
-- 8. Aktifkan kembali foreign key checks
-- ============================================================
SET FOREIGN_KEY_CHECKS = 1;
