import { useSelector, useDispatch } from 'react-redux';
import { login, logout, selectCurrentUser, selectIsLoggedIn, selectUserRole } from '../store/userSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const userRole = useSelector(selectUserRole);

  const handleLogin = (username, password) => {
    const result = dispatch(login({ username, password }));
    return result.payload;
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const isAdmin = userRole === 'admin';
  const isUser = userRole === 'user';

  return {
    currentUser,
    isLoggedIn,
    userRole,
    isAdmin,
    isUser,
    login: handleLogin,
    logout: handleLogout,
  };
};

export default useAuth;
