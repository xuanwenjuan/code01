import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Activity, ActivityFilter, ActivityStatus } from '@/types'
import { mockActivities } from '@/mock'
import dayjs from 'dayjs'

export const useActivityStore = defineStore(
  'activity',
  () => {
    const activities = ref<Activity[]>([...mockActivities])

    const activityList = computed(() => activities.value)

    function getActivityById(id: string): Activity | undefined {
      return activities.value.find((activity) => activity.id === id)
    }

    function getActivitiesByClub(clubId: string): Activity[] {
      return activities.value.filter((activity) => activity.clubId === clubId)
    }

    function getActivitiesByStatus(status: ActivityStatus): Activity[] {
      return activities.value.filter((activity) => activity.status === status)
    }

    function filterActivities(filter: ActivityFilter): Activity[] {
      return activities.value.filter((activity) => {
        if (filter.clubId && activity.clubId !== filter.clubId) {
          return false
        }
        if (filter.status && activity.status !== filter.status) {
          return false
        }
        if (filter.keyword) {
          const keyword = filter.keyword.toLowerCase()
          const title = activity.title.toLowerCase()
          const description = activity.description.toLowerCase()
          const location = activity.location.toLowerCase()
          if (!title.includes(keyword) && !description.includes(keyword) && !location.includes(keyword)) {
            return false
          }
        }
        if (filter.startDate && dayjs(activity.startTime).isBefore(dayjs(filter.startDate))) {
          return false
        }
        if (filter.endDate && dayjs(activity.startTime).isAfter(dayjs(filter.endDate))) {
          return false
        }
        if (filter.hasRegistration !== undefined) {
          const hasParticipants = activity.currentParticipants > 0
          if (filter.hasRegistration && !hasParticipants) {
            return false
          }
          if (!filter.hasRegistration && hasParticipants) {
            return false
          }
        }
        return true
      })
    }

    function addActivity(activity: Activity): void {
      activities.value.push(activity)
    }

    function updateActivity(id: string, updates: Partial<Activity>): void {
      const index = activities.value.findIndex((activity) => activity.id === id)
      if (index !== -1) {
        activities.value[index] = { ...activities.value[index], ...updates }
      }
    }

    function deleteActivity(id: string): void {
      const index = activities.value.findIndex((activity) => activity.id === id)
      if (index !== -1) {
        activities.value.splice(index, 1)
      }
    }

    function incrementParticipants(activityId: string): void {
      const activity = getActivityById(activityId)
      if (activity && activity.currentParticipants < activity.maxParticipants) {
        updateActivity(activityId, {
          currentParticipants: activity.currentParticipants + 1
        })
      }
    }

    function decrementParticipants(activityId: string): void {
      const activity = getActivityById(activityId)
      if (activity && activity.currentParticipants > 0) {
        updateActivity(activityId, {
          currentParticipants: activity.currentParticipants - 1
        })
      }
    }

    return {
      activities,
      activityList,
      getActivityById,
      getActivitiesByClub,
      getActivitiesByStatus,
      filterActivities,
      addActivity,
      updateActivity,
      deleteActivity,
      incrementParticipants,
      decrementParticipants
    }
  },
  {
    persist: true
  }
)
