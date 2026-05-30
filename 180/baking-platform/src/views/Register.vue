<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  phone: '',
  email: '',
  role: 'user'
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9!@#$%^&*]+$/, message: '密码只能包含字母、数字和特殊字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

async function handleRegister(formEl) {
  if (!formEl) return
  try {
    await formEl.validate()
    loading.value = true
    const { confirmPassword, ...userData } = registerForm
    await userStore.register(userData)
    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } catch (err) {
    if (err.message) {
      ElMessage.error(err.message)
    }
  } finally {
    loading.value = false
  }
}

function goToLogin() {
  router.push('/login')
}
</script>

<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-left">
        <div class="register-banner">
          <el-icon :size="80" color="#fff"><Goods /></el-icon>
          <h1>烘焙原料商城</h1>
          <p>加入我们，开启烘焙之旅</p>
        </div>
      </div>
      <div class="register-right">
        <div class="register-form-wrapper">
          <h2 class="register-title">创建账号</h2>
          <p class="register-subtitle">填写以下信息完成注册</p>
          
          <el-form 
            ref="registerFormRef"
            :model="registerForm" 
            :rules="rules" 
            size="large"
            label-width="80px"
          >
            <el-form-item label="用户名" prop="username">
              <el-input v-model="registerForm.username" placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="registerForm.nickname" placeholder="请输入昵称" />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" show-password />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" show-password />
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="registerForm.phone" placeholder="请输入手机号" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="registerForm.email" placeholder="请输入邮箱" />
            </el-form-item>
            <el-form-item label="账号类型">
              <el-radio-group v-model="registerForm.role">
                <el-radio value="user">普通用户</el-radio>
                <el-radio value="merchant">烘焙商家</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item>
              <el-button 
                type="primary" 
                :loading="loading"
                class="register-btn"
                @click="handleRegister(registerFormRef)"
              >
                注册
              </el-button>
            </el-form-item>
          </el-form>

          <div class="register-footer">
            <span>已有账号？</span>
            <el-button text @click="goToLogin">立即登录</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e6a23c 0%, #f56c6c 100%);
  padding: 40px 20px;
}

.register-container {
  width: 1000px;
  min-height: 680px;
  display: flex;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.register-left {
  width: 400px;
  background: linear-gradient(135deg, #e6a23c 0%, #f56c6c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.register-banner {
  text-align: center;
  color: #fff;
}

.register-banner h1 {
  font-size: 32px;
  margin: 20px 0 12px 0;
}

.register-banner p {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

.register-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  overflow-y: auto;
}

.register-form-wrapper {
  width: 100%;
  max-width: 400px;
}

.register-title {
  font-size: 28px;
  color: #303133;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.register-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0 0 24px 0;
}

.register-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
}

.register-footer {
  text-align: center;
  font-size: 14px;
  color: #606266;
}
</style>
