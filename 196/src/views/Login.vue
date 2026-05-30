<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-left">
        <div class="brand">
          <el-icon :size="48" color="#f97316"><Bee /></el-icon>
          <h1>蜂采网</h1>
          <p>专业养蜂设备采购平台</p>
        </div>
        <div class="features">
          <div class="feature-item">
            <el-icon :size="24" color="#65a30d"><CircleCheck /></el-icon>
            <span>品质保证 厂家直供</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24" color="#0891b2"><CircleCheck /></el-icon>
            <span>全场包邮 快速配送</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24" color="#7c3aed"><CircleCheck /></el-icon>
            <span>专业售后 无忧保障</span>
          </div>
        </div>
      </div>

      <div class="login-right">
        <el-card>
          <h2>欢迎回来</h2>
          <p class="subtitle">登录您的账号继续购物</p>

          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-position="top"
            @submit.prevent="handleLogin"
          >
            <el-form-item label="账号类型">
              <el-radio-group v-model="form.role">
                <el-radio value="buyer">养蜂场采购方</el-radio>
                <el-radio value="supplier">养蜂设备供货商</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="用户名" prop="username">
              <el-input
                v-model="form.username"
                placeholder="请输入用户名"
                size="large"
                :prefix-icon="User"
              />
            </el-form-item>

            <el-form-item label="密码" prop="password">
              <el-input
                v-model="form.password"
                type="password"
                placeholder="请输入密码"
                size="large"
                :prefix-icon="Lock"
                show-password
                @keyup.enter="handleLogin"
              />
            </el-form-item>

            <el-button type="primary" size="large" block :loading="loading" @click="handleLogin">
              登录
            </el-button>
          </el-form>

          <div class="form-footer">
            <span>还没有账号？</span>
            <router-link to="/register">立即注册</router-link>
          </div>

          <el-divider content-position="center">测试账号</el-divider>
          <div class="test-accounts">
            <p>采购方：buyer / 123456</p>
            <p>供货商：supplier / 123456</p>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
  role: 'buyer'
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

async function handleLogin() {
  if (!formRef.value) return

  await formRef.value.validate(async valid => {
    if (!valid) return

    loading.value = true
    try {
      const success = userStore.login(form.username, form.password)
      if (success) {
        ElMessage.success('登录成功')
        const redirect = route.query.redirect || '/'
        router.push(redirect)
      } else {
        ElMessage.error('用户名或密码错误')
      }
    } finally {
      loading.value = false
    }
  })
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.login-container {
  width: 100%;
  max-width: 900px;
  display: flex;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(249, 115, 22, 0.15);
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: #fff;
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .brand {
    h1 {
      font-size: 36px;
      margin: 12px 0 8px;
    }

    p {
      opacity: 0.9;
      font-size: 16px;
    }
  }

  .features {
    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      font-size: 15px;
    }
  }
}

.login-right {
  width: 420px;
  flex-shrink: 0;
  padding: 40px;

  :deep(.el-card) {
    border: none;
    box-shadow: none;
  }

  h2 {
    font-size: 24px;
    margin: 0 0 8px;
    color: var(--text-primary);
  }

  .subtitle {
    color: var(--text-secondary);
    margin-bottom: 32px;
  }

  .form-footer {
    text-align: center;
    margin-top: 20px;
    color: var(--text-secondary);

    a {
      color: var(--primary-color);
    }
  }

  .test-accounts {
    text-align: center;
    color: var(--text-secondary);
    font-size: 13px;

    p {
      margin: 4px 0;
    }
  }
}
</style>
