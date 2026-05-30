<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-card vintage-border">
        <div class="register-header">
          <h2>创建新账号</h2>
          <p>加入古韵饰品，开启复古之旅</p>
        </div>
        
        <el-form 
          ref="registerFormRef"
          :model="registerForm" 
          :rules="registerRules" 
          class="register-form"
          @submit.prevent="handleRegister"
        >
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
              :prefix-icon="Avatar"
            />
          </el-form-item>
          
          <el-form-item prop="email">
            <el-input 
              v-model="registerForm.email" 
              placeholder="请输入邮箱"
              size="large"
              :prefix-icon="Message"
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
            />
          </el-form-item>
          
          <el-form-item prop="role">
            <el-radio-group v-model="registerForm.role" size="large">
              <el-radio value="user">普通用户</el-radio>
              <el-radio value="merchant">饰品商家</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item v-if="registerForm.role === 'merchant'" prop="shopName">
            <el-input 
              v-model="registerForm.shopName" 
              placeholder="请输入店铺名称"
              size="large"
              :prefix-icon="Shop"
            />
          </el-form-item>
          
          <el-form-item prop="agreement">
            <el-checkbox v-model="registerForm.agreement">
              我已阅读并同意<a href="#">《用户协议》</a>和<a href="#">《隐私政策》</a>
            </el-checkbox>
          </el-form-item>
          
          <el-form-item>
            <el-button 
              type="primary" 
              size="large" 
              class="register-btn"
              :loading="userStore.loading"
              @click="handleRegister"
            >
              注册
            </el-button>
          </el-form-item>
        </el-form>
        
        <div class="register-footer">
          <p>已有账号？<router-link to="/login">立即登录</router-link></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Message, Phone, Avatar, Shop } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { validators, createValidator } from '@/utils/validators'

const router = useRouter()
const userStore = useUserStore()

const registerFormRef = ref(null)

const registerForm = reactive({
  username: '',
  nickname: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  role: 'user',
  shopName: '',
  agreement: false
})

const validateConfirmPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请确认密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const validateAgreement = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请阅读并同意用户协议'))
  } else {
    callback()
  }
}

const validateShopName = (rule, value, callback) => {
  if (registerForm.role === 'merchant' && !value) {
    callback(new Error('请输入店铺名称'))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { 
      validator: createValidator({
        ...validators.username,
        requiredMessage: '请输入用户名'
      }), 
      trigger: 'blur' 
    }
  ],
  nickname: [
    { 
      validator: createValidator({
        ...validators.nickname,
        requiredMessage: '请输入昵称'
      }), 
      trigger: 'blur' 
    }
  ],
  email: [
    { 
      validator: createValidator({
        ...validators.email,
        requiredMessage: '请输入邮箱'
      }), 
      trigger: 'blur' 
    }
  ],
  phone: [
    { 
      validator: createValidator({
        ...validators.phone,
        requiredMessage: '请输入手机号'
      }), 
      trigger: 'blur' 
    }
  ],
  password: [
    { 
      validator: createValidator({
        ...validators.password,
        requiredMessage: '请输入密码'
      }), 
      trigger: 'blur' 
    }
  ],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }],
  agreement: [{ validator: validateAgreement, trigger: 'change' }],
  shopName: [{ validator: validateShopName, trigger: 'blur' }]
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  try {
    await registerFormRef.value.validate()
    
    const userData = {
      username: registerForm.username,
      password: registerForm.password,
      nickname: registerForm.nickname,
      email: registerForm.email,
      phone: registerForm.phone,
      role: registerForm.role
    }
    
    if (registerForm.role === 'merchant') {
      userData.shopName = registerForm.shopName
      userData.shopDescription = ''
    }
    
    await userStore.register(userData)
    ElMessage.success('注册成功')
    router.push('/')
  } catch (error) {
    if (error instanceof Error) {
      ElMessage.error(error.message)
    }
  }
}
</script>

<style lang="scss" scoped>
.register-page {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f0e1 0%, #e8dcc4 100%);
  padding: 40px 20px;
}

.register-container {
  width: 100%;
  max-width: 500px;
}

.register-card {
  background: #fff;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.register-header {
  text-align: center;
  margin-bottom: 32px;
  
  h2 {
    font-size: 28px;
    font-weight: 700;
    color: #2c1810;
    margin-bottom: 8px;
  }
  
  p {
    font-size: 14px;
    color: #999;
  }
}

.register-form {
  :deep(.el-form-item) {
    margin-bottom: 20px;
  }
  
  :deep(.el-input__wrapper) {
    border-radius: 8px;
    padding: 8px 16px;
  }
  
  :deep(.el-input__wrapper:hover) {
    box-shadow: 0 0 0 1px #d4af37;
  }
  
  :deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px #d4af37;
  }
  
  :deep(.el-radio__input.is-checked .el-radio__inner) {
    border-color: #d4af37;
    background: #d4af37;
  }
  
  :deep(.el-radio__input.is-checked + .el-radio__label) {
    color: #8b6914;
  }
}

.register-btn {
  width: 100%;
  background: linear-gradient(135deg, #d4af37, #b8960c);
  border: none;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  padding: 14px;
  
  &:hover {
    background: linear-gradient(135deg, #e5c158, #c9a71d);
  }
}

.register-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #666;
  
  a {
    color: #d4af37;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
