import { Router } from 'express';
import { ChoreController } from '../controllers/choreController.js';
import { validateData } from '../middlewares/validationMiddleware.js';
import { createChoreSchema, updateChoreSchema } from '../schemas/choreSchema.js';

const router = Router();

// Get all chores for a group (requires groupId query parameter)
router.get('/', ChoreController.getAllChores);

// Get chores by date range (requires groupId, startDate, endDate query parameters)
router.get('/range', ChoreController.getChoresByDateRange);

// Get a specific chore by ID (requires groupId query parameter)
router.get('/:id', ChoreController.getChoreById);

// Create a new chore
router.post('/', validateData(createChoreSchema), ChoreController.createChore);

// Update a chore
router.put('/:id', validateData(updateChoreSchema), ChoreController.updateChore);

// Toggle chore completion (requires groupId query parameter)
router.patch('/:id/toggle', ChoreController.toggleCompleted);

// Delete a chore (requires groupId query parameter)
router.delete('/:id', ChoreController.deleteChore);

export default router;
