import * as SecureStore from 'expo-secure-store';
import { IP_ADDRESS, PORT } from '@env';

const API_URL = `http://${IP_ADDRESS}:${PORT}/`;

export const getStoredToken = async () => {
  try {
    return await SecureStore.getItemAsync('accessToken');
  } catch (error) {
    console.error('Failed to get stored token:', error);
    return null;
  }
};

export const storeToken = async (token: string) => {
  try {
    await SecureStore.setItemAsync('accessToken', token);
  } catch (error) {
    console.error('Failed to store token:', error);
  }
};

export const storeRefreshToken = async (token: string) => {
  try {
    await SecureStore.setItemAsync('refreshToken', token);
  } catch (error) {
    console.error('Failed to store refresh token:', error);
  }
};
// Logout
export const clearTokens = async () => {
  try {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
  } catch (error) {
    console.error('Failed to clear tokens:', error);
  }
};

const refreshAccessToken = async () => {
  try {
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const response = await fetch(`${API_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }
    const { accessToken } = await response.json();
    await storeToken(accessToken);
    return accessToken;
  } catch (error) {
    console.log('Failed to refresh token:', error);
    return null;
  }
};

export const apiCall = async (endpoint: string, method: string, body = null) => {
  console.log(`${API_URL}${endpoint}`)
    try {
      try {
        let token = await getStoredToken();
        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        };
    
        const config = {
          method,
          headers,
          body: body ? JSON.stringify(body) : null,
        };
    
        console.log('Making API request with config:', config);
        console.log("api call endpoint: " + `${API_URL}${endpoint}`);
        let response = await fetch(`${API_URL}${endpoint}`, config);
    
        //if token is expired/invalid
        if (response.status === 401) { 
         // try refresh token
          token = await refreshAccessToken();
          if (!token) {
            throw new Error('Session expired');
          }
          headers.Authorization = `Bearer ${token}`;
          response = await fetch(`${API_URL}${endpoint}`, config);
        }
    
        if (!response.ok) {
          throw new Error('Request failed');
        }
    
        return await response.json();
      } catch (e) {
        console.error('Failed network request', e);
        throw e;
      }
      
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };