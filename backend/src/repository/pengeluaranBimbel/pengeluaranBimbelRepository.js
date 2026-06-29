import { query, queryOne } from '../../config/query.js';

const TABLE = 'pengeluaran_bimbel';
const COLUMNS = ['id_pengeluaran', 'nominal', 'tanggal_pengeluaran', 'keterangan'];
const COLUMNS_SQL = COLUMNS.map((c) => `\`${c}\``).join(', ');

export class PengeluaranBimbelRepository {
  async findAll({ sortBy = 'tanggal_pengeluaran', order = 'DESC', startDate, endDate } = {}) {
    const allowedSortBy = ['tanggal_pengeluaran', 'nominal'];
    const allowedOrder = ['ASC', 'DESC'];
    const safeSortBy = allowedSortBy.includes(sortBy) ? sortBy : 'tanggal_pengeluaran';
    const safeOrder = allowedOrder.includes((order || '').toUpperCase()) ? order.toUpperCase() : 'DESC';

    const where = [];
    const params = [];
    if (startDate) {
      where.push('tanggal_pengeluaran >= ?');
      params.push(startDate);
    }
    if (endDate) {
      where.push('tanggal_pengeluaran <= ?');
      params.push(endDate);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    return await query(
      `SELECT ${COLUMNS_SQL}
       FROM \`${TABLE}\`
       ${whereClause}
       ORDER BY \`${safeSortBy}\` ${safeOrder}, id_pengeluaran ${safeOrder}`,
      params
    );
  }

  async findById(id) {
    return await queryOne(
      `SELECT ${COLUMNS_SQL}
       FROM \`${TABLE}\`
       WHERE id_pengeluaran = ?
       LIMIT 1`,
      [id]
    );
  }

  async create(data) {
    const payload = { ...data };
    if (!payload.id_pengeluaran) {
      const maxRow = await queryOne(
        `SELECT COALESCE(MAX(id_pengeluaran), 0) + 1 AS next_id FROM \`${TABLE}\``
      );
      payload.id_pengeluaran = maxRow?.next_id || 1;
    }
    const cols = Object.keys(payload);
    const placeholders = cols.map(() => '?').join(', ');
    const params = cols.map((c) => payload[c]);
    await query(
      `INSERT INTO \`${TABLE}\` (${cols.map((c) => `\`${c}\``).join(', ')}) VALUES (${placeholders})`,
      params
    );
    return await this.findById(payload.id_pengeluaran);
  }

  async update(id, data) {
    const cols = Object.keys(data);
    if (!cols.length) return await this.findById(id);

    const setClause = cols.map((c) => `\`${c}\` = ?`).join(', ');
    const params = cols.map((c) => data[c]);
    params.push(id);

    await query(
      `UPDATE \`${TABLE}\` SET ${setClause} WHERE id_pengeluaran = ?`,
      params
    );
    return await this.findById(id);
  }

  async delete(id) {
    await query(
      `DELETE FROM \`${TABLE}\` WHERE id_pengeluaran = ?`,
      [id]
    );
  }

  async sumByDateRange({ startDate, endDate } = {}) {
    const where = [];
    const params = [];
    if (startDate) {
      where.push('tanggal_pengeluaran >= ?');
      params.push(startDate);
    }
    if (endDate) {
      where.push('tanggal_pengeluaran <= ?');
      params.push(endDate);
    }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    return await queryOne(
      `SELECT COALESCE(SUM(nominal), 0) AS total
       FROM \`${TABLE}\`
       ${whereClause}`,
      params
    );
  }
}
