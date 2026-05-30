<template>
  <div class="search-filter">
    <div class="filter-row">
      <div class="search-box">
        <el-input
          v-model="localKeyword"
          :placeholder="placeholder"
          clearable
          @input="handleSearch"
          @clear="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <div v-if="filters && filters.length" class="filters-box">
        <el-select
          v-for="filter in filters"
          :key="filter.key"
          v-model="localFilters[filter.key]"
          :placeholder="filter.placeholder"
          style="width: 140px;"
          @change="handleFilterChange"
        >
          <el-option
            v-for="option in filter.options"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </div>
      <div class="actions-box">
        <slot name="actions" />
      </div>
    </div>
    <div v-if="$slots.tabs" class="tabs-row">
      <slot name="tabs" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, reactive } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '请输入关键词搜索'
  },
  filters: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'search', 'filter-change'])

const localKeyword = ref(props.modelValue)
const localFilters = reactive({})

props.filters.forEach(filter => {
  localFilters[filter.key] = filter.defaultValue || ''
})

watch(() => props.modelValue, (val) => {
  localKeyword.value = val
})

const handleSearch = () => {
  emit('update:modelValue', localKeyword.value)
  emit('search', localKeyword.value)
}

const handleFilterChange = () => {
  emit('filter-change', { ...localFilters })
}
</script>

<style scoped>
.search-filter {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 200px;
  max-width: 400px;
}

.filters-box {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.actions-box {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.tabs-row {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}
</style>
