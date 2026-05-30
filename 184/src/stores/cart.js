import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const cartItems = ref([])

  const cartCount = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const cartTotal = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  })

  function addToCart(product, spec, quantity = 1) {
    const existingItem = cartItems.value.find(
      item => item.productId === product.id && item.specId === spec.id
    )
    
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cartItems.value.push({
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        specId: spec.id,
        specName: spec.name,
        price: spec.price,
        quantity
      })
    }
  }

  function updateQuantity(productId, specId, quantity) {
    const item = cartItems.value.find(
      item => item.productId === productId && item.specId === specId
    )
    if (item) {
      if (quantity <= 0) {
        removeFromCart(productId, specId)
      } else {
        item.quantity = quantity
      }
    }
  }

  function removeFromCart(productId, specId) {
    const index = cartItems.value.findIndex(
      item => item.productId === productId && item.specId === specId
    )
    if (index > -1) {
      cartItems.value.splice(index, 1)
    }
  }

  function clearCart() {
    cartItems.value = []
  }

  function isInCart(productId, specId) {
    return cartItems.value.some(
      item => item.productId === productId && item.specId === specId
    )
  }

  return {
    cartItems,
    cartCount,
    cartTotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    isInCart
  }
})
