<template>
  <div class="empty-state flex-center">
    <el-empty :description="description" :image-size="imageSize">
      <template #image>
        <el-icon :size="imageSize" color="#c0c4cc"><DocumentDelete /></el-icon>
      </template>
      <template #description>
        <span>{{ description }}</span>
      </template>
      <slot name="action">
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
  imageSize: {
    type: Number,
    default: 100
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

<style scoped lang="scss">
.empty-state {
  padding: 60px 0;
  background: #fff;
  border-radius: 8px;
}
</style>
