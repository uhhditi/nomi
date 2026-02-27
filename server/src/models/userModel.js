import db from '../config/db.js';

export const UserModel = {
    async findByEmail(email){
        const result = await db.query('SELECT * FROM users WHERE email = $1',
      [email]
    );
      return result.rows[0];
    },

  async create({ email, password, first, last }) {
    const result = await db.query(`
      INSERT INTO users (email, password, first, last)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, first, last
    `, [email, password, first, last]);

    return result.rows[0];
  },

  async update(userId, { first, last, email }) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (first !== undefined) { fields.push(`first = $${paramCount++}`); values.push(first); }
    if (last !== undefined) { fields.push(`last = $${paramCount++}`); values.push(last); }
    if (email !== undefined) { fields.push(`email = $${paramCount++}`); values.push(email); }

    if (fields.length === 0) throw new Error('No fields to update');

    values.push(userId);
    const result = await db.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING id, email, first, last`,
      values
    );
    return result.rows[0];
  },
};