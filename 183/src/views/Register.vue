<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <el-icon :size="48" color="#8b6914"><Camera /></el-icon>
          <h1 class="register-title">创建账户</h1>
          <p class="register-subtitle">加入复古胶片相机爱好者社区</p>
        </div>
        
        <el-form 
          ref="registerFormRef"
          :model="registerForm" 
          :rules="registerRules" 
          class="register-form"
          label-width="100px"
        >
          <el-form-item label="用户名" prop="username">
            <el-input 
              v-model="registerForm.username" 
              placeholder="请输入用户名" 
              size="large"
            />
          </el-form-item>
          
          <el-form-item label="昵称" prop="nickname">
            <el-input 
              v-model="registerForm.nickname" 
              placeholder="请输入昵称" 
              size="large"
            />
          </el-form-item>
          
          <el-form-item label="邮箱" prop="email">
            <el-input 
              v-model="registerForm.email" 
              placeholder="请输入邮箱地址" 
              size="large"
            />
          </el-form-item>
          
          <el-form-item label="手机号" prop="phone">
            <el-input 
              v-model="registerForm.phone" 
              placeholder="请输入手机号码" 
              size="large"
            />
          </el-form-item>
          
          <el-form-item label="密码" prop="password">
            <el-input 
              v-model="registerForm.password" 
              type="password" 
              placeholder="请输入密码" 
              size="large"
              show-password
            />
          </el-form-item>
          
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input 
              v-model="registerForm.confirmPassword" 
              type="password" 
              placeholder="请再次输入密码" 
              size="large"
              show-password
            />
          </el-form-item>
          
          <el-form-item label="用户类型" prop="role">
            <el-radio-group v-model="registerForm.role" size="large">
              <el-radio value="user">普通用户</el-radio>
              <el-radio value="merchant">相机商家</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="店铺名称" prop="shopName" v-if="registerForm.role === 'merchant'">
            <el-input 
              v-model="registerForm.shopName" 
              placeholder="请输入店铺名称" 
              size="large"
            />
          </el-form-item>
          
          <el-form-item label="店铺简介" prop="shopDescription" v-if="registerForm.role === 'merchant'">
            <el-input 
              v-model="registerForm.shopDescription" 
              type="textarea" 
              :rows="3"
              placeholder="请输入店铺简介" 
            />
          </el-form-item>
          
          <el-button 
            type="primary" 
            size="large" 
            class="register-btn"
            :loading="loading"
            @click="handleRegister"
          >
            注册
          </el-button>
        </el-form>
        
        <div class="register-footer">
          <p>
            已有账户？
            <router-link to="/login" class="login-link">立即登录</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { Camera } from '@element-plus/icons-vue'
import { validateRules } from '@/utils/validation'

const router = useRouter()
const userStore = useUserStore()

const registerFormRef = ref(null)
const loading = ref(false)

const registerForm = reactive({
  username: '',
  nickname: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  role: 'user',
  shopName: '',
  shopDescription: ''
})

const passwordRef = computed(() => registerForm.password)

const registerRules = {
  username: validateRules.username,
  nickname: validateRules.nickname,
  email: validateRules.email,
  phone: validateRules.phone,
  password: validateRules.password,
  confirmPassword: validateRules.confirmPassword(passwordRef),
  shopName: [
    {
      validator: (rule, value, callback) => {
        if (registerForm.role === 'merchant' && !value) {
          callback(new Error('请输入店铺名称'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    loading.value = true
    try {
      const { confirmPassword, ...userData } = registerForm
      await userStore.register(userData)
      ElMessage.success('注册成功，请登录')
      router.push('/login')
    } catch (error) {
      ElMessage.error(error.message || '注册失败')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style lang="scss" scoped>
.register-page {
  min-height: calc(100vh - 70px - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #f5e6c8 0%, #e8dcc0 100%);
}

.register-container {
  max-width: 600px;
  width: 100%;
}

.register-card {
  background: #fff;
  border-radius: 20px;
  padding: 50px;
  box-shadow: 0 20px 60px rgba(93, 78, 55, 0.15);
}

.register-header {
  text-align: center;
  margin-bottom: 40px;
}

.register-title {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin: 16px 0 8px;
}

.register-subtitle {
  font-size: 14px;
  color: #888;
}

.register-form {
  margin-bottom: 24px;
}

.register-btn {
  width: 100%;
  margin-top: 16px;
  background: #8b6914;
  border-color: #8b6914;
  
  &:hover {
    background: #a67c00;
    border-color: #a67c00;
  }
}

.register-footer {
  text-align: center;
  font-size: 14px;
  color: #666;
}

.login-link {
  color: #8b6914;
  font-weight: 600;
  
  &:hover {
    color: #a67c00;
  }
}

@media (max-width: 640px) {
  .register-card {
    padding: 30px 20px;
  }
  
  .register-form {
    :deep(.el-form-item) {
      .el-form-item__label {
        width: 80px !important;
      }
    }
  }
}
</style>
