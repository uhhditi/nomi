import { API_BASE_URL } from '../utils/apiConfig';
import * as SecureStore from 'expo-secure-store';

export async function getLogs() {
  try {
      // Get the access token 
      let accessToken = await SecureStore.getItemAsync('accessToken');
      
      const response = await fetch(`${API_BASE_URL}/logs/`, {
          method: 'GET',
          headers: { 
              'Content-Type': 'application/json', 
              'Authorization': `Bearer ${accessToken}` // Add auth header
          }
      });
    
      if (!response.ok) {
          // Get more detailed error info
          const errorData = await response.text();
          console.log("Error response:", errorData);
          throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      return data;
      
  } catch (error) {
      console.error("getLogs error:", error);
      throw error;
  }
}

export async function addLog(description: string, notes: string, date: Date, time: string, userId: number) {
  console.log("in add log");

    try {
      let accessToken = await SecureStore.getItemAsync('accessToken');
      const response = await fetch(`${API_BASE_URL}/logs/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
        body: JSON.stringify({description, notes, date, time, userId}),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.log("log addition failed: ", errorData)
        return errorData;
      }
      console.log("got meal info");
      const data = await response.json();
      return data;
    }
    catch (error) {
      console.error("fetch failed:", error);
      return { error: true, message: "Fetch error", details: error };
    }
}