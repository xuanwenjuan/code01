<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-left">
        <div class="brand">
          <el-icon :size="48" color="#f97316"><Bee /></el-icon>
          <h1>蜂采网</h1>
          <p>专业养蜂设备采购平台</p>
        </div>
        <div class="register-benefits">
          <h3>加入蜂采网，您将获得：</h3>
          <ul>
            <li><el-icon><Check /></el-icon> 全场商品会员专享价</li>
            <li><el-icon><Check /></el-icon> 优先发货 快速送达</li>
            <li><el-icon><Check /></el-icon> 专属客服 一对一服务</li>
            <li><el-icon><Check /></el-icon> 积分兑换 好礼不断</li>
          </ul>
        </div>
      </div>

      <div class="register-right">
        <el-card>
          <h2>创建新账号</h2>
          <p class="subtitle">加入我们，开启优质养蜂设备采购之旅</p>

          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-position="top"
            @submit.prevent="handleRegister"
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
                placeholder="3-20个字符，字母或数字开头"
                size="large"
                :prefix-icon="User"
              />
            </el-form-item>

            <el-form-item :label="form.role === 'buyer' ? '养蜂场名称' : '公司名称'" prop="name">
              <el-input
                v-model="form.name"
                placeholder="请输入名称"
                size="large"
                :prefix-icon="OfficeBuilding"
              />
            </el-form-item>

            <el-form-item label="密码" prop="password">
              <el-input
                v-model="form.password"
                type="password"
                placeholder="6-20个字符，包含字母和数字"
                size="large"
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>

            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="form.confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                size="large"
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>

            <el-form-item label="手机号" prop="phone">
              <el-input
                v-model="form.phone"
                placeholder="请输入11位手机号码"
                size="large"
                :prefix-icon="Phone"
              />
            </el-form-item>

            <el-form-item label="邮箱" prop="email">
              <el-input
                v-model="form.email"
                placeholder="请输入邮箱地址"
                size="large"
                :prefix-icon="Message"
              />
            </el-form-item>

            <el-form-item label="详细地址" prop="address">
              <el-input
                v-model="form.address"
                placeholder="请输入详细地址"
                size="large"
                :prefix-icon="Location"
              />
            </el-form-item>

            <el-button type="primary" size="large" block :loading="loading" @click="handleRegister">
              注册
            </el-button>
          </el-form>

          <div class="form-footer">
            <span>已有账号？</span>
            <router-link to="/login">立即登录</router-link>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import { ElMessage } from 'element-plus'
import { User, Lock, Phone, Message, Location, OfficeBuilding } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  role: 'buyer',
  username: '',
  name: '',
  password: '',
  confirmPassword: '',
  phone: '',
  email: '',
  address: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9][a-zA-Z0-9_]*$/, message: '用户名只能包含字母、数字和下划线，且以字母或数字开头', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
    { min: 2, max: 50, message: '名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
    { pattern: /^(?=.*[a-zA-Z])(?=.*\d).+$/, message: '密码必须包含字母和数字', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的11位手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入详细地址', trigger: 'blur' },
    { min: 5, max: 200, message: '地址长度在 5 到 200 个字符', trigger: 'blur' }
  ]
}

async function handleRegister() {
  if (!formRef.value) return

  await formRef.value.validate(async valid => {
    if (!valid) return

    loading.value = true
    try {
      const { confirmPassword, ...userData } = form
      const success = userStore.register(userData)
      if (success) {
        ElMessage.success('注册成功')
        router.push('/')
      } else {
        ElMessage.error('用户名已存在')
      }
    } finally {
      loading.value = false
    }
  })
}
</script>

<style lang="scss" scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.register-container {
  width: 100%;
  max-width: 1000px;
  display: flex;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(249, 115, 22, 0.15);
}

.register-left {
  width: 360px;
  flex-shrink: 0;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: #fff;
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .brand {
    h1 {
      font-size: 32px;
      margin: 12px 0 8px;
    }

    p {
      opacity: 0.9;
      font-size: 14px;
    }
  }

  .register-benefits {
    h3 {
      font-size: 16px;
      margin-bottom: 16px;
    }

    ul {
      padding: 0;

      li {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 0;
        font-size: 14px;
      }
    }
  }
}

.register-right {
  flex: 1;
  padding: 40px;
  max-height: 90vh;
  overflow-y: auto;

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
    margin-bottom: 24px;
  }

  .form-footer {
    text-align: center;
    margin-top: 20px;
    color: var(--text-secondary);

    a {
      color: var(--primary-color);
    }
  }
}
</style>
