<template>
  <div class="empty-state">
    <el-icon :size="80" color="#dcdfe6">
      <component :is="icon" />
    </el-icon>
    <p class="empty-text">{{ text }}</p>
    <slot name="action"></slot>
  </div>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: 'Box'
  },
  text: {
    type: String,
    default: '暂无数据'
  }
})
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: #909399;

  .empty-text {
    margin-top: 20px;
    font-size: 16px;
  }
}
</style>
