import { IP_ADDRESS } from '@env'

export async function getLogs() {
    const response = await fetch(`http://${IP_ADDRESS}:3001/logs/`);
    if (!response.ok) {
        throw new Error("failed to fetch logs")
    }

    return response.json();
}