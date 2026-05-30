<template>
  <div class="not-found-page">
    <div class="not-found-content">
      <h1 class="error-code">404</h1>
      <h2 class="error-title">页面不存在</h2>
      <p class="error-desc">抱歉，您访问的页面不存在或已被移除</p>
      <el-button type="primary" size="large" @click="goHome">
        返回首页
      </el-button>
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
  background: linear-gradient(135deg, #fff5f7 0%, #f0f7ff 100%);

  .not-found-content {
    text-align: center;

    .error-code {
      font-size: 120px;
      font-weight: bold;
      color: $primary-color;
      margin: 0;
      line-height: 1;
    }

    .error-title {
      font-size: 32px;
      color: $text-primary;
      margin: 20px 0 12px;
    }

    .error-desc {
      font-size: 16px;
      color: $text-secondary;
      margin-bottom: 32px;
    }

    .el-button {
      background: $primary-color;
      border-color: $primary-color;
      padding: 0 40px;
      font-size: 16px;

      &:hover {
        background: $primary-dark;
        border-color: $primary-dark;
      }
    }
  }
}
</style>
