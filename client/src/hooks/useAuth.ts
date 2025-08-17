import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';

export interface User {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  role: 'student' | 'instructor' | 'admin';
  firstName?: string;
  lastName?: string;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isStudent: user?.role === 'student',
    isInstructor: user?.role === 'instructor',
    isAdmin: user?.role === 'admin',
    error,
  };
}

export function useStudentAuth() {
  const { data: studentUser, isLoading, error } = useQuery<User>({
    queryKey: ['/api/auth/student'],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    user: studentUser,
    isLoading,
    isAuthenticated: !!studentUser,
    error,
  };
}

export function useAdminAuth() {
  const { data: adminUser, isLoading, error } = useQuery<User>({
    queryKey: ['/api/auth/admin'],
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    user: adminUser,
    isLoading,
    isAuthenticated: !!adminUser,
    error,
  };
}