// src/components/AuthGuard.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PUBLIC_APP_URL } from '../api/apiClient';
import AdminEntrySplash from './AdminEntrySplash';

// ==============================|| AUTH GUARD ||============================== //

/**
 * AuthGuard - Protects routes that require authentication.
 * If no valid token exists, redirect to login page.
 */
export default function AuthGuard({ children }) {
  const { token, loading } = useAuth();
  const [entranceElapsed, setEntranceElapsed] = useState(false);

  useEffect(() => {
    if (!token) return undefined;

    const timer = window.setTimeout(() => setEntranceElapsed(true), 850);
    return () => window.clearTimeout(timer);
  }, [token]);

  if (!token) {
    if (!PUBLIC_APP_URL) {
      return (
        <div className="p-6 text-center text-sm text-red-700">
          URL Landing belum dikonfigurasi. Atur VITE_PUBLIC_APP_URL pada environment deployment Admin Dashboard.
        </div>
      );
    }
    window.location.replace(`${PUBLIC_APP_URL}/login`);
    return null;
  }

  if (loading || !entranceElapsed) return <AdminEntrySplash />;

  return children;
}
