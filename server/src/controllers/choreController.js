import { ChoreService } from '../services/choreService.js';

export const ChoreController = {
  async getAllChores(req, res) {
    try {
      const { groupId } = req.query;
      if (!groupId) {
        return res.status(400).json({ error: 'Group ID is required' });
      }
      const chores = await ChoreService.getAllChores(parseInt(groupId));
      res.status(200).json(chores);
    } catch (error) {
      console.error('Get all chores error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  },

  async getChoreById(req, res) {
    try {
      const { id } = req.params;
      const { groupId } = req.query;
      if (!groupId) {
        return res.status(400).json({ error: 'Group ID is required' });
      }
      const chore = await ChoreService.getChoreById(parseInt(id), parseInt(groupId));
      res.status(200).json(chore);
    } catch (error) {
      console.error('Get chore by id error:', error);
      if (error.message === 'Chore not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message || 'Internal server error' });
      }
    }
  },

  async createChore(req, res) {
    try {
      const choreData = req.body;
      if (!choreData.groupId) {
        return res.status(400).json({ error: 'Group ID is required' });
      }
      const newChore = await ChoreService.createChore(choreData);
      res.status(201).json(newChore);
    } catch (error) {
      console.error('Create chore error:', error);
      res.status(400).json({ error: error.message || 'Failed to create chore' });
    }
  },

  async updateChore(req, res) {
    try {
      const { id } = req.params;
      const { groupId } = req.body;
      if (!groupId) {
        return res.status(400).json({ error: 'Group ID is required' });
      }
      const updatedChore = await ChoreService.updateChore(parseInt(id), groupId, req.body);
      res.status(200).json(updatedChore);
    } catch (error) {
      console.error('Update chore error:', error);
      if (error.message === 'Chore not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message || 'Failed to update chore' });
      }
    }
  },

  async toggleCompleted(req, res) {
    try {
      const { id } = req.params;
      const { groupId } = req.query;
      if (!groupId) {
        return res.status(400).json({ error: 'Group ID is required' });
      }
      const updatedChore = await ChoreService.toggleCompleted(parseInt(id), parseInt(groupId));
      res.status(200).json(updatedChore);
    } catch (error) {
      console.error('Toggle chore completion error:', error);
      if (error.message === 'Chore not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message || 'Internal server error' });
      }
    }
  },

  async deleteChore(req, res) {
    try {
      const { id } = req.params;
      const { groupId } = req.query;
      if (!groupId) {
        return res.status(400).json({ error: 'Group ID is required' });
      }
      const result = await ChoreService.deleteChore(parseInt(id), parseInt(groupId));
      res.status(200).json(result);
    } catch (error) {
      console.error('Delete chore error:', error);
      if (error.message === 'Chore not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message || 'Internal server error' });
      }
    }
  },

  async getChoresByDateRange(req, res) {
    try {
      const { groupId, startDate, endDate } = req.query;
      
      if (!groupId || !startDate || !endDate) {
        return res.status(400).json({ error: 'groupId, startDate and endDate query parameters are required' });
      }

      const chores = await ChoreService.getChoresByDateRange(
        parseInt(groupId),
        new Date(startDate),
        new Date(endDate)
      );
      res.status(200).json(chores);
    } catch (error) {
      console.error('Get chores by date range error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
};
