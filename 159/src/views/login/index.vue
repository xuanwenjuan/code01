<template>
  <div class="login-container">
    <div class="login-wrapper">
      <div class="login-left">
        <div class="brand-info">
          <el-icon :size="64" color="#fff"><OfficeBuilding /></el-icon>
          <h1 class="brand-title">企业OA办公管理系统</h1>
          <p class="brand-desc">高效、便捷、智能的企业办公解决方案</p>
        </div>
        <div class="features">
          <div class="feature-item">
            <el-icon :size="24"><Check /></el-icon>
            <span>审批流程自动化</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24"><Check /></el-icon>
            <span>通讯录实时更新</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24"><Check /></el-icon>
            <span>文件云存储管理</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24"><Check /></el-icon>
            <span>日程智能提醒</span>
          </div>
        </div>
      </div>
      
      <div class="login-right">
        <div class="login-form-wrapper">
          <h2 class="login-title">用户登录</h2>
          <p class="login-subtitle">欢迎回来，请登录您的账号</p>
          
          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            class="login-form"
            @keyup.enter="handleLogin"
          >
            <el-form-item prop="username">
              <el-input
                v-model="form.username"
                placeholder="请输入用户名"
                :prefix-icon="User"
                size="large"
              />
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input
                v-model="form.password"
                type="password"
                placeholder="请输入密码"
                :prefix-icon="Lock"
                size="large"
                show-password
              />
            </el-form-item>
            
            <el-form-item>
              <div class="form-options">
                <el-checkbox v-model="form.remember">记住密码</el-checkbox>
                <a href="#" class="forgot-password">忘记密码？</a>
              </div>
            </el-form-item>
            
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                :loading="loading"
                class="login-btn"
                @click="handleLogin"
              >
                登 录
              </el-button>
            </el-form-item>
          </el-form>
          
          <div class="login-tips">
            <p>测试账号：admin / 123456</p>
            <p>普通账号：zhangsan / 123456</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const formRef = ref()
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
  remember: false
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

onMounted(() => {
  const saved = localStorage.getItem('oa_remember')
  if (saved) {
    const data = JSON.parse(saved)
    form.username = data.username
    form.password = data.password
    form.remember = true
  }
})

const handleLogin = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await userStore.login(form)
        if (form.remember) {
          localStorage.setItem('oa_remember', JSON.stringify(form))
        } else {
          localStorage.removeItem('oa_remember')
        }
        ElMessage.success('登录成功')
        const redirect = route.query.redirect || '/dashboard'
        router.push(redirect)
      } catch (error) {
        ElMessage.error(error.message || '登录失败')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped lang="scss">
.login-container {
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-wrapper {
  width: 100%;
  max-width: 1000px;
  height: 600px;
  background: #fff;
  border-radius: 12px;
  display: flex;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-left {
  width: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 50px;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.brand-info {
  .brand-title {
    font-size: 28px;
    font-weight: 600;
    margin: 20px 0 10px;
  }
  
  .brand-desc {
    font-size: 16px;
    opacity: 0.9;
  }
}

.features {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  opacity: 0.95;
}

.login-right {
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-form-wrapper {
  width: 100%;
  max-width: 360px;
}

.login-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 14px;
  color: #909399;
  margin-bottom: 30px;
}

.login-form {
  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  
  .forgot-password {
    font-size: 14px;
    color: #409EFF;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
}

.login-tips {
  margin-top: 24px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 6px;
  font-size: 13px;
  color: #606266;
  line-height: 1.8;
}

@media (max-width: 768px) {
  .login-wrapper {
    flex-direction: column;
    height: auto;
  }
  
  .login-left,
  .login-right {
    width: 100%;
  }
  
  .login-left {
    padding: 40px 30px;
  }
  
  .features {
    display: none;
  }
}
</style>
