import db from '../config/db.js';

export async function up() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS chores (
        chore_id SERIAL PRIMARY KEY,
        group_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        due_date TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create index for faster queries
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_chores_group_id ON chores(group_id);
      CREATE INDEX IF NOT EXISTS idx_chores_due_date ON chores(due_date);
      CREATE INDEX IF NOT EXISTS idx_chores_completed ON chores(completed);
    `);
  } catch (error) {
    console.log('Migration error:', error);
  }
}

export async function down() {
  try {
    await db.query('DROP TABLE IF EXISTS chores CASCADE');
  } catch (error) {
    console.log('Rollback error:', error);
  }
}

up()


