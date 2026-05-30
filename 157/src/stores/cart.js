import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref(JSON.parse(localStorage.getItem('cartItems') || '[]'))
  
  const totalCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })
  
  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  })
  
  const selectedItems = computed(() => {
    return items.value.filter(item => item.selected)
  })
  
  const selectedCount = computed(() => {
    return selectedItems.value.reduce((sum, item) => sum + item.quantity, 0)
  })
  
  const selectedPrice = computed(() => {
    return selectedItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  })
  
  const allSelected = computed(() => {
    return items.value.length > 0 && items.value.every(item => item.selected)
  })
  
  const saveToStorage = () => {
    localStorage.setItem('cartItems', JSON.stringify(items.value))
  }
  
  const addToCart = (product, quantity = 1, spec = '') => {
    const existingIndex = items.value.findIndex(
      item => item.id === product.id && item.spec === spec
    )
    
    if (existingIndex > -1) {
      items.value[existingIndex].quantity += quantity
    } else {
      items.value.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || product.image,
        quantity,
        spec,
        selected: true,
        stock: product.stock || 999
      })
    }
    
    saveToStorage()
  }
  
  const updateQuantity = (id, spec, quantity) => {
    const item = items.value.find(item => item.id === id && item.spec === spec)
    if (item) {
      item.quantity = Math.max(1, Math.min(quantity, item.stock))
      saveToStorage()
    }
  }
  
  const toggleSelect = (id, spec) => {
    const item = items.value.find(item => item.id === id && item.spec === spec)
    if (item) {
      item.selected = !item.selected
      saveToStorage()
    }
  }
  
  const toggleAll = (selected) => {
    items.value.forEach(item => {
      item.selected = selected
    })
    saveToStorage()
  }
  
  const removeItem = (id, spec) => {
    const index = items.value.findIndex(item => item.id === id && item.spec === spec)
    if (index > -1) {
      items.value.splice(index, 1)
      saveToStorage()
    }
  }
  
  const removeSelected = () => {
    items.value = items.value.filter(item => !item.selected)
    saveToStorage()
  }
  
  const clearCart = () => {
    items.value = []
    saveToStorage()
  }
  
  return {
    items,
    totalCount,
    totalPrice,
    selectedItems,
    selectedCount,
    selectedPrice,
    allSelected,
    addToCart,
    updateQuantity,
    toggleSelect,
    toggleAll,
    removeItem,
    removeSelected,
    clearCart
  }
})
