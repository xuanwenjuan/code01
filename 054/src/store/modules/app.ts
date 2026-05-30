import { defineStore } from 'pinia'

interface AppState {
  sidebarWidth: number
  isCollapse: boolean
  currentRoute: string
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    sidebarWidth: 200,
    isCollapse: false,
    currentRoute: '/category'
  }),

  actions: {
    toggleSidebar() {
      this.isCollapse = !this.isCollapse
      this.sidebarWidth = this.isCollapse ? 64 : 200
    },
    setCurrentRoute(route: string) {
      this.currentRoute = route
    }
  },

  persist: true
})
