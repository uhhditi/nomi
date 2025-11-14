import * as service from '../services/groupService.js';

export async function health(req, res) {
  res.json({ ok: true });
}

export async function searchUsers(req, res) {
  const q = (req.query.query || '').trim();
  if (!q) return res.status(400).json({ error: 'Missing query' });
  try {
    const users = await service.searchUsersByUsername(q);
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function addMember(req, res) {
  const groupId = Number(req.params.groupId);
  const { username, addedBy } = req.body || {};
  if (!groupId || !username) {
    return res.status(400).json({ error: 'groupId and username required' });
  }
  try {
    const result = await service.addUserToGroupByUsername({ username, groupId, addedBy });
    res.status(201).json(result); // { group_id, user_id }
  } catch (e) {
    if (e.code === 'P0002') return res.status(404).json({ error: e.message }); // NO_DATA_FOUND
    res.status(500).json({ error: e.message });
  }
}
