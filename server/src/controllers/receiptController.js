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
  async processReceiptAndAddGroceries(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }
      const groupId = parseInt(req.body.groupId);
      const userId = req.user?.userId;
      if (!groupId || !userId) {
        return res.status(400).json({ error: 'groupId and user required' });
      }
      const imageBuffer = req.file.buffer;
      const result = await processReceipt(imageBuffer);
      // Add each item to grocery list
      const addedItems = [];
      for (const item of result.items) {
        const grocery = await import('../models/groceryModel.js');
        const added = await grocery.GroceryItemModel.add({
          groupId,
          name: item.name,
          category: null,
          addedBy: userId,
          isSuggested: false
        });
        addedItems.push(added);
      }
      res.status(200).json({
        success: true,
        items: addedItems,
        date: result.date,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};


