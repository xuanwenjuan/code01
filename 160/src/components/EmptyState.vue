<template>
  <div class="empty-state">
    <el-empty :description="description" :image-size="100">
      <template #image>
        <el-icon :size="80" color="#c0c4cc">
          <component :is="icon" />
        </el-icon>
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
import { Document } from '@element-plus/icons-vue'

defineProps({
  description: {
    type: String,
    default: '暂无数据'
  },
  icon: {
    type: [String, Object],
    default: Document
  },
  showAction: {
    type: Boolean,
    default: false
  },
  actionText: {
    type: String,
    default: '去逛逛'
  }
})

defineEmits(['action'])
</script>

<style lang="scss" scoped>
.empty-state {
  padding: 60px 0;
}
</style>
