<template>
  <div class="app-pagination" v-if="total > 0">
    <div class="pagination-info">
      共 <span class="total">{{ total }}</span> 条记录，
      第 <span class="current">{{ currentPage }}</span> / <span class="page-count">{{ pageCount }}</span> 页
    </div>
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="pageSizes"
      :total="total"
      :layout="layout"
      :background="background"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  total: {
    type: Number,
    default: 0
  },
  currentPage: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 10
  },
  pageSizes: {
    type: Array,
    default: () => [10, 20, 50, 100]
  },
  layout: {
    type: String,
    default: 'total, sizes, prev, pager, next, jumper'
  },
  background: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:currentPage', 'update:pageSize', 'size-change', 'current-change'])

const pageCount = computed(() => Math.ceil(props.total / props.pageSize))

const handleSizeChange = (val) => {
  emit('update:pageSize', val)
  emit('size-change', val)
}

const handleCurrentChange = (val) => {
  emit('update:currentPage', val)
  emit('current-change', val)
}
</script>

<style scoped>
.app-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  flex-wrap: wrap;
  gap: 16px;
}

.pagination-info {
  font-size: 14px;
  color: #606266;
}

.pagination-info .total,
.pagination-info .current,
.pagination-info .page-count {
  color: #409eff;
  font-weight: 500;
  margin: 0 4px;
}

@media (max-width: 768px) {
  .app-pagination {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
