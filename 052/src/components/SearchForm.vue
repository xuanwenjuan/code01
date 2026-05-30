<template>
  <el-form :model="formData" inline class="search-form">
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
  initialValues?: Record<string, unknown>
}

const props = withDefaults(defineProps<Props>(), {
  initialValues: () => ({})
})

const emit = defineEmits<{
  'search': [formData: Record<string, unknown>]
  'reset': []
}>()

const formData = reactive<Record<string, unknown>>({ ...props.initialValues })

const handleSearch = () => {
  emit('search', { ...formData })
}

const handleReset = () => {
  Object.keys(formData).forEach(key => {
    const value = props.initialValues[key]
    if (Array.isArray(value)) {
      (formData as Record<string, unknown[]>)[key] = []
    } else {
      formData[key] = value
    }
  })
  emit('reset')
}

defineExpose({
  formData,
  reset: handleReset
})
</script>

<style scoped lang="scss">
.search-form {
  margin-bottom: 20px;
}
</style>
