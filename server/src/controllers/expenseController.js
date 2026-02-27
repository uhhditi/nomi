import { ExpenseService } from '../services/expenseService.js';

export const ExpenseController = {
  async createExpense(req, res) {
    try {
      const paidByUserId = req.user?.userId; // From verifyToken middleware
      const { groupId, name, price, category, shares } = req.body;

      console.log('Create expense request:', { paidByUserId, body: req.body });

      if (!paidByUserId) {
        console.error('No userId found in token:', req.user);
        return res.status(401).json({ error: 'User ID not found in token' });
      }

      if (!groupId || !name || !price) {
        return res.status(400).json({ error: 'groupId, name, and price are required' });
      }

      const expense = await ExpenseService.createExpense({
        groupId,
        paidByUserId,
        name,
        price,
        category,
        shares: shares || [],
      });

      res.status(201).json(expense);
    } catch (error) {
      console.error('Error creating expense:', error);
      console.error('Error details:', error.message, error.stack);
      res.status(500).json({ error: error.message || 'Failed to create expense' });
    }
  },

  async getExpensesByGroup(req, res) {
    try {
      const groupId = parseInt(req.params.groupId);
      if (!groupId) {
        return res.status(400).json({ error: 'Invalid groupId' });
      }

      const expenses = await ExpenseService.getExpensesByGroup(groupId);
      res.json(expenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch expenses' });
    }
  },

  async getExpensesByUser(req, res) {
    try {
      const userId = req.user?.userId; // From verifyToken middleware
      const expenses = await ExpenseService.getExpensesByUser(userId);
      res.json(expenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch expenses' });
    }
  },

  async updateExpense(req, res) {
    try {
      const expenseId = parseInt(req.params.expenseId);
      const updates = req.body;

      if (!expenseId) {
        return res.status(400).json({ error: 'Invalid expenseId' });
      }

      const expense = await ExpenseService.updateExpense(expenseId, updates);
      res.json(expense);
    } catch (error) {
      console.error('Error updating expense:', error);
      res.status(500).json({ error: error.message || 'Failed to update expense' });
    }
  },

  async deleteExpense(req, res) {
    try {
      const expenseId = parseInt(req.params.expenseId);
      if (!expenseId) {
        return res.status(400).json({ error: 'Invalid expenseId' });
      }

      const expense = await ExpenseService.deleteExpense(expenseId);
      res.json(expense);
    } catch (error) {
      console.error('Error deleting expense:', error);
      res.status(500).json({ error: error.message || 'Failed to delete expense' });
    }
  },

  async markSharesPaid(req, res) {
    try {
      const { shareIds } = req.body;
      if (!shareIds || !Array.isArray(shareIds) || shareIds.length === 0) {
        return res.status(400).json({ error: 'shareIds array is required' });
      }
      const result = await ExpenseService.markSharesPaid(shareIds);
      res.json(result);
    } catch (error) {
      console.error('Error marking shares as paid:', error);
      res.status(500).json({ error: error.message || 'Failed to mark shares as paid' });
    }
  },
};

