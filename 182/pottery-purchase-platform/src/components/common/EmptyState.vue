<template>
  <div class="empty-state">
    <el-empty :description="description" :image-size="100">
      <template #image>
        <div class="empty-icon">{{ icon }}</div>
      </template>
      <slot>
        <el-button v-if="showAction" type="primary" @click="$emit('action')">
          {{ actionText }}
        </el-button>
      </slot>
    </el-empty>
  </div>
</template>

<script setup>
defineProps({
  description: {
    type: String,
    default: '暂无数据'
  },
  icon: {
    type: String,
    default: '📭'
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

<style scoped>
.empty-state {
  padding: 60px 0;
  text-align: center;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 16px;
}
</style>
