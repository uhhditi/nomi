import { GroupService } from "../services/groupService.js"

//handles requests - calls services
export const GroupController = {
    async createGroup(req, res){
        console.log("incoming log body:", req.body);
        try {
            const newGroup = await GroupService.createGroup(req.body);
            //TODO: CALL ADD GROUP MEMBER FLOW
            res.status(200).json(newGroup);
            
        } catch (error) {
            console.error("group creation error:", error);
            res.status(500).send({message: "internal server error"});
        }
    }
}

// Export individual functions for use in routes
export async function health(req, res) {
  res.json({ ok: true });
}

export async function searchUsers(req, res) {
  const q = (req.query.query || '').trim();
  if (!q) return res.status(400).json({ error: 'Missing query' });
  try {
    const users = await GroupService.searchUsersByEmail(q);
    res.json(users);
  } catch (e) {
    console.error('Search users error:', e);
    res.status(500).json({ error: e.message || 'Internal server error' });
  }
}

export async function addMember(req, res) {
  const groupId = Number(req.params.groupId);
  const { email, addedBy } = req.body || {};
  if (!groupId || !email) {
    return res.status(400).json({ error: 'groupId and email required' });
  }
  try {
    const result = await GroupService.addUserToGroupByEmail({ email, groupId, addedBy });
    res.status(201).json(result); // { group_id, user_id }
  } catch (e) {
    if (e.code === 'P0002') return res.status(404).json({ error: e.message }); // NO_DATA_FOUND
    res.status(500).json({ error: e.message });
  }
}
