import { query, queryOne } from '../../config/query.js';

const TABLE = 'jadwal';

const SELECT_COLUMNS = [
  'j.id_jadwal',
  'j.id_kelas',
  'j.id_tutor',
  'j.id_mapel',
  'j.hari',
  'j.jam',
  'j.jam_selesai',
  'k.nama_kelas',
  'm.nama_mapel',
  't.nama_tutor',
];

const FILTER_COLUMN_MAP = {
  id_jadwal: 'j.id_jadwal',
  id_kelas: 'j.id_kelas',
  id_tutor: 'j.id_tutor',
  id_mapel: 'j.id_mapel',
};

const DAY_ORDER = { Senin: 1, Selasa: 2, Rabu: 3, Kamis: 4, Jumat: 5 };

const parseHari = (row) => {
  if (!row || !row.hari) return row;
  if (typeof row.hari === 'string') {
    try { row.hari = JSON.parse(row.hari); } catch { row.hari = [row.hari]; }
  }
  if (Array.isArray(row.hari)) {
    row.hari = row.hari.sort((a, b) => (DAY_ORDER[a] || 99) - (DAY_ORDER[b] || 99));
  }
  return row;
};

const parseHariList = (rows) => (Array.isArray(rows) ? rows.map(parseHari) : rows);

export class JadwalRepository {
  async findAll(options = {}) {
    const filters = options.where || {};
    const whereKeys = Object.keys(filters).filter((key) => FILTER_COLUMN_MAP[key]);
    const conditions = whereKeys.map((key) => `${FILTER_COLUMN_MAP[key]} = ?`);
    const params = whereKeys.map((k) => filters[k]);

    // Filter hari menggunakan JSON_CONTAINS karena tipe data JSON array
    if (filters.hari) {
      conditions.push('JSON_CONTAINS(j.hari, ?)');
      params.push(JSON.stringify(filters.hari));
    }

    const whereSql = conditions.length
      ? 'WHERE ' + conditions.join(' AND ')
      : '';

    return parseHariList(await query(
      `SELECT ${SELECT_COLUMNS.join(', ')}
       FROM \`${TABLE}\` j
       INNER JOIN \`kelas\` k ON k.id_kelas = j.id_kelas
       LEFT JOIN \`mapel\` m ON m.id_mapel = j.id_mapel
       INNER JOIN \`tutor\` t ON t.id_tutor = j.id_tutor
       ${whereSql}
       ORDER BY j.id_jadwal DESC`,
      params
    ));
  }

  async findById(id) {
    return parseHari(await queryOne(
      `SELECT ${SELECT_COLUMNS.join(', ')}
       FROM \`${TABLE}\` j
       INNER JOIN \`kelas\` k ON k.id_kelas = j.id_kelas
       LEFT JOIN \`mapel\` m ON m.id_mapel = j.id_mapel
       INNER JOIN \`tutor\` t ON t.id_tutor = j.id_tutor
       WHERE j.id_jadwal = ?
       LIMIT 1`,
      [id]
    ));
  }

  async create(data) {
    const payload = { ...data };
    if (!payload.id_jadwal) {
      const maxRow = await queryOne(
        `SELECT COALESCE(MAX(id_jadwal), 0) + 1 AS next_id FROM \`${TABLE}\``
      );
      payload.id_jadwal = maxRow?.next_id || 1;
    }
    const cols = Object.keys(payload);
    const placeholders = cols.map(() => '?').join(', ');
    const params = cols.map((c) => payload[c]);
    const result = await query(
      `INSERT INTO \`${TABLE}\` (${cols.map((c) => `\`${c}\``).join(', ')}) VALUES (${placeholders})`,
      params
    );
    return await this.findById(result.insertId || payload.id_jadwal);
  }

  async update(id, data) {
    const cols = Object.keys(data);
    if (cols.length === 0) return await this.findById(id);
    const setSql = cols.map((c) => `\`${c}\` = ?`).join(', ');
    const params = [...cols.map((c) => data[c]), id];
    await query(`UPDATE \`${TABLE}\` SET ${setSql} WHERE id_jadwal = ?`, params);
    return await this.findById(id);
  }

  async findBySiswa(id_siswa) {
    return await query(
      `SELECT ${SELECT_COLUMNS.join(', ')}
       FROM \`${TABLE}\` j
       INNER JOIN \`kelas\` k ON k.id_kelas = j.id_kelas
       LEFT JOIN \`mapel\` m ON m.id_mapel = j.id_mapel
       INNER JOIN \`tutor\` t ON t.id_tutor = j.id_tutor
       INNER JOIN \`kelas_siswa\` ks ON ks.id_kelas = j.id_kelas
       WHERE ks.id_siswa = ?
       ORDER BY j.jam ASC`,
      [id_siswa]
    );
  }

  async findByTutor(id_tutor) {
    return parseHariList(await query(
      `SELECT ${SELECT_COLUMNS.join(', ')}
       FROM \`${TABLE}\` j
       INNER JOIN \`kelas\` k ON k.id_kelas = j.id_kelas
       LEFT JOIN \`mapel\` m ON m.id_mapel = j.id_mapel
       INNER JOIN \`tutor\` t ON t.id_tutor = j.id_tutor
       WHERE j.id_tutor = ?
       ORDER BY j.jam ASC`,
      [id_tutor]
    ));
  }

  async delete(id) {
    await query(`DELETE FROM \`${TABLE}\` WHERE id_jadwal = ?`, [id]);
    return { id_jadwal: id };
  }
}
