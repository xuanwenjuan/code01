<template>
  <div class="app-empty">
    <el-empty :description="description" :image="image">
      <template v-if="showAction" #action>
        <el-button type="primary" size="small" @click="$emit('action')">{{ actionText }}</el-button>
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
    default: '去看看'
  }
})

defineEmits(['action'])
</script>

<style scoped>
.app-empty {
  padding: 40px 20px;
  text-align: center;
}
</style>
