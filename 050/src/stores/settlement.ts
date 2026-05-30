import { defineStore } from 'pinia'
import type { FeeSettlement, PageParams, PageResult } from '@/types'
import { ref } from 'vue'
import axios from 'axios'

export const useSettlementStore = defineStore('settlement', () => {
  const settlements = ref<FeeSettlement[]>([])
  const loading = ref(false)

  const fetchSettlements = async (params?: PageParams & Partial<FeeSettlement>): Promise<PageResult<FeeSettlement>> => {
    loading.value = true
    try {
      const res = await axios.get('/api/settlements', { params })
      const data = res.data.data as PageResult<FeeSettlement>
      settlements.value = data.list
      return data
    } finally {
      loading.value = false
    }
  }

  const addSettlement = async (settlement: Omit<FeeSettlement, 'id' | 'createTime'>) => {
    loading.value = true
    try {
      const res = await axios.post('/api/settlements', settlement)
      return res.data
    } finally {
      loading.value = false
    }
  }

  const updateSettlement = async (id: string, settlement: Partial<FeeSettlement>) => {
    loading.value = true
    try {
      const res = await axios.put(`/api/settlements/${id}`, settlement)
      return res.data
    } finally {
      loading.value = false
    }
  }

  const getStatistics = async () => {
    const res = await axios.get('/api/settlements/statistics')
    return res.data.data
  }

  return {
    settlements,
    loading,
    fetchSettlements,
    addSettlement,
    updateSettlement,
    getStatistics
  }
}, {
  persist: true
})
