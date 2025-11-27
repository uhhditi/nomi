import { ChoreModel } from '../models/choreModel.js';

export const ChoreService = {
  async getAllChores(groupId) {
    try {
      if (!groupId) {
        throw new Error('Group ID is required');
      }
      const chores = await ChoreModel.getAll(groupId);
      return chores;
    } catch (error) {
      console.error('Error getting chores:', error);
      throw error;
    }
  },

  async getChoreById(choreId, groupId) {
    try {
      if (!groupId) {
        throw new Error('Group ID is required');
      }
      const chore = await ChoreModel.getById(choreId, groupId);
      if (!chore) {
        throw new Error('Chore not found');
      }
      return chore;
    } catch (error) {
      console.error('Error getting chore:', error);
      throw error;
    }
  },

  async createChore(choreData) {
    try {
      const {
        groupId,
        title,
        description = '',
        dueDate,
        completed = false
      } = choreData;

      // Validate required fields
      if (!groupId || !title || !dueDate) {
        throw new Error('Group ID, title, and due date are required');
      }

      const newChore = await ChoreModel.create({
        groupId,
        title,
        description,
        dueDate: new Date(dueDate),
        completed
      });

      return newChore;
    } catch (error) {
      console.error('Error creating chore:', error);
      throw error;
    }
  },

  async updateChore(choreId, groupId, updateData) {
    try {
      if (!groupId) {
        throw new Error('Group ID is required');
      }

      const existingChore = await ChoreModel.getById(choreId, groupId);
      if (!existingChore) {
        throw new Error('Chore not found');
      }

      const updatePayload = {};
      if (updateData.title !== undefined) updatePayload.title = updateData.title;
      if (updateData.description !== undefined) updatePayload.description = updateData.description;
      if (updateData.dueDate !== undefined) updatePayload.dueDate = new Date(updateData.dueDate);
      if (updateData.completed !== undefined) updatePayload.completed = updateData.completed;

      const updatedChore = await ChoreModel.update(choreId, groupId, updatePayload);
      return updatedChore;
    } catch (error) {
      console.error('Error updating chore:', error);
      throw error;
    }
  },

  async toggleCompleted(choreId, groupId) {
    try {
      if (!groupId) {
        throw new Error('Group ID is required');
      }

      const chore = await ChoreModel.getById(choreId, groupId);
      if (!chore) {
        throw new Error('Chore not found');
      }

      const updatedChore = await ChoreModel.toggleCompleted(choreId, groupId);
      return updatedChore;
    } catch (error) {
      console.error('Error toggling chore completion:', error);
      throw error;
    }
  },

  async deleteChore(choreId, groupId) {
    try {
      if (!groupId) {
        throw new Error('Group ID is required');
      }

      const deleted = await ChoreModel.delete(choreId, groupId);
      if (!deleted) {
        throw new Error('Chore not found');
      }
      return { message: 'Chore deleted successfully' };
    } catch (error) {
      console.error('Error deleting chore:', error);
      throw error;
    }
  },

  async getChoresByDateRange(groupId, startDate, endDate) {
    try {
      if (!groupId) {
        throw new Error('Group ID is required');
      }

      const chores = await ChoreModel.getByDateRange(
        groupId,
        new Date(startDate),
        new Date(endDate)
      );
      return chores;
    } catch (error) {
      console.error('Error getting chores by date range:', error);
      throw error;
    }
  }
};
