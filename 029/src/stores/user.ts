import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'

export const useUserStore = defineStore(
  'user',
  () => {
    const user = ref<User | null>(null)
    const token = ref<string>('')

    const setUser = (userData: User, tokenData: string) => {
      user.value = userData
      token.value = tokenData
    }

    const clearUser = () => {
      user.value = null
      token.value = ''
    }

    const isAdmin = computed(() => user.value?.role === 'admin')

    return {
      user,
      token,
      setUser,
      clearUser,
      isAdmin
    }
  },
  {
    persist: {
      key: 'hotel-user',
      paths: ['user', 'token']
    }
  }
)
