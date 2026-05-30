import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { products } from '@/mock/products'

export const useCartStore = defineStore('cart', () => {
  const cartItems = ref([])
  const loading = ref(false)

  const loadCart = () => {
    const saved = localStorage.getItem('cart')
    if (saved) {
      cartItems.value = JSON.parse(saved)
    }
  }

  const saveCart = () => {
    localStorage.setItem('cart', JSON.stringify(cartItems.value))
  }

  const totalCount = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const selectedItems = computed(() => {
    return cartItems.value.filter(item => item.selected)
  })

  const selectedCount = computed(() => {
    return selectedItems.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const totalPrice = computed(() => {
    return selectedItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  })

  const isAllSelected = computed(() => {
    return cartItems.value.length > 0 && cartItems.value.every(item => item.selected)
  })

  const initCart = () => {
    loadCart()
  }

  initCart()

  const addToCart = async (productId, quantity = 1, specs = {}) => {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const product = products.find(p => p.id === productId)
    if (!product) {
      loading.value = false
      return { success: false, message: '商品不存在' }
    }

    const specKey = JSON.stringify(specs)
    const existingItem = cartItems.value.find(
      item => item.productId === productId && item.specKey === specKey
    )

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cartItems.value.push({
        id: Date.now(),
        productId,
        name: product.name,
        image: product.images[0],
        price: product.price,
        originalPrice: product.originalPrice,
        quantity,
        specs,
        specKey,
        selected: true,
        stock: product.stock
      })
    }

    saveCart()
    loading.value = false
    return { success: true }
  }

  const updateQuantity = (itemId, quantity) => {
    const item = cartItems.value.find(i => i.id === itemId)
    if (item) {
      item.quantity = Math.max(1, Math.min(quantity, item.stock))
      saveCart()
    }
  }

  const toggleSelect = (itemId) => {
    const item = cartItems.value.find(i => i.id === itemId)
    if (item) {
      item.selected = !item.selected
      saveCart()
    }
  }

  const toggleSelectAll = (selected) => {
    cartItems.value.forEach(item => {
      item.selected = selected
    })
    saveCart()
  }

  const removeItem = (itemId) => {
    cartItems.value = cartItems.value.filter(i => i.id !== itemId)
    saveCart()
  }

  const removeSelected = () => {
    cartItems.value = cartItems.value.filter(i => !i.selected)
    saveCart()
  }

  const clearCart = () => {
    cartItems.value = []
    saveCart()
  }

  const getCartItems = () => {
    return [...cartItems.value]
  }

  return {
    cartItems,
    loading,
    totalCount,
    selectedItems,
    selectedCount,
    totalPrice,
    isAllSelected,
    initCart,
    loadCart,
    addToCart,
    updateQuantity,
    toggleSelect,
    toggleSelectAll,
    removeItem,
    removeSelected,
    clearCart,
    getCartItems
  }
})
