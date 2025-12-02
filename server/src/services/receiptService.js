import vision from '@google-cloud/vision';

// Initialize the Vision API client
let client;

try {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    client = new vision.ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
  } else if (process.env.GOOGLE_CLOUD_CREDENTIALS) {
    const credentials = JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS);
    client = new vision.ImageAnnotatorClient({
      credentials: credentials,
    });
  } else {
    client = new vision.ImageAnnotatorClient();
  }
} catch (error) {
  console.error('Error initializing Google Cloud Vision client:', error);
  throw error;
}

/**
 * Group words into lines based on their Y-coordinates
 * This is crucial for maintaining proper receipt structure
 */
function groupWordsIntoLines(pages) {
  const allWords = [];
  
  // Extract all words with their bounding boxes
  for (const page of pages) {
    for (const block of page.blocks) {
      for (const paragraph of block.paragraphs) {
        for (const word of paragraph.words) {
          const wordText = word.symbols.map(s => s.text).join('');
          
          // Calculate average Y position
          const vertices = word.boundingBox.vertices;
          const yAvg = vertices.reduce((sum, v) => sum + v.y, 0) / vertices.length;
          const xAvg = vertices.reduce((sum, v) => sum + v.x, 0) / vertices.length;
          
          allWords.push({
            text: wordText,
            x: xAvg,
            y: yAvg,
            vertices: vertices
          });
        }
      }
    }
  }
  
  // Sort by Y coordinate
  allWords.sort((a, b) => a.y - b.y);
  
  // Group words into lines with Y-tolerance of 5 pixels (tighter tolerance)
  const lines = [];
  let currentLine = [];
  let currentY = null;
  const yTolerance = 5; // Reduced from 10 to prevent merging separate lines
  
  for (const word of allWords) {
    if (currentY === null || Math.abs(word.y - currentY) <= yTolerance) {
      currentLine.push(word);
      currentY = currentY === null ? word.y : (currentY + word.y) / 2;
    } else {
      if (currentLine.length > 0) {
        // Sort words in line by X coordinate (left to right)
        currentLine.sort((a, b) => a.x - b.x);
        lines.push({
          words: currentLine,
          text: currentLine.map(w => w.text).join(' '),
          y: currentY
        });
      }
      currentLine = [word];
      currentY = word.y;
    }
  }
  
  // Add the last line
  if (currentLine.length > 0) {
    currentLine.sort((a, b) => a.x - b.x);
    lines.push({
      words: currentLine,
      text: currentLine.map(w => w.text).join(' '),
      y: currentY
    });
  }
  
  return lines;
}

/**
 * Extract text with proper line structure using document text detection
 */
export async function extractTextFromImage(imageBuffer) {
  try {
    // Use documentTextDetection instead of textDetection
    // This provides better structure with blocks, paragraphs, and words
    const [result] = await client.documentTextDetection({
      image: { content: imageBuffer },
    });

    const fullTextAnnotation = result.fullTextAnnotation;
    
    if (!fullTextAnnotation || !fullTextAnnotation.pages) {
      throw new Error('No text detected in image');
    }

    // Group words into proper lines using bounding boxes
    const lines = groupWordsIntoLines(fullTextAnnotation.pages);
    
    console.log(`\n=== EXTRACTED ${lines.length} LINES ===`);
    lines.slice(0, 20).forEach((line, i) => {
      console.log(`${i}: "${line.text}"`);
    });
    
    return {
      fullText: fullTextAnnotation.text,
      lines: lines
    };
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw error;
  }
}

/**
 * Check if a line is likely a header or footer
 */
function isHeaderOrFooter(text) {
  const skipPatterns = [
    /^(total|subtotal|tax|amount|change|cash|card|balance|payment|visa|mastercard|debit|credit|tender|thank you|receipt|store|address|phone|date|time|items in transaction|auth code|tid|mid|sale transaction|customer copy|open|daily|balance to pay)/i,
    /^\d+\s+\d+\s+\$/, // Lines like "3 8 $1.19" (quantity codes)
    /^\d+\s+\d+\.\d{2}$/, // Just numbers
    /^store #/i,
    /^open/i,
    /^\d{3}-?\d{3}-?\d{4}$/, // Phone numbers
    /^www\./i, // URLs
    /@/i, // Emails
    /^payment/i,
    /type:/i,
    /mid:/i,
    /tid:/i,
    /auth code/i,
  ];
  
  return skipPatterns.some(pattern => pattern.test(text));
}

/**
 * Parse receipt lines to extract items with better accuracy
 */
