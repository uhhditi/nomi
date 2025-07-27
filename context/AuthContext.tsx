import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { setUser, loginUser } from '../services/userService';

interface AuthProps {
    authState?: {token: string | null; authenticated: boolean | null};
    onRegister?: (name: string, email: string, password: string) => Promise<any>;
    onLogin?: (email: string, password: string) => Promise<any>;
    onLogout?: () => Promise<any>;
}

const TOKEN_KEY = 'my-jwt';
export const API_URL = 'erm';

export const AuthContext = createContext<AuthProps>({});

export const useAuth = () => {
    return useContext(AuthContext);
}

export const AuthProvider = ({children}: any) => {
    //auth state, initially set to null
    const [AuthState, setAuthState] = useState<{
        token: string | null;
        authenticated: boolean | null;
    }>({
        token: null,
        authenticated: null
    })
    
    const value = {
        AuthState,
        setAuthState,
        onRegister: setUser
    };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}