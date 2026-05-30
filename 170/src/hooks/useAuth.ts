import { useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import { login, logout, register } from '../store/modules/user';
import type { User } from '../types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { currentUser, isLoggedIn, loading } = useAppSelector((state) => state.user);

  const handleLogin = (phone: string, password: string) => {
    try {
      dispatch(login({ phone, password }));
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleRegister = (phone: string, password: string, nickname: string, role: 'user' | 'technician') => {
    try {
      dispatch(register({ phone, password, nickname, role }));
      return true;
    } catch (error) {
      return false;
    }
  };

  const isTechnician = useMemo(() => {
    return currentUser?.role === 'technician';
  }, [currentUser]);

  const isUser = useMemo(() => {
    return currentUser?.role === 'user';
  }, [currentUser]);

  return {
    user: currentUser as User | null,
    isLoggedIn,
    loading,
    isTechnician,
    isUser,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
  };
};
