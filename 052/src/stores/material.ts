import { defineStore } from 'pinia'
import type { Material, MaterialCategory, MaterialStoreState } from '@/types'

export const useMaterialStore = defineStore('material', {
  state: (): MaterialStoreState => ({
    materials: [],
    loading: false
  }),
  
  getters: {
    getMaterialById: (state) => (id: string) => {
      return state.materials.find(m => m.id === id)
    },
    
    getMaterialsByCategory: (state) => (category: MaterialCategory) => {
      return state.materials.filter(m => m.category === category)
    },
    
    getActiveMaterials: (state) => {
      return state.materials.filter(m => m.status === 'on')
    }
  },
  
  actions: {
    setLoading(loading: boolean) {
      this.loading = loading
    },
    
    setMaterials(materials: Material[]) {
      this.materials = materials
    },
    
    addMaterial(material: Material) {
      this.materials.unshift(material)
    },
    
    updateMaterial(material: Material) {
      const index = this.materials.findIndex(m => m.id === material.id)
      if (index !== -1) {
        this.materials[index] = material
      }
    },
    
    deleteMaterial(id: string) {
      const index = this.materials.findIndex(m => m.id === id)
      if (index !== -1) {
        this.materials.splice(index, 1)
      }
    },
    
    updateMaterialStatus(id: string, status: 'on' | 'off') {
      const material = this.materials.find(m => m.id === id)
      if (material) {
        material.status = status
      }
    }
  },
  
  persist: true
})
