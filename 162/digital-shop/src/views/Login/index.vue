<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <el-icon :size="48" color="#409eff"><ShoppingBag /></el-icon>
          <h1>数码商城</h1>
          <p>欢迎回来，请登录您的账号</p>
        </div>
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          class="login-form"
          @submit.prevent="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              size="large"
              :prefix-icon="User"
            />
          </el-form-item>
          <el-form-item prop="password">
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
          <el-button
            type="primary"
            size="large"
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >登录</el-button>
        </el-form>
        <div class="login-tips">
          <p>测试账号：admin / 密码：123456</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ShoppingBag, User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

function handleLogin() {
  formRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      setTimeout(() => {
        if (form.username === 'admin' && form.password === '123456') {
          userStore.login({
            id: 1,
            username: 'admin',
            nickname: '管理员',
            avatar: 'https://picsum.photos/100/100?random=999',
            phone: '13800138000',
            email: 'admin@example.com'
          })
          ElMessage.success('登录成功')
          const redirect = route.query.redirect || '/'
          router.push(redirect)
        } else {
          ElMessage.error('用户名或密码错误')
        }
        loading.value = false
      }, 800)
    }
  })
}
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .login-container {
    width: 400px;
    padding: 20px;
  }

  .login-card {
    background: #fff;
    border-radius: 12px;
    padding: 40px 30px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);

    .login-header {
      text-align: center;
      margin-bottom: 30px;

      h1 {
        font-size: 24px;
        color: #333;
        margin: 10px 0;
      }

      p {
        color: #999;
        font-size: 14px;
      }
    }

    .login-form {
      .login-btn {
        width: 100%;
        margin-top: 10px;
      }
    }

    .login-tips {
      margin-top: 20px;
      text-align: center;

      p {
        color: #999;
        font-size: 12px;
      }
    }
  }
}
</style>
