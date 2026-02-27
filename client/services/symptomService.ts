import { API_BASE_URL } from '@env'
import * as SecureStore from 'expo-secure-store';


export async function getSymptoms() {
  try {
      // Get the access token 
      let accessToken = await SecureStore.getItemAsync('accessToken');
      
      const response = await fetch(`${API_BASE_URL}/symptom/`, {
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
      console.error("getSymptoms error:", error);
      throw error;
  }
}

export async function addSymptom(name: string, date: Date, time: string, userId: number) {
    try {
      let accessToken = await SecureStore.getItemAsync('accessToken');
      const response = await fetch(`${API_BASE_URL}/symptom/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
        body: JSON.stringify({name, date, time, userId}),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.log("symptom log addition failed: ", errorData)
        return errorData;
      }
      console.log("got symptom log info");
      const data = await response.json();
      return data;
    }
    catch (error) {
      console.error("fetch failed:", error);
      return { error: true, message: "Fetch error", details: error };
    }
}