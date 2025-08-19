import { IP_ADDRESS, PORT } from '@env'
import * as SecureStore from 'expo-secure-store';

export async function getLogs() {
    const response = await fetch(`http://${IP_ADDRESS}:${PORT}/logs/`);
    if (!response.ok) {
        throw new Error("failed to fetch logs")
    }

    return response.json();
}

export async function addLog(description: string, notes: string, date: Date, time: string, userId: number) {
  console.log("in add log");
    // const response = await apiCall(`user/`, 'POST');
    try {
      let accessToken = await SecureStore.getItemAsync('accessToken');
      const response = await fetch(`http://${IP_ADDRESS}:${PORT}/logs/create`, {
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