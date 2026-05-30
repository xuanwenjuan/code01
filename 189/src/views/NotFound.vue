<template>
  <div class="not-found-page">
    <div class="container">
      <div class="not-found-content">
        <h1 class="error-code">404</h1>
        <h2 class="error-title">页面未找到</h2>
        <p class="error-desc">抱歉，您访问的页面不存在或已被移除</p>
        <el-button type="primary" size="large" @click="$router.push('/home')">
          返回首页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);

  .not-found-content {
    text-align: center;
    color: #fff;

    .error-code {
      font-size: 120px;
      font-weight: 700;
      margin-bottom: 16px;
      text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .error-title {
      font-size: 32px;
      font-weight: 600;
      margin-bottom: 16px;
    }

    .error-desc {
      font-size: 16px;
      margin-bottom: 32px;
      opacity: 0.9;
    }

    .el-button {
      background: #fff;
      color: $primary-color;
      border: none;
      padding: 12px 32px;
      font-size: 16px;

      &:hover {
        background: #f5f5f5;
        color: $primary-color;
      }
    }
  }
}
</style>
