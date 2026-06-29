-- ============================================================
--  Migration 000: Create base tables (core schema v2.1)
--  This is the foundational schema. All subsequent migrations
--  are incremental patches on top of this.
-- ============================================================

-- ------------------------------------------------------------
-- 1. USERS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id_user   INT          AUTO_INCREMENT PRIMARY KEY,
    username  VARCHAR(50)  NOT NULL UNIQUE,
    password  VARCHAR(255) NOT NULL,
    role      ENUM('admin','tutor','siswa','pemilik') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. SISWA
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS siswa (
    id_siswa        INT          AUTO_INCREMENT PRIMARY KEY,
    id_user         INT          NOT NULL,
    nama            VARCHAR(50)  NOT NULL,
    tempat_lahir    VARCHAR(50),
    tanggal_lahir   DATE,
    jenis_kelamin   VARCHAR(10),
    kelas           VARCHAR(20),
    mapel           TEXT,
    asal_sekolah    VARCHAR(50),
    alamat          TEXT,
    tanggal_masuk   DATE,
    nama_ortu       VARCHAR(50),
    pekerjaan_ortu  VARCHAR(50),
    no_hp_ortu      VARCHAR(15),
    pendidikan_ortu VARCHAR(20),
    spp             BIGINT       DEFAULT 0,
    status          ENUM('Aktif','Nonaktif') DEFAULT 'Aktif',
    FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3. TUTOR
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tutor (
    id_tutor           INT          AUTO_INCREMENT PRIMARY KEY,
    id_user            INT          NOT NULL,
    nama_tutor         VARCHAR(50)  NOT NULL,
    tempat_lahir       VARCHAR(50),
    tanggal_lahir      DATE,
    jenis_kelamin      CHAR(1),
    alamat             TEXT,
    pendidikan         VARCHAR(50),
    no_hp              VARCHAR(15),
    tanggal_bergabung  DATE,
    status             ENUM('Aktif','Nonaktif') DEFAULT 'Aktif',
    mapel              VARCHAR(255),
    FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 4. MAPEL
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mapel (
    id_mapel    INT           AUTO_INCREMENT PRIMARY KEY,
    nama_mapel  VARCHAR(100)  NOT NULL,
    UNIQUE KEY uq_mapel_nama (nama_mapel)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5. KELAS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kelas (
    id_kelas    INT          AUTO_INCREMENT PRIMARY KEY,
    nama_kelas  VARCHAR(50)  NOT NULL,
    id_mapel    INT          NOT NULL,
    id_tutor    INT,
    FOREIGN KEY (id_mapel) REFERENCES mapel(id_mapel) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (id_tutor) REFERENCES tutor(id_tutor) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 6. KELAS_SISWA
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kelas_siswa (
    id_kelas_siswa  INT  AUTO_INCREMENT PRIMARY KEY,
    id_siswa        INT  NOT NULL,
    id_kelas        INT  NOT NULL,
    FOREIGN KEY (id_siswa) REFERENCES siswa(id_siswa) ON DELETE CASCADE,
    FOREIGN KEY (id_kelas) REFERENCES kelas(id_kelas) ON DELETE CASCADE,
    UNIQUE KEY uq_kelas_siswa (id_siswa, id_kelas)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 7. JADWAL
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS jadwal (
    id_jadwal   INT          AUTO_INCREMENT PRIMARY KEY,
    id_kelas    INT          NOT NULL,
    id_tutor    INT          NOT NULL,
    id_mapel    INT          NOT NULL,
    hari        ENUM('Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu') NOT NULL,
    jam         TIME         NOT NULL,
    FOREIGN KEY (id_kelas)  REFERENCES kelas(id_kelas)  ON DELETE CASCADE,
    FOREIGN KEY (id_tutor)  REFERENCES tutor(id_tutor)  ON DELETE CASCADE,
    FOREIGN KEY (id_mapel)  REFERENCES mapel(id_mapel)  ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 8. PEMBAYARAN
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pembayaran (
    id_pembayaran      INT          AUTO_INCREMENT PRIMARY KEY,
    id_siswa           INT          NOT NULL,
    bulan              VARCHAR(20),
    tanggal_bayar      DATE         NOT NULL,
    jenis_pembayaran   VARCHAR(20),
    jumlah             BIGINT       DEFAULT 0,
    metode_pembayaran  ENUM('Tunai','Transfer'),
    diskon             BIGINT       DEFAULT 0,
    status             ENUM('Pending','Verified','Rejected') DEFAULT 'Pending',
    tanggal_verifikasi DATE,
    catatan            TEXT,
    FOREIGN KEY (id_siswa) REFERENCES siswa(id_siswa) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 9. ABSENSI_SISWA
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS absensi_siswa (
    id_absensi          INT          AUTO_INCREMENT PRIMARY KEY,
    id_siswa            INT          NOT NULL,
    id_jadwal           INT          NOT NULL,
    tanggal             DATE         NOT NULL,
    pertemuan           INT          DEFAULT 1,
    status              ENUM('Hadir','Tidak Hadir','Sakit','Izin') NOT NULL,
    id_mapel            INT,
    is_confirmed        TINYINT(1)   DEFAULT 0,
    confirmed_at        DATE,
    confirmed_by        INT,
    FOREIGN KEY (id_siswa)  REFERENCES siswa(id_siswa)   ON DELETE CASCADE,
    FOREIGN KEY (id_jadwal) REFERENCES jadwal(id_jadwal) ON DELETE CASCADE,
    FOREIGN KEY (id_mapel)  REFERENCES mapel(id_mapel)   ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 10. ABSENSI_TUTOR
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS absensi_tutor (
    id_absensi_tutor  INT          AUTO_INCREMENT PRIMARY KEY,
    id_tutor          INT          NOT NULL,
    tanggal           DATE         NOT NULL,
    status            ENUM('Hadir','Absen') NOT NULL,
    FOREIGN KEY (id_tutor) REFERENCES tutor(id_tutor) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 11. GAJI_TUTOR (base columns only)
--      Additional columns (total_infal, status_gaji) are added
--      by migration 006.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gaji_tutor (
    id_gaji           INT          AUTO_INCREMENT PRIMARY KEY,
    id_tutor          INT          NOT NULL,
    periode           DATETIME     NOT NULL,
    total_pemasukan   BIGINT       DEFAULT 0,
    potongan          BIGINT       DEFAULT 0,
    bonus             BIGINT       DEFAULT 0,
    total_gaji        BIGINT       DEFAULT 0,
    FOREIGN KEY (id_tutor) REFERENCES tutor(id_tutor) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
