<template>
  <div class="search-filter card">
    <div class="filter-row">
      <div class="search-box">
        <el-input
          v-model="localSearch"
          :placeholder="placeholder"
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>
      
      <div class="filter-actions" v-if="$slots.default">
        <slot />
      </div>
    </div>
    
    <div class="filter-tags" v-if="showFilters && filters.length > 0">
      <span class="filter-label">筛选：</span>
      <el-tag
        v-for="filter in filters"
        :key="filter.value"
        :type="activeFilter === filter.value ? 'primary' : 'info'"
        effect="plain"
        class="filter-tag"
        @click="handleFilter(filter.value)"
      >
        {{ filter.label }}
      </el-tag>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  placeholder: {
    type: String,
    default: '请输入搜索内容'
  },
  modelValue: {
    type: String,
    default: ''
  },
  filters: {
    type: Array,
    default: () => []
  },
  activeFilter: {
    type: [String, Number],
    default: ''
  },
  showFilters: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'search', 'filter'])

const localSearch = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  localSearch.value = val
})

const handleSearch = () => {
  emit('update:modelValue', localSearch.value)
  emit('search', localSearch.value)
}

const handleFilter = (value) => {
  emit('filter', value)
}
</script>

<style lang="scss" scoped>
.search-filter {
  padding: 16px 20px;
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.search-box {
  display: flex;
  gap: 12px;
  flex: 1;
  max-width: 500px;
}

.filter-actions {
  display: flex;
  gap: 12px;
}

.filter-tags {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0ebe0;
}

.filter-label {
  font-size: 14px;
  color: #666;
  flex-shrink: 0;
}

.filter-tag {
  cursor: pointer;
  transition: all 0.2s;
}
</style>
