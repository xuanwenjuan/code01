<template>
  <div class="empty-state">
    <el-icon :size="80" color="#c0c4cc">
      <component :is="icon" />
    </el-icon>
    <p class="empty-text">{{ text }}</p>
    <slot name="action"></slot>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  Empty,
  ShoppingCart,
  Star,
  Document,
  Box,
  Search
} from '@element-plus/icons-vue'

const props = defineProps({
  text: {
    type: String,
    default: '暂无数据'
  },
  type: {
    type: String,
    default: 'empty'
  }
})

const iconMap = {
  empty: Empty,
  cart: ShoppingCart,
  favorite: Star,
  order: Document,
  product: Box,
  search: Search
}

const icon = computed(() => iconMap[props.type] || Empty)
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #909399;
}

.empty-text {
  margin-top: 16px;
  font-size: 14px;
}
</style>
