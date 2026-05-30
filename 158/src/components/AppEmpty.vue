<template>
  <div class="app-empty">
    <el-empty :description="description" :image-size="imageSize">
      <template v-if="$slots.default">
        <slot />
      </template>
      <template v-else-if="showAction">
        <el-button type="primary" @click="handleAction">{{ actionText }}</el-button>
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
    default: 120
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

const emit = defineEmits(['action'])

const handleAction = () => {
  emit('action')
}
</script>

<style lang="scss" scoped>
.app-empty {
  padding: 60px 0;
  text-align: center;
}
</style>
