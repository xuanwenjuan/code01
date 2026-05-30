<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-left">
        <div class="logo">
          <el-icon :size="64" color="#fff">
            <ShoppingBag />
          </el-icon>
          <h1>植物标本器材采购平台</h1>
          <p>专业的科研器材供应商</p>
        </div>
        <div class="features">
          <div class="feature-item">
            <el-icon :size="24"><CircleCheck /></el-icon>
            <span>正品保障，厂家直供</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24"><CircleCheck /></el-icon>
            <span>专业服务，售后无忧</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24"><CircleCheck /></el-icon>
            <span>批量采购，价格优惠</span>
          </div>
        </div>
      </div>
      
      <div class="login-right">
        <div class="login-form">
          <h2>账号登录</h2>
          <el-tabs v-model="loginType">
            <el-tab-pane label="采购方登录" name="buyer" />
            <el-tab-pane label="供货商登录" name="supplier" />
          </el-tabs>
          
          <el-form 
            :model="loginForm" 
            :rules="loginRules" 
            ref="loginFormRef"
            @keyup.enter="handleLogin"
          >
            <el-form-item prop="username">
              <el-input 
                v-model="loginForm.username" 
                placeholder="请输入账号"
                size="large"
                prefix-icon="User"
              />
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input 
                v-model="loginForm.password" 
                type="password"
                placeholder="请输入密码"
                size="large"
                prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            
            <el-button 
              type="primary" 
              size="large" 
              class="login-btn"
              :loading="loading"
              @click="handleLogin"
            >
              登录
            </el-button>
          </el-form>
          
          <div class="test-accounts">
            <p>测试账号：</p>
            <p v-if="loginType === 'buyer'">
              账号：buyer001 / 密码：buyer123456
            </p>
            <p v-else>
              账号：supplier001 / 密码：supplier123456
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { mockUsers } from '@/mock/data'
import { ShoppingBag, CircleCheck } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loginType = ref('buyer')
const loading = ref(false)
const loginFormRef = ref(null)

const loginForm = ref({
  username: '',
  password: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 4, max: 20, message: '账号长度在 4 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '密码只能包含字母、数字和下划线', trigger: 'blur' }
  ]
}

watch(loginType, () => {
  loginForm.value = { username: '', password: '' }
  if (loginFormRef.value) {
    loginFormRef.value.resetFields()
  }
})

async function handleLogin() {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    
    loading.value = true
    
    setTimeout(() => {
      const user = mockUsers.find(
        u => u.username === loginForm.value.username && 
             u.password === loginForm.value.password &&
             u.role === loginType.value
      )
      
      if (user) {
        const { password, ...userInfo } = user
        userStore.login(userInfo, 'mock-token-' + Date.now())
        ElMessage.success('登录成功')
        
        const redirect = route.query.redirect || '/'
        router.push(redirect)
      } else {
        ElMessage.error('账号或密码错误')
      }
      
      loading.value = false
    }, 1000)
  } catch (e) {
    console.log('表单验证失败')
  }
}
</script>

<style scoped>
.login-page {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.login-container {
  display: flex;
  width: 900px;
  max-width: 100%;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 40px;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.logo h1 {
  font-size: 24px;
  margin: 16px 0 8px 0;
}

.logo p {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.login-right {
  flex: 1;
  padding: 60px 40px;
}

.login-form h2 {
  font-size: 24px;
  margin: 0 0 24px 0;
  color: #303133;
}

.login-btn {
  width: 100%;
  margin-top: 8px;
}

.test-accounts {
  margin-top: 24px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  font-size: 12px;
  color: #909399;
}

.test-accounts p {
  margin: 4px 0;
}
</style>
