import { GroceryItemModel, GroceryPurchaseModel } from '../models/groceryModel.js';

export const GroceryController = {
  async addItem(req, res) {
    try {
      const { groupId, name, category, isSuggested } = req.body;
      const addedBy = req.user?.userId;
      if (!groupId || !name || !addedBy) {
        return res.status(400).json({ error: 'groupId, name, and user required' });
      }
      const item = await GroceryItemModel.add({ groupId, name, category, addedBy, isSuggested });
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateItem(req, res) {
    try {
      const itemId = parseInt(req.params.itemId);
      const updates = req.body;
      if (!itemId) return res.status(400).json({ error: 'itemId required' });
      const item = await GroceryItemModel.update(itemId, updates);
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async deleteItem(req, res) {
    try {
      const itemId = parseInt(req.params.itemId);
      if (!itemId) return res.status(400).json({ error: 'itemId required' });
      const item = await GroceryItemModel.delete(itemId);
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async markPurchased(req, res) {
    try {
      const itemId = parseInt(req.params.itemId);
      const userId = req.user?.userId;
      if (!itemId || !userId) return res.status(400).json({ error: 'itemId and user required' });
      const item = await GroceryItemModel.markPurchased(itemId, userId);
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getList(req, res) {
    try {
      const groupId = parseInt(req.params.groupId);
      if (!groupId) return res.status(400).json({ error: 'groupId required' });
      const items = await GroceryItemModel.getByGroup(groupId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getSuggestions(req, res) {
    try {
      const groupId = parseInt(req.params.groupId);
      if (!groupId) return res.status(400).json({ error: 'groupId required' });
      const items = await GroceryItemModel.getSuggestions(groupId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getRecurringSuggestions(req, res) {
    try {
      const groupId = parseInt(req.params.groupId);
      if (!groupId) return res.status(400).json({ error: 'groupId required' });
      const suggestions = await GroceryItemModel.getRecurringSuggestions(groupId);
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getHistory(req, res) {
    try {
      const groupId = parseInt(req.params.groupId);
      const itemName = req.query.itemName;
      if (!groupId || !itemName) return res.status(400).json({ error: 'groupId and itemName required' });
      const history = await GroceryPurchaseModel.getHistory(groupId, itemName);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
