<script setup lang="ts">
import { computed } from 'vue'
import type { SelectOption } from '@/types'

export interface FilterField {
  key: string
  label: string
  type: 'input' | 'select' | 'date' | 'date-range'
  placeholder?: string
  options?: SelectOption[]
  width?: string
  clearable?: boolean
  defaultValue?: unknown
}

const props = defineProps<{
  fields: FilterField[]
  modelValue: Record<string, unknown>
  inline?: boolean
  showSearchButton?: boolean
  showResetButton?: boolean
  showActiveCount?: boolean
  autoSearch?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Record<string, unknown>): void
  (e: 'search'): void
  (e: 'reset'): void
  (e: 'field-change', key: string, value: unknown): void
}>()

const formData = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const activeFilterCount = computed(() => {
  let count = 0
  for (const field of props.fields) {
    const value = formData.value[field.key]
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value) && value.length === 0) {
        continue
      }
      count++
    }
  }
  return count
})

function handleFieldChange(key: string, value: unknown): void {
  const newData = { ...formData.value, [key]: value }
  emit('update:modelValue', newData)
  emit('field-change', key, value)
  if (props.autoSearch) {
    emit('search')
  }
}

function handleSearch(): void {
  emit('search')
}

function handleReset(): void {
  emit('reset')
}
</script>

<template>
  <div class="filter-form">
    <el-form :inline="inline !== false" :model="formData" class="filter-row">
      <el-form-item
        v-for="field in fields"
        :key="field.key"
        :label="field.label"
        class="filter-item"
      >
        <el-input
          v-if="field.type === 'input'"
          v-model="formData[field.key]"
          :placeholder="field.placeholder || '请输入'"
          :clearable="field.clearable !== false"
          :style="{ width: field.width || '200px' }"
          @input="handleFieldChange(field.key, formData[field.key])"
          @keyup.enter="handleSearch"
          @clear="handleFieldChange(field.key, '')"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select
          v-else-if="field.type === 'select'"
          v-model="formData[field.key]"
          :placeholder="field.placeholder || '请选择'"
          :clearable="field.clearable !== false"
          :style="{ width: field.width || '150px' }"
          @change="(val: unknown) => handleFieldChange(field.key, val)"
          @clear="handleFieldChange(field.key, undefined)"
          filterable
        >
          <el-option
            v-for="option in field.options"
            :key="option.value"
            :label="option.label"
            :value="option.value"
            :disabled="option.disabled"
          />
        </el-select>

        <el-date-picker
          v-else-if="field.type === 'date'"
          v-model="formData[field.key]"
          type="date"
          :placeholder="field.placeholder || '选择日期'"
          :clearable="field.clearable !== false"
          value-format="YYYY-MM-DD"
          :style="{ width: field.width || '140px' }"
          @change="(val: unknown) => handleFieldChange(field.key, val)"
          @clear="handleFieldChange(field.key, undefined)"
        />

        <el-date-picker
          v-else-if="field.type === 'date-range'"
          v-model="formData[field.key]"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          :style="{ width: field.width || '260px' }"
          @change="(val: unknown) => handleFieldChange(field.key, val)"
          @clear="handleFieldChange(field.key, undefined)"
        />
      </el-form-item>

      <el-form-item v-if="showSearchButton !== false || showResetButton !== false || showActiveCount">
        <el-button v-if="showSearchButton !== false" type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button v-if="showResetButton !== false" @click="handleReset">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
        <el-tag
          v-if="showActiveCount && activeFilterCount > 0"
          type="primary"
          effect="light"
          class="filter-count-tag"
        >
          已选 {{ activeFilterCount }} 个条件
        </el-tag>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.filter-form {
  padding: 0;
}
.filter-count-tag {
  margin-left: 8px;
}
</style>
