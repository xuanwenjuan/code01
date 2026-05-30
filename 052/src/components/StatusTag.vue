<template>
  <el-tag 
    :type="tagType" 
    :effect="effect"
    @click="$emit('click', $event)"
  >
    <slot>
      {{ statusLabel }}
    </slot>
  </el-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  status: string
  type?: 'success' | 'warning' | 'danger' | 'info' | 'primary'
  effect?: 'dark' | 'light' | 'plain'
  statusMap?: Record<string, { label: string; type: 'success' | 'warning' | 'danger' | 'info' | 'primary' }>
}

const props = withDefaults(defineProps<Props>(), {
  effect: 'light'
})

defineEmits<{
  click: [event: MouseEvent]
}>()

const tagType = computed(() => {
  if (props.type) return props.type
  if (props.statusMap && props.statusMap[props.status]) {
    return props.statusMap[props.status].type
  }
  return 'info'
})

const statusLabel = computed(() => {
  if (props.statusMap && props.statusMap[props.status]) {
    return props.statusMap[props.status].label
  }
  return props.status
})
</script>

<style scoped>
.el-tag {
  cursor: inherit;
}
</style>
