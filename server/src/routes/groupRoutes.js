import { Router } from 'express';
import { health, searchUsers, addMember } from '../controllers/groupController.js';
import pool from '../config/db.js';

const router = Router();

router.get('/health', health);
router.get('/users/search', searchUsers);
router.get('/search', async (req, res) => {
  const q = (req.query.query || '').trim();
  if (!q) return res.status(400).json({ error: 'Missing query' });
  
  try {
    const { rows } = await pool.query(
      `SELECT id, name
       FROM groups
       WHERE name ILIKE $1
       ORDER BY name
       LIMIT 20`,
      [`%${q}%`]
    );
    res.json(rows);
  } catch (e) {
    console.error('Search groups error:', e);
    res.status(500).json({ error: e.message });
  }
});
router.get('/by-user/:userId', async (req, res) => {
  const userId = Number(req.params.userId);
  if (!userId) return res.status(400).json({ error: 'Invalid userId' });

  try {
    // Get groups where user is a member (check if user_id is in group's user_ids array)
    const { rows } = await pool.query(
      `SELECT g.id, g.name
       FROM groups g
       WHERE $1 = ANY(g.user_ids)
       ORDER BY g.name`,
      [userId]
    );
    res.json(rows);
  } catch (e) {
    console.error('Error getting groups for user:', e);
    res.status(500).json({ error: e.message });
  }
});
router.post('/:groupId/members', async (req, res) => {
  const groupId = Number(req.params.groupId);
  const { email, addedBy } = req.body || {};
  
  if (!groupId || !email) {
    return res.status(400).json({ error: 'groupId and email required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // First find user by email
    const userResult = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: `User with email ${email} not found` });
    }
    
    const userId = userResult.rows[0].id;

    // Check if user is already in another group
    const existingGroupCheck = await client.query(
      `SELECT id, name FROM groups WHERE $1 = ANY(user_ids) AND id != $2 LIMIT 1`,
      [userId, groupId]
    );
    
    if (existingGroupCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: `User ${email} is already in a group. Users can only be in one group at a time.` });
    }

    // Get current group user_ids
    const groupResult = await client.query(
      'SELECT user_ids FROM groups WHERE id = $1',
      [groupId]
    );

    if (groupResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Group not found' });
    }

    const currentUserIds = groupResult.rows[0].user_ids || [];
    
    // Check if user is already in this group
    if (currentUserIds.includes(userId)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'User is already in this group' });
    }

    // Add user to group
    const updatedUserIds = [...currentUserIds, userId];
    await client.query(
      'UPDATE groups SET user_ids = $1 WHERE id = $2',
      [updatedUserIds, groupId]
    );

    await client.query('COMMIT');
    res.status(201).json({ group_id: groupId, user_id: userId });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Add member error:', e);
    res.status(500).json({ error: e.message || 'Internal server error' });
  } finally {
    client.release();
  }
});
router.post('/:groupId/join', async (req, res) => {
  const groupId = Number(req.params.groupId);
  const userId = req.user?.userId;
  
  if (!groupId) return res.status(400).json({ error: 'Invalid groupId' });
  if (!userId) return res.status(401).json({ error: 'User authentication required' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if user is already in another group
    const existingGroupCheck = await client.query(
      `SELECT id, name FROM groups WHERE $1 = ANY(user_ids) AND id != $2 LIMIT 1`,
      [userId, groupId]
    );
    
    if (existingGroupCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'You are already in a group. You can only be in one group at a time.' });
    }

    // Get current group user_ids
    const groupResult = await client.query(
      'SELECT user_ids FROM groups WHERE id = $1',
      [groupId]
    );

    if (groupResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Group not found' });
    }

    const currentUserIds = groupResult.rows[0].user_ids || [];
    
    // Check if user is already in the group
    if (currentUserIds.includes(userId)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'User is already in this group' });
    }

    // Add user to group
    const updatedUserIds = [...currentUserIds, userId];
    await client.query(
      'UPDATE groups SET user_ids = $1 WHERE id = $2',
      [updatedUserIds, groupId]
    );

    await client.query('COMMIT');
    res.status(200).json({ message: 'Successfully joined group', groupId, userId });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Join group error:', e);
    res.status(500).json({ error: e.message || 'Internal server error' });
  } finally {
    client.release();
  }
});

