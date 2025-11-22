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
  }
};