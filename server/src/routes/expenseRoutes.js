import { Router } from 'express';
import { ExpenseController } from '../controllers/expenseController.js';
import { verifyToken } from '../middlewares/validationMiddleware.js';

const router = Router();

// All routes require authentication
router.use(verifyToken);

// Create expense
router.post('/', ExpenseController.createExpense);

// Get expenses by group
router.get('/group/:groupId', ExpenseController.getExpensesByGroup);

// Get expenses by user
router.get('/user', ExpenseController.getExpensesByUser);

// Mark shares as paid (must come before /:expenseId to avoid route conflict)
router.put('/shares/paid', ExpenseController.markSharesPaid);

// Update expense
router.put('/:expenseId', ExpenseController.updateExpense);

// Delete expense
router.delete('/:expenseId', ExpenseController.deleteExpense);

export default router;


