<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-left">
        <div class="login-logo">
          <h1>非遗手作原料集采平台</h1>
          <p>传承千年工艺 · 甄选天然原料</p>
        </div>
        <div class="login-features">
          <div class="feature-item">
            <el-icon :size="24"><Goods /></el-icon>
            <span>正品原料保障</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24"><Trophy /></el-icon>
            <span>非遗认证商家</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24"><Truck /></el-icon>
            <span>批量集采配送</span>
          </div>
        </div>
      </div>
      <div class="login-right">
        <div class="login-form-wrapper">
          <h2 class="login-title">账号登录</h2>
          <p class="login-subtitle">请选择您的身份类型</p>
          
          <el-radio-group v-model="loginForm.role" class="role-selector">
            <el-radio-button value="buyer">
              <el-icon><Shop /></el-icon>
              手作工坊采购方
            </el-radio-button>
            <el-radio-button value="supplier">
              <el-icon><OfficeBuilding /></el-icon>
              原料供货商
            </el-radio-button>
          </el-radio-group>

          <el-form 
            ref="formRef"
            :model="loginForm" 
            :rules="loginRules" 
            class="login-form"
            @keyup.enter="handleLogin"
          >
            <el-form-item prop="username">
              <el-input 
                v-model="loginForm.username" 
                placeholder="请输入账号"
                size="large"
                :prefix-icon="User"
              />
            </el-form-item>
            <el-form-item prop="password">
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
              class="login-btn"
              :loading="loading"
              @click="handleLogin"
              block
            >
              登 录
            </el-button>
          </el-form>

          <div class="login-tips">
            <p>测试账号：</p>
            <p>采购方：buyer / 123456</p>
            <p>供货商：supplier / 123456</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { User, Lock, Goods, Trophy, Truck, Shop, OfficeBuilding } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { users } from '@/mock/data'
import { toast } from '@/utils/notify'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
  role: 'buyer'
})

const loginRules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, max: 20, message: '账号长度在 3 到 20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '账号只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

function handleLogin() {
  formRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      
      setTimeout(() => {
        const user = users.find(
          u => u.username === loginForm.username && 
               u.password === loginForm.password && 
               u.role === loginForm.role
        )

        if (user) {
          const { password, ...userInfo } = user
          const token = 'mock_token_' + Date.now()
          userStore.login(userInfo, token)
          toast.success('登录成功')
          
          const redirect = route.query.redirect || '/home'
          router.push(redirect)
        } else {
          toast.error('账号或密码错误，请重新输入')
        }
        
        loading.value = false
      }, 800)
    }
  })
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #8B4513 0%, #D2691E 50%, #CD853F 100%);
  padding: 20px;
}

.login-container {
  display: flex;
  width: 100%;
  max-width: 960px;
  min-height: 560px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #fff;

  .login-logo {
    h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 12px;
      letter-spacing: 2px;
    }

    p {
      font-size: 16px;
      opacity: 0.9;
    }
  }

  .login-features {
    display: flex;
    flex-direction: column;
    gap: 24px;

    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 16px;

      el-icon {
        background: rgba(255, 255, 255, 0.2);
        padding: 10px;
        border-radius: 50%;
      }
    }
  }
}

.login-right {
  width: 400px;
  padding: 60px 40px;
  display: flex;
  align-items: center;

  .login-form-wrapper {
    width: 100%;

    .login-title {
      font-size: 24px;
      font-weight: 600;
      color: $text-color;
      margin-bottom: 8px;
    }

    .login-subtitle {
      font-size: 14px;
      color: $text-light;
      margin-bottom: 24px;
    }

    .role-selector {
      width: 100%;
      margin-bottom: 24px;

      :deep(.el-radio-button__inner) {
        width: 50%;
        text-align: center;
        padding: 12px 16px;
      }
    }

    .login-form {
      .login-btn {
        margin-top: 8px;
        background: linear-gradient(135deg, $primary-color, $secondary-color);
        border: none;
        height: 48px;
        font-size: 16px;
        letter-spacing: 4px;
      }
    }

    .login-tips {
      margin-top: 24px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
      font-size: 12px;
      color: $text-light;
      line-height: 1.8;
    }
  }
}

@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }

  .login-left {
    padding: 40px 24px;
    text-align: center;

    .login-features {
      flex-direction: row;
      justify-content: center;
      flex-wrap: wrap;
      margin-top: 24px;
    }
  }

  .login-right {
    width: 100%;
    padding: 40px 24px;
  }
}
</style>
