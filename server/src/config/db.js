import pg from 'pg';
// Load dotenv only when available (e.g. local); on Vercel env vars are injected
try { (await import('dotenv')).default.config(); } catch (_) {}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;