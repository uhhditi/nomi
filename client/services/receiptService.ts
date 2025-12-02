import { IP_ADDRESS, PORT } from '@env';
import { getToken } from './authService';

const API_URL = `http://${IP_ADDRESS}:${PORT}/receipts`;

export interface ReceiptItem {
  name: string;
  quantity?: number; // Optional - only present if quantity indicator found
  price: number;
}

export interface ReceiptResponse {
  success: boolean;
  items: ReceiptItem[];
  date: string | null;
}

/**
 * Process a receipt image and extract items
 */
export async function processReceiptImage(imageUri: string): Promise<ReceiptResponse> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Create form data for React Native
    const formData = new FormData();
    
    // For React Native, we need to use the file URI directly
    // Extract filename from URI or use default
    const filename = imageUri.split('/').pop() || 'receipt.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    
    formData.append('image', {
      uri: imageUri,
      type: type,
      name: filename,
    } as any);

    // Send to backend
    const apiResponse = await fetch(`${API_URL}/process`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type, let FormData set it with boundary
      },
      body: formData as any,
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    return data;
  } catch (error) {
    console.error('Error processing receipt:', error);
    throw error;
  }
}

