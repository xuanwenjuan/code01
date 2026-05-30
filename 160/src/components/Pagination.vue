<template>
  <div class="pagination-wrapper">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="pageSizes"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      :background="background"
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
    required: true
  },
  currentPage: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 12
  },
  pageSizes: {
    type: Array,
    default: () => [12, 24, 36, 48]
  },
  background: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:currentPage', 'update:pageSize', 'change'])

const currentPage = ref(props.currentPage)
const pageSize = ref(props.pageSize)

watch(() => props.currentPage, (val) => {
  currentPage.value = val
})

watch(() => props.pageSize, (val) => {
  pageSize.value = val
})

const handleSizeChange = (val) => {
  emit('update:pageSize', val)
  emit('change', { page: 1, pageSize: val })
}

const handleCurrentChange = (val) => {
  emit('update:currentPage', val)
  emit('change', { page: val, pageSize: pageSize.value })
}
</script>

<style lang="scss" scoped>
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}
</style>
