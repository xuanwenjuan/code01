import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User, Address, Coupon, Order } from '../../types';
import { mockUsers, mockCoupons } from '../../mock';

interface UserState {
  currentUser: User | null;
  isLoggedIn: boolean;
  coupons: Coupon[];
  orders: Order[];
  favorites: string[];
  loading: boolean;
}

const initialState: UserState = {
  currentUser: null,
  isLoggedIn: false,
  coupons: mockCoupons,
  orders: [],
  favorites: ['1', '3'],
  loading: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ phone: string; password: string }>) => {
      const user = mockUsers[action.payload.phone];
      if (user && user.password === action.payload.password) {
        const { password, ...userInfo } = user;
        state.currentUser = userInfo;
        state.isLoggedIn = true;
      } else {
        throw new Error('手机号或密码错误');
      }
    },
    logout: (state) => {
      state.currentUser = null;
      state.isLoggedIn = false;
    },
    register: (state, action: PayloadAction<{ phone: string; password: string; nickname: string; role: 'user' | 'technician' }>) => {
      if (mockUsers[action.payload.phone]) {
        throw new Error('该手机号已注册');
      }
      const newUser: User & { password: string } = {
        id: Date.now().toString(),
        phone: action.payload.phone,
        nickname: action.payload.nickname,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
        role: action.payload.role,
        password: action.payload.password,
        address: [],
      };
      mockUsers[action.payload.phone] = newUser;
      const { password, ...userInfo } = newUser;
      state.currentUser = userInfo;
      state.isLoggedIn = true;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
      }
    },
    addAddress: (state, action: PayloadAction<Address>) => {
      if (state.currentUser) {
        if (action.payload.isDefault) {
          state.currentUser.address = state.currentUser.address?.map(addr => ({
            ...addr,
            isDefault: false,
          })) || [];
        }
        state.currentUser.address = [...(state.currentUser.address || []), action.payload];
      }
    },
    updateAddress: (state, action: PayloadAction<Address>) => {
      if (state.currentUser?.address) {
        if (action.payload.isDefault) {
          state.currentUser.address = state.currentUser.address.map(addr => ({
            ...addr,
            isDefault: false,
          }));
        }
        state.currentUser.address = state.currentUser.address.map(addr =>
          addr.id === action.payload.id ? action.payload : addr
        );
      }
    },
    deleteAddress: (state, action: PayloadAction<string>) => {
      if (state.currentUser?.address) {
        state.currentUser.address = state.currentUser.address.filter(addr => addr.id !== action.payload);
      }
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders = [action.payload, ...state.orders];
    },
    updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: Order['status'] }>) => {
      state.orders = state.orders.map(order =>
        order.id === action.payload.orderId ? { ...order, status: action.payload.status } : order
      );
    },
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const index = state.favorites.indexOf(action.payload);
      if (index > -1) {
        state.favorites = state.favorites.filter(id => id !== action.payload);
      } else {
        state.favorites = [...state.favorites, action.payload];
      }
    },
    useCoupon: (state, action: PayloadAction<string>) => {
      state.coupons = state.coupons.map(coupon =>
        coupon.id === action.payload ? { ...coupon, used: true } : coupon
      );
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  login,
  logout,
  register,
  updateUser,
  addAddress,
  updateAddress,
  deleteAddress,
  addOrder,
  updateOrderStatus,
  toggleFavorite,
  useCoupon,
  setLoading,
} = userSlice.actions;

export default userSlice.reducer;
