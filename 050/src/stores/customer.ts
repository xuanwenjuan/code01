import { defineStore } from 'pinia'
import type { Customer, PageParams, PageResult } from '@/types'
import { ref } from 'vue'
import axios from 'axios'

export const useCustomerStore = defineStore('customer', () => {
  const customers = ref<Customer[]>([])
  const loading = ref(false)

  const fetchCustomers = async (params?: PageParams & Partial<Customer>): Promise<PageResult<Customer>> => {
    loading.value = true
    try {
      const res = await axios.get('/api/customers', { params })
      const data = res.data.data as PageResult<Customer>
      customers.value = data.list
      return data
    } finally {
      loading.value = false
    }
  }

  const addCustomer = async (customer: Omit<Customer, 'id' | 'createTime'>) => {
    loading.value = true
    try {
      const res = await axios.post('/api/customers', customer)
      return res.data
    } finally {
      loading.value = false
    }
  }

  const updateCustomer = async (id: string, customer: Partial<Customer>) => {
    loading.value = true
    try {
      const res = await axios.put(`/api/customers/${id}`, customer)
      return res.data
    } finally {
      loading.value = false
    }
  }

  const deleteCustomer = async (id: string) => {
    loading.value = true
    try {
      const res = await axios.delete(`/api/customers/${id}`)
      return res.data
    } finally {
      loading.value = false
    }
  }

  const getExpiringCustomers = async (): Promise<Customer[]> => {
    const res = await axios.get('/api/customers/expiring')
    return res.data.data
  }

  return {
    customers,
    loading,
    fetchCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getExpiringCustomers
  }
})
