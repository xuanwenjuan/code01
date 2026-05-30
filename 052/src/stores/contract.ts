import { defineStore } from 'pinia'
import type { Contract, ContractStatus, ContractStoreState } from '@/types'

export const useContractStore = defineStore('contract', {
  state: (): ContractStoreState => ({
    contracts: [],
    loading: false
  }),
  
  getters: {
    getContractById: (state) => (id: string) => {
      return state.contracts.find(c => c.id === id)
    },
    
    getContractsByStatus: (state) => (status: ContractStatus) => {
      return state.contracts.filter(c => c.status === status)
    },
    
    getContractsByDesignerId: (state) => (designerId: string) => {
      return state.contracts.filter(c => c.designerId === designerId)
    }
  },
  
  actions: {
    setLoading(loading: boolean) {
      this.loading = loading
    },
    
    setContracts(contracts: Contract[]) {
      this.contracts = contracts
    },
    
    addContract(contract: Contract) {
      this.contracts.unshift(contract)
    },
    
    updateContract(contract: Contract) {
      const index = this.contracts.findIndex(c => c.id === contract.id)
      if (index !== -1) {
        this.contracts[index] = contract
      }
    },
    
    deleteContract(id: string) {
      const index = this.contracts.findIndex(c => c.id === id)
      if (index !== -1) {
        this.contracts.splice(index, 1)
      }
    },
    
    updateContractStatus(id: string, status: ContractStatus) {
      const contract = this.contracts.find(c => c.id === id)
      if (contract) {
        contract.status = status
      }
    }
  },
  
  persist: true
})
