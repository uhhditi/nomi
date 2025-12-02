import { processReceipt } from '../services/receiptService.js';

export const ReceiptController = {
  async processReceiptImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      // Get image buffer from multer
      const imageBuffer = req.file.buffer;

      // Process the receipt
      const result = await processReceipt(imageBuffer);

      res.status(200).json({
        success: true,
        items: result.items,
        date: result.date,
      });
    } catch (error) {
      console.error('Error processing receipt:', error);
      res.status(500).json({
        error: 'Failed to process receipt',
        message: error.message,
      });
    }
  },
};

