<template>
  <el-form :inline="true" :model="form" class="search-form">
    <el-form-item v-for="field in fields" :key="field.prop" :label="field.label">
      <el-input
        v-if="field.type === 'input'"
        v-model="form[field.prop]"
        :placeholder="field.placeholder || '请输入'"
        :clearable="field.clearable !== false"
        style="width: 200px"
      />
      <el-select
        v-else-if="field.type === 'select'"
        v-model="form[field.prop]"
        :placeholder="field.placeholder || '请选择'"
        :clearable="field.clearable !== false"
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
        v-model="form[field.prop]"
        type="date"
        :placeholder="field.placeholder || '请选择日期'"
        value-format="YYYY-MM-DD"
        :clearable="field.clearable !== false"
        style="width: 200px"
      />
      <el-date-picker
        v-else-if="field.type === 'daterange'"
        v-model="form[field.prop]"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
        :clearable="field.clearable !== false"
        style="width: 300px"
      />
      <el-date-picker
        v-else-if="field.type === 'month'"
        v-model="form[field.prop]"
        type="month"
        :placeholder="field.placeholder || '请选择月份'"
        value-format="YYYY-MM"
        :clearable="field.clearable !== false"
        style="width: 200px"
      />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon>
        查询
      </el-button>
      <el-button @click="handleReset">
        <el-icon><Refresh /></el-icon>
        重置
      </el-button>
      <slot name="extra"></slot>
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

interface Emits {
  (e: 'search', values: Record<string, unknown>): void
  (e: 'reset'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const form = reactive<Record<string, unknown>>({})

watch(() => props.initialValues, (values) => {
  if (values) {
    Object.assign(form, values)
  }
}, { immediate: true, deep: true })

watch(() => props.fields, (fields) => {
  fields.forEach(field => {
    if (form[field.prop] === undefined) {
      form[field.prop] = field.type === 'daterange' ? ['', ''] : ''
    }
  })
}, { immediate: true })

const handleSearch = () => {
  emit('search', { ...form })
}

const handleReset = () => {
  props.fields.forEach(field => {
    form[field.prop] = field.type === 'daterange' ? ['', ''] : ''
  })
  emit('reset')
}
</script>

<style lang="scss" scoped>
.search-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}
</style>
