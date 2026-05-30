import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockBooks, mockCategories, mockPackages } from '@/mock/data'

export const useBookStore = defineStore('book', () => {
  const books = ref([])
  const categories = ref([])
  const packages = ref([])
  const loading = ref(false)
  const currentBook = ref(null)
  const selectedCategory = ref('')
  const searchKeyword = ref('')

  const fetchBooks = async () => {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 500))
    books.value = mockBooks
    categories.value = mockCategories
    packages.value = mockPackages
    loading.value = false
  }

  const filteredBooks = computed(() => {
    let result = books.value
    if (selectedCategory.value) {
      result = result.filter(function(b) { return b.category === selectedCategory.value })
    }
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      result = result.filter(function(b) {
        return b.name.toLowerCase().includes(keyword) || b.author.toLowerCase().includes(keyword)
      })
    }
    return result
  })

  const newBooks = computed(() => books.value.filter(function(b) { return b.isNew }))

  const classicBooks = computed(() => books.value.filter(function(b) { return b.isClassic }))

  const getBookById = function(id) {
    return books.value.find(function(b) { return b.id === Number(id) })
  }

  return {
    books,
    categories,
    packages,
    loading,
    currentBook,
    selectedCategory,
    searchKeyword,
    filteredBooks,
    newBooks,
    classicBooks,
    fetchBooks,
    getBookById
  }
})
