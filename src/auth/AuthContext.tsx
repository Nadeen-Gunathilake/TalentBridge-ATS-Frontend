import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import { registerUnauthorizedHandler } from '../api/client';
import { login as loginRequest, registerCandidate as registerRequest } from '../api/auth';
import { clearSession, getStoredUser, getToken, saveSession } from './session';
import type { AuthUser, LoginRequest, RegisterRequest, RegisterResponse } from '../types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  isInitializing: boolean;
  sessionMessage: string | null;
  login: (body: LoginRequest) => Promise<AuthUser>;
  register: (body: RegisterRequest) => Promise<RegisterResponse>;
  logout: () => void;
  clearSessionMessage: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    const storedUser = getStoredUser();
    if (token && storedUser) {
      setUser(storedUser);
    }
    setIsInitializing(false);
  }, []);

  useEffect(() => {
    registerUnauthorizedHandler((reason) => {
      if (reason === 'expired') {
        setUser(null);
        setSessionMessage('Your session has expired. Please log in again.');
      } else {
        setSessionMessage("You don't have permission to do that.");
      }
    });
  }, []);

  const login = useCallback(async (body: LoginRequest) => {
    const { token, role } = await loginRequest(body);
    const loggedInUser: AuthUser = { email: body.email, role };
    saveSession(token, loggedInUser);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(async (body: RegisterRequest) => {
    return registerRequest(body);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const clearSessionMessage = useCallback(() => setSessionMessage(null), []);

  return (
    <AuthContext.Provider
      value={{ user, isInitializing, sessionMessage, login, register, logout, clearSessionMessage }}
    >
      {children}
    </AuthContext.Provider>
  );
}
