<template>
  <div class="ring-progress">
    <svg :width="size" :height="size" viewBox="0 0 120 120" :style="{ transform: `rotate(${rotation}deg)` }">
      <circle
        cx="60"
        cy="60"
        :r="radius"
        fill="none"
        :stroke="trackColor"
        :stroke-width="strokeWidth"
      />
      <circle
        cx="60"
        cy="60"
        :r="radius"
        fill="none"
        :stroke="statusColor"
        :stroke-width="strokeWidth"
        :stroke-linecap="strokeLinecap"
        :stroke-dasharray="strokeDasharray"
      />
    </svg>
    <div class="ring-content">
      <div class="ring-percentage" :style="{ color: statusColor }">
        {{ displayPercentage }}
      </div>
      <div v-if="innerText" class="ring-label">
        {{ BUDGET_STATUS_LABELS[innerText] || innerText }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BUDGET_STATUS_LABELS } from '@/constants'

interface Props {
  percentage: number
  statusColor?: string
  innerText?: string
  size?: number
  strokeWidth?: number
  trackColor?: string
  rotation?: number
}

const props = withDefaults(defineProps<Props>(), {
  percentage: 0,
  statusColor: '#67c23a',
  innerText: '',
  size: 120,
  strokeWidth: 8,
  trackColor: '#ebeef5',
  rotation: -90,
})

const radius = computed(() => 60 - props.strokeWidth / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const safePercentage = computed(() => Math.min(100, Math.max(0, props.percentage)))
const strokeDasharray = computed(() => {
  const progress = (safePercentage.value / 100) * circumference.value
  return `${progress} ${circumference.value}`
})
const strokeLinecap = computed(() => (safePercentage.value > 0 && safePercentage.value < 100 ? 'round' : 'butt'))
const displayPercentage = computed(() => `${safePercentage.value.toFixed(0)}%`)
</script>

<style scoped lang="scss">
.ring-progress {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .ring-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    
    .ring-percentage {
      font-size: 24px;
      font-weight: bold;
      line-height: 1.2;
    }
    
    .ring-label {
      font-size: 12px;
      color: #909399;
      margin-top: 4px;
    }
  }
}
</style>
