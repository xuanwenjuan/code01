import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getLocalStorage, setLocalStorage } from '@/utils'

export const useCartStore = defineStore('cart', () => {
  const cartItems = ref(getLocalStorage('cart', []))

  const saveCart = () => {
    setLocalStorage('cart', cartItems.value)
  }

  const addToCart = (flower, spec, quantity = 1) => {
    const existingIndex = cartItems.value.findIndex(
      item => item.flowerId === flower.id && item.specId === spec.id
    )
    
    if (existingIndex > -1) {
      cartItems.value[existingIndex].quantity += quantity
    } else {
      cartItems.value.push({
        flowerId: flower.id,
        name: flower.name,
        image: flower.image,
        specId: spec.id,
        specName: spec.name,
        price: spec.price,
        quantity: quantity,
        checked: true
      })
    }
    saveCart()
  }

  const removeFromCart = (flowerId, specId) => {
    const index = cartItems.value.findIndex(
      item => item.flowerId === flowerId && item.specId === specId
    )
    if (index > -1) {
      cartItems.value.splice(index, 1)
      saveCart()
    }
  }

  const updateQuantity = (flowerId, specId, quantity) => {
    const item = cartItems.value.find(
      item => item.flowerId === flowerId && item.specId === specId
    )
    if (item) {
      item.quantity = Math.max(1, quantity)
      saveCart()
    }
  }

  const toggleChecked = (flowerId, specId) => {
    const item = cartItems.value.find(
      item => item.flowerId === flowerId && item.specId === specId
    )
    if (item) {
      item.checked = !item.checked
      saveCart()
    }
  }

  const toggleAllChecked = (checked) => {
    cartItems.value.forEach(item => {
      item.checked = checked
    })
    saveCart()
  }

  const removeCheckedItems = () => {
    cartItems.value = cartItems.value.filter(item => !item.checked)
    saveCart()
  }

  const clearCart = () => {
    cartItems.value = []
    saveCart()
  }

  const totalCount = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const checkedItems = computed(() => {
    return cartItems.value.filter(item => item.checked)
  })

  const checkedCount = computed(() => {
    return checkedItems.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const totalPrice = computed(() => {
    return checkedItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  })

  const isAllChecked = computed(() => {
    return cartItems.value.length > 0 && cartItems.value.every(item => item.checked)
  })

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    toggleChecked,
    toggleAllChecked,
    removeCheckedItems,
    clearCart,
    totalCount,
    checkedItems,
    checkedCount,
    totalPrice,
    isAllChecked
  }
})
