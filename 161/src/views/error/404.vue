<template>
  <div class="error-page">
    <div class="error-container">
      <div class="error-code">404</div>
      <div class="error-message">
        <h2>页面不存在</h2>
        <p>抱歉，您访问的页面不存在或已被移除</p>
      </div>
      <div class="error-actions">
        <el-button type="primary" size="large" @click="goHome">返回首页</el-button>
        <el-button size="large" @click="goBack">返回上一页</el-button>
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

const goBack = () => {
  router.go(-1)
}
</script>

<style lang="scss" scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.error-container {
  text-align: center;
  color: #fff;
}

.error-code {
  font-size: 160px;
  font-weight: 700;
  line-height: 1;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.error-message {
  margin: 30px 0;

  h2 {
    font-size: 32px;
    margin: 0 0 12px 0;
  }

  p {
    font-size: 16px;
    opacity: 0.9;
    margin: 0;
  }
}

.error-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}
</style>
