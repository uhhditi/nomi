import db from '../config/db.js';

export const ExpenseModel = {
  async create({ groupId, paidByUserId, name, price, category }) {
    const result = await db.query(`
      INSERT INTO expenses (group_id, paid_by_user_id, name, price, category)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING expense_id, group_id, paid_by_user_id, name, price, category, created_at
    `, [groupId, paidByUserId, name, price, category || null]);

    return result.rows[0];
  },

  async getByGroupId(groupId) {
    const result = await db.query(`
      SELECT 
        e.expense_id,
        e.group_id,
        e.paid_by_user_id,
        e.name,
        e.price,
        e.category,
        e.created_at,
        u.first,
        u.last,
        u.email
      FROM expenses e
      JOIN users u ON e.paid_by_user_id = u.id
      WHERE e.group_id = $1
      ORDER BY e.created_at DESC
    `, [groupId]);

    return result.rows;
  },

  async getByUserId(userId) {
    const result = await db.query(`
      SELECT 
        e.expense_id,
        e.group_id,
        e.paid_by_user_id,
        e.name,
        e.price,
        e.category,
        e.created_at,
        u.first,
        u.last,
        u.email
      FROM expenses e
      JOIN users u ON e.paid_by_user_id = u.id
      WHERE e.paid_by_user_id = $1
      ORDER BY e.created_at DESC
    `, [userId]);

    return result.rows;
  },

  async update(expenseId, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }
    if (updates.price !== undefined) {
      fields.push(`price = $${paramCount++}`);
      values.push(updates.price);
    }
    if (updates.category !== undefined) {
      fields.push(`category = $${paramCount++}`);
      values.push(updates.category);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(expenseId);

    const result = await db.query(`
      UPDATE expenses
      SET ${fields.join(', ')}
      WHERE expense_id = $${paramCount}
      RETURNING *
    `, values);

    return result.rows[0];
  },

  async delete(expenseId) {
    const result = await db.query(`
      DELETE FROM expenses
      WHERE expense_id = $1
      RETURNING *
    `, [expenseId]);

    return result.rows[0];
  },
};

export const ExpenseShareModel = {
  async create({ expenseId, userId, owedAmount }) {
    const result = await db.query(`
      INSERT INTO expense_shares (expense_id, user_id, owed_amount)
      VALUES ($1, $2, $3)
      RETURNING share_id, expense_id, user_id, owed_amount, created_at
    `, [expenseId, userId, owedAmount]);

    return result.rows[0];
  },

  async createMultiple(shares) {
    if (shares.length === 0) {
      return [];
    }

    const values = [];
    const placeholders = [];
    let paramCount = 1;

    shares.forEach((share) => {
      placeholders.push(`($${paramCount++}, $${paramCount++}, $${paramCount++})`);
      values.push(share.expenseId, share.userId, share.owedAmount);
    });

    const result = await db.query(`
      INSERT INTO expense_shares (expense_id, user_id, owed_amount)
      VALUES ${placeholders.join(', ')}
      RETURNING share_id, expense_id, user_id, owed_amount, created_at
    `, values);

    return result.rows;
  },

  async getByExpenseId(expenseId) {
    const result = await db.query(`
      SELECT 
        es.share_id,
        es.expense_id,
        es.user_id,
        es.owed_amount,
        es.created_at,
        u.first,
        u.last,
        u.email
      FROM expense_shares es
      JOIN users u ON es.user_id = u.id
      WHERE es.expense_id = $1
    `, [expenseId]);

    return result.rows;
  },

  async deleteByExpenseId(expenseId) {
    const result = await db.query(`
      DELETE FROM expense_shares
      WHERE expense_id = $1
      RETURNING *
    `, [expenseId]);

    return result.rows;
  },
};


