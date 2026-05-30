<template>
  <div class="pagination-wrapper" v-if="total > 0">
    <div class="pagination-info">
      共 <span class="highlight">{{ total }}</span> 条记录，
      第 <span class="highlight">{{ currentPage }}</span> /
      <span class="highlight">{{ totalPages }}</span> 页
    </div>
    <el-pagination
      v-model:current-page="localCurrentPage"
      v-model:page-size="localPageSize"
      :page-sizes="pageSizes"
      :total="total"
      layout="prev, pager, next, sizes, jumper"
      :small="small"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  total: {
    type: Number,
    required: true
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
  small: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:currentPage', 'update:pageSize', 'current-change', 'size-change'])

const localCurrentPage = ref(props.currentPage)
const localPageSize = ref(props.pageSize)

const totalPages = computed(() => {
  return Math.ceil(props.total / localPageSize.value)
})

watch(() => props.currentPage, (val) => {
  localCurrentPage.value = val
})

watch(() => props.pageSize, (val) => {
  localPageSize.value = val
})

const handleCurrentChange = (page) => {
  emit('update:currentPage', page)
  emit('current-change', page)
}

const handleSizeChange = (size) => {
  emit('update:pageSize', size)
  emit('size-change', size)
}
</script>

<style scoped>
.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  flex-wrap: wrap;
  gap: 12px;
}

.pagination-info {
  font-size: 14px;
  color: #666;
}

.pagination-info .highlight {
  color: #d4a574;
  font-weight: 500;
}
</style>
