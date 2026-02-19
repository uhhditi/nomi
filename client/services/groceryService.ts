import { IP_ADDRESS, PORT } from '@env';
import { getToken } from './authService';

const API_URL = `http://${IP_ADDRESS}:${PORT}/grocery`;

export async function getGroceryList(groupId) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/group/${groupId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch grocery list');
  return res.json();
}

export async function getGrocerySuggestions(groupId) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/group/${groupId}/recurring-suggestions`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch suggestions');
  return res.json();
}

export async function addGroceryItem(groupId, name, category) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ groupId, name, category }),
  });
  if (!res.ok) throw new Error('Failed to add item');
  return res.json();
}

export async function updateGroceryItem(itemId, updates) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/${itemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update item');
  return res.json();
}

export async function deleteGroceryItem(itemId) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/${itemId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete item');
  return res.json();
}

export async function markGroceryPurchased(itemId) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/${itemId}/purchased`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to mark as purchased');
  return res.json();
}
