<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">{{ title }}</h1>
      <el-button v-if="showAddBtn" type="primary" @click="$emit('add')">
        <el-icon><Plus /></el-icon>
        新增
      </el-button>
    </div>
    <el-card>
      <slot name="search" />
      <slot name="table" />
      <div v-if="showPagination" class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="total"
          :page-sizes="pageSizes"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="$emit('size-change', $event)"
          @current-change="$emit('current-change', $event)"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'

interface Props {
  title: string
  showAddBtn?: boolean
  showPagination?: boolean
  total?: number
  pageSizes?: number[]
}

withDefaults(defineProps<Props>(), {
  showAddBtn: true,
  showPagination: true,
  total: 0,
  pageSizes: () => [10, 20, 50, 100]
})

defineEmits<{
  'add': []
  'size-change': [size: number]
  'current-change': [page: number]
}>()

const pagination = reactive({
  page: 1,
  pageSize: 10
})

defineExpose({
  pagination
})
</script>

<style scoped lang="scss">
.page-container {
  height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
