import { createSlice } from '@reduxjs/toolkit';
import { users } from '../mock';

const initialState = {
  currentUser: JSON.parse(localStorage.getItem('currentUser')) || null,
  isLoggedIn: !!localStorage.getItem('currentUser'),
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      const { username, password } = action.payload;
      const user = Object.values(users).find(
        (u) => u.username === username && u.password === password
      );
      if (user) {
        const { password: _, ...userInfo } = user;
        state.currentUser = userInfo;
        state.isLoggedIn = true;
        localStorage.setItem('currentUser', JSON.stringify(userInfo));
        return { success: true, user: userInfo };
      }
      return { success: false, message: '用户名或密码错误' };
    },
    logout: (state) => {
      state.currentUser = null;
      state.isLoggedIn = false;
      localStorage.removeItem('currentUser');
    },
  },
});

export const { login, logout } = userSlice.actions;

export const selectCurrentUser = (state) => state.user.currentUser;
export const selectIsLoggedIn = (state) => state.user.isLoggedIn;
export const selectUserRole = (state) => state.user.currentUser?.role;

export default userSlice.reducer;
