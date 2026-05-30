import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: JSON.parse(localStorage.getItem('cartItems')) || [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity, specs } = action.payload;
      const existingIndex = state.items.findIndex(
        (item) => item.id === product.id && JSON.stringify(item.selectedSpecs) === JSON.stringify(specs)
      );
      if (existingIndex >= 0) {
        state.items[existingIndex].quantity += quantity;
      } else {
        state.items.push({
          ...product,
          quantity,
          selectedSpecs: specs,
          checked: true,
        });
      }
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    updateQuantity: (state, action) => {
      const { index, quantity } = action.payload;
      if (state.items[index]) {
        state.items[index].quantity = quantity;
        localStorage.setItem('cartItems', JSON.stringify(state.items));
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((_, index) => index !== action.payload);
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    toggleCheck: (state, action) => {
      const index = action.payload;
      if (state.items[index]) {
        state.items[index].checked = !state.items[index].checked;
        localStorage.setItem('cartItems', JSON.stringify(state.items));
      }
    },
    toggleAllCheck: (state, action) => {
      const checked = action.payload;
      state.items = state.items.map((item) => ({ ...item, checked }));
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('cartItems');
    },
    clearCheckedItems: (state) => {
      state.items = state.items.filter((item) => !item.checked);
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
  },
});

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  toggleCheck,
  toggleAllCheck,
  clearCart,
  clearCheckedItems,
} = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
export const selectCheckedItems = (state) => state.cart.items.filter((item) => item.checked);
export const selectCheckedCount = (state) =>
  state.cart.items.filter((item) => item.checked).reduce((sum, item) => sum + item.quantity, 0);
export const selectTotalPrice = (state) =>
  state.cart.items
    .filter((item) => item.checked)
    .reduce((sum, item) => sum + item.price * item.quantity, 0);
export const selectOriginalTotalPrice = (state) =>
  state.cart.items
    .filter((item) => item.checked)
    .reduce((sum, item) => sum + item.originalPrice * item.quantity, 0);
export const selectTotalDiscount = (state) =>
  state.cart.items
    .filter((item) => item.checked)
    .reduce((sum, item) => sum + (item.originalPrice - item.price) * item.quantity, 0);
export const selectAllChecked = (state) =>
  state.cart.items.length > 0 && state.cart.items.every((item) => item.checked);
export const selectHasCheckedItems = (state) => state.cart.items.some((item) => item.checked);
export const selectCartItemCount = (state) => state.cart.items.length;

export default cartSlice.reducer;
