import pool from '../config/db.js';  

export async function searchUsersByUsername(query) {
  const { rows } = await pool.query(
    `SELECT id, username, email
       FROM users
      WHERE username ILIKE $1
      ORDER BY username
      LIMIT 20`,
    [`%${query}%`]
  );
  return rows;
}

export async function addUserToGroupByUsername({ username, groupId, addedBy = null }) {
  const { rows } = await pool.query(
    'SELECT * FROM add_user_to_group($1, $2, $3)',
    [username, Number(groupId), addedBy]
  );
  return rows[0]; // { group_id, user_id }
}
