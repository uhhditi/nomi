import db from '../config/db.js';

export async function up() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        meal VARCHAR(255) UNIQUE NOT NULL, 
        symptom VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id INT REFERENCES users(id) ON DELETE CASCADE
      )
    `);
  } catch (error) {
    console.log(error)
  }
}

export async function down() {
  try {
    await db.query('DROP TABLE IF EXISTS logs');
  } catch (error) {
    console.log(error)
  }
}

up()