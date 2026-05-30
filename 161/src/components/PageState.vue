<template>
  <div class="page-state">
    <template v-if="loading">
      <LoadingState :text="loadingText" :type="loadingType" />
    </template>
    <template v-else-if="error">
      <div class="error-state">
        <el-empty description="加载失败" :image="Empty.PRESENTED_IMAGE_SIMPLE">
          <el-button type="primary" @click="$emit('retry')">重试</el-button>
        </el-empty>
      </div>
    </template>
    <template v-else-if="empty">
      <EmptyState
        :description="emptyText"
        :show-action="showAction"
        :action-text="actionText"
        @action="$emit('action')"
      />
    </template>
    <template v-else>
      <slot />
    </template>
  </div>
</template>

<script setup>
import { Empty } from 'element-plus'
import LoadingState from './LoadingState.vue'
import EmptyState from './EmptyState.vue'

defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: '加载中...'
  },
  loadingType: {
    type: String,
    default: 'spinner'
  },
  error: {
    type: Boolean,
    default: false
  },
  empty: {
    type: Boolean,
    default: false
  },
  emptyText: {
    type: String,
    default: '暂无数据'
  },
  showAction: {
    type: Boolean,
    default: false
  },
  actionText: {
    type: String,
    default: '去看看'
  }
})

defineEmits(['retry', 'action'])
</script>

<style lang="scss" scoped>
.page-state {
  min-height: 200px;
}

.error-state {
  padding: 60px 0;
  text-align: center;
}
</style>
