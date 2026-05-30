import { useSelector, useDispatch } from 'react-redux';
import {
  addToCart,
  updateQuantity,
  removeFromCart,
  toggleCheck,
  toggleAllCheck,
  clearCart,
  clearCheckedItems,
  selectCartItems,
  selectCartCount,
  selectCheckedItems,
  selectTotalPrice,
  selectAllChecked,
  selectCheckedCount,
  selectOriginalTotalPrice,
  selectTotalDiscount,
  selectHasCheckedItems,
  selectCartItemCount,
} from '../store/cartSlice';

export const useCart = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const cartCount = useSelector(selectCartCount);
  const checkedItems = useSelector(selectCheckedItems);
  const totalPrice = useSelector(selectTotalPrice);
  const allChecked = useSelector(selectAllChecked);
  const checkedCount = useSelector(selectCheckedCount);
  const originalTotalPrice = useSelector(selectOriginalTotalPrice);
  const totalDiscount = useSelector(selectTotalDiscount);
  const hasCheckedItems = useSelector(selectHasCheckedItems);
  const cartItemCount = useSelector(selectCartItemCount);

  const handleAddToCart = (product, quantity = 1, specs = {}) => {
    dispatch(addToCart({ product, quantity, specs }));
  };

  const handleUpdateQuantity = (index, quantity) => {
    dispatch(updateQuantity({ index, quantity }));
  };

  const handleRemoveFromCart = (index) => {
    dispatch(removeFromCart(index));
  };

  const handleToggleCheck = (index) => {
    dispatch(toggleCheck(index));
  };

  const handleToggleAllCheck = (checked) => {
    dispatch(toggleAllCheck(checked));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const handleClearCheckedItems = () => {
    dispatch(clearCheckedItems());
  };

  return {
    cartItems,
    cartCount,
    cartItemCount,
    checkedItems,
    checkedCount,
    totalPrice,
    originalTotalPrice,
    totalDiscount,
    allChecked,
    hasCheckedItems,
    addToCart: handleAddToCart,
    updateQuantity: handleUpdateQuantity,
    removeFromCart: handleRemoveFromCart,
    toggleCheck: handleToggleCheck,
    toggleAllCheck: handleToggleAllCheck,
    clearCart: handleClearCart,
    clearCheckedItems: handleClearCheckedItems,
  };
};

export default useCart;
