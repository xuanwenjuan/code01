<template>
  <div v-if="loading" class="loading-state">
    <el-icon class="is-loading" :size="40"><Loading /></el-icon>
  </div>
  <div v-else-if="empty" class="empty-state">
    <el-empty :description="description">
      <template #image>
        <el-icon :size="80" color="#dcdfe6"><Box /></el-icon>
      </template>
      <slot name="action">
        <el-button type="primary" size="small" @click="$router.push('/')">去逛逛</el-button>
      </slot>
    </el-empty>
  </div>
  <slot v-else></slot>
</template>

<script setup>
defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  empty: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    default: '暂无数据'
  }
})
</script>
