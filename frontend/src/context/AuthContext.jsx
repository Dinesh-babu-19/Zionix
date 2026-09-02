import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const checkSessionExpiry = (userData) => {
    if (!userData) return null;
    const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
    if (userData.loginTimestamp && Date.now() - userData.loginTimestamp > THREE_DAYS_MS) {
      localStorage.removeItem('zionix_user');
      return null;
    }
    return userData;
  };

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('zionix_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        return checkSessionExpiry(parsed);
      }
      return null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    const handleAuthChange = () => {
      try {
        const stored = localStorage.getItem('zionix_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser(checkSessionExpiry(parsed));
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };

    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const login = (userData) => {
    const userToSave = {
      ...userData,
      loginTimestamp: Date.now()
    };
    localStorage.setItem('zionix_user', JSON.stringify(userToSave));
    setUser(userToSave);
    window.dispatchEvent(new Event('auth-change'));
    setIsAuthModalOpen(false);

    // If there was a pending action waiting for sign in, execute it now!
    if (pendingAction && typeof pendingAction === 'function') {
      try {
        pendingAction();
      } catch (e) {
        console.error('Error executing post-login action:', e);
      }
      setPendingAction(null);
    }
  };

  const logout = () => {
    localStorage.removeItem('zionix_user');
    setUser(null);
    window.dispatchEvent(new Event('auth-change'));
  };

  /**
   * Guards any button or user action.
   * If user is logged in, executes action immediately.
   * If user is NOT logged in, opens the Auth Modal and saves the action to run upon successful login!
   */
  const requireAuth = (action) => {
    if (user) {
      if (typeof action === 'function') {
        action();
      }
      return true;
    }

    // User is not logged in -> open modal
    if (typeof action === 'function') {
      setPendingAction(() => action);
    }
    setIsAuthModalOpen(true);
    return false;
  };

  const openAuthModal = (callbackAction) => {
    if (typeof callbackAction === 'function') {
      setPendingAction(() => callbackAction);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setPendingAction(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      login,
      logout,
      requireAuth,
      openAuthModal,
      closeAuthModal,
      isAuthModalOpen
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
