import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref(JSON.parse(localStorage.getItem('cart') || '[]'))

  const cartItems = computed(() => items.value)
  
  const cartCount = computed(() => 
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )
  
  const cartTotal = computed(() => 
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )

  const saveToStorage = () => {
    localStorage.setItem('cart', JSON.stringify(items.value))
  }

  const addToCart = (product) => {
    const existingItem = items.value.find(
      item => item.productId === product.productId && item.spec === product.spec
    )
    
    if (existingItem) {
      existingItem.quantity += product.quantity || 1
    } else {
      items.value.push({
        ...product,
        id: Date.now(),
        quantity: product.quantity || 1,
        addedAt: new Date().toISOString()
      })
    }
    saveToStorage()
  }

  const removeFromCart = (itemId) => {
    const index = items.value.findIndex(item => item.id === itemId)
    if (index > -1) {
      items.value.splice(index, 1)
      saveToStorage()
    }
  }

  const updateQuantity = (itemId, quantity) => {
    const item = items.value.find(item => item.id === itemId)
    if (item) {
      item.quantity = quantity
      saveToStorage()
    }
  }

  const clearCart = () => {
    items.value = []
    saveToStorage()
  }

  return {
    items,
    cartItems,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  }
})
