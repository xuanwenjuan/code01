<template>
  <div class="not-found-page">
    <div class="container">
      <div class="not-found-content">
        <div class="error-code">404</div>
        <h1 class="error-title">页面不存在</h1>
        <p class="error-desc">抱歉，您访问的页面不存在或已被移除</p>
        <div class="error-actions">
          <el-button type="primary" size="large" @click="goHome">
            返回首页
          </el-button>
          <el-button size="large" @click="goBack">
            返回上一页
          </el-button>
        </div>
        <div class="error-illustration">
          <span class="icon">🎨</span>
        </div>
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
  router.back()
}
</script>

<style lang="scss" scoped>
.not-found-page {
  min-height: calc(100vh - 60px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
}

.not-found-content {
  text-align: center;
  position: relative;
  
  .error-code {
    font-size: 120px;
    font-weight: 700;
    color: #667eea;
    line-height: 1;
    margin-bottom: 20px;
    text-shadow: 4px 4px 0 rgba(102, 126, 234, 0.1);
  }
  
  .error-title {
    font-size: 32px;
    color: #333;
    margin-bottom: 16px;
  }
  
  .error-desc {
    font-size: 16px;
    color: #666;
    margin-bottom: 32px;
  }
  
  .error-actions {
    display: flex;
    gap: 16px;
    justify-content: center;
    
    .el-button {
      min-width: 140px;
    }
  }
  
  .error-illustration {
    position: absolute;
    top: -20px;
    right: -40px;
    opacity: 0.1;
    
    .icon {
      font-size: 200px;
    }
  }
}

@media (max-width: 768px) {
  .not-found-content {
    .error-code {
      font-size: 80px;
    }
    
    .error-title {
      font-size: 24px;
    }
    
    .error-actions {
      flex-direction: column;
      
      .el-button {
        width: 100%;
      }
    }
    
    .error-illustration {
      right: 0;
      
      .icon {
        font-size: 120px;
      }
    }
  }
}
</style>
