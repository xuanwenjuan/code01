<template>
  <div class="data-table">
    <div v-if="loading" class="table-loading">
      <LoadingState type="spinner" />
    </div>
    <template v-else>
      <el-table
        ref="tableRef"
        :data="displayData"
        :border="border"
        :stripe="stripe"
        :row-key="rowKey"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        style="width: 100%"
      >
        <el-table-column
          v-if="showSelection"
          type="selection"
          width="55"
          :selectable="selectable"
        />
        <el-table-column
          v-if="showIndex"
          type="index"
          label="序号"
          width="60"
          :index="indexMethod"
        />
        <slot />
      </el-table>

      <div v-if="showPagination && total > 0" class="pagination-wrapper">
        <div class="pagination-info">
          共 {{ total }} 条记录，第 {{ internalPage }} / {{ totalPages }} 页
        </div>
        <el-pagination
          :current-page="internalPage"
          :page-size="internalSize"
          :page-sizes="pageSizes"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import LoadingState from '@/components/LoadingState.vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  border: {
    type: Boolean,
    default: false
  },
  stripe: {
    type: Boolean,
    default: true
  },
  rowKey: {
    type: [String, Function],
    default: 'id'
  },
  showSelection: {
    type: Boolean,
    default: false
  },
  showIndex: {
    type: Boolean,
    default: false
  },
  showPagination: {
    type: Boolean,
    default: true
  },
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
  selectable: {
    type: Function,
    default: () => true
  },
  remote: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'selection-change',
  'sort-change',
  'size-change',
  'current-change',
  'update:currentPage',
  'update:pageSize'
])

const tableRef = ref(null)
const internalPage = ref(props.currentPage)
const internalSize = ref(props.pageSize)

watch(() => props.currentPage, (val) => {
  internalPage.value = val
})

watch(() => props.pageSize, (val) => {
  internalSize.value = val
})

const totalPages = computed(() => Math.ceil(props.total / internalSize.value))

const displayData = computed(() => {
  if (props.remote || !props.showPagination) {
    return props.data
  }
  const start = (internalPage.value - 1) * internalSize.value
  const end = start + internalSize.value
  return props.data.slice(start, end)
})

const indexMethod = (index) => {
  return (internalPage.value - 1) * internalSize.value + index + 1
}

const handleSelectionChange = (selection) => {
  emit('selection-change', selection)
}

const handleSortChange = ({ column, prop, order }) => {
  emit('sort-change', { column, prop, order })
}

const handleSizeChange = (size) => {
  internalSize.value = size
  internalPage.value = 1
  emit('update:pageSize', size)
  emit('size-change', size)
}

const handleCurrentChange = (page) => {
  internalPage.value = page
  emit('update:currentPage', page)
  emit('current-change', page)
}

const clearSelection = () => {
  tableRef.value?.clearSelection()
}

const toggleRowSelection = (row, selected) => {
  tableRef.value?.toggleRowSelection(row, selected)
}

defineExpose({
  clearSelection,
  toggleRowSelection,
  tableRef
})
</script>

<style lang="scss" scoped>
.data-table {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  position: relative;

  .table-loading {
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid #ebeef5;
    flex-wrap: wrap;
    gap: 16px;

    .pagination-info {
      font-size: 14px;
      color: #606266;
    }
  }
}
</style>
