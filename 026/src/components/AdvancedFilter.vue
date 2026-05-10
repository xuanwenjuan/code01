<template>
  <div class="filter-container">
    <div class="filter-row">
      <div
        v-for="filter in filters"
        :key="filter.key"
        class="filter-item"
      >
        <span class="filter-label">{{ filter.label }}：</span>
        <template v-if="filter.type === 'select'">
          <el-select
            v-model="filterValues[filter.key as string]"
            :placeholder="filter.placeholder || '请选择'"
            clearable
            :style="{ width: filter.width || '150px' }"
            @change="handleFilterChange"
          >
            <el-option
              v-for="option in filter.options"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </template>
        <template v-else-if="filter.type === 'input'">
          <el-input
            v-model="filterValues[filter.key as string]"
            :placeholder="filter.placeholder || '请输入'"
            clearable
            :style="{ width: filter.width || '200px' }"
            @keyup.enter="handleFilterChange"
            @clear="handleFilterChange"
          />
        </template>
        <template v-else-if="filter.type === 'date'">
          <el-date-picker
            v-model="filterValues[filter.key as string]"
            type="date"
            :placeholder="filter.placeholder || '请选择日期'"
            value-format="YYYY-MM-DD"
            clearable
            :style="{ width: filter.width || '200px' }"
            @change="handleFilterChange"
          />
        </template>
        <template v-else-if="filter.type === 'dateRange'">
          <el-date-picker
            v-model="filterValues[filter.key as string]"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm"
            clearable
            :style="{ width: filter.width || '350px' }"
            @change="handleFilterChange"
          />
        </template>
      </div>
      
      <el-button type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon>
        查询
      </el-button>
      <el-button @click="handleReset">
        <el-icon><Refresh /></el-icon>
        重置
      </el-button>
    </div>
    
    <div v-if="showActiveFilters && activeFiltersCount > 0" class="active-filters">
      <span class="active-filters-label">已选条件：</span>
      <el-tag
        v-for="(label, key) in activeFilters"
        :key="key"
        closable
        @close="removeFilter(key as string)"
        style="margin-right: 8px;"
      >
        {{ label }}
      </el-tag>
      <el-button 
        v-if="activeFiltersCount > 1" 
        type="text" 
        size="small"
        @click="handleReset"
      >
        清除全部
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'

export interface FilterOption {
  label: string
  value: string | number | boolean | undefined
}

export interface FilterConfig {
  key: string
  label: string
  type: 'select' | 'input' | 'date' | 'dateRange'
  placeholder?: string
  width?: string
  options?: FilterOption[]
}

const props = defineProps<{
  filters: FilterConfig[]
  modelValue: Record<string, unknown>
  showActiveFilters?: boolean
  autoSearch?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>]
  'search': [value: Record<string, unknown>]
  'reset': []
}>()

const filterValues = reactive<Record<string, unknown>>({ ...props.modelValue })

const activeFilters = computed<Record<string, string>>(() => {
  const result: Record<string, string> = {}
  
  props.filters.forEach((filter) => {
    const value = filterValues[filter.key]
    if (value !== undefined && value !== null && value !== '') {
      let label = ''
      
      if (filter.type === 'select' && filter.options) {
        const option = filter.options.find((opt) => opt.value === value)
        label = option?.label || String(value)
      } else if (Array.isArray(value)) {
        label = (value as string[]).join(' 至 ')
      } else {
        label = String(value)
      }
      
      result[filter.key] = `${filter.label}: ${label}`
    }
  })
  
  return result
})

const activeFiltersCount = computed<number>(Object.keys(activeFilters.value).length)

function handleFilterChange(): void {
  if (props.autoSearch !== false) {
    emitSearch()
  }
}

function handleSearch(): void {
  emitSearch()
}

function handleReset(): void {
  props.filters.forEach((filter) => {
    filterValues[filter.key] = undefined
  })
  emit('update:modelValue', { ...filterValues })
  emit('reset')
}

function removeFilter(key: string): void {
  filterValues[key] = undefined
  emitSearch()
}

function emitSearch(): void {
  const cleanValues: Record<string, unknown> = {}
  Object.keys(filterValues).forEach((key: string) => {
    const value = filterValues[key]
    if (value !== undefined && value !== null && value !== '') {
      cleanValues[key] = value
    }
  })
  
  emit('update:modelValue', cleanValues)
  emit('search', cleanValues)
}

watch(
  () => props.modelValue,
  (newVal) => {
    props.filters.forEach((filter) => {
      if (newVal[filter.key] !== undefined) {
        filterValues[filter.key] = newVal[filter.key]
      }
    })
  },
  { deep: true }
)

watch(
  () => props.filters,
  () => {
    props.filters.forEach((filter) => {
      if (filterValues[filter.key] === undefined) {
        filterValues[filter.key] = undefined
      }
    })
  },
  { deep: true }
)
</script>

<style scoped>
.active-filters {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px dashed #dcdfe6;
  display: flex;
  align-items: center;
}

.active-filters-label {
  color: #909399;
  font-size: 13px;
  margin-right: 12px;
}
</style>