export function parseReceiptText(extractedData) {
  console.log('=== PARSING RECEIPT ===');
  console.log('Total lines:', extractedData.lines.length);
  
  const items = [];
  let receiptDate = null;
  
  // Date patterns
  const datePatterns = [
    /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/,
    /(\d{1,2})-(\d{1,2})-(\d{2,4})/,
    /(\d{4})-(\d{1,2})-(\d{1,2})/,
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}/i,
  ];

  // Find date
  for (const line of extractedData.lines) {
    for (const pattern of datePatterns) {
      const match = line.text.match(pattern);
      if (match) {
        receiptDate = line.text;
        break;
      }
    }
    if (receiptDate) break;
  }

  // Price pattern - look for $X.XX or just X.XX at the end of line
  const pricePattern = /\$?(\d+\.\d{2})\s*$/;
  
  for (let i = 0; i < extractedData.lines.length; i++) {
    const line = extractedData.lines[i];
    const text = line.text.trim();
    
    console.log(`\nLine ${i}: "${text}"`);
    
    // Skip short lines
    if (text.length < 5) {
      console.log('  ❌ Too short');
      continue;
    }
    
    // Skip headers/footers
    if (isHeaderOrFooter(text)) {
      console.log('  ❌ Header/footer');
      continue;
    }
    
    // Look for price at end of line
    const priceMatch = text.match(pricePattern);
    
    if (!priceMatch) {
      console.log('  ❌ No price found');
      continue;
    }
    
    const price = parseFloat(priceMatch[1]);
    const priceStr = priceMatch[1]; // The matched price string (e.g., "1.29")
    console.log(`  💰 Price: ${price}`);
    
    // Sanity check price
    if (!price || price <= 0 || price > 1000) {
      console.log('  ❌ Price out of range');
      continue;
    }
    
    // Extract item name by removing the price from the end
    // Try multiple patterns to catch different formats
    let itemName = text
      .replace(new RegExp(`\\s*:\\s*\\$?${priceStr}\\s*$`), '') // Remove ": $1.29" or ": 1.29"
      .replace(new RegExp(`\\s+\\$?${priceStr}\\s*$`), '') // Remove " $1.29" or " 1.29"
      .replace(new RegExp(`\\s+${priceStr}\\s*$`), '') // Remove " 1.29" (fallback)
      .trim();
    
    // Check for quantity at the start
    let quantity = undefined;
    
    // Pattern: "3@" or "3 @"
    const qtyAtMatch = itemName.match(/^(\d+(?:\.\d+)?)\s*@/);
    if (qtyAtMatch) {
      quantity = parseFloat(qtyAtMatch[1]);
      itemName = itemName.replace(/^(\d+(?:\.\d+)?)\s*@\s*/, '').trim();
      console.log(`  📦 Quantity (@ format): ${quantity}`);
    } else {
      // Pattern: "2x" or "2 x"
      const qtyXMatch = itemName.match(/^(\d+(?:\.\d+)?)\s*[xX×]\s*/);
      if (qtyXMatch) {
        quantity = parseFloat(qtyXMatch[1]);
        itemName = itemName.replace(/^(\d+(?:\.\d+)?)\s*[xX×]\s*/, '').trim();
        console.log(`  📦 Quantity (x format): ${quantity}`);
      }
    }
    
    // Clean up item name
    itemName = itemName
      .replace(/[@$#]/g, '') // Remove special chars
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .trim();
    
    // Remove any trailing price-like numbers (X.XX format) that might still be in the name
    // This handles cases where the price appears in the item name itself
    itemName = itemName.replace(/\s+(\d+\.\d{2})\s*$/, '').trim();
    
    console.log(`  🏷️  Item: "${itemName}"`);
    
    // Validate item name - at least 3 chars, must contain at least one letter
    if (!itemName || itemName.length < 3 || !/[a-zA-Z]/.test(itemName)) {
      console.log('  ❌ Invalid item name (no letters found)');
      continue;
    }
    
    // Add the item
    const item = {
      name: itemName,
      price: price,
    };
    
    if (quantity !== undefined && quantity > 0) {
      item.quantity = quantity;
    }
    
    items.push(item);
    console.log('  ✅ Added:', item);
  }
  
  console.log(`\n=== FOUND ${items.length} ITEMS ===`);
  
  return {
    items: items.slice(0, 30), // Increased limit for longer receipts
    date: receiptDate,
    debug: {
      totalLines: extractedData.lines.length,
      processedItems: items.length
    }
  };
}

/**
 * Process receipt image and return parsed items
 */
export async function processReceipt(imageBuffer) {
  try {
    console.log('Processing receipt image...');
    
    // Extract text with proper line structure
    const extractedData = await extractTextFromImage(imageBuffer);
    
    console.log('\n=== EXTRACTED TEXT (first 500 chars) ===');
    console.log(extractedData.fullText.substring(0, 500));
    console.log('\n=== LINE STRUCTURE ===');
    extractedData.lines.slice(0, 10).forEach((line, i) => {
      console.log(`${i}: "${line.text}"`);
    });
    
    // Parse the structured data
    const parsed = parseReceiptText(extractedData);
    
    console.log('\n=== FINAL RESULT ===');
    console.log(JSON.stringify(parsed, null, 2));
    
    return parsed;
  } catch (error) {
    console.error('Error processing receipt:', error);
    throw error;
  }
}
