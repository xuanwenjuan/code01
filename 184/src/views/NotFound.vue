<template>
  <div class="not-found-page">
    <div class="container flex-center">
      <div class="content">
        <div class="error-code">404</div>
        <h1 class="title">页面不存在</h1>
        <p class="desc">抱歉，您访问的页面不存在或已被移除</p>
        <div class="actions">
          <el-button type="primary" size="large" @click="goHome">
            <el-icon><House /></el-icon>
            返回首页
          </el-button>
          <el-button size="large" @click="goBack">
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

const router = useRouter()

function goHome() {
  router.push('/')
}

function goBack() {
  router.back()
}
</script>

<style scoped lang="scss">
.not-found-page {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.content {
  text-align: center;
  
  .error-code {
    font-size: 120px;
    font-weight: bold;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1;
    margin-bottom: 20px;
  }
  
  .title {
    font-size: 28px;
    color: #303133;
    margin-bottom: 12px;
  }
  
  .desc {
    font-size: 15px;
    color: #909399;
    margin-bottom: 32px;
  }
  
  .actions {
    display: flex;
    gap: 16px;
    justify-content: center;
  }
}
</style>
