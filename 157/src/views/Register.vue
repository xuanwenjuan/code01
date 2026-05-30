<template>
  <div class="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center py-12">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-gradient-to-br from-primary to-pink-400 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
            母婴
          </div>
          <h1 class="text-2xl font-bold text-gray-800">注册账号</h1>
          <p class="text-gray-500 mt-2">创建您的母婴用品商城账号</p>
        </div>
        
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          class="space-y-4"
        >
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              size="large"
              :prefix-icon="User"
            />
          </el-form-item>
          
          <el-form-item label="手机号" prop="phone">
            <el-input
              v-model="form.phone"
              placeholder="请输入手机号"
              size="large"
              :prefix-icon="Cellphone"
              maxlength="11"
            />
          </el-form-item>
          
          <el-form-item label="验证码" prop="code">
            <div class="flex gap-3">
              <el-input
                v-model="form.code"
                placeholder="请输入验证码"
                size="large"
                :prefix-icon="Key"
                class="flex-1"
                maxlength="6"
              />
              <el-button
                size="large"
                :disabled="countdown > 0"
                @click="sendCode"
              >
                {{ countdown > 0 ? `${countdown}s后重新获取` : '获取验证码' }}
              </el-button>
            </div>
          </el-form-item>
          
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
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
          
          <el-form-item prop="agreement">
            <el-checkbox v-model="form.agreement">
              我已阅读并同意
              <a href="#" class="text-primary hover:underline">《用户协议》</a>
              和
              <a href="#" class="text-primary hover:underline">《隐私政策》</a>
            </el-checkbox>
          </el-form-item>
          
          <el-button
            type="primary"
            size="large"
            class="w-full py-3 !bg-gradient-to-r !from-primary !to-pink-400 !border-none"
            :loading="loading"
            @click="handleRegister"
          >
            注册
          </el-button>
        </el-form>
        
        <div class="mt-6 text-center text-sm text-gray-500">
          已有账号？
          <router-link to="/login" class="text-primary hover:underline">立即登录</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Cellphone, Key, Lock } from '@element-plus/icons-vue'
import { registerRules, validateRequired, validatePassword } from '@/utils/validate'

const router = useRouter()

const formRef = ref(null)
const loading = ref(false)
const countdown = ref(0)

const form = reactive({
  username: '',
  phone: '',
  code: '',
  password: '',
  confirmPassword: '',
  agreement: false
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const validateAgreement = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请阅读并同意用户协议'))
  } else {
    callback()
  }
}

const rules = {
  ...registerRules,
  confirmPassword: [
    validateRequired('请确认密码'),
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  agreement: [
    { validator: validateAgreement, trigger: 'change' }
  ]
}

const sendCode = () => {
  if (!form.phone) {
    ElMessage.warning('请先输入手机号')
    return
  }
  if (!/^1[3-9]\d{9}$/.test(form.phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }
  
  ElMessage.success('验证码已发送')
  countdown.value = 60
  
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const handleRegister = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    loading.value = true
    
    setTimeout(() => {
      loading.value = false
      ElMessage.success('注册成功，请登录')
      router.push('/login')
    }, 1000)
  } catch (error) {
    console.log('表单验证失败')
  }
}
</script>
