import db from '../config/db.js';

export const GroceryItemModel = {
  async add({ groupId, name, category, addedBy, isSuggested = false }) {
    const result = await db.query(`
      INSERT INTO grocery_items (group_id, name, category, added_by, is_suggested)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [groupId, name, category, addedBy, isSuggested]);
    return result.rows[0];
  },

  async update(itemId, updates) {
    const fields = [];
    const values = [];
    let idx = 1;
    for (const key in updates) {
      fields.push(`${key} = $${idx++}`);
      values.push(updates[key]);
    }
    values.push(itemId);
    const result = await db.query(`
      UPDATE grocery_items SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE item_id = $${idx}
      RETURNING *
    `, values);
    return result.rows[0];
  },

  async delete(itemId) {
    const result = await db.query(`
      DELETE FROM grocery_items WHERE item_id = $1 RETURNING *
    `, [itemId]);
    return result.rows[0];
  },

  async markPurchased(itemId, userId) {
    // Mark as purchased and add to purchase history
    const item = await this.update(itemId, { is_purchased: true });
    await db.query(`
      INSERT INTO grocery_purchases (group_id, item_name, purchased_by)
      VALUES ($1, $2, $3)
    `, [item.group_id, item.name, userId]);
    return item;
  },

  async getByGroup(groupId) {
    const result = await db.query(`
      SELECT * FROM grocery_items WHERE group_id = $1 ORDER BY created_at DESC
    `, [groupId]);
    return result.rows;
  },

  async getSuggestions(groupId) {
    const result = await db.query(`
      SELECT * FROM grocery_items WHERE group_id = $1 AND is_suggested = TRUE
      ORDER BY created_at DESC
    `, [groupId]);
    return result.rows;
  },

  async getRecurringSuggestions(groupId) {
    // Get all purchase history for the group
    const history = await GroceryPurchaseModel.getAllHistory(groupId);
    // Group by item_name
    const itemMap = {};
    for (const row of history) {
      if (!itemMap[row.item_name]) itemMap[row.item_name] = [];
      itemMap[row.item_name].push(new Date(row.purchase_date));
    }
    // Calculate average days between purchases for each item
    const suggestions = [];
    const now = new Date();
    for (const [item, dates] of Object.entries(itemMap)) {
      if (dates.length < 2) continue; // Need at least 2 purchases
      // Sort dates descending
      dates.sort((a, b) => b - a);
      let totalDiff = 0;
      for (let i = 1; i < dates.length; i++) {
        totalDiff += (dates[i - 1] - dates[i]) / (1000 * 60 * 60 * 24); // days
      }
      const avgDays = totalDiff / (dates.length - 1);
      const lastPurchase = dates[0];
      const daysSince = (now - lastPurchase) / (1000 * 60 * 60 * 24);
      // If overdue by 80% of avg interval, suggest
      if (daysSince >= avgDays * 0.8) {
        suggestions.push({ item, avgDays, daysSince });
      }
    }
    return suggestions;
  },
};

export const GroceryPurchaseModel = {
  async getHistory(groupId, itemName) {
    const result = await db.query(`
      SELECT * FROM grocery_purchases WHERE group_id = $1 AND item_name = $2
      ORDER BY purchase_date DESC
    `, [groupId, itemName]);
    return result.rows;
  },

  async getAllHistory(groupId) {
    const result = await db.query(`
      SELECT * FROM grocery_purchases WHERE group_id = $1
      ORDER BY purchase_date DESC
    `, [groupId]);
    return result.rows;
  },
};
