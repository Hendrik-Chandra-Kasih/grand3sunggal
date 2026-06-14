import { query, queryOne } from '../../config/query.js';

const TABLE = 'mapel';
const COLUMNS = ['id_mapel', 'nama_mapel'];

export class MapelRepository {
  async findAll() {
    return await query(
      `SELECT ${COLUMNS.map((column) => `\`${column}\``).join(', ')}
       FROM \`${TABLE}\`
       ORDER BY nama_mapel ASC`
    );
  }

  async findById(id) {
    return await queryOne(
      `SELECT ${COLUMNS.map((column) => `\`${column}\``).join(', ')}
       FROM \`${TABLE}\`
       WHERE id_mapel = ?
       LIMIT 1`,
      [id]
    );
  }
}
