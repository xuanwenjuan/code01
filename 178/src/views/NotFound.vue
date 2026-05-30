<template>
  <div class="not-found-page">
    <div class="container">
      <div class="content">
        <div class="error-code">404</div>
        <h1 class="error-title">页面不存在</h1>
        <p class="error-desc">抱歉，您访问的页面不存在或已被移除</p>
        <el-button type="primary" size="large" @click="goHome">
          <el-icon><HomeFilled /></el-icon>
          返回首页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.not-found-page {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.content {
  text-align: center;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  color: #4caf50;
  text-shadow: 4px 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.error-title {
  font-size: 32px;
  color: #333;
  margin: 0 0 16px 0;
}

.error-desc {
  font-size: 16px;
  color: #666;
  margin: 0 0 30px 0;
}
</style>
