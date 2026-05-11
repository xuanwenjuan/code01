<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { calculateCountdown, formatCountdown } from '@/utils/countdown'
import type { CountdownInfo } from '@/types'

const props = defineProps<{
  targetTime: string
  prefix?: string
  showSeconds?: boolean
  size?: 'small' | 'medium' | 'large'
  mode?: 'start' | 'end'
  expiredText?: string
}>()

const emit = defineEmits<{
  (e: 'expired'): void
  (e: 'tick', countdown: CountdownInfo): void
}>()

const countdown = ref<CountdownInfo | null>(null)
let timer: ReturnType<typeof setInterval> | null = null

const displayText = computed(() => {
  if (!countdown.value) return '计算中...'
  return formatCountdown(countdown.value, props.prefix)
})

const sizeClass = computed(() => {
  const sizeMap = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-xl'
  }
  return sizeMap[props.size || 'medium']
})

const isUrgent = computed(() => {
  if (!countdown.value || countdown.value.isExpired) return false
  return countdown.value.days === 0 && countdown.value.hours < 24
})

const defaultExpiredText = computed(() => {
  if (props.expiredText) return props.expiredText
  return props.mode === 'end' ? '活动已结束' : '活动已开始'
})

function updateCountdown(): void {
  countdown.value = calculateCountdown(props.targetTime)
  emit('tick', countdown.value)
  
  if (countdown.value.isExpired) {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    emit('expired')
  }
}

function startTimer(): void {
  updateCountdown()
  timer = setInterval(() => {
    updateCountdown()
  }, 1000)
}

function stopTimer(): void {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

watch(
  () => props.targetTime,
  () => {
    stopTimer()
    startTimer()
  }
)

onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  stopTimer()
})
</script>

<template>
  <div
    class="countdown-timer"
    :class="[
      sizeClass,
      {
        'is-expired': countdown?.isExpired,
        'is-urgent': isUrgent,
        'is-end-mode': mode === 'end'
      }
    ]"
  >
    <template v-if="countdown && !countdown.isExpired">
      <el-icon v-if="isUrgent" class="warning-icon">
        <WarningFilled />
      </el-icon>
      <span class="countdown-text">{{ displayText }}</span>
    </template>
    <template v-else>
      <el-icon v-if="mode === 'end'" class="info-icon">
        <InfoFilled />
      </el-icon>
      <el-icon v-else class="success-icon">
        <CircleCheckFilled />
      </el-icon>
      <span class="countdown-text">{{ defaultExpiredText }}</span>
    </template>
  </div>
</template>

<style scoped>
.countdown-timer {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
  color: #606266;
}

.countdown-timer.is-expired {
  color: #909399;
}

.countdown-timer.is-urgent {
  color: #e6a23c;
}

.countdown-timer.is-end-mode.is-expired {
  color: #909399;
}

.warning-icon {
  color: #e6a23c;
}

.success-icon {
  color: #67c23a;
}

.info-icon {
  color: #909399;
}

.text-sm {
  font-size: 13px;
}

.text-base {
  font-size: 14px;
}

.text-xl {
  font-size: 18px;
}
</style>
