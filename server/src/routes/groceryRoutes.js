import { Router } from 'express';
import { GroceryController } from '../controllers/groceryController.js';
import { verifyToken } from '../middlewares/validationMiddleware.js';

const router = Router();
router.use(verifyToken);

// CRUD endpoints
router.post('/', GroceryController.addItem);
router.put('/:itemId', GroceryController.updateItem);
router.delete('/:itemId', GroceryController.deleteItem);
router.put('/:itemId/purchased', GroceryController.markPurchased);

// List and suggestions
router.get('/group/:groupId', GroceryController.getList);
router.get('/group/:groupId/suggestions', GroceryController.getSuggestions);
router.get('/group/:groupId/history', GroceryController.getHistory);
router.get('/group/:groupId/recurring-suggestions', GroceryController.getRecurringSuggestions);

export default router;
