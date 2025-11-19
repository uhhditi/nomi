import db from '../config/db.js';

export const UserModel = {
    async findByEmail(email){
        const result = await db.query('SELECT * FROM users WHERE email = $1',
      [email]
    );
      return result.rows[0];
    },

  async create({ email, password, username, first, last }) {
    const result = await db.query(`
      INSERT INTO users (email, password, username, first, last)
      VALUES ($1, $2, $3, $4, $5 )
      RETURNING id, email, username, first, last
    `, [email, password, username, first, last]);

    return result.rows[0];
  }
};