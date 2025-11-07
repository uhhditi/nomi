// import * as SecureStore from 'expo-secure-store';
// import { IP_ADDRESS, PORT } from '@env';

// const API_URL = `http://${IP_ADDRESS}:${PORT}`;
const API_URL = process.env.API_URL!;
// console.log('API_URL =>', API_URL);
export async function searchUsers(q: string) {
  const r = await fetch(`${API_URL}/groups/users/search?query=${encodeURIComponent(q)}`);
  if (!r.ok) throw new Error(`Search failed: ${r.status}`);
  return r.json() as Promise<Array<{id:number; username:string; email:string}>>;
}

// export async function createGroup(name: string, members: string[], createdBy?: number) {
//   const r = await fetch(`${API_URL}/groups`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ name, members, createdBy }),
//   });
//   if (!r.ok) throw new Error(`Create failed: ${r.status}`);
//   return r.json() as Promise<{id:number; name:string}>;
// }
export async function createGroup(
  name: string,
  members: string[],
  createdBy?: number
): Promise<{ id: number; name: string }> {
  if (!process.env.API_URL) {
    throw new Error("API URL missing (API_URL)");
  }
  const API_URL = process.env.API_URL;

  // Build payload (omit createdBy if undefined)
  const payload: Record<string, unknown> = { name, members };
  if (createdBy !== undefined) payload.createdBy = createdBy;

  // Add a timeout (e.g., 10s)
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 10_000);

  try {
    const res = await fetch(`${API_URL}/groups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: ac.signal,
    });

    const text = await res.text(); // read once

    if (!res.ok) {
      // surface server error details
      throw new Error(`Create failed ${res.status}: ${text}`);
    }

    // parse json after status check
    const data = JSON.parse(text) as { id: number; name: string };

    if (!data?.id || !data?.name) {
      throw new Error(`Unexpected response: ${text}`);
    }
    return data;
  } catch (err: any) {
    if (err?.name === "AbortError") {
      throw new Error("Create failed: request timed out");
    }
    throw err;
  } finally {
    clearTimeout(t);
  }
}


export async function addMember(groupId: number, username: string, addedBy?: number) {
  const r = await fetch(`${API_URL}/groups/${groupId}/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, addedBy }),
  });
  if (!r.ok) throw new Error(`Add member failed: ${r.status}`);
  return r.json() as Promise<{group_id: number; user_id: number}>;
}

export async function listMembers(groupId: number) {
  const r = await fetch(`${API_URL}/groups/${groupId}/members`);
  if (!r.ok) throw new Error(`List failed: ${r.status}`);
  return r.json() as Promise<Array<{id:number; username:string; email:string}>>;
}

export async function listGroupsForUser(userId: number) {
  const r = await fetch(`${API_URL}/groups/by-user/${userId}`);
  if (!r.ok) throw new Error(`Group list failed: ${r.status}`);
  return r.json() as Promise<Array<{id:number; name:string}>>;
}