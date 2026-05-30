<template>
  <div class="search-bar">
    <div class="search-filters">
      <div v-if="showSearch" class="search-input-wrapper">
        <el-input
          v-model="searchText"
          :placeholder="placeholder"
          :size="size"
          clearable
          @input="handleSearch"
          @clear="handleClear"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <div v-if="filters && filters.length > 0" class="filter-items">
        <div v-for="filter in filters" :key="filter.key" class="filter-item">
          <span class="filter-label">{{ filter.label }}：</span>
          <el-select
            v-model="filterValues[filter.key]"
            :placeholder="`请选择${filter.label}`"
            :size="size"
            clearable
            style="width: 150px"
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
      </div>
    </div>
    <div v-if="showActions" class="search-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '请输入搜索关键词'
  },
  size: {
    type: String,
    default: 'default'
  },
  showSearch: {
    type: Boolean,
    default: true
  },
  showActions: {
    type: Boolean,
    default: false
  },
  filters: {
    type: Array,
    default: () => []
  },
  delay: {
    type: Number,
    default: 300
  }
})

const emit = defineEmits(['update:modelValue', 'search', 'filterChange', 'clear'])

const searchText = ref(props.modelValue)
const filterValues = reactive({})

let searchTimer = null

watch(() => props.modelValue, (val) => {
  searchText.value = val
})

const handleSearch = () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    emit('update:modelValue', searchText.value)
    emit('search', searchText.value)
  }, props.delay)
}

const handleClear = () => {
  searchText.value = ''
  emit('update:modelValue', '')
  emit('clear')
}

const handleFilterChange = () => {
  emit('filterChange', { ...filterValues })
}
</script>

<style lang="scss" scoped>
.search-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;

  .search-filters {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    flex: 1;

    .search-input-wrapper {
      min-width: 250px;
    }

    .filter-items {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;

      .filter-item {
        display: flex;
        align-items: center;
        gap: 8px;

        .filter-label {
          font-size: 14px;
          color: #606266;
          white-space: nowrap;
        }
      }
    }
  }

  .search-actions {
    display: flex;
    gap: 10px;
  }
}
</style>
