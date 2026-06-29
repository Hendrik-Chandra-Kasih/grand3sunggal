import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_NAME = process.env.DB_NAME || process.env.DB_DATABASE || 'grand3sunggal';
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

const baseConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true,
};

// Semua tabel yang ada di database, diurutkan agar foreign key tidak error saat DROP
const ALL_TABLES = [
  // Tabel anak (yang punya foreign key) di-drop duluan
  'absensi_siswa',
  'absensi_tutor',
  'gaji_tutor',
  'infal_tutor',
  'pembayaran',
  'jadwal',
  'kelas_siswa',
  'bonus_tutor',
  // Tabel induk
  'kelas',
  'siswa',
  'mapel',
  'tutor',
  'users',
  'libur',
  'pengeluaran_bimbel',
  'app_settings',
  'schema_migrations',
];

async function main() {
  console.log(`[reset] target database: ${DB_NAME}`);

  // Step 1: Buat database dulu jika belum ada
  const connInit = await mysql.createConnection(baseConfig);
  try {
    await connInit.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
    console.log(`[reset] database \`${DB_NAME}\` siap.`);
  } finally {
    await connInit.end();
  }

  // Step 2: Hapus semua tabel yang ada
  const conn = await mysql.createConnection({
    ...baseConfig,
    database: DB_NAME,
  });
  try {
    console.log('[reset] dropping all existing tables...');
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const t of ALL_TABLES) {
      try {
        await conn.query(`DROP TABLE IF EXISTS \`${t}\``);
        console.log(`  - dropped ${t}`);
      } catch (e) {
        console.warn(`  ! could not drop ${t}: ${e.message}`);
      }
    }
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
  } finally {
    await conn.end();
  }

  // Step 3: Jalankan semua migration file (berurutan)
  console.log('[reset] running migrations...');
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.error(`[reset] migrations directory not found: ${MIGRATIONS_DIR}`);
    process.exit(1);
  }

  const migrationFiles = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b));

  if (migrationFiles.length === 0) {
    console.error('[reset] no migration files found.');
    process.exit(1);
  }

  const conn2 = await mysql.createConnection({
    ...baseConfig,
    database: DB_NAME,
    multipleStatements: true,
  });
  try {
    for (const file of migrationFiles) {
      const filePath = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      console.log(`  - ${file}`);
      await conn2.query(sql);
    }
    console.log(`[reset] ${migrationFiles.length} migration(s) applied.`);
  } finally {
    await conn2.end();
  }

  console.log('[reset] done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
