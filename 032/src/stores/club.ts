import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Club } from '@/types'
import { mockClubs } from '@/mock'

export const useClubStore = defineStore(
  'club',
  () => {
    const clubs = ref<Club[]>([...mockClubs])

    const clubList = computed(() => clubs.value)

    const clubOptions = computed(() =>
      clubs.value.map((club) => ({
        label: club.name,
        value: club.id
      }))
    )

    function getClubById(id: string): Club | undefined {
      return clubs.value.find((club) => club.id === id)
    }

    function addClub(club: Club): void {
      clubs.value.push(club)
    }

    function updateClub(id: string, updates: Partial<Club>): void {
      const index = clubs.value.findIndex((club) => club.id === id)
      if (index !== -1) {
        clubs.value[index] = { ...clubs.value[index], ...updates }
      }
    }

    function deleteClub(id: string): void {
      const index = clubs.value.findIndex((club) => club.id === id)
      if (index !== -1) {
        clubs.value.splice(index, 1)
      }
    }

    return {
      clubs,
      clubList,
      clubOptions,
      getClubById,
      addClub,
      updateClub,
      deleteClub
    }
  },
  {
    persist: true
  }
)
