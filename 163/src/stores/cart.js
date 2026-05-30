import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])

  const cartItems = computed(() => items.value)

  const totalCount = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))

  const selectedItems = computed(() => items.value.filter(item => item.selected))

  const selectedCount = computed(() => selectedItems.value.reduce((sum, item) => sum + item.quantity, 0))

  const totalPrice = computed(() => 
    selectedItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )

  const isAllSelected = computed(() => 
    items.value.length > 0 && items.value.every(item => item.selected)
  )

  const addToCart = (product, quantity = 1, specs = {}) => {
    const existing = items.value.find(item => 
      item.id === product.id && JSON.stringify(item.specs) === JSON.stringify(specs)
    )
    if (existing) {
      existing.quantity += quantity
    } else {
      items.value.push({
        ...product,
        quantity,
        specs,
        selected: true,
        addTime: Date.now()
      })
    }
    saveToStorage()
  }

  const updateQuantity = (id, specs, quantity) => {
    const item = items.value.find(item => 
      item.id === id && JSON.stringify(item.specs) === JSON.stringify(specs)
    )
    if (item) {
      item.quantity = Math.max(1, quantity)
      saveToStorage()
    }
  }

  const toggleSelect = (id, specs) => {
    const item = items.value.find(item => 
      item.id === id && JSON.stringify(item.specs) === JSON.stringify(specs)
    )
    if (item) {
      item.selected = !item.selected
      saveToStorage()
    }
  }

  const toggleSelectAll = (selected) => {
    items.value.forEach(item => item.selected = selected)
    saveToStorage()
  }

  const removeItem = (id, specs) => {
    const index = items.value.findIndex(item => 
      item.id === id && JSON.stringify(item.specs) === JSON.stringify(specs)
    )
    if (index !== -1) {
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

  const saveToStorage = () => {
    localStorage.setItem('auto_parts_cart', JSON.stringify(items.value))
  }

  const loadFromStorage = () => {
    const saved = localStorage.getItem('auto_parts_cart')
    if (saved) {
      items.value = JSON.parse(saved)
    }
  }

  return {
    items,
    cartItems,
    totalCount,
    selectedItems,
    selectedCount,
    totalPrice,
    isAllSelected,
    addToCart,
    updateQuantity,
    toggleSelect,
    toggleSelectAll,
    removeItem,
    removeSelected,
    clearCart,
    loadFromStorage
  }
})
