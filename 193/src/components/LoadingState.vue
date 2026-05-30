<template>
  <div class="loading-state">
    <el-loading :text="text" :fullscreen="fullscreen">
      <div class="loading-content">
        <el-icon class="is-loading" :size="40">
          <Loading />
        </el-icon>
      </div>
    </el-loading>
  </div>
</template>

<script setup>
import { Loading } from '@element-plus/icons-vue'

defineProps({
  text: {
    type: String,
    default: '加载中...'
  },
  fullscreen: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #409eff;
}
</style>
