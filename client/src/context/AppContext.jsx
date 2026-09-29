import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [fineNotification, setFineNotification] = useState(null);

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

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'member') {
      setFineNotification(null);
      return undefined;
    }

    let isCurrentSession = true;
    api.get('/fines/my')
      .then(({ data }) => {
        if (isCurrentSession && data.length > 0) {
          setFineNotification(data);
        }
      })
      .catch((error) => {
        if (isCurrentSession) {
          console.error('Could not load your outstanding fines:', error);
        }
      });

    return () => {
      isCurrentSession = false;
    };
  }, [currentUser]);

  const login = ({ token, email, role, name }) => {
    if (token) localStorage.setItem('token', token);
    setFineNotification(null);
    setCurrentUser({
      email,
      name: name || email.split('@')[0],
      role: role === 'librarian' ? 'admin' : role,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setFineNotification(null);
    setCurrentUser(null);
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      fineNotification,
      dismissFineNotification: () => setFineNotification(null),
      isInitializing,
      login,
      logout,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
