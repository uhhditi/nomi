import { API_BASE_URL } from '../utils/apiConfig';
import * as SecureStore from 'expo-secure-store';

const API_URL = `${API_BASE_URL}/chores`;

// Helper function to convert backend snake_case to frontend camelCase
const convertBackendChoreToFrontend = (chore: any): Chore => ({
  choreId: chore.chore_id || chore.choreId,
  groupId: chore.group_id || chore.groupId,
  title: chore.title,
  description: chore.description,
  completed: chore.completed,
  dueDate: new Date(chore.due_date || chore.dueDate),
  createdAt: chore.created_at || chore.createdAt,
  updatedAt: chore.updated_at || chore.updatedAt
});

export type Chore = {
  choreId: number;
  groupId: number;
  title: string;
  description?: string | null;
  completed: boolean;
  dueDate: Date | string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateChoreData = {
  groupId: number;
  title: string;
  description?: string;
  dueDate: Date | string;
  completed?: boolean;
};

export type UpdateChoreData = Partial<CreateChoreData> & {
  groupId: number;
};

// Get all chores for a group
export async function getChores(groupId: number): Promise<Chore[]> {
  try {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    const response = await fetch(`${API_URL}/?groupId=${groupId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.log("Error response:", errorData);
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    // Convert snake_case to camelCase and date strings to Date objects
    return data.map(convertBackendChoreToFrontend);
  } catch (error) {
    console.error("getChores error:", error);
    throw error;
  }
}

// Get chores by date range
export async function getChoresByDateRange(
  groupId: number, 
  startDate: Date, 
  endDate: Date
): Promise<Chore[]> {
  try {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    const start = startDate.toISOString();
    const end = endDate.toISOString();
    
    const response = await fetch(
      `${API_URL}/range?groupId=${groupId}&startDate=${start}&endDate=${end}`, 
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    return data.map(convertBackendChoreToFrontend);
  } catch (error) {
    console.error("getChoresByDateRange error:", error);
    throw error;
  }
}

// Get a single chore by ID
export async function getChoreById(choreId: number, groupId: number): Promise<Chore> {
  try {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    const response = await fetch(`${API_URL}/${choreId}?groupId=${groupId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    return convertBackendChoreToFrontend(data);
  } catch (error) {
    console.error("getChoreById error:", error);
    throw error;
  }
}

// Create a new chore
export async function createChore(choreData: CreateChoreData): Promise<Chore> {
  try {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    const response = await fetch(`${API_URL}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        ...choreData,
        dueDate: choreData.dueDate instanceof Date 
          ? choreData.dueDate.toISOString() 
          : choreData.dueDate
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return convertBackendChoreToFrontend(data);
  } catch (error) {
    console.error("createChore error:", error);
    throw error;
  }
}

// Update a chore
export async function updateChore(
  choreId: number, 
  updateData: UpdateChoreData
): Promise<Chore> {
  try {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    const payload: any = { ...updateData };
    
    if (updateData.dueDate) {
      payload.dueDate = updateData.dueDate instanceof Date 
        ? updateData.dueDate.toISOString() 
        : updateData.dueDate;
    }

    const response = await fetch(`${API_URL}/${choreId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return convertBackendChoreToFrontend(data);
  } catch (error) {
    console.error("updateChore error:", error);
    throw error;
  }
}

// Toggle chore completion
export async function toggleChoreCompleted(
  choreId: number, 
  groupId: number
): Promise<Chore> {
  try {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    const response = await fetch(`${API_URL}/${choreId}/toggle?groupId=${groupId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText || 'Unknown error' };
      }
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return convertBackendChoreToFrontend(data);
  } catch (error) {
    console.error("toggleChoreCompleted error:", error);
    throw error;
  }
}

// Delete a chore
export async function deleteChore(choreId: number, groupId: number): Promise<void> {
  try {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    const response = await fetch(`${API_URL}/${choreId}?groupId=${groupId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }
  } catch (error) {
    console.error("deleteChore error:", error);
    throw error;
  }
}
