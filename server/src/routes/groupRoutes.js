import { Router } from 'express';
import { health, searchUsers, addMember } from '../controllers/groupController.js';
import pool from '../config/db.js';

const router = Router();

router.get('/health', health);
router.get('/users/search', searchUsers);
router.post('/:groupId/members', addMember);


router.get('/:groupId/members', async (req, res) => {
  const groupId = Number(req.params.groupId);
  if (!groupId) return res.status(400).json({ error: 'Invalid groupId' });

  try {
    // using your arrays-based schema
    const { rows } = await pool.query(
      `SELECT id, username, email
         FROM users
        WHERE $1 = ANY(group_ids)
        ORDER BY username`,
      [groupId]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', async (req, res) => {
  const { name, members = [], createdBy = null } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ error: 'name is required' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `INSERT INTO groups (name, user_ids)
       VALUES ($1, ARRAY[]::int[])
       RETURNING id, name`,
      [name.trim()]
    );
    const group = rows[0];

    // add members
    for (const uname of members) {
      await client.query(`SELECT * FROM add_user_to_group($1,$2,$3)`, [
        uname,
        group.id,
        createdBy,
      ]);
    }

    await client.query('COMMIT');
    res.status(201).json(group); // { id, name }
  } catch (e) {
    await client.query('ROLLBACK');
    if (e.code === 'P0002') return res.status(404).json({ error: e.message }); // username not found
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});

export default router;

