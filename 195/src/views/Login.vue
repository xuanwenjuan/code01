<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-left">
        <div class="brand">
          <span class="brand-icon">🪵</span>
          <h1>传统木雕工具采购平台</h1>
          <p>传承匠心 · 精工细作</p>
        </div>
        <div class="features">
          <div class="feature-item">
            <el-icon><Check /></el-icon>
            <span>优质供货商入驻</span>
          </div>
          <div class="feature-item">
            <el-icon><Check /></el-icon>
            <span>品质保证 正品保障</span>
          </div>
          <div class="feature-item">
            <el-icon><Check /></el-icon>
            <span>专业木雕工具齐全</span>
          </div>
          <div class="feature-item">
            <el-icon><Check /></el-icon>
            <span>双角色权限系统</span>
          </div>
        </div>
      </div>

      <div class="login-right">
        <div class="login-form-card">
          <h2 class="form-title">欢迎登录</h2>
          <p class="form-subtitle">请选择您的身份进行登录</p>

          <el-tabs v-model="activeTab" class="role-tabs">
            <el-tab-pane label="采购方登录" name="buyer">
              <el-form
                ref="buyerFormRef"
                :model="buyerForm"
                :rules="buyerRules"
                label-position="top"
                @submit.prevent="handleBuyerLogin"
              >
                <el-form-item label="账号" prop="username">
                  <el-input
                    v-model="buyerForm.username"
                    placeholder="请输入采购方账号"
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
                <el-button
                  type="primary"
                  size="large"
                  class="login-btn"
                  :loading="loading"
                  @click="handleBuyerLogin"
                >
                  采购方登录
                </el-button>
              </el-form>
              <div class="demo-tip">
                <el-tag type="info">演示账号：buyer001 / 123456</el-tag>
              </div>
            </el-tab-pane>

            <el-tab-pane label="供货商登录" name="supplier">
              <el-form
                ref="supplierFormRef"
                :model="supplierForm"
                :rules="supplierRules"
                label-position="top"
                @submit.prevent="handleSupplierLogin"
              >
                <el-form-item label="账号" prop="username">
                  <el-input
                    v-model="supplierForm.username"
                    placeholder="请输入供货商账号"
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
                <el-button
                  type="success"
                  size="large"
                  class="login-btn"
                  :loading="loading"
                  @click="handleSupplierLogin"
                >
                  供货商登录
                </el-button>
              </el-form>
              <div class="demo-tip">
                <el-tag type="success">演示账号：supplier001 / 123456</el-tag>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Check, User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const activeTab = ref('buyer')

const buyerFormRef = ref(null)
const supplierFormRef = ref(null)

const buyerForm = reactive({
  username: '',
  password: ''
})

const supplierForm = reactive({
  username: '',
  password: ''
})

const validateUsername = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入账号'))
  } else if (!/^[a-zA-Z0-9_]{4,20}$/.test(value)) {
    callback(new Error('账号格式不正确，4-20位字母数字下划线'))
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
  if (!buyerFormRef.value) return
  await buyerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await userStore.login(buyerForm.username, buyerForm.password, 'buyer')
        ElMessage.success('登录成功')
        router.push('/')
      } catch (error) {
        ElMessage.error(error.message)
      } finally {
        loading.value = false
      }
    }
  })
}

const handleSupplierLogin = async () => {
  if (!supplierFormRef.value) return
  await supplierFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await userStore.login(supplierForm.username, supplierForm.password, 'supplier')
        ElMessage.success('登录成功')
        router.push('/supplier')
      } catch (error) {
        ElMessage.error(error.message)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #8b4513 0%, #d2691e 50%, #cd853f 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  width: 1000px;
  max-width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-left {
  padding: 60px 40px;
  background: linear-gradient(135deg, #2c1810 0%, #4a3728 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .brand {
    text-align: center;
    margin-bottom: 40px;

    .brand-icon {
      font-size: 64px;
      display: block;
      margin-bottom: 16px;
    }

    h1 {
      font-size: 24px;
      margin-bottom: 8px;
    }

    p {
      font-size: 14px;
      opacity: 0.8;
    }
  }

  .features {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      opacity: 0.9;

      .el-icon {
        color: #67c23a;
        font-size: 20px;
      }
    }
  }
}

.login-right {
  padding: 60px 40px;
  display: flex;
  align-items: center;
  justify-content: center;

  .login-form-card {
    width: 100%;
    max-width: 360px;

    .form-title {
      font-size: 24px;
      font-weight: 600;
      text-align: center;
      margin-bottom: 8px;
      color: #333;
    }

    .form-subtitle {
      font-size: 14px;
      text-align: center;
      color: #999;
      margin-bottom: 32px;
    }

    .role-tabs {
      .login-btn {
        width: 100%;
        margin-top: 8px;
      }

      .demo-tip {
        margin-top: 16px;
        text-align: center;
      }
    }
  }
}

:deep(.el-tabs__header) {
  margin-bottom: 24px;
}

:deep(.el-tabs__nav) {
  width: 100%;
}

:deep(.el-tabs__item) {
  flex: 1;
  text-align: center;
}
</style>
