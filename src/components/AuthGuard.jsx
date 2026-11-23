// src/components/AuthGuard.jsx
import { useAuth } from '../contexts/AuthContext';
import { PUBLIC_APP_URL } from '../api/apiClient';

// ==============================|| AUTH GUARD ||============================== //

/**
 * AuthGuard - Protects routes that require authentication.
 * If no valid token exists, redirect to login page.
 */
export default function AuthGuard({ children }) {
  const { token, loading } = useAuth();

  if (!token) {
    window.location.replace(`${PUBLIC_APP_URL}/login`);
    return null;
  }

  if (loading) return null;

  return children;
}
