import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsInitializing(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        setCurrentUser({
          email: data.email,
          name: data.name || data.email.split('@')[0],
          role: data.role === 'librarian' ? 'admin' : data.role,
        });
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
        }
        setCurrentUser(null);
      } finally {
        setIsInitializing(false);
      }
    };

    restoreSession();
  }, []);

  const login = ({ token, email, role, name }) => {
    if (token) localStorage.setItem('token', token);
    setCurrentUser({
      email,
      name: name || email.split('@')[0],
      role: role === 'librarian' ? 'admin' : role,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  return (
    <AppContext.Provider value={{ currentUser, isInitializing, login, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
