<template>
  <div class="status-tip" :class="[type, { show: visible }]">
    <div class="status-tip-content">
      <el-icon class="status-icon" :size="iconSize">
        <component :is="iconComponent" />
      </el-icon>
      <div class="status-text">
        <p class="status-title" v-if="title">{{ title }}</p>
        <p class="status-desc" v-if="message">{{ message }}</p>
      </div>
      <el-icon v-if="closable" class="close-icon" @click="handleClose">
        <Close />
      </el-icon>
    </div>
    <div class="status-tip-progress" v-if="duration > 0" :style="progressStyle"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { Check, Close, Warning, InfoFilled, CircleCheck, CircleClose, Loading } from '@element-plus/icons-vue'

const props = defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (val) => ['success', 'warning', 'error', 'info', 'loading'].includes(val)
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  duration: {
    type: Number,
    default: 3000
  },
  closable: {
    type: Boolean,
    default: true
  },
  show: {
    type: Boolean,
    default: false
  },
  iconSize: {
    type: Number,
    default: 24
  }
})

const emit = defineEmits(['close', 'update:show'])

const visible = ref(props.show)
const progress = ref(100)
let timer = null
let progressTimer = null

const iconComponent = computed(() => {
  const iconMap = {
    success: CircleCheck,
    warning: Warning,
    error: CircleClose,
    info: InfoFilled,
    loading: Loading
  }
  return iconMap[props.type] || InfoFilled
})

const progressStyle = computed(() => ({
  width: `${progress.value}%`
}))

function handleClose() {
  visible.value = false
  emit('close')
  emit('update:show', false)
  clearTimers()
}

function clearTimers() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
}

function startTimer() {
  clearTimers()
  progress.value = 100
  
  if (props.duration > 0 && props.type !== 'loading') {
    const step = 100 / (props.duration / 100)
    progressTimer = setInterval(() => {
      progress.value = Math.max(0, progress.value - step)
    }, 100)
    
    timer = setTimeout(() => {
      handleClose()
    }, props.duration)
  }
}

watch(() => props.show, (newVal) => {
  visible.value = newVal
  if (newVal) {
    startTimer()
  } else {
    clearTimers()
  }
})

onMounted(() => {
  if (props.show) {
    startTimer()
  }
})

onBeforeUnmount(() => {
  clearTimers()
})
</script>

<style scoped>
.status-tip {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 9999;
  min-width: 300px;
  max-width: 450px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  transform: translateX(120%);
  transition: transform 0.3s ease;
}

.status-tip.show {
  transform: translateX(0);
}

.status-tip.success {
  border-left: 4px solid #67c23a;
}

.status-tip.warning {
  border-left: 4px solid #e6a23c;
}

.status-tip.error {
  border-left: 4px solid #f56c6c;
}

.status-tip.info {
  border-left: 4px solid #409eff;
}

.status-tip.loading {
  border-left: 4px solid #909399;
}

.status-tip-content {
  display: flex;
  align-items: flex-start;
  padding: 16px 20px;
  gap: 12px;
}

.status-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.status-tip.success .status-icon {
  color: #67c23a;
}

.status-tip.warning .status-icon {
  color: #e6a23c;
}

.status-tip.error .status-icon {
  color: #f56c6c;
}

.status-tip.info .status-icon {
  color: #409eff;
}

.status-tip.loading .status-icon {
  color: #909399;
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.status-text {
  flex: 1;
  min-width: 0;
}

.status-title {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  margin: 0 0 4px;
}

.status-desc {
  font-size: 13px;
  color: #606266;
  margin: 0;
  line-height: 1.5;
  word-break: break-all;
}

.close-icon {
  flex-shrink: 0;
  cursor: pointer;
  color: #c0c4cc;
  font-size: 16px;
  transition: color 0.2s;
}

.close-icon:hover {
  color: #909399;
}

.status-tip-progress {
  height: 3px;
  background: linear-gradient(90deg, #409eff, #67c23a);
  transition: width 0.1s linear;
}

.status-tip.success .status-tip-progress {
  background: linear-gradient(90deg, #67c23a, #85ce61);
}

.status-tip.warning .status-tip-progress {
  background: linear-gradient(90deg, #e6a23c, #f0c78a);
}

.status-tip.error .status-tip-progress {
  background: linear-gradient(90deg, #f56c6c, #f89898);
}
</style>
