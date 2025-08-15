import { useQuery } from '@tanstack/react-query';

export interface User {
  id: string;
  username: string;
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