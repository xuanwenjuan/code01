<template>
  <el-form :model="model" :inline="true" class="search-form">
    <slot />
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
import { reactive } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'

interface Props {
  initialValues?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  initialValues: () => ({})
})

const emit = defineEmits<{
  (e: 'search', values: Record<string, any>): void
  (e: 'reset'): void
}>()

const model = reactive<Record<string, any>>({ ...props.initialValues })

const handleSearch = () => {
  emit('search', { ...model })
}

const handleReset = () => {
  Object.keys(model).forEach(key => {
    model[key] = props.initialValues[key] ?? ''
  })
  emit('reset')
}

const getFieldValue = (key: string) => model[key]

const setFieldValue = (key: string, value: any) => {
  model[key] = value
}

defineExpose({
  getFieldValue,
  setFieldValue
})
</script>

<style scoped lang="scss">
.search-form {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 16px;

  :deep(.el-form-item) {
    margin-bottom: 0;
    margin-right: 16px;
  }
}
</style>
