<template>
  <el-tag
    :type="tagType"
    :effect="effect"
    :size="size"
    :round="round"
    :class="['status-tag', type]"
  >
    <el-icon v-if="showIcon" class="tag-icon">
      <component :is="icon" />
    </el-icon>
    <slot>{{ displayText }}</slot>
  </el-tag>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'default'
  },
  text: {
    type: String,
    default: ''
  },
  statusMap: {
    type: Object,
    default: () => ({})
  },
  size: {
    type: String,
    default: 'small'
  },
  effect: {
    type: String,
    default: 'light'
  },
  round: {
    type: Boolean,
    default: false
  },
  showIcon: {
    type: Boolean,
    default: false
  }
})

const defaultStatusMap = {
  pending: { text: '待处理', type: 'warning', icon: 'Clock' },
  processing: { text: '处理中', type: 'primary', icon: 'Loading' },
  shipped: { text: '已发货', type: 'primary', icon: 'Van' },
  completed: { text: '已完成', type: 'success', icon: 'CircleCheck' },
  cancelled: { text: '已取消', type: 'info', icon: 'CircleClose' },
  success: { text: '成功', type: 'success', icon: 'CircleCheck' },
  error: { text: '失败', type: 'danger', icon: 'CircleClose' },
  warning: { text: '警告', type: 'warning', icon: 'Warning' },
  info: { text: '信息', type: 'info', icon: 'InfoFilled' },
  active: { text: '启用', type: 'success', icon: 'Switch' },
  inactive: { text: '禁用', type: 'info', icon: 'SwitchButton' }
}

const statusConfig = computed(() => {
  const map = { ...defaultStatusMap, ...props.statusMap }
  return map[props.type] || { text: props.text || props.type, type: 'info', icon: 'InfoFilled' }
})

const displayText = computed(() => props.text || statusConfig.value.text)
const tagType = computed(() => statusConfig.value.type)
const icon = computed(() => statusConfig.value.icon)
</script>

<style lang="scss" scoped>
.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;

  .tag-icon {
    font-size: 12px;
  }
}
</style>
