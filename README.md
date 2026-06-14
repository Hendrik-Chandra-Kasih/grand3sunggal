# Grand3Sunggal — Fullstack Project

Sistem manajemen bimbingan belajar (Bimbel) dengan fitur manajemen siswa, tutor, kelas, jadwal, absensi, pembayaran SPP, penggajian tutor, dan laporan keuangan.

**Stack:**

| Layer      | Teknologi                                   |
| ---------- | ------------------------------------------- |
| Frontend   | React.js 18 + Vite + React Router 6         |
| Backend    | Express.js 4 + ES Modules                   |
| Database   | MySQL 8+ (via mysql2 + connection pool)     |
| Auth       | JWT (jsonwebtoken + bcryptjs)               |

---

## Daftar Isi

- [Struktur Folder](#struktur-folder)
- [Prasyarat](#prasyarat)
- [Environment Variables](#environment-variables)
- [Setup Backend](#setup-backend)
- [Setup Frontend](#setup-frontend)
- [Database: Inisialisasi](#database-inisialisasi)
- [Database: Migrations](#database-migrations)
- [Database: Reset](#database-reset)
- [Database: Seed](#database-seed)
- [Port yang Digunakan](#port-yang-digunakan)
- [API Endpoints](#api-endpoints)

---

## Struktur Folder

```
grand3sunggal/
├── frontend/                          # React.js + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/                 # Layout halaman admin (sidebar, header)
│   │   │   ├── home/                  # Header, Footer, ChatButton publik
│   │   │   ├── owner/                 # Layout halaman owner
│   │   │   ├── siswa/                 # Layout halaman siswa
│   │   │   ├── tutor/                 # Layout halaman tutor
│   │   │   ├── Layout.jsx             # Layout bersama
│   │   │   └── ProtectedRoute.jsx     # Guard route berbasis role
│   │   ├── pages/
│   │   │   ├── home/                  # Halaman publik (Beranda, Berita, Tutor, ProfileBimbel)
│   │   │   ├── login/                 # Halaman login
│   │   │   └── dashboard/
│   │   │       ├── admin/             # Manajemen siswa, tutor, kelas, jadwal, pembayaran, absensi
│   │   │       ├── tutor/             # Jadwal mengajar, absensi siswa, kehadiran, gaji, profil
│   │   │       ├── siswa/             # Jadwal belajar, pembayaran, profil
│   │   │       └── owner/             # Kelola gaji, laporan keuangan
│   │   ├── services/
│   │   │   └── api.js                 # Axios client (base URL, interceptor JWT)
│   │   ├── App.jsx                    # Root component + routing
│   │   └── main.jsx                   # Entry point
│   ├── vite.config.js                 # Konfigurasi Vite (port 3000, proxy /api)
│   └── package.json
│
└── backend/                           # Express.js + MySQL
    ├── src/
    │   ├── config/
    │   │   ├── database.js            # Koneksi MySQL (connection pool)
    │   │   └── query.js               # Helper query: query(), queryOne(), queryScalar(), buildWhere()
    │   ├── middleware/
    │   │   └── auth.js                # Middleware verifikasi JWT
    │   ├── routes/                    # Definisi route per modul (13 file)
    │   │   ├── health.js              # GET /api/health
    │   │   ├── auth.js                # Register, login, me, change-password
    │   │   ├── siswa.js               # CRUD siswa
    │   │   ├── tutor.js               # CRUD tutor (guru)
    │   │   ├── mapel.js               # CRUD mata pelajaran
    │   │   ├── kelas.js               # CRUD kelas
    │   │   ├── jadwal.js              # CRUD jadwal
    │   │   ├── absensiSiswa.js        # Absensi siswa
    │   │   ├── absensiTutor.js        # Absensi tutor
    │   │   ├── pembayaran.js          # Pembayaran SPP
    │   │   ├── dashboard.js           # Statistik dashboard
    │   │   ├── gaji.js                # Penggajian tutor
    │   │   └── keuangan.js            # Laporan keuangan
    │   ├── controllers/               # Logika bisnis per modul (12 file)
    │   ├── repository/                # Layer akses data per entitas (10 file)
    │   ├── database/
    │   │   ├── schema.sql             # Skema database utama
    │   │   ├── migrate.js             # Runner migrasi bertahap
    │   │   ├── reset.js               # Hapus & buat ulang semua tabel
    │   │   └── migrations/            # Migrasi SQL bertahap (5 file)
    │   ├── seed.js                    # Data dummy untuk development
    │   └── server.js                  # Entry point Express
    ├── .env.example                   # Template konfigurasi environment
    └── package.json
```

---

## Prasyarat

- [Node.js](https://nodejs.org/) v18+
- [MySQL](https://dev.mysql.com/downloads/) 8+
- npm (bundling dengan Node.js)

---

## Environment Variables

### Backend (`.env`)

Salin dari `.env.example` dan sesuaikan:

```bash
cd backend
copy .env.example .env
```

| Variable         | Default             | Deskripsi                              |
| ---------------- | ------------------- | -------------------------------------- |
| `PORT`           | `5000`              | Port server Express                    |
| `DB_HOST`        | `localhost`         | Host MySQL                             |
| `DB_PORT`        | `3306`              | Port MySQL                             |
| `DB_USER`        | `root`              | User MySQL                             |
| `DB_PASSWORD`    | `your_password`     | Password MySQL                         |
| `DB_NAME`        | `grand3sunggal_db`  | Nama database                          |
| `JWT_SECRET`     | —                   | Secret key untuk JWT                   |
| `JWT_EXPIRES_IN` | `7d`                | Masa berlaku token (contoh: `1d`, `7d`)|
| `NODE_ENV`       | `development`       | Environment mode                       |

### Frontend

Tidak perlu file `.env` terpisah. Frontend menggunakan proxy Vite (dikonfigurasi di `vite.config.js`) yang mengarahkan semua request `/api` ke `http://localhost:5000`.

---

## Setup Backend

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Konfigurasi environment
copy .env.example .env
# Edit .env sesuai dengan kredensial MySQL Anda

# 3. Jalankan dalam mode development (dengan auto-reload)
npm run dev

# Atau jalankan dalam mode production
npm start
```

Server berjalan di **http://localhost:5000**.

---

## Setup Frontend

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Jalankan dev server
npm run dev
```

Aplikasi berjalan di **http://localhost:3000**.

> **Catatan:** Vite telah dikonfigurasi dengan proxy. Semua request `/api` secara otomatis diteruskan ke `http://localhost:5000`, sehingga tidak perlu CORS manual saat development.

Build untuk production:

```bash
npm run build     # Hasil build di folder dist/
npm run preview   # Preview hasil build secara lokal
```

---

## Database: Inisialisasi

Ada dua cara untuk inisialisasi database:

### Opsi A: Manual (via MySQL CLI)

```bash
# Masuk ke MySQL
mysql -u root -p

# Buat database
CREATE DATABASE grand3sunggal_db;
USE grand3sunggal_db;

# Jalankan schema
SOURCE src/database/schema.sql;
EXIT;
```

### Opsi B: Via Script Reset

```bash
cd backend
npm run reset
```

Script ini akan:
1. Menghapus semua tabel yang ada (urutan aman dengan `FOREIGN_KEY_CHECKS = 0`)
2. Menjalankan ulang `schema.sql` dari awal

---

## Database: Migrations

Migrations digunakan untuk perubahan skema secara bertahap tanpa mengganggu data yang sudah ada.

```bash
cd backend
npm run migrate
```

Cara kerja:
- Membaca file `.sql` dari folder `src/database/migrations/`
- Menjalankan file yang belum pernah dijalankan (tracking via tabel `schema_migrations`)
- Setiap migrasi dibungkus dalam transaksi — jika gagal, akan di-rollback

File migrasi yang tersedia:

| File | Deskripsi |
|------|-----------|
| `001_add_mapel_master.sql` | Tabel master mata pelajaran |
| `002_restructure_mapel_and_relations.sql` | Restruktur relasi mapel |
| `003_add_topik_to_absensi_siswa.sql` | Kolom topik di absensi siswa |
| `004_change_siswa_mapel_to_json.sql` | Ubah tipe kolom mapel ke JSON |
| `005_change_gaji_tutor_periode_to_datetime.sql` | Ubah tipe periode gaji ke DATETIME |

---

## Database: Reset

Menghapus semua tabel dan membuat ulang dari skema awal.

```bash
cd backend
npm run reset
```

> **PERINGATAN:** Semua data akan hilang! Hanya gunakan di lingkungan development.

---

## Database: Seed

Mengisi database dengan data dummy untuk development.

```bash
cd backend
npm run seed
```

Data yang dihasilkan meliputi:
- Users (admin, owner, tutor, siswa)
- Mata pelajaran (Mapel)
- Data tutor lengkap
- Data siswa lengkap
- Kelas dan jadwal
- Enrollments (kelas_siswa)
- Absensi siswa hari ini
- Riwayat pembayaran
- Absensi tutor

---

## Port yang Digunakan

| Service           | Port | Catatan                          |
| ----------------- | ---- | -------------------------------- |
| Frontend (Vite)   | 3000 | Proxy `/api` → `localhost:5000`  |
| Backend (Express) | 5000 | API server utama                 |
| MySQL             | 3306 | Default port database            |

---

## API Endpoints

### Health & Auth

| Method | Endpoint              | Auth     | Deskripsi            |
| ------ | --------------------- | -------- | -------------------- |
| GET    | `/api/health`         | ✗        | Health check server  |
| POST   | `/api/auth/register`  | ✗        | Registrasi user baru |
| POST   | `/api/auth/login`     | ✗        | Login                |
| GET    | `/api/auth/me`        | ✓        | Data user saat ini   |
| PUT    | `/api/auth/update-username` | ✓  | Update username      |
| PUT    | `/api/auth/change-password` | ✓  | Ganti password       |

### Manajemen Data

| Method | Endpoint                        | Auth | Deskripsi                        |
| ------ | ------------------------------- | ---- | -------------------------------- |
| GET    | `/api/siswa`                    | ✓    | Daftar semua siswa               |
| GET    | `/api/siswa/:id`                | ✓    | Detail siswa                     |
| POST   | `/api/siswa`                    | ✓    | Tambah siswa                     |
| PUT    | `/api/siswa/:id`                | ✓    | Update siswa                     |
| DELETE | `/api/siswa/:id`                | ✓    | Hapus siswa                      |
| GET    | `/api/siswa/by-user/:id_user`   | ✓    | Cari siswa berdasarkan user ID   |
| GET    | `/api/siswa/kelas/:id_kelas`    | ✓    | Siswa dalam satu kelas           |
| GET    | `/api/siswa/:id/kelas`          | ✓    | Enrollments siswa                |
| GET    | `/api/guru`                     | ✓    | Daftar semua tutor               |
| GET    | `/api/guru/:id`                 | ✓    | Detail tutor                     |
| POST   | `/api/guru`                     | ✓    | Tambah tutor                     |
| PUT    | `/api/guru/:id`                 | ✓    | Update tutor                     |
| DELETE | `/api/guru/:id`                 | ✓    | Hapus tutor                      |
| GET    | `/api/guru/by-user/:id_user`    | ✓    | Cari tutor berdasarkan user ID   |
| GET    | `/api/mapel`                    | ✓    | Daftar mata pelajaran            |
| GET    | `/api/kelas`                    | ✓    | Daftar kelas                     |
| GET    | `/api/kelas/jenjang`            | ✓    | Opsi jenjang                     |
| GET    | `/api/kelas/:id`                | ✓    | Detail kelas                     |
| POST   | `/api/kelas`                    | ✓    | Tambah kelas                     |
| PUT    | `/api/kelas/:id`                | ✓    | Update kelas                     |
| DELETE | `/api/kelas/:id`                | ✓    | Hapus kelas                      |

### Jadwal & Absensi

| Method | Endpoint                                        | Auth | Deskripsi                            |
| ------ | ----------------------------------------------- | ---- | ------------------------------------ |
| GET    | `/api/jadwal`                                   | ✓    | Daftar jadwal                        |
| GET    | `/api/jadwal/:id`                               | ✓    | Detail jadwal                        |
| POST   | `/api/jadwal`                                   | ✓    | Tambah jadwal                        |
| PUT    | `/api/jadwal/:id`                               | ✓    | Update jadwal                        |
| DELETE | `/api/jadwal/:id`                               | ✓    | Hapus jadwal                         |
| GET    | `/api/jadwal/siswa/:id_siswa`                   | ✓    | Jadwal untuk siswa                   |
| GET    | `/api/jadwal/tutor/:id_tutor`                   | ✓    | Jadwal untuk tutor                   |
| POST   | `/api/absensi-siswa`                            | ✓    | Input absensi siswa                  |
| POST   | `/api/absensi-siswa/bulk`                       | ✓    | Input absensi siswa massal           |
| GET    | `/api/absensi-siswa`                            | ✓    | Riwayat absensi siswa                |
| GET    | `/api/absensi-siswa/:id`                        | ✓    | Detail absensi siswa                 |
| PUT    | `/api/absensi-siswa/:id`                        | ✓    | Update absensi siswa                 |
| PATCH  | `/api/absensi-siswa/:id/confirm`                | ✓    | Konfirmasi absensi siswa             |
| PATCH  | `/api/absensi-siswa/confirm-class/:id_kelas`    | ✓    | Konfirmasi absensi per kelas         |
| PATCH  | `/api/absensi-siswa/confirm-all-today`          | ✓    | Konfirmasi semua absensi hari ini    |
| DELETE | `/api/absensi-siswa/:id`                        | ✓    | Hapus absensi siswa                  |
| POST   | `/api/absensi-tutor/bulk`                       | ✓    | Input absensi tutor massal           |
| GET    | `/api/absensi-tutor/today`                      | ✓    | Absensi tutor hari ini               |
| GET    | `/api/absensi-tutor/recap`                      | ✓    | Rekap absensi tutor                  |

### Pembayaran & Keuangan

| Method | Endpoint                              | Auth | Deskripsi                             |
| ------ | ------------------------------------- | ---- | ------------------------------------- |
| GET    | `/api/pembayaran`                     | ✓    | Daftar pembayaran                     |
| GET    | `/api/pembayaran/:id`                 | ✓    | Detail pembayaran                     |
| POST   | `/api/pembayaran`                     | ✓    | Catat pembayaran baru                 |
| PUT    | `/api/pembayaran/:id`                 | ✓    | Update pembayaran                     |
| PATCH  | `/api/pembayaran/:id/verify`          | ✓    | Verifikasi pembayaran                 |
| PATCH  | `/api/pembayaran/bulk-verify`         | ✓    | Verifikasi massal                     |
| DELETE | `/api/pembayaran/:id`                 | ✓    | Hapus pembayaran                      |
| GET    | `/api/pembayaran/tunggakan/:id_siswa` | ✓    | Hitung tunggakan SPP siswa            |
| GET    | `/api/gaji/perhitungan`               | ✓    | Perhitungan gaji tutor                |
| GET    | `/api/gaji/all`                       | ✓    | Semua data gaji                       |
| POST   | `/api/gaji/send`                      | ✓    | Kirim/simpan gaji tutor               |
| GET    | `/api/keuangan/rekap`                 | ✓    | Rekap keuangan bulanan                |
| GET    | `/api/keuangan/tahunan`               | ✓    | Laporan keuangan tahunan              |

### Dashboard

| Method | Endpoint                         | Auth | Deskripsi                        |
| ------ | -------------------------------- | ---- | -------------------------------- |
| GET    | `/api/dashboard/stats`           | ✓    | Statistik dashboard              |
| GET    | `/api/dashboard/absensi-hari-ini`| ✓    | Absensi hari ini                 |
| GET    | `/api/dashboard/transaksi-pending`| ✓   | Transaksi pembayaran pending     |
| GET    | `/api/dashboard/piutang`         | ✓    | Data piutang                     |

---

## Scripts Backend — Ringkasan

| Script        | Perintah                    | Fungsi                                        |
| ------------- | --------------------------- | --------------------------------------------- |
| `dev`         | `npm run dev`               | Jalankan server dengan nodemon (auto-reload) |
| `start`       | `npm start`                 | Jalankan server production                   |
| `seed`        | `npm run seed`              | Isi data dummy untuk development              |
| `migrate`     | `npm run migrate`           | Jalankan migrasi database yang pending        |
| `reset`       | `npm run reset`             | Hapus semua tabel & buat ulang dari skema     |

---

## Catatan Pengembangan

- **ES Modules**: Backend menggunakan `"type": "module"` — semua file menggunakan `import`/`export`.
- **Repository Pattern**: Layer akses database dipisahkan di folder `repository/` per entitas.
- **JWT Auth**: Token dikirim via header `Authorization: Bearer <token>`. Middleware `auth.js` memvalidasi dan melekatkan `req.user`.
- **Frontend Routing**: Protected route diimplementasikan di `ProtectedRoute.jsx` dengan validasi role (`admin`, `tutor`, `siswa`, `owner`).
