<template>
  <div class="empty-state">
    <el-empty :description="description" :image="image">
      <template v-if="showAction" #action>
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

<style scoped>
.empty-state {
  padding: 60px 0;
  background: #fff;
  border-radius: 12px;
}
</style>
