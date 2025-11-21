import db from '../config/db.js';

export const ChoreModel = {
  async getAll(groupId) {
    const result = await db.query(`
      SELECT 
        chore_id,
        group_id,
        title,
        description,
        completed,
        due_date,
        created_at,
        updated_at
      FROM chores
      WHERE group_id = $1
      ORDER BY due_date ASC, created_at DESC
    `, [groupId]);
    
    return result.rows;
  },

  async getById(choreId, groupId) {
    const result = await db.query(`
      SELECT * FROM chores 
      WHERE chore_id = $1 AND group_id = $2
    `, [choreId, groupId]);
    
    return result.rows[0];
  },

  async create({ groupId, title, description, dueDate, completed = false }) {
    const result = await db.query(`
      INSERT INTO chores (
        group_id,
        title,
        description,
        due_date,
        completed
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [groupId, title, description || null, dueDate, completed]);
    
    return result.rows[0];
  },

  async update(choreId, groupId, { title, description, dueDate, completed }) {
    const result = await db.query(`
      UPDATE chores
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        due_date = COALESCE($3, due_date),
        completed = COALESCE($4, completed),
        updated_at = CURRENT_TIMESTAMP
      WHERE chore_id = $5 AND group_id = $6
      RETURNING *
    `, [title, description, dueDate, completed, choreId, groupId]);
    
    return result.rows[0];
  },

  async toggleCompleted(choreId, groupId) {
    const result = await db.query(`
      UPDATE chores
      SET 
        completed = NOT completed,
        updated_at = CURRENT_TIMESTAMP
      WHERE chore_id = $1 AND group_id = $2
      RETURNING *
    `, [choreId, groupId]);
    
    return result.rows[0];
  },

  async delete(choreId, groupId) {
    const result = await db.query(`
      DELETE FROM chores 
      WHERE chore_id = $1 AND group_id = $2
      RETURNING chore_id
    `, [choreId, groupId]);
    
    return result.rows[0];
  },

  async getByDateRange(groupId, startDate, endDate) {
    const result = await db.query(`
      SELECT * FROM chores
      WHERE group_id = $1 
        AND due_date >= $2 
        AND due_date <= $3
      ORDER BY due_date ASC
    `, [groupId, startDate, endDate]);
    
    return result.rows;
  }
};
