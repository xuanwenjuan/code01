<template>
  <div class="page-header">
    <div class="header-left">
      <el-button
        v-if="showBack"
        :icon="ArrowLeft"
        text
        @click="router.back()"
        class="back-btn"
      >
        返回
      </el-button>
      <h2 class="page-title">{{ title }}</h2>
      <slot name="subtitle"></slot>
    </div>
    <div class="header-right">
      <slot name="extra"></slot>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()

defineProps({
  title: {
    type: String,
    required: true
  },
  showBack: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped lang="scss">
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .back-btn {
      margin: 0;
      padding: 0;
      font-size: 14px;
    }
    
    .page-title {
      font-size: 20px;
      font-weight: 600;
      margin: 0;
      color: var(--text-primary);
    }
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}
</style>
