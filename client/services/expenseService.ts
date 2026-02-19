import { IP_ADDRESS, PORT } from '@env';
import { getToken } from './authService';

const API_URL = `http://${IP_ADDRESS}:${PORT}/expenses`;

export interface ExpenseShare {
  share_id: number;
  expense_id: number;
  user_id: number;
  owed_amount: number;
  created_at: string;
  first?: string;
  last?: string;
  email?: string;
}

export interface Expense {
  expense_id: number;
  group_id: number;
  paid_by_user_id: number;
  name: string;
  price: number;
  category?: string;
  created_at: string;
  shares?: ExpenseShare[];
  first?: string;
  last?: string;
  email?: string;
}

export interface CreateExpenseData {
  groupId: number;
  name: string;
  price: number;
  category?: string;
  shares?: Array<{ userId: number; owedAmount: number }>;
}

/**
 * Create a new expense
 */
export async function createExpense(data: CreateExpenseData): Promise<Expense> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating expense:', error);
    throw error;
  }
}

/**
 * Get expenses by group
 */
export async function getExpensesByGroup(groupId: number): Promise<Expense[]> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/group/${groupId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
}

/**
 * Mark a list of expense shares as paid/settled
 */
export async function markSharesPaid(shareIds: number[]): Promise<void> {
  const token = await getToken();
  if (!token) throw new Error('No authentication token found');
  const response = await fetch(`${API_URL}/shares/paid`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ shareIds }),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
}

/**
 * Get expenses by current user
 */
export async function getExpensesByUser(): Promise<Expense[]> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
}


