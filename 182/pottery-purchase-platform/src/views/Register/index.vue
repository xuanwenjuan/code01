<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <div class="logo">
            <span class="logo-icon">🏺</span>
            <span class="logo-text">陶艺工坊</span>
          </div>
          <p class="register-subtitle">创建您的账号，开启陶艺之旅</p>
        </div>

        <el-tabs v-model="registerType" class="register-tabs">
          <el-tab-pane label="采购用户注册" name="buyer">
            <el-form
              ref="buyerFormRef"
              :model="buyerForm"
              :rules="buyerRules"
              label-position="top"
              class="register-form"
            >
              <el-form-item label="用户名" prop="username">
                <el-input
                  v-model="buyerForm.username"
                  placeholder="请输入用户名（3-20个字符）"
                  size="large"
                />
              </el-form-item>
              <el-form-item label="昵称" prop="nickname">
                <el-input
                  v-model="buyerForm.nickname"
                  placeholder="请输入昵称"
                  size="large"
                />
              </el-form-item>
              <el-form-item label="手机号" prop="phone">
                <el-input
                  v-model="buyerForm.phone"
                  placeholder="请输入手机号"
                  size="large"
                />
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input
                  v-model="buyerForm.email"
                  placeholder="请输入邮箱地址"
                  size="large"
                />
              </el-form-item>
              <el-form-item label="密码" prop="password">
                <el-input
                  v-model="buyerForm.password"
                  type="password"
                  placeholder="请输入密码（至少6位）"
                  size="large"
                  show-password
                />
              </el-form-item>
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input
                  v-model="buyerForm.confirmPassword"
                  type="password"
                  placeholder="请再次输入密码"
                  size="large"
                  show-password
                />
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  size="large"
                  class="submit-btn"
                  :loading="loading"
                  @click="handleBuyerRegister"
                >
                  注册
                </el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="供应商入驻" name="supplier">
            <el-form
              ref="supplierFormRef"
              :model="supplierForm"
              :rules="supplierRules"
              label-position="top"
              class="register-form"
            >
              <el-form-item label="企业名称" prop="companyName">
                <el-input
                  v-model="supplierForm.companyName"
                  placeholder="请输入企业全称"
                  size="large"
                />
              </el-form-item>
              <el-form-item label="营业执照号" prop="businessLicense">
                <el-input
                  v-model="supplierForm.businessLicense"
                  placeholder="请输入营业执照号（18位）"
                  size="large"
                />
              </el-form-item>
              <el-form-item label="联系人" prop="nickname">
                <el-input
                  v-model="supplierForm.nickname"
                  placeholder="请输入联系人姓名"
                  size="large"
                />
              </el-form-item>
              <el-form-item label="联系电话" prop="phone">
                <el-input
                  v-model="supplierForm.phone"
                  placeholder="请输入联系电话"
                  size="large"
                />
              </el-form-item>
              <el-form-item label="登录账号" prop="username">
                <el-input
                  v-model="supplierForm.username"
                  placeholder="请设置登录账号"
                  size="large"
                />
              </el-form-item>
              <el-form-item label="密码" prop="password">
                <el-input
                  v-model="supplierForm.password"
                  type="password"
                  placeholder="请设置登录密码"
                  size="large"
                  show-password
                />
              </el-form-item>
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input
                  v-model="supplierForm.confirmPassword"
                  type="password"
                  placeholder="请再次输入密码"
                  size="large"
                  show-password
                />
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  size="large"
                  class="submit-btn"
                  :loading="loading"
                  @click="handleSupplierRegister"
                >
                  提交入驻申请
                </el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>

        <div class="register-footer">
          <span>已有账号？</span>
          <router-link to="/login" class="login-link">立即登录</router-link>
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

const router = useRouter()
const userStore = useUserStore()

const registerType = ref('buyer')
const loading = ref(false)

const buyerFormRef = ref()
const buyerForm = reactive({
  username: '',
  nickname: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const supplierFormRef = ref()
const supplierForm = reactive({
  companyName: '',
  businessLicense: '',
  nickname: '',
  phone: '',
  username: '',
  password: '',
  confirmPassword: ''
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

const validateConfirmPassword = (form) => (rule, value, callback) => {
  if (!value) {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const validatePhone = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入手机号'))
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('请输入正确的手机号'))
  } else {
    callback()
  }
}

const validateEmail = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入邮箱'))
  } else if (!/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(value)) {
    callback(new Error('请输入正确的邮箱地址'))
  } else {
    callback()
  }
}

const validateBusinessLicense = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入营业执照号'))
  } else if (!/^[0-9A-Z]{18}$/.test(value)) {
    callback(new Error('请输入正确的18位营业执照号'))
  } else {
    callback()
  }
}

const buyerRules = {
  username: [{ validator: validateUsername, trigger: 'blur' }],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  phone: [{ validator: validatePhone, trigger: 'blur' }],
  email: [{ validator: validateEmail, trigger: 'blur' }],
  password: [{ validator: validatePassword, trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPassword(buyerForm), trigger: 'blur' }]
}

const supplierRules = {
  companyName: [{ required: true, message: '请输入企业名称', trigger: 'blur' }],
  businessLicense: [{ validator: validateBusinessLicense, trigger: 'blur' }],
  nickname: [{ required: true, message: '请输入联系人姓名', trigger: 'blur' }],
  phone: [{ validator: validatePhone, trigger: 'blur' }],
  username: [{ validator: validateUsername, trigger: 'blur' }],
  password: [{ validator: validatePassword, trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPassword(supplierForm), trigger: 'blur' }]
}

const handleBuyerRegister = async () => {
  try {
    await buyerFormRef.value.validate()
    loading.value = true
    const { confirmPassword, ...userData } = buyerForm
    await userStore.register({ ...userData, role: 'buyer' })
    ElMessage.success('注册成功')
    router.push('/user')
  } catch (error) {
    if (error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    loading.value = false
  }
}

const handleSupplierRegister = async () => {
  try {
    await supplierFormRef.value.validate()
    loading.value = true
    const { confirmPassword, ...userData } = supplierForm
    await userStore.register({ ...userData, role: 'supplier' })
    ElMessage.success('入驻申请提交成功，请等待审核')
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
.register-page {
  min-height: calc(100vh - 86px - 180px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f4f0 0%, #e8d5c4 100%);
  padding: 40px 0;
}

.register-container {
  width: 520px;
  max-width: 100%;
  padding: 0 20px;
}

.register-card {
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.register-header {
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

.register-subtitle {
  color: #999;
  font-size: 14px;
}

.register-tabs :deep(.el-tabs__header) {
  margin-bottom: 24px;
}

.register-tabs :deep(.el-tabs__nav) {
  width: 100%;
}

.register-tabs :deep(.el-tabs__item) {
  flex: 1;
  text-align: center;
  font-size: 16px;
}

.submit-btn {
  width: 100%;
  background: linear-gradient(135deg, #d4a574, #c49060);
  border: none;
}

.submit-btn:hover {
  background: linear-gradient(135deg, #c49060, #b08050);
}

.register-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #eee;
  font-size: 14px;
  color: #999;
}

.login-link,
.home-link {
  color: #d4a574;
  margin: 0 4px;
}

.login-link:hover,
.home-link:hover {
  color: #c49060;
}

.divider {
  margin: 0 8px;
  color: #ddd;
}
</style>
