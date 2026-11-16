import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextValue {
  token: string | null;
  username: string | null;
  nombre: string | null;
  login: (token: string, username: string, nombre: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [username, setUsername] = useState<string | null>(localStorage.getItem('username'));
  const [nombre, setNombre] = useState<string | null>(localStorage.getItem('nombre'));

  const login = (t: string, u: string, n: string) => {
    localStorage.setItem('token', t);
    localStorage.setItem('username', u);
    localStorage.setItem('nombre', n);
    setToken(t);
    setUsername(u);
    setNombre(n);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('nombre');
    setToken(null);
    setUsername(null);
    setNombre(null);
  };

  return (
    <AuthContext.Provider value={{ token, username, nombre, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
