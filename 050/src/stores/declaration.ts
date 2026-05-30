import { defineStore } from 'pinia'
import type { CustomsDeclaration, PageParams, PageResult } from '@/types'
import { ref } from 'vue'
import axios from 'axios'

export const useDeclarationStore = defineStore('declaration', () => {
  const declarations = ref<CustomsDeclaration[]>([])
  const loading = ref(false)

  const fetchDeclarations = async (params?: PageParams & Partial<CustomsDeclaration>): Promise<PageResult<CustomsDeclaration>> => {
    loading.value = true
    try {
      const res = await axios.get('/api/declarations', { params })
      const data = res.data.data as PageResult<CustomsDeclaration>
      declarations.value = data.list
      return data
    } finally {
      loading.value = false
    }
  }

  const addDeclaration = async (declaration: Omit<CustomsDeclaration, 'id' | 'createTime'>) => {
    loading.value = true
    try {
      const res = await axios.post('/api/declarations', declaration)
      return res.data
    } finally {
      loading.value = false
    }
  }

  const updateDeclaration = async (id: string, declaration: Partial<CustomsDeclaration>) => {
    loading.value = true
    try {
      const res = await axios.put(`/api/declarations/${id}`, declaration)
      return res.data
    } finally {
      loading.value = false
    }
  }

  const getDeclarationById = async (id: string): Promise<CustomsDeclaration> => {
    const res = await axios.get(`/api/declarations/${id}`)
    return res.data.data
  }

  const getStatistics = async () => {
    const res = await axios.get('/api/declarations/statistics')
    return res.data.data
  }

  return {
    declarations,
    loading,
    fetchDeclarations,
    addDeclaration,
    updateDeclaration,
    getDeclarationById,
    getStatistics
  }
})
