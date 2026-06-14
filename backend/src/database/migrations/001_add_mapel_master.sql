CREATE TABLE IF NOT EXISTS mapel (
  id_mapel INT AUTO_INCREMENT PRIMARY KEY,
  nama_mapel VARCHAR(100) NOT NULL,
  UNIQUE KEY uq_mapel_nama (nama_mapel)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO mapel (nama_mapel)
SELECT DISTINCT TRIM(nama_kelas)
FROM kelas
WHERE COALESCE(TRIM(nama_kelas), '') <> ''
ON DUPLICATE KEY UPDATE nama_mapel = VALUES(nama_mapel);

ALTER TABLE kelas
  ADD COLUMN id_mapel INT NULL AFTER nama_kelas;

UPDATE kelas k
INNER JOIN mapel m
  ON m.nama_mapel = TRIM(k.nama_kelas)
SET k.id_mapel = m.id_mapel
WHERE k.id_mapel IS NULL
  AND COALESCE(TRIM(k.nama_kelas), '') <> '';

ALTER TABLE kelas
  MODIFY COLUMN id_mapel INT NOT NULL,
  ADD INDEX idx_kelas_id_mapel (id_mapel),
  ADD CONSTRAINT fk_kelas_mapel
    FOREIGN KEY (id_mapel) REFERENCES mapel(id_mapel)
    ON UPDATE CASCADE
    ON DELETE RESTRICT;
