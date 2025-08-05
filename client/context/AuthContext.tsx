import React, { createContext, useState, useContext } from 'react';
import { storeToken, storeRefreshToken, clearTokens, apiCall } from '../services/authService';
import { IP_ADDRESS, PORT } from '@env';

interface AuthProps {
  // authState?: {token: string | null; authenticated: boolean | null};
  user?: {name: string, email: string, password: string | null} | null;
  register: (name: string, email: string, password: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<any>;
}

export const AuthContext = createContext<AuthProps | undefined>(undefined);

const API_URL = `http://${IP_ADDRESS}:${PORT}/user/login`;

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState(null);

  const login = async (email: string, password: string) => {
    try {
        const response = await fetch(`http://${IP_ADDRESS}:${PORT}/user/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({email, password}),
          });
    
          if (!response.ok) {
            throw new Error("invalid login")
          } 
    
        const data = await response.json();

        setUser(data.user);
        console.log("storing token");

        await storeToken(data.accessToken);
        await storeRefreshToken(data.refreshToken);
        return data.email;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
        const response = await fetch(`http://${IP_ADDRESS}:${PORT}/user/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({name, email, password}),
        });

        console.log("Response status:", response.status);
        const data = await response.json();
       // const text = await response.text();
       // console.log("Response text:", text);

          if (!response.ok) {
            console.error('Signup failed:', data);
            throw new Error(data.message || 'Signup failed');
          }
          console.log("yay")
          setUser(data.user);
          await storeToken(data.accessToken);
          await storeRefreshToken(data.refreshToken);
          return data.user;

    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    setUser(null);
    await clearTokens();
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);