import { Router } from 'express';
import { health, searchUsers, addMember } from '../controllers/groupController.js';
import pool from '../config/db.js';

const router = Router();

router.get('/health', health);
router.get('/users/search', searchUsers);
router.post('/:groupId/members', addMember);

// Get all members in a group
router.get('/:groupId/members', async (req, res) => {
  const groupId = Number(req.params.groupId);
  if (!groupId) return res.status(400).json({ error: 'Invalid groupId' });

  try {
    // Get users where this groupId is in their group_ids array
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

// Create a new group
router.post('/', async (req, res) => {
    console.log('POST /groups body =>', req.body);
  const { name, members = [], createdBy = null } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ error: 'name is required' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create the group with empty user_ids array
    const { rows } = await client.query(
      `INSERT INTO groups (name, user_ids) VALUES ($1, ARRAY[]::integer[])
       RETURNING id, name`,
      [name.trim()]
    );
    const group = rows[0];

    // Add members using your SQL function
    for (const username of members) {
      await client.query(
        `SELECT * FROM add_user_to_group($1, $2, $3)`,
        [username, group.id, createdBy]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(group); // { id, name }
  } catch (e) {
    await client.query('ROLLBACK');
    // Your function uses NO_DATA_FOUND error code
    if (e.code === 'P0001' || e.message?.includes('not found')) {
      return res.status(404).json({ error: e.message });
    }
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});

export default router;