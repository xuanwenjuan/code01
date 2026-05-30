import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useHistoryStore = defineStore('history', () => {
  const history = ref(JSON.parse(localStorage.getItem('browseHistory') || '[]'))

  const totalCount = computed(() => history.value.length)

  function saveToStorage() {
    localStorage.setItem('browseHistory', JSON.stringify(history.value))
  }

  function addHistory(product) {
    history.value = history.value.filter(item => item.id !== product.id)
    history.value.unshift({
      id: product.id,
      name: product.name,
      image: product.images ? product.images[0] : product.image,
      price: product.price,
      browseTime: new Date()
    })
    if (history.value.length > 20) {
      history.value = history.value.slice(0, 20)
    }
    saveToStorage()
  }

  function removeHistory(productId) {
    const index = history.value.findIndex(item => item.id === Number(productId))
    if (index > -1) {
      history.value.splice(index, 1)
      saveToStorage()
      return true
    }
    return false
  }

  function clearHistory() {
    history.value = []
    saveToStorage()
  }

  return {
    history,
    totalCount,
    addHistory,
    removeHistory,
    clearHistory
  }
})
