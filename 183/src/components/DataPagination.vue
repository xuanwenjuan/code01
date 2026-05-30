<template>
  <div class="pagination-wrapper" v-if="total > 0">
    <div class="pagination-info">
      共 {{ total }} 条记录，当前显示 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, total) }} 条
    </div>
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="pageSizes"
      :total="total"
      layout="sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  total: {
    type: Number,
    default: 0
  },
  pageSize: {
    type: Number,
    default: 10
  },
  currentPage: {
    type: Number,
    default: 1
  },
  pageSizes: {
    type: Array,
    default: () => [10, 20, 50, 100]
  }
})

const emit = defineEmits(['update:currentPage', 'update:pageSize', 'change'])

const localPage = ref(props.currentPage)
const localSize = ref(props.pageSize)

watch(() => props.currentPage, (val) => {
  localPage.value = val
})

watch(() => props.pageSize, (val) => {
  localSize.value = val
})

const handleSizeChange = (size) => {
  localSize.value = size
  emit('update:pageSize', size)
  emit('change', { page: 1, pageSize: size })
}

const handleCurrentChange = (page) => {
  localPage.value = page
  emit('update:currentPage', page)
  emit('change', { page, pageSize: localSize.value })
}
</script>

<style lang="scss" scoped>
.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  margin-top: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.pagination-info {
  font-size: 14px;
  color: #666;
}
</style>
