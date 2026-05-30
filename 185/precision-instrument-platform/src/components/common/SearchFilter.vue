<template>
  <div class="search-filter card">
    <div class="filter-row" v-if="showSearch">
      <el-input
        v-model="localKeyword"
        :placeholder="searchPlaceholder"
        size="large"
        clearable
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
        <template #append>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </template>
      </el-input>
    </div>

    <div class="filter-row" v-if="showDateRange">
      <label class="filter-label">日期范围：</label>
      <el-date-picker
        v-model="localDateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        size="large"
        style="width: 380px"
        @change="handleDateChange"
      />
    </div>

    <div class="filter-row" v-if="tabs && tabs.length > 0">
      <el-radio-group v-model="localActiveTab" size="large" @change="handleTabChange">
        <el-radio-button
          v-for="tab in tabs"
          :key="tab.value"
          :value="tab.value"
        >
          {{ tab.label }}
          <el-badge v-if="tab.count !== undefined" :value="tab.count" class="tab-badge" />
        </el-radio-button>
      </el-radio-group>
    </div>

    <div class="filter-row" v-if="filters && filters.length > 0">
      <div v-for="filter in filters" :key="filter.key" class="filter-item">
        <label class="filter-label">{{ filter.label }}：</label>
        <el-select
          v-model="filter.value"
          :placeholder="filter.placeholder || '请选择'"
          size="large"
          clearable
          style="width: 180px"
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

    <div class="filter-actions" v-if="showActions">
      <el-button @click="handleReset">
        <el-icon><Refresh /></el-icon>
        重置
      </el-button>
      <slot name="extra" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'

const props = defineProps({
  showSearch: {
    type: Boolean,
    default: true
  },
  searchPlaceholder: {
    type: String,
    default: '请输入关键词搜索'
  },
  keyword: {
    type: String,
    default: ''
  },
  showDateRange: {
    type: Boolean,
    default: false
  },
  dateRange: {
    type: Array,
    default: () => []
  },
  tabs: {
    type: Array,
    default: () => []
  },
  activeTab: {
    type: String,
    default: ''
  },
  filters: {
    type: Array,
    default: () => []
  },
  showActions: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:keyword', 'update:dateRange', 'update:activeTab', 'search', 'filterChange', 'reset'])

const localKeyword = ref(props.keyword)
const localDateRange = ref(props.dateRange)
const localActiveTab = ref(props.activeTab)

watch(() => props.keyword, (val) => {
  localKeyword.value = val
})

watch(() => props.dateRange, (val) => {
  localDateRange.value = val
})

watch(() => props.activeTab, (val) => {
  localActiveTab.value = val
})

const handleSearch = () => {
  emit('update:keyword', localKeyword.value)
  emit('search', localKeyword.value)
}

const handleDateChange = (val) => {
  emit('update:dateRange', val)
  emit('filterChange', { type: 'dateRange', value: val })
}

const handleTabChange = (val) => {
  emit('update:activeTab', val)
  emit('filterChange', { type: 'tab', value: val })
}

const handleFilterChange = () => {
  emit('filterChange', { type: 'filters', value: props.filters })
}

const handleReset = () => {
  localKeyword.value = ''
  localDateRange.value = []
  localActiveTab.value = props.tabs[0]?.value || ''
  props.filters.forEach(f => {
    f.value = ''
  })
  emit('update:keyword', '')
  emit('update:dateRange', [])
  emit('update:activeTab', localActiveTab.value)
  emit('reset')
}
</script>

<style scoped>
.search-filter {
  padding: 20px;
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.filter-row:last-child {
  margin-bottom: 0;
}

.filter-label {
  color: #606266;
  font-size: 14px;
  flex-shrink: 0;
  width: 80px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.tab-badge {
  margin-left: 4px;
}
</style>
