import db from '../config/db.js';

export const UserModel = {
    async findByEmail(email){
        const result = await db.query('SELECT * FROM users WHERE email = $1',
      [email]
    );
      return result.rows[0];
    },

  async create({ email, password, first, last }) {
    const name = [first, last].filter(Boolean).join(' ') || email;
    const result = await db.query(`
      INSERT INTO users (name, email, password, first, last)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, first, last
    `, [name, email, password, first, last]);

    return result.rows[0];
  }
};