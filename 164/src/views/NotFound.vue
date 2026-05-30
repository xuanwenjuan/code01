<template>
  <div class="not-found-page">
    <div class="content">
      <div class="emoji">🌸</div>
      <h1 class="code">404</h1>
      <p class="message">页面不存在或已被移除</p>
      <el-button type="primary" size="large" @click="goHome">返回首页</el-button>
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

<style lang="scss" scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fff5f7 0%, #fff0f3 100%);
  
  .content {
    text-align: center;
    
    .emoji {
      font-size: 80px;
      margin-bottom: 20px;
    }
    
    .code {
      font-size: 120px;
      font-weight: bold;
      background: linear-gradient(135deg, $primary-color, $primary-dark);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 20px;
    }
    
    .message {
      font-size: 18px;
      color: $text-secondary;
      margin-bottom: 30px;
    }
    
    .el-button {
      height: 48px;
      padding: 0 40px;
      font-size: 16px;
    }
  }
}
</style>
