import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const cartItems = ref(JSON.parse(localStorage.getItem('cartItems') || '[]'))

  const cartCount = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const cartTotal = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  })

  const addToCart = (product, quantity = 1, spec = '', customPrice = null) => {
    const existingItem = cartItems.value.find(
      item => item.id === product.id && item.spec === spec
    )
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cartItems.value.push({
        ...product,
        price: customPrice || product.price,
        quantity,
        spec,
        selected: true
      })
    }
    saveToStorage()
  }

  const updateQuantity = (id, spec, quantity) => {
    const item = cartItems.value.find(item => item.id === id && item.spec === spec)
    if (item) {
      item.quantity = quantity
      saveToStorage()
    }
  }

  const removeFromCart = (id, spec) => {
    const index = cartItems.value.findIndex(item => item.id === id && item.spec === spec)
    if (index > -1) {
      cartItems.value.splice(index, 1)
      saveToStorage()
    }
  }

  const toggleSelect = (id, spec) => {
    const item = cartItems.value.find(item => item.id === id && item.spec === spec)
    if (item) {
      item.selected = !item.selected
      saveToStorage()
    }
  }

  const toggleSelectAll = (selected) => {
    cartItems.value.forEach(item => {
      item.selected = selected
    })
    saveToStorage()
  }

  const clearCart = () => {
    cartItems.value = []
    saveToStorage()
  }

  const saveToStorage = () => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems.value))
  }

  return {
    cartItems,
    cartCount,
    cartTotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    toggleSelect,
    toggleSelectAll,
    clearCart
  }
})
