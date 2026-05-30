<template>
  <div class="app-state">
    <el-empty v-if="type === 'empty'" :description="description || '暂无数据'">
      <slot name="action"></slot>
    </el-empty>
    <div v-else-if="type === 'loading'" class="loading-state">
      <el-icon class="is-loading" size="40"><Loading /></el-icon>
      <p class="loading-text">{{ description || '加载中...' }}</p>
    </div>
    <div v-else-if="type === 'error'" class="error-state">
      <el-icon size="40" color="#f56c6c"><Warning /></el-icon>
      <p class="error-text">{{ description || '加载失败' }}</p>
      <slot name="action"></slot>
    </div>
    <div v-else-if="type === 'no-result'" class="no-result-state">
      <el-icon size="40" color="#909399"><Search /></el-icon>
      <p class="no-result-text">{{ description || '没有找到相关结果' }}</p>
      <slot name="action"></slot>
    </div>
    <div v-else-if="type === 'success'" class="success-state">
      <el-icon size="40" color="#67c23a"><CircleCheck /></el-icon>
      <p class="success-text">{{ description || '操作成功' }}</p>
      <slot name="action"></slot>
    </div>
  </div>
</template>

<script setup>
import { Loading, Warning, Search, CircleCheck } from '@element-plus/icons-vue'

defineProps({
  type: {
    type: String,
    default: 'empty',
    validator: (value) => ['empty', 'loading', 'error', 'no-result', 'success'].includes(value)
  },
  description: {
    type: String,
    default: ''
  }
})
</script>

<style lang="scss" scoped>
.app-state {
  padding: 60px 20px;
  text-align: center;
  background-color: #fff;
  border-radius: 8px;
}

.loading-state,
.error-state,
.no-result-state,
.success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  p {
    margin: 0;
    font-size: 14px;
  }
}

.loading-text {
  color: #909399;
}

.error-text {
  color: #f56c6c;
}

.no-result-text {
  color: #606266;
}

.success-text {
  color: #67c23a;
}
</style>
