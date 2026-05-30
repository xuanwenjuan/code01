import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const cartList = ref(JSON.parse(localStorage.getItem('cartList') || '[]'))

  cartList.value = cartList.value.map(item => ({ ...item, checked: item.checked ?? true }))

  const totalCount = computed(() => cartList.value.reduce((sum, item) => sum + item.count, 0))

  const checkedItems = computed(() => cartList.value.filter(item => item.checked))

  const totalPrice = computed(() => {
    return checkedItems.value.reduce((sum, item) => sum + item.price * item.count, 0).toFixed(2)
  })

  const allChecked = computed(() => {
    return cartList.value.length > 0 && cartList.value.every(item => item.checked)
  })

  function saveToStorage() {
    localStorage.setItem('cartList', JSON.stringify(cartList.value))
  }

  function addToCart(product, version, count) {
    const existingItem = cartList.value.find(
      item => item.id === product.id && item.version === version
    )
    if (existingItem) {
      existingItem.count += count
    } else {
      cartList.value.push({
        ...product,
        version,
        count,
        checked: true
      })
    }
    saveToStorage()
  }

  function updateCount(id, version, count) {
    const item = cartList.value.find(item => item.id === id && item.version === version)
    if (item) {
      item.count = count
      saveToStorage()
    }
  }

  function removeItem(id, version) {
    const index = cartList.value.findIndex(item => item.id === id && item.version === version)
    if (index > -1) {
      cartList.value.splice(index, 1)
      saveToStorage()
    }
  }

  function toggleCheck(id, version) {
    const item = cartList.value.find(item => item.id === id && item.version === version)
    if (item) {
      item.checked = !item.checked
      saveToStorage()
    }
  }

  function toggleAllCheck(checked) {
    cartList.value.forEach(item => {
      item.checked = checked
    })
    saveToStorage()
  }

  function clearCart() {
    cartList.value = []
    saveToStorage()
  }

  return {
    cartList,
    totalCount,
    checkedItems,
    totalPrice,
    allChecked,
    addToCart,
    updateCount,
    removeItem,
    toggleCheck,
    toggleAllCheck,
    clearCart
  }
})