// Get all members in a group
router.get('/:groupId/members', async (req, res) => {
  const groupId = Number(req.params.groupId);
  if (!groupId) return res.status(400).json({ error: 'Invalid groupId' });

  try {
    // Get users that are members of this group
    const { rows } = await pool.query(
      `SELECT u.id, u.email, u.first, u.last
       FROM users u
       JOIN groups g ON u.id = ANY(g.user_ids)
       WHERE g.id = $1
       ORDER BY u.email`,
      [groupId]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Leave a group (remove user from group)
router.post('/:groupId/leave', async (req, res) => {
  const groupId = Number(req.params.groupId);
  const userId = req.user?.userId;
  
  if (!groupId) return res.status(400).json({ error: 'Invalid groupId' });
  if (!userId) return res.status(401).json({ error: 'User authentication required' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get current group user_ids
    const groupResult = await client.query(
      'SELECT user_ids FROM groups WHERE id = $1',
      [groupId]
    );

    if (groupResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Group not found' });
    }

    const currentUserIds = groupResult.rows[0].user_ids || [];
    
    // Check if user is in the group
    if (!currentUserIds.includes(userId)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'You are not a member of this group' });
    }

    // Remove user from group
    const updatedUserIds = currentUserIds.filter(id => id !== userId);
    await client.query(
      'UPDATE groups SET user_ids = $1 WHERE id = $2',
      [updatedUserIds, groupId]
    );

    await client.query('COMMIT');
    res.status(200).json({ message: 'Successfully left group', groupId, userId });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Leave group error:', e);
    res.status(500).json({ error: e.message || 'Internal server error' });
  } finally {
    client.release();
  }
});

// Create a new group
router.post('/', async (req, res) => {
  const { name, members = [], createdBy = null } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ error: 'name is required' });

  // Get creator's user ID from JWT token
  const creatorUserId = req.user?.userId || createdBy;
  if (!creatorUserId) {
    return res.status(401).json({ error: 'User authentication required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if creator is already in a group
    const existingGroupCheck = await client.query(
      `SELECT id, name FROM groups WHERE $1 = ANY(user_ids) LIMIT 1`,
      [creatorUserId]
    );
    
    if (existingGroupCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'You are already in a group. You can only be in one group at a time.' });
    }

    // Create the group with empty user_ids array
    const { rows } = await client.query(
      `INSERT INTO groups (name, user_ids) VALUES ($1, ARRAY[]::integer[])
       RETURNING id, name`,
      [name.trim()]
    );
    const group = rows[0];

    // Start with creator's ID in the array
    const userIds = [creatorUserId];

    // Add members by email
    for (const email of members) {
      // First find user by email
      const userResult = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );
      
      if (userResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: `User with email ${email} not found` });
      }
      
      const userId = userResult.rows[0].id;
      
      // Check if this user is already in another group
      const userGroupCheck = await client.query(
        `SELECT id, name FROM groups WHERE $1 = ANY(user_ids) LIMIT 1`,
        [userId]
      );
      
      if (userGroupCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `User ${email} is already in a group. Users can only be in one group at a time.` });
      }
      
      // Only add if not already in the array (in case creator is also in members list)
      if (!userIds.includes(userId)) {
        userIds.push(userId);
      }
    }

    // Update group with all user IDs (including creator)
    await client.query(
      `UPDATE groups SET user_ids = $1 WHERE id = $2`,
      [userIds, group.id]
    );

    await client.query('COMMIT');
    res.status(201).json(group); // { id, name }
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Create group error:', e);
    res.status(500).json({ error: e.message || 'Internal server error' });
  } finally {
    client.release();
  }
});

export default router;