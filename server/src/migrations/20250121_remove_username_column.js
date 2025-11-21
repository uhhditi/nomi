import db from '../config/db.js';

export async function up() {
  try {
    // Remove username column from users table
    await db.query(`
      DO $$ 
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='username') THEN
          ALTER TABLE users DROP COLUMN username;
        END IF;
      END $$;
    `);
    console.log('Username column removed from users table');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
}

export async function down() {
  try {
    // Add username column back if needed
    await db.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name='users' AND column_name='username') THEN
          ALTER TABLE users ADD COLUMN username VARCHAR(100);
        END IF;
      END $$;
    `);
    console.log('Username column added back to users table');
  } catch (error) {
    console.error('Rollback error:', error);
    throw error;
  }
}

