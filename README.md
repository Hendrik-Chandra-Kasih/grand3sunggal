# Grand3Sunggal — Fullstack Project

Stack: **React.js + Vite** (Frontend) · **Express.js + MySQL** (Backend)

## Struktur Direktori

```
grand3sunggal/
├── frontend/          # React.js + Vite
│   ├── src/
│   │   ├── pages/     # Halaman (Home, dll)
│   │   ├── services/  # Axios API client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js
│   └── package.json
│
└── backend/           # Express.js + MySQL
    ├── src/
    │   ├── config/    # Konfigurasi database
    │   ├── controllers/
    │   ├── middleware/
    │   ├── routes/
    │   └── database/  # schema.sql
    ├── .env.example
    └── package.json
```

## Cara Setup

### 1. Prasyarat
Pastikan sudah terinstall:
- [Node.js](https://nodejs.org/) v18+
- MySQL 8+

### 2. Backend

```bash
cd backend

# Salin env dan isi konfigurasi
copy .env.example .env

# Install dependencies
npm install

# Buat database di MySQL:
# CREATE DATABASE grand3sunggal_db;
# Jalankan schema:
# mysql -u root -p grand3sunggal_db < src/database/schema.sql

# Jalankan server (development)
npm run dev
# Server berjalan di http://localhost:5000
```

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Jalankan dev server
npm run dev
# App berjalan di http://localhost:3000
```

## API Endpoints

| Method | URL | Deskripsi |
|--------|-----|-----------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Daftar user baru |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Data user (auth required) |

## Port

| Service | Port |
|---------|------|
| Frontend (Vite) | 3000 |
| Backend (Express) | 5000 |
