<template>
  <el-table
    v-loading="loading"
    :data="data"
    :border="border"
    :stripe="stripe"
    :height="height"
    :size="size"
    @selection-change="handleSelectionChange"
  >
    <el-table-column v-if="showSelection" type="selection" width="55" />
    <el-table-column
      v-for="column in columns"
      :key="column.prop"
      :prop="column.prop as string"
      :label="column.label"
      :width="column.width"
      :fixed="column.fixed"
      :sortable="column.sortable"
    >
      <template #default="scope">
        <slot :name="`column-${String(column.prop)}`" :row="scope.row" :column="column">
          {{ column.formatter ? column.formatter(scope.row) : scope.row[column.prop] }}
        </slot>
      </template>
    </el-table-column>
    <el-table-column v-if="$slots.actions" label="操作" width="200" fixed="right">
      <template #default="scope">
        <slot name="actions" :row="scope.row" :$index="scope.$index" />
      </template>
    </el-table-column>
  </el-table>
  <div v-if="showPagination" class="pagination-container">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[10, 20, 50, 100]"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '@/types'

interface Props<T> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  border?: boolean
  stripe?: boolean
  height?: string | number
  size?: 'large' | 'default' | 'small'
  showSelection?: boolean
  showPagination?: boolean
  currentPage?: number
  pageSize?: number
  total?: number
}

const props = withDefaults(defineProps<Props<object>>(), {
  loading: false,
  border: true,
  stripe: true,
  height: undefined,
  size: 'default',
  showSelection: false,
  showPagination: true,
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const emit = defineEmits<{
  'selection-change': [selection: object[]]
  'update:currentPage': [page: number]
  'update:pageSize': [size: number]
  'pagination-change': [params: { page: number; pageSize: number }]
}>()

function handleSelectionChange(selection: object[]): void {
  emit('selection-change', selection)
}

function handleSizeChange(size: number): void {
  emit('update:pageSize', size)
  emit('pagination-change', { page: 1, pageSize: size })
}

function handleCurrentChange(page: number): void {
  emit('update:currentPage', page)
  emit('pagination-change', { page, pageSize: props.pageSize })
}
</script>

<style scoped>
.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  :deep(.el-table) {
    font-size: 12px;
  }

  :deep(.el-table .cell) {
    padding: 0 4px;
  }

  .pagination-container {
    justify-content: center;
    overflow-x: auto;
  }

  :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }
}
</style>
