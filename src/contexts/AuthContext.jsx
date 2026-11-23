// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuthToken, setAuthToken, request } from '../api/apiClient';

const AuthContext = createContext(null);

export const AVAILABLE_ROLES = [
  { id: 'marketing', label: 'Marketing / Content Writer', description: 'Kelola Slider, Banner, Blog, Mitra' },
  { id: 'administrator', label: 'Super Administrator', description: 'Akses penuh seluruh modul sistem' },
  { id: 'finance', label: 'Finance Staff', description: 'Verifikasi Pembayaran & Laporan Keuangan' },
  { id: 'admin_ppb', label: 'Admin PPB', description: 'Kelola Kursus & Pendaftaran PPB' },
  { id: 'admin_bipa', label: 'Admin BIPA', description: 'Kelola Kursus & Pendaftaran BIPA' },
  { id: 'admin_ppp', label: 'Admin PPP', description: 'Kelola Kursus & Pendaftaran PPP' },
  { id: 'student', label: 'Peserta / Student', description: 'Portal Siswa & Jadwal' }
];

function getInitialToken() {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const handoffToken = params.get('auth_token');

  if (handoffToken) {
    setAuthToken(handoffToken);
    window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.hash}`);
    return handoffToken;
  }

  return getAuthToken();
}

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(getInitialToken);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('lbi_current_user');
    const realRoleSaved = localStorage.getItem('lbi_real_role');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (realRoleSaved && parsed.role !== realRoleSaved) {
          parsed.role = realRoleSaved;
          if (parsed.name?.startsWith('Preview:')) {
            parsed.name = parsed.email?.split('@')[0] || 'User';
          }
          localStorage.setItem('lbi_current_user', JSON.stringify(parsed));
        }
        return parsed;
      } catch {
        // ignore parse error
      }
    }
    return null;
  });

  // realRole = role asli dari backend
  const [realRole, setRealRole] = useState(() => {
    return localStorage.getItem('lbi_real_role') || null;
  });

  // roleLocked = true HANYA jika role backend asli user adalah 'marketing'
  // User marketing tidak bisa switch ke role lain (keamanan RBAC)
  const roleLocked = realRole === 'marketing';

  const [loading, setLoading] = useState(() => Boolean(getAuthToken()));

  useEffect(() => {
    // If token exists, verify with backend /me
    const verifyUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await request('/auth/me');
        if (res.data) {
          const backendRole = res.data.role || 'marketing';
          const fetchedUser = {
            id: res.data.id,
            name: res.data.name,
            email: res.data.email,
            role: backendRole
          };
          setRealRole(backendRole);
          localStorage.setItem('lbi_real_role', backendRole);
          setUser(fetchedUser);
          localStorage.setItem('lbi_current_user', JSON.stringify(fetchedUser));
        }
      } catch (err) {
        if (err.status === 401) {
          setAuthToken(null);
          setTokenState(null);
          setUser(null);
          setRealRole(null);
          localStorage.removeItem('lbi_current_user');
          localStorage.removeItem('lbi_real_role');
          return;
        }
        console.warn('Could not verify token with /auth/me:', err.message);
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      const authToken = res.data?.token;
      const authUser = res.data?.user;

      if (authToken) {
        setAuthToken(authToken);
        setTokenState(authToken);
      }

      if (authUser) {
        const backendRole = authUser.role || 'marketing';
        const userData = {
          id: authUser.id,
          name: authUser.name,
          email: authUser.email,
          role: backendRole
        };
        setRealRole(backendRole);
        localStorage.setItem('lbi_real_role', backendRole);
        setUser(userData);
        localStorage.setItem('lbi_current_user', JSON.stringify(userData));
      }

      return { success: true, data: res.data };
    } catch (err) {
      return {
        success: false,
        message: err.data?.message || err.message || 'Login failed'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setAuthToken(null);
    setTokenState(null);
    localStorage.removeItem('lbi_current_user');
    localStorage.removeItem('lbi_real_role');
    setUser(null);
    setRealRole(null);
  };

  const switchRole = (roleKey) => {
    if (roleLocked) return; // Hanya blocked jika real backend role = marketing

    const updatedUser = {
      ...user,
      role: roleKey,
      // Tampilkan nama asli jika kembali ke role asli, preview label jika switch
      name: realRole === roleKey ? (user?.name?.replace(/^Preview: [A-Z_]+$/, '') || user?.name) : `Preview: ${roleKey.toUpperCase()}`
    };
    setUser(updatedUser);
    localStorage.setItem('lbi_current_user', JSON.stringify(updatedUser));
  };

  const hasRole = (...roles) => {
    if (!user || !user.role) return false;
    if (user.role === 'administrator') return true; // Super admin always has full access
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        realRole,
        token,
        loading,
        login,
        logout,
        switchRole,
        roleLocked,
        hasRole
      }}
    >
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
