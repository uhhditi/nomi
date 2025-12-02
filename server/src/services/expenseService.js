import { ExpenseModel, ExpenseShareModel } from '../models/expenseModel.js';

export const ExpenseService = {
  async createExpense(expenseData) {
    const {
      groupId,
      paidByUserId,
      name,
      price,
      category,
      shares, // Array of { userId, owedAmount }
    } = expenseData;

    if (!groupId || !paidByUserId || !name || !price) {
      throw new Error('Missing required fields: groupId, paidByUserId, name, and price are required');
    }

    // Create the expense
    const expense = await ExpenseModel.create({
      groupId,
      paidByUserId,
      name,
      price: parseFloat(price),
      category: category || null,
    });

    // Create expense shares if provided
    if (shares && shares.length > 0) {
      const shareRecords = shares.map(share => ({
        expenseId: expense.expense_id,
        userId: share.userId,
        owedAmount: parseFloat(share.owedAmount),
      }));
      
      await ExpenseShareModel.createMultiple(shareRecords);
    }

    // Fetch the expense with shares
    const expenseShares = await ExpenseShareModel.getByExpenseId(expense.expense_id);
    
    return {
      ...expense,
      shares: expenseShares,
    };
  },

  async getExpensesByGroup(groupId) {
    if (!groupId) {
      throw new Error('groupId is required');
    }

    const expenses = await ExpenseModel.getByGroupId(groupId);
    
    // Fetch shares for each expense
    const expensesWithShares = await Promise.all(
      expenses.map(async (expense) => {
        const shares = await ExpenseShareModel.getByExpenseId(expense.expense_id);
        return {
          ...expense,
          shares,
        };
      })
    );

    return expensesWithShares;
  },

  async getExpensesByUser(userId) {
    if (!userId) {
      throw new Error('userId is required');
    }

    return await ExpenseModel.getByUserId(userId);
  },

  async updateExpense(expenseId, updates) {
    if (!expenseId) {
      throw new Error('expenseId is required');
    }

    return await ExpenseModel.update(expenseId, updates);
  },

  async deleteExpense(expenseId) {
    if (!expenseId) {
      throw new Error('expenseId is required');
    }

    return await ExpenseModel.delete(expenseId);
  },
};


