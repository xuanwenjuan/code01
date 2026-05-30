<template>
  <div class="app-empty">
    <el-empty :description="description" :image-size="imageSize">
      <template v-if="$slots.default">
        <slot></slot>
      </template>
      <template v-else>
        <p class="empty-text">{{ text }}</p>
      </template>
    </el-empty>
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: '暂无数据'
  },
  description: {
    type: String,
    default: ''
  },
  imageSize: {
    type: Number,
    default: 100
  }
})
</script>

<style lang="scss" scoped>
.app-empty {
  padding: 40px 20px;
  text-align: center;

  .empty-text {
    color: $text-light;
    font-size: 14px;
    margin-top: 16px;
  }
}
</style>
