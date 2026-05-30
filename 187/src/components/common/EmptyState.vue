<template>
  <div class="empty-state">
    <el-icon :size="iconSize" :color="iconColor">
      <component :is="icon" />
    </el-icon>
    <p class="empty-text">{{ text }}</p>
    <slot v-if="$slots.default" />
    <el-button
      v-else-if="showAction"
      type="primary"
      size="small"
      @click="handleAction"
    >
      {{ actionText }}
    </el-button>
  </div>
</template>

<script setup>
const props = defineProps({
  icon: {
    type: String,
    default: 'Document'
  },
  text: {
    type: String,
    default: '暂无数据'
  },
  iconSize: {
    type: Number,
    default: 64
  },
  iconColor: {
    type: String,
    default: '#c0c4cc'
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

const emit = defineEmits(['action'])

const handleAction = () => {
  emit('action')
}
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #909399;
  text-align: center;
}

.empty-text {
  margin: 16px 0;
  font-size: 14px;
}
</style>
