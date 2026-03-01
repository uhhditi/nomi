import pg from 'pg';
if (typeof process !== 'undefined' && !process.env.VERCEL) {
  try { (await import('dotenv')).default.config(); } catch (_) {}
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;