<template>
  <div class="empty-state">
    <el-icon :size="60"><Empty /></el-icon>
    <p class="empty-text">{{ text }}</p>
    <slot name="action">
      <el-button v-if="showAction" type="primary" @click="$emit('action')">
        {{ actionText }}
      </el-button>
    </slot>
  </div>
</template>

<script setup>
defineProps({
  text: {
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

defineEmits(['action'])
</script>

<style lang="scss" scoped>
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  
  .el-icon {
    color: #d4af37;
    margin-bottom: 16px;
  }
  
  .empty-text {
    font-size: 16px;
    margin-bottom: 20px;
  }
}
</style>
