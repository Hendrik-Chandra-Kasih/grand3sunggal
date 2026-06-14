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
  database: DB_NAME,
  multipleStatements: true,
};

async function ensureMigrationsTable(conn) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function getAppliedMigrations(conn) {
  const [rows] = await conn.query(
    'SELECT filename FROM schema_migrations ORDER BY filename ASC'
  );
  return new Set(rows.map((row) => row.filename));
}

function getMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    return [];
  }

  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b));
}

async function runMigration(conn, filename) {
  const filePath = path.join(MIGRATIONS_DIR, filename);
  const sql = fs.readFileSync(filePath, 'utf8');

  console.log(`[migrate] applying ${filename}...`);
  await conn.beginTransaction();
  try {
    await conn.query(sql);
    await conn.query(
      'INSERT INTO schema_migrations (filename) VALUES (?)',
      [filename]
    );
    await conn.commit();
    console.log(`[migrate] applied ${filename}`);
  } catch (error) {
    await conn.rollback();
    throw error;
  }
}

async function main() {
  console.log(`[migrate] target database: ${DB_NAME}`);

  const files = getMigrationFiles();
  if (files.length === 0) {
    console.log('[migrate] no migration files found.');
    return;
  }

  const conn = await mysql.createConnection(baseConfig);
  try {
    await ensureMigrationsTable(conn);
    const applied = await getAppliedMigrations(conn);
    const pending = files.filter((file) => !applied.has(file));

    if (pending.length === 0) {
      console.log('[migrate] no pending migrations.');
      return;
    }

    for (const filename of pending) {
      await runMigration(conn, filename);
    }

    console.log(`[migrate] completed ${pending.length} migration(s).`);
  } finally {
    await conn.end();
  }
}

main().catch((error) => {
  console.error('[migrate] failed:', error);
  process.exit(1);
});
