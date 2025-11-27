import { GroupModel } from '../models/groupModel.js'
import pool from '../config/db.js';

//handles logic
export const GroupService = {
    async createGroup(newGroup) {
        const {name, userIds} = newGroup;
        const createdGroup = await GroupModel.create({name, userIds});
        return createdGroup;
    },

    async searchUsersByEmail(query) {
        const { rows } = await pool.query(
            `SELECT id, email
             FROM users
             WHERE email ILIKE $1
             ORDER BY email
             LIMIT 20`,
            [`%${query}%`]
        );
        return rows;
    },

    async addUserToGroupByEmail({ email, groupId, addedBy = null }) {
        // First find user by email
        const userResult = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );
        
        if (userResult.rows.length === 0) {
            throw new Error(`User with email ${email} not found`);
        }
        
        const userId = userResult.rows[0].id;
        
        // Add user to group
        const { rows } = await pool.query(
            'SELECT * FROM add_user_to_group($1, $2, $3)',
            [userId, Number(groupId), addedBy]
        );
        return rows[0]; // { group_id, user_id }
    }
}
