<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-left">
        <div class="auth-logo">
          <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beauty%20cosmetics%20logo%20pink%20elegant&image_size=square" alt="logo" />
          <h1>美妆护肤商城</h1>
          <p>美丽从这里开始</p>
        </div>
        <div class="auth-banner">
          <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beauty%20cosmetics%20skincare%20elegant%20pink&image_size=portrait_4_3" alt="banner" />
        </div>
      </div>
      <div class="auth-right">
        <div class="auth-form">
          <h2 class="form-title">注册新账号</h2>
          <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            class="form-content"
          >
            <el-form-item prop="username">
              <el-input
                v-model="formData.username"
                placeholder="请输入用户名"
                size="large"
                :prefix-icon="User"
              />
            </el-form-item>
            <el-form-item prop="nickname">
              <el-input
                v-model="formData.nickname"
                placeholder="请输入昵称"
                size="large"
                :prefix-icon="UserFilled"
              />
            </el-form-item>
            <el-form-item prop="phone">
              <el-input
                v-model="formData.phone"
                placeholder="请输入手机号"
                size="large"
                :prefix-icon="Phone"
              />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="formData.password"
                type="password"
                placeholder="请输入密码"
                size="large"
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            <el-form-item prop="confirmPassword">
              <el-input
                v-model="formData.confirmPassword"
                type="password"
                placeholder="请确认密码"
                size="large"
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            <el-form-item prop="agreement">
              <el-checkbox v-model="formData.agreement">
                我已阅读并同意 <a href="#">《用户协议》</a> 和 <a href="#">《隐私政策》</a>
              </el-checkbox>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                class="submit-btn"
                :loading="userStore.loading"
                @click="handleRegister"
              >
                注册
              </el-button>
            </el-form-item>
          </el-form>
          <div class="form-footer">
            <span>已有账号？</span>
            <router-link to="/login">立即登录</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, UserFilled, Phone, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref(null)

const formData = reactive({
  username: '',
  nickname: '',
  phone: '',
  password: '',
  confirmPassword: '',
  agreement: false
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== formData.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
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
  ],
  agreement: [
    { 
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请阅读并同意用户协议'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

const handleRegister = async () => {
  if (!formRef.value) return
  
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  const result = await userStore.register({
    username: formData.username,
    nickname: formData.nickname,
    phone: formData.phone
  })
  
  if (result.success) {
    ElMessage.success('注册成功')
    router.push('/')
  } else {
    ElMessage.error(result.message || '注册失败')
  }
}
</script>

<style lang="scss" scoped>
.auth-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff5f7 0%, #f0f7ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.auth-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 100%;
  max-width: 1000px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.auth-left {
  background: linear-gradient(135deg, $primary-color 0%, #ff8fb3 100%);
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #fff;

  .auth-logo {
    text-align: center;

    img {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      margin-bottom: 16px;
    }

    h1 {
      font-size: 28px;
      margin-bottom: 8px;
    }

    p {
      opacity: 0.9;
    }
  }

  .auth-banner {
    img {
      width: 100%;
      border-radius: 8px;
    }
  }
}

.auth-right {
  padding: 40px 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  max-height: 100vh;
  overflow-y: auto;

  .auth-form {
    width: 100%;
    max-width: 360px;

    .form-title {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 24px;
      text-align: center;
      color: $text-primary;
    }

    .form-content {
      .el-form-item {
        margin-bottom: 16px;
      }

      .submit-btn {
        width: 100%;
        background: $primary-color;
        border-color: $primary-color;
        font-size: 16px;
        height: 48px;

        &:hover {
          background: $primary-dark;
          border-color: $primary-dark;
        }
      }
    }

    .form-footer {
      text-align: center;
      color: $text-secondary;
      font-size: 14px;

      a {
        color: $primary-color;
        margin-left: 4px;

        &:hover {
          color: $primary-dark;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .auth-container {
    grid-template-columns: 1fr;
  }

  .auth-left {
    display: none;
  }

  .auth-right {
    padding: 40px 20px;
  }
}
</style>
