import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

// ─────────────────────────────────────────────
// JWT decode helper (no library needed)
// Decodes the payload to check expiry without
// needing to hit the backend on every reload
// ─────────────────────────────────────────────
const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return null;
  }
};

const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  // exp is in seconds, Date.now() is in ms
  return decoded.exp * 1000 < Date.now();
};

// ─────────────────────────────────────────────
// Admin data helpers
// ─────────────────────────────────────────────
const saveAdmin = (admin) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('fth_admin', JSON.stringify(admin));
  }
};

const loadAdmin = () => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('fth_admin');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
  return null;
};

const clearAll = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('fth_admin');
    localStorage.removeItem('fth_token');
  }
};

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = authService.getToken();
      const storedAdmin = loadAdmin();

      // ✅ No token or no admin data → not logged in
      if (!token || !storedAdmin) {
        clearAll();
        setAdmin(null);
        setLoading(false);
        return;
      }

      // ✅ Token expired → clear and redirect
      if (isTokenExpired(token)) {
        clearAll();
        setAdmin(null);
        setLoading(false);
        return;
      }

      // ✅ Token valid → restore session instantly, no API call needed
      setAdmin(storedAdmin);
      setLoading(false);
    };

    checkAuth();
  }, []);

  // ── Login ───────────────────────────────────────────────
  const login = async (email, password) => {
    const data = await authService.login(email, password);
    if (data.success) {
      const adminData = {
        _id: data._id,
        username: data.username,
        email: data.email,
      };
      saveAdmin(adminData);
      setAdmin(adminData);
      router.push('/admin/dashboard');
    }
    return data;
  };

  // ── Register ────────────────────────────────────────────
  const register = async (name, username, email, password) => {
    return await authService.register(name, username, email, password);
  };

  // ── Logout ──────────────────────────────────────────────
  const logout = async () => {
    clearAll();
    setAdmin(null);
    await authService.logout();
    router.push('/login');
  };

  // ── Forgot Password ─────────────────────────────────────
  const forgotPassword = async (email) => {
    return await authService.requestPasswordReset(email);
  };

  // ── Reset Password ──────────────────────────────────────
  const resetPassword = async (token, newPassword) => {
    return await authService.resetPassword(token, newPassword);
  };

  // ── Change Password ─────────────────────────────────────
  const changePassword = async (currentPassword, newPassword) => {
    return await authService.changePassword(currentPassword, newPassword);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        loading,
        isAuthenticated: !!admin,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default AuthContext;