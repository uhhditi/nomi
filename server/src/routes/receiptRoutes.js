import { Router } from 'express';
import multer from 'multer';
import { ReceiptController } from '../controllers/receiptController.js';
import { verifyToken } from '../middlewares/validationMiddleware.js';

const router = Router();

// Configure multer to store files in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Process receipt image
router.post('/process', verifyToken, upload.single('image'), ReceiptController.processReceiptImage);

// Process receipt and add groceries to the group list
router.post('/process-and-add-groceries', verifyToken, upload.single('image'), ReceiptController.processReceiptAndAddGroceries);

export default router;


