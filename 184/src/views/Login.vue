<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-left">
        <div class="brand-info">
          <el-icon :size="64" color="#fff"><Brush /></el-icon>
          <h1>模型喷涂耗材采购平台</h1>
          <p>汇聚全球知名品牌，为模型爱好者提供优质产品和服务</p>
        </div>
        <div class="features">
          <div class="feature-item">
            <el-icon :size="24"><CircleCheck /></el-icon>
            <span>正品保障，官方授权</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24"><CircleCheck /></el-icon>
            <span>极速发货，全国包邮</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24"><CircleCheck /></el-icon>
            <span>七天无理由退换</span>
          </div>
        </div>
      </div>
      
      <div class="login-right">
        <div class="login-form-wrapper">
          <h2 class="form-title">账号登录</h2>
          <p class="form-subtitle">请选择您的身份登录</p>
          
          <el-tabs v-model="loginType" class="login-tabs">
            <el-tab-pane label="采购用户" name="buyer" />
            <el-tab-pane label="供应商" name="supplier" />
          </el-tabs>
          
          <el-form 
            ref="loginFormRef"
            :model="loginForm" 
            :rules="loginRules"
            class="login-form"
          >
            <el-form-item prop="username">
              <el-input 
                v-model="loginForm.username" 
                placeholder="请输入用户名"
                size="large"
                :prefix-icon="User"
              />
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input 
                v-model="loginForm.password" 
                type="password"
                placeholder="请输入密码"
                size="large"
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            
            <el-form-item>
              <el-button 
                type="primary" 
                size="large" 
                class="login-btn"
                :loading="loading"
                @click="handleLogin"
              >
                {{ loading ? '登录中...' : '登 录' }}
              </el-button>
            </el-form-item>
          </el-form>
          
          <div class="demo-accounts">
            <p class="demo-title">演示账号：</p>
            <div class="demo-item">
              <span class="demo-label">采购用户：</span>
              <span class="demo-value">buyer001 / 123456</span>
            </div>
            <div class="demo-item">
              <span class="demo-label">供应商：</span>
              <span class="demo-value">supplier001 / 123456</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { validators } from '@/utils/validators'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref(null)
const loading = ref(false)
const loginType = ref('buyer')

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: validators.username,
  password: validators.password
}

async function handleLogin() {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
  } catch (error) {
    return
  }
  
  loading.value = true
  try {
    const user = await userStore.login(loginForm.username, loginForm.password)
    
    if (loginType.value === 'buyer' && user.role !== 'buyer') {
      userStore.logout()
      ElMessage.error('该账号不是采购用户，请切换登录类型')
      loading.value = false
      return
    }
    
    if (loginType.value === 'supplier' && user.role !== 'supplier') {
      userStore.logout()
      ElMessage.error('该账号不是供应商，请切换登录类型')
      loading.value = false
      return
    }
    
    ElMessage.success('登录成功')
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (error) {
    ElMessage.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (userStore.isLoggedIn) {
    router.push('/')
  }
})
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-container {
  display: flex;
  width: 100%;
  max-width: 900px;
  min-height: 560px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  padding: 60px 40px;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.brand-info {
  h1 {
    font-size: 28px;
    margin: 20px 0 12px;
    font-weight: 600;
  }
  
  p {
    font-size: 14px;
    opacity: 0.85;
    line-height: 1.6;
  }
}

.features {
  .feature-item {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    font-size: 14px;
    opacity: 0.9;
  }
}

.login-right {
  width: 420px;
  padding: 50px 40px;
  display: flex;
  align-items: center;
}

.login-form-wrapper {
  width: 100%;
  
  .form-title {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 8px;
  }
  
  .form-subtitle {
    color: #909399;
    font-size: 14px;
    margin-bottom: 24px;
  }
}

.login-tabs {
  margin-bottom: 24px;
  
  :deep(.el-tabs__nav) {
    width: 100%;
  }
  
  :deep(.el-tabs__item) {
    flex: 1;
    text-align: center;
  }
}

.login-form {
  .login-btn {
    width: 100%;
    height: 48px;
    font-size: 16px;
    margin-top: 8px;
  }
}

.demo-accounts {
  margin-top: 24px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  
  .demo-title {
    font-size: 13px;
    color: #606266;
    margin-bottom: 10px;
    font-weight: 500;
  }
  
  .demo-item {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    margin-bottom: 6px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .demo-label {
      color: #909399;
    }
    
    .demo-value {
      color: #409eff;
      font-family: monospace;
    }
  }
}

@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }
  
  .login-left {
    padding: 30px 20px;
  }
  
  .login-right {
    width: 100%;
    padding: 30px 20px;
  }
}
</style>
