import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { openDB, getAllItems, addItem, updateItem, deleteItem, getItem, STORE_NAMES } from '../utils/indexedDB'

export const useBorrowStore = defineStore('borrow', () => {
  const borrowRecords = ref([])
  const loading = ref(false)

  const activeBorrows = computed(() => {
    return borrowRecords.value.filter(r => r.status === 'borrowing')
  })

  const overdueBorrows = computed(() => {
    const today = new Date()
    return activeBorrows.value.filter(r => {
      if (!r.expectedReturnDate) return false
      const expected = new Date(r.expectedReturnDate)
      return expected < today
    })
  })

  const loadBorrowRecords = async () => {
    loading.value = true
    try {
      await openDB()
      const items = await getAllItems(STORE_NAMES.borrowRecords)
      borrowRecords.value = items.sort((a, b) => b.id - a.id)
    } catch (error) {
      console.error('加载借阅记录失败:', error)
    } finally {
      loading.value = false
    }
  }

  const addBorrowRecord = async (record) => {
    const newRecord = {
      ...record,
      status: 'borrowing',
      createdAt: new Date().toISOString()
    }
    const id = await addItem(STORE_NAMES.borrowRecords, newRecord)
    await loadBorrowRecords()
    return id
  }

  const returnBorrow = async (borrowId, returnQuantity, notes) => {
    const record = await getItem(STORE_NAMES.borrowRecords, borrowId)
    if (record) {
      record.returnDate = new Date().toISOString()
      record.returnQuantity = returnQuantity
      record.notes = notes
      record.status = 'returned'
      record.updatedAt = new Date().toISOString()
      await updateItem(STORE_NAMES.borrowRecords, record)
      await loadBorrowRecords()
    }
  }

  const getBorrowRecordsBySpecimen = (specimenId) => {
    return borrowRecords.value.filter(r => r.specimenId === specimenId)
  }

  const getActiveBorrowsBySpecimen = (specimenId) => {
    return borrowRecords.value.filter(r => r.specimenId === specimenId && r.status === 'borrowing')
  }

  const getBorrowedQuantity = (specimenId) => {
    return getActiveBorrowsBySpecimen(specimenId).reduce((sum, r) => sum + r.quantity, 0)
  }

  return {
    borrowRecords,
    loading,
    activeBorrows,
    overdueBorrows,
    loadBorrowRecords,
    addBorrowRecord,
    returnBorrow,
    getBorrowRecordsBySpecimen,
    getActiveBorrowsBySpecimen,
    getBorrowedQuantity
  }
})