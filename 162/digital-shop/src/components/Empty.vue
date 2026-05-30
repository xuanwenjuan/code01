<template>
  <div class="empty-wrapper">
    <el-empty :description="description" :image="image">
      <slot>
        <el-button v-if="showAction" type="primary" @click="$emit('action')">{{ actionText }}</el-button>
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
  image: {
    type: String,
    default: ''
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
.empty-wrapper {
  padding: 60px 0;
  text-align: center;
}
</style>
