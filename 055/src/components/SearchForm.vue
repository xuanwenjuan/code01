<template>
  <el-form :inline="true" :model="searchForm" class="search-form">
    <template v-for="field in fields" :key="field.prop">
      <el-form-item :label="field.label">
        <el-input
          v-if="field.type === 'input'"
          v-model="searchForm[field.prop]"
          :placeholder="field.placeholder || `请输入${field.label}`"
          clearable
          style="width: 200px"
        />
        <el-select
          v-else-if="field.type === 'select'"
          v-model="searchForm[field.prop]"
          :placeholder="field.placeholder || `请选择${field.label}`"
          clearable
          style="width: 200px"
        >
          <el-option
            v-for="option in field.options"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
        <el-date-picker
          v-else-if="field.type === 'date'"
          v-model="searchForm[field.prop]"
          type="date"
          :placeholder="field.placeholder || `请选择${field.label}`"
          value-format="YYYY-MM-DD"
          style="width: 200px"
        />
        <el-date-picker
          v-else-if="field.type === 'daterange'"
          v-model="searchForm[field.prop]"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          style="width: 300px"
        />
      </el-form-item>
    </template>
    <el-form-item>
      <el-button type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
      <el-button @click="handleReset">
        <el-icon><Refresh /></el-icon>
        重置
      </el-button>
      <slot></slot>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { SearchField } from '@/types'

interface Props {
  fields: SearchField[]
  initialValues?: Record<string, unknown>
}

const props = withDefaults(defineProps<Props>(), {
  initialValues: () => ({})
})

const emit = defineEmits<{
  (e: 'search', values: Record<string, unknown>): void
  (e: 'reset'): void
}>()

const searchForm = reactive<Record<string, unknown>>({ ...props.initialValues })

watch(() => props.initialValues, (val) => {
  Object.assign(searchForm, val)
}, { deep: true })

const handleSearch = () => {
  emit('search', { ...searchForm })
}

const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = props.initialValues[key] ?? ''
  })
  emit('reset')
}

defineExpose({
  searchForm,
  reset: handleReset
})
</script>

<style scoped>
.search-form {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  :deep(.el-form-item) {
    margin-right: 0 !important;
    width: 100%;
  }
  
  :deep(.el-input),
  :deep(.el-select),
  :deep(.el-date-editor) {
    width: 100% !important;
  }
}
</style>
