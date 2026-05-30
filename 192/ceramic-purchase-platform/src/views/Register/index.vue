<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <div class="logo">
            <span class="logo-icon">🏺</span>
            <span class="logo-text">瓷源购</span>
          </div>
          <p class="welcome-text">注册成为陶瓷艺术原料采购平台会员</p>
        </div>

        <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          class="register-form"
          label-width="100px"
        >
          <el-form-item label="用户类型" prop="role">
            <el-radio-group v-model="registerForm.role" size="large">
              <el-radio-button value="buyer">
                <el-icon><ShoppingBag /></el-icon> 我是采购方
              </el-radio-button>
              <el-radio-button value="supplier">
                <el-icon><OfficeBuilding /></el-icon> 我是供货商
              </el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="registerForm.username"
              placeholder="请输入4-20位字母、数字或下划线"
              size="large"
            />
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入6-20位字母、数字或下划线"
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

          <el-form-item label="企业名称" prop="name">
            <el-input
              v-model="registerForm.name"
              placeholder="请输入企业/工坊名称"
              size="large"
            />
          </el-form-item>

          <el-form-item label="联系电话" prop="phone">
            <el-input
              v-model="registerForm.phone"
              placeholder="请输入11位手机号码"
              size="large"
              maxlength="11"
            />
          </el-form-item>

          <el-form-item label="电子邮箱" prop="email">
            <el-input
              v-model="registerForm.email"
              placeholder="请输入邮箱地址"
              size="large"
            />
          </el-form-item>

          <el-form-item label="详细地址" prop="address">
            <el-input
              v-model="registerForm.address"
              placeholder="请输入详细地址"
              size="large"
              type="textarea"
              :rows="2"
            />
          </el-form-item>

          <el-form-item label="营业执照" prop="businessLicense">
            <el-input
              v-model="registerForm.businessLicense"
              placeholder="请输入统一社会信用代码"
              size="large"
              maxlength="18"
            />
          </el-form-item>

          <el-button
            type="primary"
            size="large"
            class="register-btn"
            :loading="loading"
            @click="handleRegister"
          >
            立即注册
          </el-button>

          <div class="form-footer">
            <span>已有账号？</span>
            <router-link to="/login" class="login-link">立即登录</router-link>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

const registerFormRef = ref<FormInstance>()
const loading = ref(false)

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  role: 'buyer',
  name: '',
  phone: '',
  email: '',
  address: '',
  businessLicense: ''
})

const validateUsername = (rule, value, callback) => {
  const usernameRegex = /^[a-zA-Z0-9_]{4,20}$/
  if (!value) {
    callback(new Error('请输入用户名'))
  } else if (!usernameRegex.test(value)) {
    callback(new Error('用户名必须是4-20位字母、数字或下划线'))
  } else {
    callback()
  }
}

const validatePassword = (rule, value, callback) => {
  const passwordRegex = /^[a-zA-Z0-9_]{6,20}$/
  if (!value) {
    callback(new Error('请输入密码'))
  } else if (!passwordRegex.test(value)) {
    callback(new Error('密码必须是6-20位字母、数字或下划线'))
  } else {
    callback()
  }
}

const validateConfirmPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const validatePhone = (rule, value, callback) => {
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!value) {
    callback(new Error('请输入手机号码'))
  } else if (!phoneRegex.test(value)) {
    callback(new Error('请输入正确的11位手机号码'))
  } else {
    callback()
  }
}

const validateEmail = (rule, value, callback) => {
  const emailRegex = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/
  if (!value) {
    callback(new Error('请输入邮箱地址'))
  } else if (!emailRegex.test(value)) {
    callback(new Error('请输入正确的邮箱地址'))
  } else {
    callback()
  }
}

const validateBusinessLicense = (rule, value, callback) => {
  const licenseRegex = /^[0-9A-HJ-NPQRTUWXY]{18}$/
  if (!value) {
    callback(new Error('请输入营业执照号码'))
  } else if (!licenseRegex.test(value)) {
    callback(new Error('请输入正确的18位统一社会信用代码'))
  } else {
    callback()
  }
}

const registerRules: FormRules = {
  username: [{ validator: validateUsername, trigger: 'blur' }],
  password: [{ validator: validatePassword, trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }],
  role: [{ required: true, message: '请选择用户类型', trigger: 'change' }],
  name: [{ required: true, message: '请输入企业/工坊名称', trigger: 'blur' }],
  phone: [{ validator: validatePhone, trigger: 'blur' }],
  email: [{ validator: validateEmail, trigger: 'blur' }],
  address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
  businessLicense: [{ validator: validateBusinessLicense, trigger: 'blur' }]
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  try {
    await registerFormRef.value.validate()
    loading.value = true
    
    const { confirmPassword, ...userData } = registerForm
    await userStore.register(userData)
    
    ElMessage.success('注册成功')
    router.push('/')
  } catch (error) {
    if (error instanceof Error) {
      ElMessage.error(error.message)
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.register-container {
  width: 100%;
  max-width: 600px;
}

.register-card {
  background: #fff;
  border-radius: 16px;
  padding: 48px 48px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.register-header {
  text-align: center;
  margin-bottom: 36px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
}

.logo-icon {
  font-size: 48px;
}

.logo-text {
  font-size: 32px;
  font-weight: bold;
  background: linear-gradient(135deg, #2c5c97, #4a90d9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-text {
  color: #606266;
  font-size: 15px;
}

.register-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  margin-top: 8px;
}

.form-footer {
  text-align: center;
  margin-top: 20px;
  color: #909399;
  font-size: 14px;
}

.login-link {
  color: #409eff;
  margin-left: 4px;
}

.login-link:hover {
  color: #66b1ff;
}
</style>
