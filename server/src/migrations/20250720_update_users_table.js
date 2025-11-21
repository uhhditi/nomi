import db from '../config/db.js';

export async function up() {
  try {
    // Add email column if it doesn't exist
    await db.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='users' AND column_name='email') THEN
          ALTER TABLE users ADD COLUMN email VARCHAR(255) UNIQUE;
        END IF;
      END $$;
    `);

    // Add password column if it doesn't exist
    await db.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='users' AND column_name='password') THEN
          ALTER TABLE users ADD COLUMN password VARCHAR(255);
        END IF;
      END $$;
    `);

    // Add first column if it doesn't exist
    await db.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='users' AND column_name='first') THEN
          ALTER TABLE users ADD COLUMN first VARCHAR(100);
        END IF;
      END $$;
    `);

    // Add last column if it doesn't exist
    await db.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='users' AND column_name='last') THEN
          ALTER TABLE users ADD COLUMN last VARCHAR(100);
        END IF;
      END $$;
    `);

    // Make email required if it's not already
    await db.query(`
      DO $$ 
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='email' AND is_nullable='YES') THEN
          ALTER TABLE users ALTER COLUMN email SET NOT NULL;
        END IF;
      END $$;
    `);

    console.log('Users table updated successfully');
  } catch (error) {
    console.error('Error updating users table:', error);
    throw error;
  }
}

export async function down() {
  try {
    // Remove the columns we added
    await db.query(`
      ALTER TABLE users 
      DROP COLUMN IF EXISTS email,
      DROP COLUMN IF EXISTS password,
      DROP COLUMN IF EXISTS first,
      DROP COLUMN IF EXISTS last;
    `);
    console.log('Users table columns removed');
  } catch (error) {
    console.error('Error reverting users table:', error);
    throw error;
  }
}

// Run the migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  up().then(() => {
    console.log('Migration completed');
    process.exit(0);
  }).catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}


