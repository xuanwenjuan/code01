<template>
  <div class="not-found-page">
    <div class="container">
      <div class="content">
        <h1 class="error-code">404</h1>
        <h2 class="error-title">页面不存在</h2>
        <p class="error-desc">抱歉，您访问的页面不存在或已被移除</p>
        <el-button type="primary" size="large" @click="goHome">
          <el-icon><House /></el-icon>
          返回首页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => router.push('/')
</script>

<style lang="scss" scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
}

.content {
  text-align: center;
  
  .error-code {
    font-size: 120px;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 16px;
  }
  
  .error-title {
    font-size: 32px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 12px;
  }
  
  .error-desc {
    font-size: 16px;
    color: #909399;
    margin-bottom: 32px;
  }
}
</style>
