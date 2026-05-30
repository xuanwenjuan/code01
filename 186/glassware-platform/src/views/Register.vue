<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-left">
        <div class="brand">
          <el-icon size="48" color="#409eff"><Cup /></el-icon>
          <h1 class="brand-title">实验室玻璃器皿采购平台</h1>
          <p class="brand-desc">专业的实验室设备一站式采购服务平台</p>
        </div>
        <div class="features">
          <div class="feature-item">
            <el-icon size="24" color="#67c23a"><CircleCheck /></el-icon>
            <span>品质保证 正品行货</span>
          </div>
          <div class="feature-item">
            <el-icon size="24" color="#67c23a"><CircleCheck /></el-icon>
            <span>专业配送 快速到达</span>
          </div>
          <div class="feature-item">
            <el-icon size="24" color="#67c23a"><CircleCheck /></el-icon>
            <span>售后无忧 贴心服务</span>
          </div>
        </div>
      </div>
      <div class="register-right">
        <div class="register-form">
          <h2 class="form-title">注册新账号</h2>
          <el-form
            ref="registerFormRef"
            :model="registerForm"
            :rules="registerRules"
            label-position="top"
          >
            <el-form-item label="用户名" prop="username">
              <el-input
                v-model="registerForm.username"
                placeholder="请输入用户名"
                size="large"
                :prefix-icon="User"
              />
            </el-form-item>
            <el-form-item label="姓名" prop="name">
              <el-input
                v-model="registerForm.name"
                placeholder="请输入真实姓名"
                size="large"
                :prefix-icon="User"
              />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input
                v-model="registerForm.email"
                placeholder="请输入邮箱地址"
                size="large"
                :prefix-icon="Message"
              />
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
              <el-input
                v-model="registerForm.phone"
                placeholder="请输入手机号码"
                size="large"
                :prefix-icon="Phone"
              />
            </el-form-item>
            <el-form-item label="所属单位" prop="organization">
              <el-input
                v-model="registerForm.organization"
                placeholder="请输入所属单位"
                size="large"
                :prefix-icon="OfficeBuilding"
              />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="请输入密码"
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
                @keyup.enter="handleRegister"
              />
            </el-form-item>
            <el-form-item label="角色" prop="role">
              <el-radio-group v-model="registerForm.role" size="large" style="width: 100%">
                <el-radio-button value="buyer" style="width: 50%">采购用户</el-radio-button>
                <el-radio-button value="supplier" style="width: 50%">供应商</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-button
              type="primary"
              size="large"
              class="register-btn"
              :loading="loading"
              @click="handleRegister"
            >
              注 册
            </el-button>
          </el-form>
          <div class="form-footer">
            <span>已有账号？</span>
            <router-link to="/login" class="login-link">立即登录</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { User, Lock, Message, Phone, OfficeBuilding } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const registerFormRef = ref(null)
const loading = ref(false)

const registerForm = reactive({
  username: '',
  name: '',
  email: '',
  phone: '',
  organization: '',
  password: '',
  confirmPassword: '',
  role: 'buyer'
})

const validateUsername = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入用户名'))
  } else if (!/^[a-zA-Z0-9_]{4,20}$/.test(value)) {
    callback(new Error('用户名由4-20位字母、数字、下划线组成'))
  } else {
    callback()
  }
}

const validateName = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入真实姓名'))
  } else if (!/^[\u4e00-\u9fa5a-zA-Z]{2,20}$/.test(value)) {
    callback(new Error('姓名由2-20位中文或英文字母组成'))
  } else {
    callback()
  }
}

const validateEmail = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入邮箱地址'))
  } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
    callback(new Error('请输入正确的邮箱地址'))
  } else {
    callback()
  }
}

const validatePhone = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入手机号码'))
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('请输入正确的手机号码'))
  } else {
    callback()
  }
}

const validatePassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入密码'))
  } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d_]{6,20}$/.test(value)) {
    callback(new Error('密码需包含大小写字母和数字，长度6-20位'))
  } else {
    callback()
  }
}

const validateOrganization = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入所属单位'))
  } else if (value.length < 2) {
    callback(new Error('单位名称至少2个字符'))
  } else if (value.length > 100) {
    callback(new Error('单位名称不能超过100个字符'))
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

const registerRules = {
  username: [{ validator: validateUsername, trigger: 'blur' }],
  name: [{ validator: validateName, trigger: 'blur' }],
  email: [{ validator: validateEmail, trigger: 'blur' }],
  phone: [{ validator: validatePhone, trigger: 'blur' }],
  organization: [{ validator: validateOrganization, trigger: 'blur' }],
  password: [{ validator: validatePassword, trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }]
}

const handleRegister = () => {
  registerFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      setTimeout(() => {
        const { confirmPassword, ...userData } = registerForm
        userData.roleText = userData.role === 'buyer' ? '采购用户' : '器皿供应商'
        const result = userStore.register(userData)
        loading.value = false
        if (result.success) {
          ElMessage.success(result.message)
          router.push('/login')
        } else {
          ElMessage.error(result.message)
        }
      }, 500)
    }
  })
}
</script>

<style lang="scss" scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.register-container {
  width: 1100px;
  max-width: 100%;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.register-left {
  width: 45%;
  padding: 60px 50px;
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .brand {
    .brand-title {
      font-size: 28px;
      margin: 20px 0 10px;
      font-weight: 600;
    }

    .brand-desc {
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
    }
  }
}

.register-right {
  width: 55%;
  padding: 40px 50px;

  .register-form {
    width: 100%;

    .form-title {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 25px;
      color: #303133;
    }

    .register-btn {
      width: 100%;
      height: 48px;
      font-size: 16px;
      margin-top: 10px;
      background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
      border: none;

      &:hover {
        opacity: 0.9;
      }
    }

    .form-footer {
      text-align: center;
      margin-top: 20px;
      color: #909399;
      font-size: 14px;

      .login-link {
        color: #409eff;
        margin-left: 5px;
      }
    }
  }
}

@media (max-width: 768px) {
  .register-container {
    flex-direction: column;
  }

  .register-left,
  .register-right {
    width: 100%;
    padding: 40px 30px;
  }
}
</style>
