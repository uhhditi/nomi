import { API_BASE_URL } from '@env';
import * as SecureStore from 'expo-secure-store';

const API_URL = API_BASE_URL;

async function getAuthHeaders() {
  const token = await SecureStore.getItemAsync('accessToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

export async function searchUsers(q: string) {
  const headers = await getAuthHeaders();
  const r = await fetch(`${API_URL}/groups/users/search?query=${encodeURIComponent(q)}`, {
    headers
  });
  if (!r.ok) throw new Error(`Search failed: ${r.status}`);
  return r.json() as Promise<Array<{id:number; email:string}>>;
}

export async function addMember(groupId: number, email: string, addedBy?: number) {
  const headers = await getAuthHeaders();
  const r = await fetch(`${API_URL}/groups/${groupId}/members`, {
    method: "POST",
    headers,
    body: JSON.stringify({ email, addedBy }),
  });
  if (!r.ok) throw new Error(`Add member failed: ${r.status}`);
  return r.json() as Promise<{group_id: number; user_id: number}>;
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
  memberEmails: string[],
  createdBy?: number
): Promise<{ id: number; name: string }> {
  if (!API_URL) {
    throw new Error("API URL missing (API_URL)");
  }

  // Build payload (omit createdBy if undefined)
  const payload: Record<string, unknown> = { name, members: memberEmails };
  if (createdBy !== undefined) payload.createdBy = createdBy;

  // Add a timeout (e.g., 10s)
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 10_000);

  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/groups`, {
      method: "POST",
      headers,
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



export async function listMembers(groupId: number) {
  const headers = await getAuthHeaders();
  const r = await fetch(`${API_URL}/groups/${groupId}/members`, { headers });
  if (!r.ok) throw new Error(`List failed: ${r.status}`);
  return r.json() as Promise<Array<{id:number; email:string; first?:string; last?:string}>>;
}

export async function listGroupsForUser(userId: number) {
  const headers = await getAuthHeaders();
  const r = await fetch(`${API_URL}/groups/by-user/${userId}`, { headers });
  if (!r.ok) throw new Error(`Group list failed: ${r.status}`);
  return r.json() as Promise<Array<{id:number; name:string}>>;
}

export async function searchGroups(query: string) {
  const headers = await getAuthHeaders();
  const r = await fetch(`${API_URL}/groups/search?query=${encodeURIComponent(query)}`, { headers });
  if (!r.ok) throw new Error(`Search groups failed: ${r.status}`);
  return r.json() as Promise<Array<{id:number; name:string}>>;
}

export async function leaveGroup(groupId: number) {
  const headers = await getAuthHeaders();
  const r = await fetch(`${API_URL}/groups/${groupId}/leave`, {
    method: 'POST',
    headers
  });
  if (!r.ok) {
    const errorData = await r.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `Leave group failed: ${r.status}`);
  }
  return r.json() as Promise<{ message: string; groupId: number; userId: number }>;
}

export async function joinGroup(groupId: number) {
  const headers = await getAuthHeaders();
  const r = await fetch(`${API_URL}/groups/${groupId}/join`, {
    method: 'POST',
    headers,
  });
  if (!r.ok) {
    const errorText = await r.text();
    throw new Error(errorText || `Join group failed: ${r.status}`);
  }
  return r.json();
}