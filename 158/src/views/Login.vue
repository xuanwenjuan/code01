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
          <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beauty%20cosmetics%20skincare%20elegant%20banner&image_size=portrait_4_3" alt="banner" />
        </div>
      </div>
      <div class="auth-right">
        <div class="auth-form">
          <h2 class="form-title">欢迎登录</h2>
          <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            class="form-content"
          >
            <el-form-item prop="username">
              <el-input
                v-model="formData.username"
                placeholder="请输入用户名/手机号"
                size="large"
                :prefix-icon="User"
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
                @keyup.enter="handleLogin"
              />
            </el-form-item>
            <el-form-item>
              <div class="form-options">
                <el-checkbox v-model="formData.remember">记住密码</el-checkbox>
                <a href="#" class="forgot-link">忘记密码？</a>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                class="submit-btn"
                :loading="userStore.loading"
                @click="handleLogin"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>
          <div class="form-footer">
            <span>还没有账号？</span>
            <router-link to="/register">立即注册</router-link>
          </div>
          <div class="quick-login">
            <p>其他登录方式</p>
            <div class="login-methods">
              <el-button circle size="large" class="method-btn wechat">
                <el-icon :size="20"><ChatDotRound /></el-icon>
              </el-button>
              <el-button circle size="large" class="method-btn qq">
                <el-icon :size="20"><Connection /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, ChatDotRound, Connection } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const formRef = ref(null)

const formData = reactive({
  username: '',
  password: '',
  remember: false
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!formRef.value) return
  
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  const result = await userStore.login(formData.username, formData.password)
  
  if (result.success) {
    ElMessage.success('登录成功')
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } else {
    ElMessage.error(result.message || '登录失败')
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
  padding: 60px;
  display: flex;
  align-items: center;
  justify-content: center;

  .auth-form {
    width: 100%;
    max-width: 360px;

    .form-title {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 32px;
      text-align: center;
      color: $text-primary;
    }

    .form-content {
      .el-form-item {
        margin-bottom: 20px;
      }

      .form-options {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;

        .forgot-link {
          color: $primary-color;
          font-size: 14px;

          &:hover {
            color: $primary-dark;
          }
        }
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

    .quick-login {
      margin-top: 32px;
      text-align: center;

      p {
        color: $text-secondary;
        font-size: 14px;
        margin-bottom: 16px;
        position: relative;

        &::before,
        &::after {
          content: '';
          position: absolute;
          top: 50%;
          width: 60px;
          height: 1px;
          background: $border-light;
        }

        &::before {
          left: 20px;
        }

        &::after {
          right: 20px;
        }
      }

      .login-methods {
        display: flex;
        justify-content: center;
        gap: 16px;

        .method-btn {
          &.wechat {
            background: #07c160;
            border-color: #07c160;
            color: #fff;

            &:hover {
              background: #06ad56;
              border-color: #06ad56;
            }
          }

          &.qq {
            background: #12b7f5;
            border-color: #12b7f5;
            color: #fff;

            &:hover {
              background: #0fa3db;
              border-color: #0fa3db;
            }
          }
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
