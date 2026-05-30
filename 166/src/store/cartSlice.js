import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
  selectedIds: []
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { productId, product, quantity = 1, spec } = action.payload
      const existingItem = state.items.find(
        item => item.productId === productId && item.spec === spec
      )
      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        state.items.push({
          productId,
          name: product.name,
          image: product.image,
          price: product.price,
          originalPrice: product.originalPrice,
          quantity,
          spec,
          stock: product.stock
        })
      }
      state.selectedIds.push(`${productId}-${spec}`)
    },
    updateQuantity: (state, action) => {
      const { productId, spec, quantity } = action.payload
      const item = state.items.find(
        item => item.productId === productId && item.spec === spec
      )
      if (item) {
        item.quantity = Math.max(1, Math.min(quantity, item.stock))
      }
    },
    removeFromCart: (state, action) => {
      const { productId, spec } = action.payload
      const key = `${productId}-${spec}`
      state.items = state.items.filter(
        item => !(item.productId === productId && item.spec === spec)
      )
      state.selectedIds = state.selectedIds.filter(id => id !== key)
    },
    toggleSelect: (state, action) => {
      const { productId, spec } = action.payload
      const key = `${productId}-${spec}`
      const index = state.selectedIds.indexOf(key)
      if (index > -1) {
        state.selectedIds.splice(index, 1)
      } else {
        state.selectedIds.push(key)
      }
    },
    selectAll: (state) => {
      state.selectedIds = state.items.map(item => `${item.productId}-${item.spec}`)
    },
    unselectAll: (state) => {
      state.selectedIds = []
    },
    clearCart: (state) => {
      state.items = []
      state.selectedIds = []
    },
    clearSelected: (state) => {
      state.items = state.items.filter(
        item => !state.selectedIds.includes(`${item.productId}-${item.spec}`)
      )
      state.selectedIds = []
    }
  }
})

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  toggleSelect,
  selectAll,
  unselectAll,
  clearCart,
  clearSelected
} = cartSlice.actions

export const selectCartTotal = (state) => {
  return state.cart.items.reduce((total, item) => {
    const key = `${item.productId}-${item.spec}`
    if (state.cart.selectedIds.includes(key)) {
      return total + item.price * item.quantity
    }
    return total
  }, 0)
}

export const selectCartCount = (state) => {
  return state.cart.items.reduce((count, item) => count + item.quantity, 0)
}

export const selectSelectedCount = (state) => {
  return state.cart.items.reduce((count, item) => {
    const key = `${item.productId}-${item.spec}`
    if (state.cart.selectedIds.includes(key)) {
      return count + item.quantity
    }
    return count
  }, 0)
}

export default cartSlice.reducer
