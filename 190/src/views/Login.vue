<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <el-icon :size="48" color="#409eff"><Tools /></el-icon>
        <h1>牧采通</h1>
        <p>畜牧养殖器械采购平台</p>
      </div>

      <el-card class="login-card">
        <el-tabs v-model="activeTab" class="login-tabs">
          <el-tab-pane label="登录" name="login">
            <el-form 
              ref="loginFormRef" 
              :model="loginForm" 
              :rules="loginRules" 
              label-position="top"
            >
              <el-form-item label="用户类型" prop="role">
                <el-radio-group v-model="loginForm.role" size="large" style="width: 100%">
                  <el-radio-button value="purchaser" style="flex: 1">
                    <el-icon><User /></el-icon>
                    养殖场采购方
                  </el-radio-button>
                  <el-radio-button value="supplier" style="flex: 1">
                    <el-icon><OfficeBuilding /></el-icon>
                    器械供货商
                  </el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="用户名" prop="username">
                <el-input 
                  v-model="loginForm.username" 
                  placeholder="请输入用户名" 
                  size="large"
                  :prefix-icon="User"
                />
              </el-form-item>
              <el-form-item label="密码" prop="password">
                <el-input 
                  v-model="loginForm.password" 
                  type="password" 
                  placeholder="请输入密码" 
                  size="large"
                  :prefix-icon="Lock"
                  show-password
                />
              </el-form-item>
              <el-button 
                type="primary" 
                size="large" 
                block 
                :loading="loading"
                @click="handleLogin"
              >
                登录
              </el-button>
            </el-form>
            <div class="login-tips">
              <p>测试账号：</p>
              <p>采购方：farm123 / 123456</p>
              <p>供货商：supplier123 / 123456</p>
            </div>
          </el-tab-pane>

          <el-tab-pane label="注册" name="register">
            <el-form 
              ref="registerFormRef" 
              :model="registerForm" 
              :rules="registerRules" 
              label-position="top"
            >
              <el-form-item label="用户类型" prop="role">
                <el-radio-group v-model="registerForm.role" size="large" style="width: 100%">
                  <el-radio-button value="purchaser" style="flex: 1">
                    <el-icon><User /></el-icon>
                    养殖场采购方
                  </el-radio-button>
                  <el-radio-button value="supplier" style="flex: 1">
                    <el-icon><OfficeBuilding /></el-icon>
                    器械供货商
                  </el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="用户名" prop="username">
                <el-input 
                  v-model="registerForm.username" 
                  placeholder="请输入用户名（4-16位字母或数字）" 
                  size="large"
                  :prefix-icon="User"
                />
              </el-form-item>
              <el-form-item label="密码" prop="password">
                <el-input 
                  v-model="registerForm.password" 
                  type="password" 
                  placeholder="请输入密码（6-16位，包含字母和数字）" 
                  size="large"
                  :prefix-icon="Lock"
                  show-password
                />
              </el-form-item>
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input 
                  v-model="registerForm.confirmPassword" 
                  type="password" 
                  placeholder="请再次输入密码" 
                  size="large"
                  :prefix-icon="Lock"
                  show-password
                />
              </el-form-item>
              <el-form-item label="手机号" prop="phone">
                <el-input 
                  v-model="registerForm.phone" 
                  placeholder="请输入手机号" 
                  size="large"
                  :prefix-icon="Phone"
                />
              </el-form-item>
              <el-form-item label="企业名称" prop="company">
                <el-input 
                  v-model="registerForm.company" 
                  placeholder="请输入企业/养殖场名称" 
                  size="large"
                  :prefix-icon="OfficeBuilding"
                />
              </el-form-item>
              <el-button 
                type="success" 
                size="large" 
                block 
                :loading="registerLoading"
                @click="handleRegister"
              >
                注册
              </el-button>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { User, Lock, Phone, OfficeBuilding } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const activeTab = ref('login')
const loading = ref(false)
const registerLoading = ref(false)
const loginFormRef = ref(null)
const registerFormRef = ref(null)

const loginForm = reactive({
  username: '',
  password: '',
  role: 'purchaser'
})

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  phone: '',
  company: '',
  role: 'purchaser'
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]{4,16}$/, message: '用户名应为4-16位字母、数字或下划线', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 16, message: '密码长度为6-16位', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择用户类型', trigger: 'change' }
  ]
}

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]{4,16}$/, message: '用户名应为4-16位字母、数字或下划线', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { pattern: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,16}$/, message: '密码需包含字母和数字，6-16位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  company: [
    { required: true, message: '请输入企业名称', trigger: 'blur' },
    { min: 2, max: 50, message: '企业名称长度为2-50个字符', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择用户类型', trigger: 'change' }
  ]
}

async function handleLogin() {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await userStore.login(loginForm.username, loginForm.password, loginForm.role)
        ElMessage.success('登录成功')
        const redirect = route.query.redirect || '/'
        router.push(redirect)
      } catch (err) {
        ElMessage.error(err.message || '登录失败，请检查用户名和密码')
      } finally {
        loading.value = false
      }
    }
  })
}

async function handleRegister() {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate((valid) => {
    if (valid) {
      registerLoading.value = true
      setTimeout(() => {
        ElMessage.success('注册成功！请使用账号登录')
        activeTab.value = 'login'
        loginForm.username = registerForm.username
        loginForm.role = registerForm.role
        registerLoading.value = false
      }, 1000)
    }
  })
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.login-container {
  width: 480px;
}

.login-header {
  text-align: center;
  color: #fff;
  margin-bottom: 30px;
}

.login-header h1 {
  font-size: 36px;
  font-weight: bold;
  margin: 10px 0 5px;
}

.login-header p {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

.login-card {
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.login-tabs :deep(.el-tabs__header) {
  margin: 0 0 20px;
}

.login-tabs :deep(.el-tabs__nav) {
  width: 100%;
}

.login-tabs :deep(.el-tabs__item) {
  flex: 1;
  text-align: center;
  font-size: 16px;
}

.login-tips {
  margin-top: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 6px;
  font-size: 12px;
  color: #909399;
  line-height: 1.8;
}

.login-tips p {
  margin: 0;
}
</style>
