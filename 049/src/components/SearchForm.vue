<template>
  <el-form
    :model="formData"
    :inline="inline"
    :label-width="labelWidth"
    class="search-form"
  >
    <slot :formData="formData" />
    <el-form-item>
      <el-button type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
      <el-button @click="handleReset">
        <el-icon><Refresh /></el-icon>
        重置
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

interface Props<T = any> {
  initialValues: T
  inline?: boolean
  labelWidth?: string
}

const props = withDefaults(defineProps<Props>(), {
  inline: true,
  labelWidth: '90px'
})

const emit = defineEmits<{
  (e: 'search', values: any): void
  (e: 'reset', values: any): void
}>()

const formData = reactive({ ...props.initialValues })

watch(
  () => props.initialValues,
  (newVal) => {
    Object.assign(formData, newVal)
  },
  { deep: true }
)

const handleSearch = () => {
  emit('search', { ...formData })
}

const handleReset = () => {
  Object.assign(formData, props.initialValues)
  emit('reset', { ...formData })
}

defineExpose({
  formData,
  reset: handleReset
})
</script>

<style scoped>
.search-form {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .search-form {
    :deep(.el-form-item) {
      width: 100%;
      margin-right: 0 !important;
    }

    :deep(.el-form-item__content) {
      width: 100%;
    }

    :deep(.el-input),
    :deep(.el-select) {
      width: 100% !important;
    }
  }
}
</style>
