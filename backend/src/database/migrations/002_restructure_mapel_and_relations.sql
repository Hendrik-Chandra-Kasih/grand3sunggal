-- ============================================================
-- Migration 002: Restructure Mapel and Relations
-- ============================================================

-- 1. Nonaktifkan foreign key checks sementara
SET FOREIGN_KEY_CHECKS = 0;

-- 2. Bersihkan tabel mapel lama dan masukkan seed baru sesuai permintaan:
--    SD, SMP, SMA, Bahasa Inggris, calistung, MAFIA
TRUNCATE TABLE mapel;

INSERT INTO mapel (nama_mapel) VALUES
  ('SD'),
  ('SMP'),
  ('SMA'),
  ('Bahasa Inggris'),
  ('calistung'),
  ('MAFIA');

-- 3. Ubah tabel siswa: ganti jenis_kelas menjadi mapel (VARCHAR(255) / TEXT untuk multiple)
ALTER TABLE siswa CHANGE COLUMN jenis_kelas mapel VARCHAR(255) NULL;

-- 4. Ubah tabel tutor: tambahkan field mapel (VARCHAR(255) / TEXT untuk multiple)
ALTER TABLE tutor ADD COLUMN mapel VARCHAR(255) NULL AFTER status;

-- 5. Ubah tabel kelas:
--    - Kita akan memetakan jenjang lama ke id_mapel baru
--    - Jenjang lama: 'SD', 'SMP', 'SMA', 'Calistung', 'Mafia'
--    - Kita update id_mapel di kelas berdasarkan jenjang lama tersebut
UPDATE kelas SET id_mapel = (SELECT id_mapel FROM mapel WHERE nama_mapel = 'SD' LIMIT 1) WHERE jenjang = 'SD';
UPDATE kelas SET id_mapel = (SELECT id_mapel FROM mapel WHERE nama_mapel = 'SMP' LIMIT 1) WHERE jenjang = 'SMP';
UPDATE kelas SET id_mapel = (SELECT id_mapel FROM mapel WHERE nama_mapel = 'SMA' LIMIT 1) WHERE jenjang = 'SMA' OR jenjang = 'SMA/SMK';
UPDATE kelas SET id_mapel = (SELECT id_mapel FROM mapel WHERE nama_mapel = 'calistung' LIMIT 1) WHERE LOWER(jenjang) = 'calistung';
UPDATE kelas SET id_mapel = (SELECT id_mapel FROM mapel WHERE nama_mapel = 'MAFIA' LIMIT 1) WHERE LOWER(jenjang) = 'mafia';

--    - Jika ada kelas yang id_mapel-nya masih kosong, beri default SD
UPDATE kelas SET id_mapel = (SELECT id_mapel FROM mapel WHERE nama_mapel = 'SD' LIMIT 1) WHERE id_mapel IS NULL OR id_mapel = 0;

--    - Hapus kolom jenjang dari kelas
ALTER TABLE kelas DROP COLUMN jenjang;

-- 6. Ubah tabel jadwal: tambahkan field id_mapel
ALTER TABLE jadwal ADD COLUMN id_mapel INT NULL AFTER id_tutor;

--    - Isi jadwal.id_mapel dari kelas.id_mapel yang terkait
UPDATE jadwal j INNER JOIN kelas k ON k.id_kelas = j.id_kelas SET j.id_mapel = k.id_mapel;

--    - Jadikan id_mapel NOT NULL setelah diisi, dan tambahkan foreign key
ALTER TABLE jadwal MODIFY COLUMN id_mapel INT NOT NULL;
ALTER TABLE jadwal ADD CONSTRAINT fk_jadwal_mapel FOREIGN KEY (id_mapel) REFERENCES mapel(id_mapel) ON UPDATE CASCADE ON DELETE RESTRICT;

-- 7. Ubah tabel absensi_siswa: topik_pembelajaran menjadi id_mapel (INT NULL)
--    - Tambahkan kolom id_mapel
ALTER TABLE absensi_siswa ADD COLUMN id_mapel INT NULL AFTER status;

--    - Isi absensi_siswa.id_mapel dari jadwal.id_mapel yang terkait
UPDATE absensi_siswa a INNER JOIN jadwal j ON j.id_jadwal = a.id_jadwal SET a.id_mapel = j.id_mapel;

--    - Tambahkan foreign key untuk absensi_siswa.id_mapel
ALTER TABLE absensi_siswa ADD CONSTRAINT fk_absensi_siswa_mapel FOREIGN KEY (id_mapel) REFERENCES mapel(id_mapel) ON UPDATE CASCADE ON DELETE SET NULL;

--    - Hapus kolom topik_pembelajaran lama
ALTER TABLE absensi_siswa DROP COLUMN topik_pembelajaran;

-- 8. Aktifkan kembali foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
