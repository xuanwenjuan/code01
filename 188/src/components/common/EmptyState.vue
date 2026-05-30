<template>
  <div class="empty-state">
    <el-empty :description="description" :image-size="imageSize">
      <template v-if="showAction">
        <el-button type="primary" @click="$emit('action')">{{ actionText }}</el-button>
      </template>
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
    default: '去看看'
  }
})

defineEmits(['action'])
</script>

<style lang="scss" scoped>
.empty-state {
  width: 100%;
  padding: 60px 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
