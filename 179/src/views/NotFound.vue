<template>
  <div class="not-found-page">
    <div class="container">
      <div class="content">
        <div class="icon-wrapper">
          <el-icon :size="120" class="error-icon"><Warning /></el-icon>
        </div>
        <h1 class="error-code">404</h1>
        <h2 class="error-title">页面未找到</h2>
        <p class="error-desc">抱歉，您访问的页面不存在或已被移除</p>
        <div class="actions">
          <el-button type="primary" size="large" @click="router.push('/')">
            <el-icon><HomeFilled /></el-icon>
            返回首页
          </el-button>
          <el-button size="large" @click="router.go(-1)">
            <el-icon><ArrowLeft /></el-icon>
            返回上一页
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { Warning, HomeFilled, ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()
</script>

<style lang="scss" scoped>
.not-found-page {
  min-height: calc(100vh - 140px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fdf6e3 0%, #f5e6c8 100%);
}

.content {
  text-align: center;
  padding: 60px 40px;
}

.icon-wrapper {
  margin-bottom: 24px;
  
  .error-icon {
    color: #d4af37;
  }
}

.error-code {
  font-size: 120px;
  font-weight: 700;
  color: #d4af37;
  margin: 0;
  line-height: 1;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.error-title {
  font-size: 28px;
  font-weight: 600;
  color: #2c1810;
  margin: 16px 0 12px;
}

.error-desc {
  font-size: 15px;
  color: #666;
  margin-bottom: 40px;
}

.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  
  .el-button--primary {
    background: linear-gradient(135deg, #d4af37, #b8960c);
    border: none;
    
    &:hover {
      background: linear-gradient(135deg, #e5c158, #c9a71d);
    }
  }
}
</style>
