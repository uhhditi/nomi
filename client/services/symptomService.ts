import { IP_ADDRESS, PORT } from '@env'
import * as SecureStore from 'expo-secure-store';

// export async function getLogs() {
//     const response = await fetch(`http://${IP_ADDRESS}:3001/logs/`);
//     if (!response.ok) {
//         throw new Error("failed to fetch logs")
//     }

//     return response.json();
// }

export async function addSymptom(name: string, date: Date, time: string, userId: number) {
  console.log("in add symptom");
    // const response = await apiCall(`user/`, 'POST');
    try {
      let accessToken = await SecureStore.getItemAsync('accessToken');
      const response = await fetch(`http://${IP_ADDRESS}:${PORT}/symptom/add`, {
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