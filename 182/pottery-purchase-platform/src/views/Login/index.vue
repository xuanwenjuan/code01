<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo">
            <span class="logo-icon">🏺</span>
            <span class="logo-text">陶艺工坊</span>
          </div>
          <p class="login-subtitle">欢迎回来，请登录您的账号</p>
        </div>

        <el-tabs v-model="loginType" class="login-tabs">
          <el-tab-pane label="采购用户登录" name="buyer">
            <el-form
              ref="buyerFormRef"
              :model="buyerForm"
              :rules="buyerRules"
              label-position="top"
              class="login-form"
              @submit.prevent="handleBuyerLogin"
            >
              <el-form-item label="用户名" prop="username">
                <el-input
                  v-model="buyerForm.username"
                  placeholder="请输入用户名"
                  size="large"
                  :prefix-icon="User"
                />
              </el-form-item>
              <el-form-item label="密码" prop="password">
                <el-input
                  v-model="buyerForm.password"
                  type="password"
                  placeholder="请输入密码"
                  size="large"
                  :prefix-icon="Lock"
                  show-password
                />
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  size="large"
                  class="submit-btn"
                  :loading="loading"
                  @click="handleBuyerLogin"
                >
                  登录
                </el-button>
              </el-form-item>
            </el-form>
            <div class="demo-tip">
              <el-alert
                title="演示账号"
                type="info"
                :closable="false"
                show-icon
              >
                <p>用户名：buyer123</p>
                <p>密码：123456</p>
              </el-alert>
            </div>
          </el-tab-pane>

          <el-tab-pane label="供应商登录" name="supplier">
            <el-form
              ref="supplierFormRef"
              :model="supplierForm"
              :rules="supplierRules"
              label-position="top"
              class="login-form"
              @submit.prevent="handleSupplierLogin"
            >
              <el-form-item label="供应商账号" prop="username">
                <el-input
                  v-model="supplierForm.username"
                  placeholder="请输入供应商账号"
                  size="large"
                  :prefix-icon="User"
                />
              </el-form-item>
              <el-form-item label="密码" prop="password">
                <el-input
                  v-model="supplierForm.password"
                  type="password"
                  placeholder="请输入密码"
                  size="large"
                  :prefix-icon="Lock"
                  show-password
                />
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  size="large"
                  class="submit-btn"
                  :loading="loading"
                  @click="handleSupplierLogin"
                >
                  登录
                </el-button>
              </el-form-item>
            </el-form>
            <div class="demo-tip">
              <el-alert
                title="演示账号"
                type="info"
                :closable="false"
                show-icon
              >
                <p>用户名：supplier123</p>
                <p>密码：123456</p>
              </el-alert>
            </div>
          </el-tab-pane>
        </el-tabs>

        <div class="login-footer">
          <span>还没有账号？</span>
          <router-link to="/register" class="register-link">立即注册</router-link>
          <span class="divider">|</span>
          <router-link to="/" class="home-link">返回首页</router-link>
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
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const loginType = ref('buyer')
const loading = ref(false)

const buyerFormRef = ref()
const buyerForm = reactive({
  username: 'buyer123',
  password: '123456'
})

const supplierFormRef = ref()
const supplierForm = reactive({
  username: 'supplier123',
  password: '123456'
})

const validateUsername = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入用户名'))
  } else if (value.length < 3 || value.length > 20) {
    callback(new Error('用户名长度为3-20个字符'))
  } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
    callback(new Error('用户名只能包含字母、数字和下划线'))
  } else {
    callback()
  }
}

const validatePassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入密码'))
  } else if (value.length < 6) {
    callback(new Error('密码长度不能少于6位'))
  } else {
    callback()
  }
}

const buyerRules = {
  username: [{ validator: validateUsername, trigger: 'blur' }],
  password: [{ validator: validatePassword, trigger: 'blur' }]
}

const supplierRules = {
  username: [{ validator: validateUsername, trigger: 'blur' }],
  password: [{ validator: validatePassword, trigger: 'blur' }]
}

const handleBuyerLogin = async () => {
  try {
    await buyerFormRef.value.validate()
    loading.value = true
    await userStore.login(buyerForm.username, buyerForm.password, 'buyer')
    ElMessage.success('登录成功')
    router.push('/user')
  } catch (error) {
    if (error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    loading.value = false
  }
}

const handleSupplierLogin = async () => {
  try {
    await supplierFormRef.value.validate()
    loading.value = true
    await userStore.login(supplierForm.username, supplierForm.password, 'supplier')
    ElMessage.success('登录成功')
    router.push('/supplier')
  } catch (error) {
    if (error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: calc(100vh - 86px - 180px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f4f0 0%, #e8d5c4 100%);
  padding: 40px 0;
}

.login-container {
  width: 480px;
  max-width: 100%;
  padding: 0 20px;
}

.login-card {
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 12px;
}

.logo-icon {
  font-size: 48px;
}

.logo-text {
  font-size: 32px;
  font-weight: bold;
  background: linear-gradient(135deg, #d4a574, #c49060);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-subtitle {
  color: #999;
  font-size: 14px;
}

.login-tabs :deep(.el-tabs__header) {
  margin-bottom: 24px;
}

.login-tabs :deep(.el-tabs__nav) {
  width: 100%;
}

.login-tabs :deep(.el-tabs__item) {
  flex: 1;
  text-align: center;
  font-size: 16px;
}

.login-form {
  margin-bottom: 20px;
}

.submit-btn {
  width: 100%;
  background: linear-gradient(135deg, #d4a574, #c49060);
  border: none;
}

.submit-btn:hover {
  background: linear-gradient(135deg, #c49060, #b08050);
}

.demo-tip {
  margin-top: 16px;
}

.demo-tip p {
  margin: 4px 0;
  font-size: 12px;
}

.login-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #eee;
  font-size: 14px;
  color: #999;
}

.register-link,
.home-link {
  color: #d4a574;
  margin: 0 4px;
}

.register-link:hover,
.home-link:hover {
  color: #c49060;
}

.divider {
  margin: 0 8px;
  color: #ddd;
}
</style>
