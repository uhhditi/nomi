import React, { createContext, useState, useContext } from 'react';
import { storeToken, storeRefreshToken, clearTokens, apiCall } from '../services/authService';
import { API_BASE_URL } from '../utils/apiConfig';

interface AuthProps {
  // authState?: {token: string | null; authenticated: boolean | null};
  user?: {name: string, email: string, password: string | null, id: number, first?: string, last?: string} | null;
  register: ( email: string, password: string, first: string, last: string ) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<any>;
}

export const AuthContext = createContext<AuthProps | undefined>(undefined);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState(null);

  const login = async (email: string, password: string) => {
    try {
      console.log("body: ", JSON.stringify({email, password}))
        const response = await fetch(`${API_BASE_URL}/user/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({email, password}),
          });
    
        if (!response.ok) {
          throw new Error("invalid login")
        } 
    
        const data = await response.json();
        console.log("login user data", data.user);
        setUser(data.user.user);
        console.log("storing token");

        console.log("access token type: ", typeof (data.user.accessToken));
        console.log("refresh token type: ", typeof (data.user.refreshToken));
        await storeToken(data.user.accessToken);
        await storeRefreshToken(data.user.refreshToken);
        return data.user;
    } catch (error) {
      console.error('Login error:', error);
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
        const data = await response.json();
       // const text = await response.text();
       // console.log("Response text:", text);

          if (!response.ok) {
            if (data.errorCode === "23505") {
              alert("This email has an account associated with it. Please log in.");
              return null;
            }
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