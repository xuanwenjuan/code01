<template>
  <div class="advanced-filter">
    <div class="filter-header">
      <span class="filter-title">
        <el-icon><Search /></el-icon>
        高级筛选
      </span>
      <el-button
        v-if="showToggle"
        link
        type="primary"
        @click="toggleExpanded"
      >
        {{ expanded ? '收起' : '展开' }}
        <el-icon>
          <component :is="expanded ? 'ArrowUp' : 'ArrowDown'" />
        </el-icon>
      </el-button>
    </div>
    <el-collapse-transition>
      <div v-show="expanded" class="filter-content">
        <div class="filter-row">
          <slot />
        </div>
        <div class="filter-footer">
          <div class="active-filters" v-if="activeFilterCount > 0">
            <span class="label">已选条件：</span>
            <el-tag
              v-for="(tag, index) in activeFilterTags"
              :key="index"
              size="small"
              closable
              @close="tag.remove"
            >
              {{ tag.label }}
            </el-tag>
            <el-button link type="primary" size="small" @click="handleReset">
              清除全部
            </el-button>
          </div>
          <div class="filter-actions">
            <slot name="reset">
              <el-button @click="handleReset">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
            </slot>
            <slot name="search">
              <el-button type="primary" @click="handleSearch">
                <el-icon><Search /></el-icon>
                查询
              </el-button>
            </slot>
          </div>
        </div>
      </div>
    </el-collapse-transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, Refresh, ArrowUp, ArrowDown } from '@element-plus/icons-vue'

interface FilterTag {
  label: string
  remove: () => void
}

interface Props {
  showToggle?: boolean
  defaultExpanded?: boolean
  activeFilterCount?: number
  activeFilterTags?: FilterTag[]
}

const props = withDefaults(defineProps<Props>(), {
  showToggle: false,
  defaultExpanded: true,
  activeFilterCount: 0,
  activeFilterTags: () => []
})

const emit = defineEmits<{
  search: []
  reset: []
  'update:expanded': [value: boolean]
}>()

const expanded = ref<boolean>(props.defaultExpanded)

function toggleExpanded(): void {
  expanded.value = !expanded.value
  emit('update:expanded', expanded.value)
}

function handleSearch(): void {
  emit('search')
}

function handleReset(): void {
  emit('reset')
}
</script>

<style lang="scss" scoped>
.advanced-filter {
  background-color: #fafafa;
  padding: 16px;
  border-radius: 8px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.filter-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-content {
  transition: all 0.3s ease;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.filter-footer {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.active-filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;

  .label {
    font-size: 12px;
    color: #909399;
  }
}

.filter-actions {
  display: flex;
  gap: 8px;
}

@media (max-width: 768px) {
  .advanced-filter {
    padding: 12px;
  }

  .filter-row {
    flex-direction: column;
    align-items: stretch;

    :deep(.el-input),
    :deep(.el-select),
    :deep(.el-date-editor) {
      width: 100% !important;
    }
  }

  .filter-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .active-filters {
    justify-content: flex-start;
  }

  .filter-actions {
    justify-content: flex-end;
  }
}
</style>
