<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="width"
    :close-on-click-modal="false"
    :class="{ 'view-only': mode === 'view' }"
    @close="handleClose"
  >
    <slot />
    <template #footer>
      <el-button @click="handleClose">{{ mode === 'view' ? '关闭' : '取消' }}</el-button>
      <el-button
        v-if="mode !== 'view'"
        type="primary"
        :loading="loading"
        @click="handleConfirm"
      >
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

type DialogMode = 'add' | 'edit' | 'view'

interface Props {
  modelValue: boolean
  title?: string
  width?: string
  mode?: DialogMode
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  width: '600px',
  mode: 'add'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'close'): void
}>()

const visible = ref(false)
const loading = ref(false)

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
  },
  { immediate: true }
)

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const computedTitle = computed(() => {
  if (props.title) return props.title
  const titles: Record<DialogMode, string> = {
    add: '新增',
    edit: '编辑',
    view: '详情'
  }
  return titles[props.mode]
})

const handleClose = () => {
  visible.value = false
  emit('close')
}

const handleConfirm = () => {
  emit('confirm')
}

const setLoading = (val: boolean) => {
  loading.value = val
}

defineExpose({
  setLoading
})
</script>

<style scoped lang="scss">
.view-only {
  :deep(.el-form-item__content) {
    color: #606266;
  }
}
</style>
