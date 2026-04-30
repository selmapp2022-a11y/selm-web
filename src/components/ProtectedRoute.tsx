import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { auth, tokenStore } from '../lib/api';
import { useAuthStore } from '../store/authStore';

export function ProtectedRoute() {
  const { setUser } = useAuthStore();
  const hasToken = !!tokenStore.get();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['me'],
    queryFn: auth.me,
    enabled: hasToken,
  });

  useEffect(() => {
    if (data) setUser(data);
  }, [data, setUser]);

  if (!hasToken) return <Navigate to="/login" replace />;
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-app">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy/20 border-t-navy" />
      </div>
    );
  }
  if (isError) return <Navigate to="/login" replace />;

  return <Outlet />;
}
