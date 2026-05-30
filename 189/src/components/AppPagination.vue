<template>
  <div class="app-pagination" v-if="total > 0">
    <div class="pagination-info">
      共 <span class="highlight">{{ total }}</span> 条记录，
      第 <span class="highlight">{{ currentPage }}</span> / 
      <span class="highlight">{{ totalPages }}</span> 页
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
import { computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 12
  },
  total: {
    type: Number,
    default: 0
  },
  pageSizes: {
    type: Array,
    default: () => [12, 24, 48, 100]
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

const emit = defineEmits(['update:modelValue', 'update:pageSize', 'change'])

const currentPage = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const currentPageSize = computed({
  get: () => props.pageSize,
  set: (val) => emit('update:pageSize', val)
})

const totalPages = computed(() => {
  return Math.ceil(props.total / currentPageSize.value) || 1
})

function handleSizeChange(val) {
  emit('update:pageSize', val)
  emit('change', { page: 1, pageSize: val })
}

function handleCurrentChange(val) {
  emit('change', { page: val, pageSize: currentPageSize.value })
}
</script>

<style lang="scss" scoped>
.app-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  flex-wrap: wrap;
  gap: 12px;

  .pagination-info {
    font-size: 14px;
    color: $text-light;

    .highlight {
      color: $primary-color;
      font-weight: 600;
      margin: 0 4px;
    }
  }

  :deep(.el-pagination) {
    .btn-prev,
    .btn-next,
    .el-pager li {
      border-radius: 4px;
    }

    .el-pager li.is-active {
      background: $primary-color;
    }
  }
}

@media (max-width: 768px) {
  .app-pagination {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
