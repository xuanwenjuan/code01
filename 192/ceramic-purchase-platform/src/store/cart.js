import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref(JSON.parse(localStorage.getItem('cartItems') || '[]'))

  const totalCount = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))
  const totalPrice = computed(() => items.value.reduce((sum, item) => sum + item.price * item.quantity, 0))

  const addToCart = (material, quantity = 1) => {
    const existing = items.value.find(item => item.id === material.id)
    if (existing) {
      existing.quantity += quantity
    } else {
      items.value.push({ ...material, quantity })
    }
    saveToLocalStorage()
  }

  const removeFromCart = (id) => {
    const index = items.value.findIndex(item => item.id === id)
    if (index > -1) {
      items.value.splice(index, 1)
      saveToLocalStorage()
    }
  }

  const updateQuantity = (id, quantity) => {
    const item = items.value.find(item => item.id === id)
    if (item) {
      item.quantity = quantity
      saveToLocalStorage()
    }
  }

  const clearCart = () => {
    items.value = []
    saveToLocalStorage()
  }

  const saveToLocalStorage = () => {
    localStorage.setItem('cartItems', JSON.stringify(items.value))
  }

  return {
    items,
    totalCount,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  }
})
