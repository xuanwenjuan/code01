<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-left">
        <div class="brand">
          <span class="logo">🌸</span>
          <h1>花语轩</h1>
          <p>专业的鲜花花艺礼品订购平台</p>
        </div>
        <div class="features">
          <div class="feature-item">
            <el-icon :size="24"><Van /></el-icon>
            <span>同城2小时送达</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24"><Present /></el-icon>
            <span>精美包装</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24"><Medal /></el-icon>
            <span>品质保证</span>
          </div>
        </div>
      </div>
      
      <div class="register-right">
        <h2 class="form-title">创建账户</h2>
        <p class="form-subtitle">加入我们，开启美好购物体验</p>
        
        <el-form :model="registerForm" :rules="registerRules" ref="registerFormRef" class="register-form">
          <el-form-item prop="username">
            <el-input 
              v-model="registerForm.username" 
              placeholder="请输入用户名"
              size="large"
              :prefix-icon="User"
            />
          </el-form-item>
          <el-form-item prop="nickname">
            <el-input 
              v-model="registerForm.nickname" 
              placeholder="请输入昵称"
              size="large"
              :prefix-icon="UserFilled"
            />
          </el-form-item>
          <el-form-item prop="phone">
            <el-input 
              v-model="registerForm.phone" 
              placeholder="请输入手机号"
              size="large"
              :prefix-icon="Phone"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input 
              v-model="registerForm.password" 
              type="password"
              placeholder="请输入密码"
              size="large"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <el-input 
              v-model="registerForm.confirmPassword" 
              type="password"
              placeholder="请确认密码"
              size="large"
              :prefix-icon="Lock"
              show-password
              @keyup.enter="handleRegister"
            />
          </el-form-item>
          <el-form-item>
            <el-button 
              type="primary" 
              size="large" 
              class="register-btn"
              :loading="loading"
              @click="handleRegister"
            >
              注册
            </el-button>
          </el-form-item>
        </el-form>
        
        <div class="form-footer">
          <span>已有账户？</span>
          <router-link to="/login" class="login-link">立即登录</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, UserFilled, Phone, Lock, Van, Present, Medal } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const registerFormRef = ref(null)

const registerForm = ref({
  username: '',
  nickname: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== registerForm.value.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate()
  
  try {
    loading.value = true
    const { confirmPassword, ...userData } = registerForm.value
    await userStore.registerAction(userData)
    ElMessage.success('注册成功')
    router.push('/')
  } catch (error) {
    ElMessage.error(error.message || '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.register-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 900px;
  width: 100%;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.register-left {
  background: linear-gradient(135deg, $primary-color 0%, $primary-dark 100%);
  padding: 60px 40px;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  .brand {
    text-align: center;
    margin-bottom: 60px;
    
    .logo {
      font-size: 64px;
      display: block;
      margin-bottom: 16px;
    }
    
    h1 {
      font-size: 32px;
      margin-bottom: 8px;
    }
    
    p {
      font-size: 14px;
      opacity: 0.9;
    }
  }
  
  .features {
    display: flex;
    flex-direction: column;
    gap: 20px;
    
    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 15px;
      
      el-icon {
        background: rgba(255, 255, 255, 0.2);
        padding: 8px;
        border-radius: 50%;
      }
    }
  }
}

.register-right {
  padding: 60px 50px;
  max-height: 100vh;
  overflow-y: auto;
  
  .form-title {
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 8px;
    color: $text-primary;
  }
  
  .form-subtitle {
    font-size: 14px;
    color: $text-secondary;
    margin-bottom: 30px;
  }
  
  .register-form {
    .el-form-item {
      margin-bottom: 20px;
    }
    
    .register-btn {
      width: 100%;
      height: 48px;
      font-size: 16px;
      background: linear-gradient(135deg, $primary-color, $primary-dark);
      border: none;
      
      &:hover {
        opacity: 0.9;
      }
    }
  }
  
  .form-footer {
    text-align: center;
    font-size: 14px;
    color: $text-secondary;
    
    .login-link {
      color: $primary-color;
      margin-left: 4px;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
}

@media (max-width: 768px) {
  .register-container {
    grid-template-columns: 1fr;
  }
  
  .register-left {
    display: none;
  }
  
  .register-right {
    padding: 40px 30px;
  }
}
</style>
