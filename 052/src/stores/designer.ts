import { defineStore } from 'pinia'
import type { Designer, DesignerStatus, DesignerStoreState } from '@/types'

export const useDesignerStore = defineStore('designer', {
  state: (): DesignerStoreState => ({
    designers: [],
    loading: false
  }),
  
  getters: {
    getDesignerById: (state) => (id: string) => {
      return state.designers.find(d => d.id === id)
    },
    
    getAvailableDesigners: (state) => {
      return state.designers.filter(d => d.status === 'on')
    }
  },
  
  actions: {
    setLoading(loading: boolean) {
      this.loading = loading
    },
    
    setDesigners(designers: Designer[]) {
      this.designers = designers
    },
    
    addDesigner(designer: Designer) {
      this.designers.unshift(designer)
    },
    
    updateDesigner(designer: Designer) {
      const index = this.designers.findIndex(d => d.id === designer.id)
      if (index !== -1) {
        this.designers[index] = designer
      }
    },
    
    deleteDesigner(id: string) {
      const index = this.designers.findIndex(d => d.id === id)
      if (index !== -1) {
        this.designers.splice(index, 1)
      }
    },
    
    updateDesignerStatus(id: string, status: DesignerStatus) {
      const designer = this.designers.find(d => d.id === id)
      if (designer) {
        designer.status = status
      }
    }
  },
  
  persist: true
})
