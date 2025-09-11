import { useState, useEffect } from 'react';
import { ApiUserRepository } from '../../infrastructure/repositories/ApiCourseRepository';
import { useAppStore } from '../stores/useAppStore';
import { UserRole } from '../../shared/types';

const userRepository = new ApiUserRepository();

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user, setUser, logout: logoutStore } = useAppStore();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const loginResult = await userRepository.login({ email, password });
      
      if (loginResult.success) {
        // Get user data after successful login
        const userResult = await userRepository.getCurrentUser();
        
        if (userResult.success && userResult.data) {
          setUser({
            id: userResult.data.id,
            name: userResult.data.name,
            email: userResult.data.email,
            role: userResult.data.role as UserRole
          });
          return true;
        }
      } else {
        setError(loginResult.error?.message || 'Login failed');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    email: string;
    name: string;
    password: string;
    role: 'teacher' | 'student';
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await userRepository.register(userData);
      
      if (result.success && result.data) {
        // Auto-login after registration
        const loginSuccess = await login(userData.email, userData.password);
        return loginSuccess;
      } else {
        setError(result.error?.message || 'Registration failed');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await userRepository.logout();
    logoutStore();
  };

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return false;
    }

    try {
      const result = await userRepository.getCurrentUser();
      
      if (result.success && result.data) {
        setUser({
          id: result.data.id,
          name: result.data.name,
          email: result.data.email,
          role: result.data.role as UserRole
        });
        return true;
      } else {
        // Token is invalid
        localStorage.removeItem('auth_token');
        return false;
      }
    } catch (err) {
      localStorage.removeItem('auth_token');
      return false;
    }
  };

  useEffect(() => {
    // Check auth status on mount
    if (!user) {
      checkAuthStatus();
    }
  }, []);

  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    checkAuthStatus,
    clearError: () => setError(null)
  };
};