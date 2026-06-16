-- ============================================================
--  Migration 001: Add mapel master table & link to kelas
--  Idempotent — aman dijalankan berulang kali.
-- ============================================================

-- 1. Tabel mapel (sudah pakai IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS mapel (
  id_mapel INT AUTO_INCREMENT PRIMARY KEY,
  nama_mapel VARCHAR(100) NOT NULL,
  UNIQUE KEY uq_mapel_nama (nama_mapel)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Isi data master mapel dari nama_kelas yang sudah ada
INSERT INTO mapel (nama_mapel)
SELECT DISTINCT TRIM(nama_kelas)
FROM kelas
WHERE COALESCE(TRIM(nama_kelas), '') <> ''
ON DUPLICATE KEY UPDATE nama_mapel = VALUES(nama_mapel);

-- 3. Tambah kolom id_mapel di kelas hanya jika belum ada
SET @db = (SELECT DATABASE());
SET @col_exists = (SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'kelas' AND COLUMN_NAME = 'id_mapel');

SET @col_sql = IF(@col_exists = 0,
  'ALTER TABLE kelas ADD COLUMN id_mapel INT NULL AFTER nama_kelas',
  'SELECT 1');
PREPARE stmt FROM @col_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. Isi relasi id_mapel ke mapel yang sudah ada
UPDATE kelas k
INNER JOIN mapel m
  ON m.nama_mapel = TRIM(k.nama_kelas)
SET k.id_mapel = m.id_mapel
WHERE k.id_mapel IS NULL
  AND COALESCE(TRIM(k.nama_kelas), '') <> '';

-- 5. Ubah kolom jadi NOT NULL, tambah index & FK (hanya jika belum)
SET @idx_exists = (SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'kelas' AND INDEX_NAME = 'idx_kelas_id_mapel');

SET @fk_exists = (SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = @db AND TABLE_NAME = 'kelas'
    AND CONSTRAINT_NAME = 'fk_kelas_mapel' AND CONSTRAINT_TYPE = 'FOREIGN KEY');

SET @mod_sql = 'ALTER TABLE kelas';

-- MODIFY COLUMN: hanya jika kolom belum NOT NULL
SET @is_not_null = (SELECT IS_NULLABLE
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'kelas' AND COLUMN_NAME = 'id_mapel');

SET @mod_sql = IF(@is_not_null = 'YES',
  CONCAT(@mod_sql, ' MODIFY COLUMN id_mapel INT NOT NULL,'),
  @mod_sql);

SET @mod_sql = IF(@idx_exists = 0,
  CONCAT(@mod_sql, ' ADD INDEX idx_kelas_id_mapel (id_mapel),'),
  @mod_sql);

SET @mod_sql = IF(@fk_exists = 0,
  CONCAT(@mod_sql,
    ' ADD CONSTRAINT fk_kelas_mapel',
    '   FOREIGN KEY (id_mapel) REFERENCES mapel(id_mapel)',
    '   ON UPDATE CASCADE ON DELETE RESTRICT'),
  @mod_sql);

-- Hapus koma trailing dari MODIFY/INDEX jika FK tidak ditambahkan (dan ada koma di akhir)
SET @mod_sql = IF(@fk_exists > 0 AND RIGHT(@mod_sql, 1) = ',',
  LEFT(@mod_sql, CHAR_LENGTH(@mod_sql) - 1),
  @mod_sql);

-- Hanya jalan jika ada perubahan
SET @has_changes = (SELECT
  CASE
    WHEN @is_not_null = 'YES' OR @idx_exists = 0 OR @fk_exists = 0 THEN 1
    ELSE 0
  END);

SET @final_sql = IF(@has_changes = 1,
  @mod_sql,
  'SELECT 1');

PREPARE stmt2 FROM @final_sql;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;
