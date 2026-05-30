import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])

  const cartCount = computed(() => 
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  const cartTotal = computed(() => 
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )

  const addToCart = (product, quantity = 1, size = null) => {
    const existingItem = items.value.find(
      item => item.id === product.id && item.size === size
    )
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      items.value.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity,
        size,
        stock: product.stock
      })
    }
    saveCart()
  }

  const updateQuantity = (index, quantity) => {
    if (quantity <= 0) {
      removeItem(index)
    } else {
      items.value[index].quantity = quantity
      saveCart()
    }
  }

  const removeItem = (index) => {
    items.value.splice(index, 1)
    saveCart()
  }

  const clearCart = () => {
    items.value = []
    saveCart()
  }

  const saveCart = () => {
    localStorage.setItem('cart', JSON.stringify(items.value))
  }

  const loadCart = () => {
    const saved = localStorage.getItem('cart')
    if (saved) {
      items.value = JSON.parse(saved)
    }
  }

  return {
    items,
    cartCount,
    cartTotal,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    loadCart
  }
})
