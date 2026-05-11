<template>
  <el-tag :type="tagType" :class="['status-tag', status]">
    {{ displayText }}
  </el-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TripStatus, CheckInStatus } from '@/types'
import { TripStatusLabels, CheckInStatusLabels } from '@/types'

const props = defineProps<{
  status: TripStatus | CheckInStatus
  type?: 'trip' | 'checkin'
}>()

const tagType = computed(() => {
  switch (props.status) {
    case 'preparing':
    case 'pending':
      return 'warning'
    case 'ongoing':
    case 'checked':
      return 'success'
    case 'completed':
      return 'info'
    case 'missed':
      return 'danger'
    default:
      return 'info'
  }
})

const displayText = computed(() => {
  if (props.type === 'trip') {
    return TripStatusLabels[props.status as TripStatus]
  }
  return CheckInStatusLabels[props.status as CheckInStatus]
})
</script>

<style scoped>
.status-tag {
  font-weight: 500;
}
</style>
