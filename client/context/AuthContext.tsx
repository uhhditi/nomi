import React, { createContext, useState, useContext } from 'react';
import { storeToken, storeRefreshToken, clearTokens, getToken } from '../services/authService';
import { API_BASE_URL } from '../utils/apiConfig';

interface AuthProps {
  // authState?: {token: string | null; authenticated: boolean | null};
  user?: {name: string, email: string, password: string | null, id: number, first?: string, last?: string} | null;
  register: ( email: string, password: string, first: string, last: string ) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<any>;
  updateUser: (updates: { first?: string; last?: string; email?: string }) => Promise<void>;
}

export const AuthContext = createContext<AuthProps | undefined>(undefined);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState(null);

  const login = async (email: string, password: string) => {
    try {
      console.log("body: ", JSON.stringify({email, password}));
      const response = await fetch(`${API_BASE_URL}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({email, password}),
      });

      const text = await response.text();
      let data: { user?: { user?: any; accessToken?: string; refreshToken?: string }; message?: string } = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        console.error('Login response not JSON:', text?.slice(0, 200));
        throw new Error(response.ok ? 'Invalid response from server' : 'Login failed. Try again.');
      }

      if (!response.ok) {
        console.error('Login failed:', response.status, data);
        throw new Error(data.message || 'Invalid email or password.');
      }

      console.log("login user data", data.user);
      setUser(data.user?.user);
      if (data.user?.accessToken) await storeToken(data.user.accessToken);
      if (data.user?.refreshToken) await storeRefreshToken(data.user.refreshToken);
      return data.user;
    } catch (error: any) {
      console.error('Login error:', error);
      if (error?.message?.includes('fetch') || error?.name === 'TypeError') {
        throw new Error('Could not reach server. Check your connection.');
      }
      throw error;
    }
  };

  const register = async (email: string, password: string, first: string, last: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/user/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({email, password, first, last}),
        });

        console.log("Response status:", response.status);
        const text = await response.text();
        let data: { user?: any; accessToken?: string; refreshToken?: string; message?: string; errorCode?: string } = {};
        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          console.error('Signup response not JSON:', response.status, text?.slice(0, 300));
          if (!response.ok) {
            throw new Error('Server error during signup. Check your connection and try again.');
          }
          throw new Error('Invalid response from server.');
        }

        if (!response.ok) {
          if (data.errorCode === "23505") {
            alert("This email has an account associated with it. Please log in.");
            return null;
          }
          const msg = data.message || 'Signup failed';
          console.error('Signup failed:', response.status, data);
          throw new Error(msg);
        }
        console.log("yay");
        setUser(data.user);
        if (data.accessToken) await storeToken(data.accessToken);
        if (data.refreshToken) await storeRefreshToken(data.refreshToken);
        return data.user;

    } catch (error: any) {
      console.error('Registration error:', error);
      if (error?.message?.includes('fetch') || error?.name === 'TypeError') {
        throw new Error('Could not reach server. Check your connection.');
      }
      throw error;
    }
  };

  const logout = async () => {
    setUser(null);
    await clearTokens();
  };

  const updateUser = async (updates: { first?: string; last?: string; email?: string }) => {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update profile');
    const updatedUser = await response.json();
    setUser((prev: any) => ({ ...prev, ...updatedUser }));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);