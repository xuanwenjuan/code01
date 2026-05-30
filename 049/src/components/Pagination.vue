<template>
  <div class="pagination-wrapper">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="pageSizes"
      :layout="layout"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: number
  total: number
  pageSize?: number
  pageSizes?: number[]
  layout?: string
}

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
  (e: 'sizeChange', value: number): void
  (e: 'change', value: number): void
}>()

const props = withDefaults(defineProps<Props>(), {
  pageSize: 10,
  pageSizes: () => [10, 20, 50, 100],
  layout: 'total, sizes, prev, pager, next, jumper'
})

const currentPage = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const handleSizeChange = (size: number): void => {
  emit('sizeChange', size)
}

const handleCurrentChange = (page: number): void => {
  emit('change', page)
}
</script>

<style scoped>
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0;
  background: #fff;
  margin-top: 1px;
}

:deep(.el-pagination) {
  font-weight: 500;
}

:deep(.el-pagination .el-pager li) {
  min-width: 36px;
  height: 36px;
  line-height: 36px;
  border-radius: 4px;
  margin: 0 4px;
}

:deep(.el-pagination .el-pager li.is-active) {
  background-color: #409eff;
  color: #fff;
}

:deep(.el-pagination button) {
  min-width: 36px;
  height: 36px;
  line-height: 36px;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .pagination-wrapper {
    justify-content: center;
    overflow-x: auto;
    padding: 12px 8px;
  }

  :deep(.el-pagination) {
    white-space: nowrap;
  }

  :deep(.el-pagination .el-pager li:not(.is-active):not(.more)) {
    display: none;
  }

  :deep(.el-pagination__sizes) {
    display: none;
  }
}
</style>
