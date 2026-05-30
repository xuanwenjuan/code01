<template>
  <div class="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center py-12">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-gradient-to-br from-primary to-pink-400 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
            母婴
          </div>
          <h1 class="text-2xl font-bold text-gray-800">欢迎回来</h1>
          <p class="text-gray-500 mt-2">登录您的母婴用品商城账号</p>
        </div>
        
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          class="space-y-4"
        >
          <el-form-item label="用户名/手机号" prop="username">
            <el-input
              v-model="form.username"
              placeholder="请输入用户名或手机号"
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
          
          <div class="flex items-center justify-between text-sm">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <a href="#" class="text-primary hover:underline">忘记密码？</a>
          </div>
          
          <el-button
            type="primary"
            size="large"
            class="w-full mt-4 py-3 !bg-gradient-to-r !from-primary !to-pink-400 !border-none"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form>
        
        <div class="mt-6 text-center text-sm text-gray-500">
          还没有账号？
          <router-link to="/register" class="text-primary hover:underline">立即注册</router-link>
        </div>
        
        <div class="mt-8">
          <div class="relative flex items-center justify-center text-sm text-gray-400">
            <span class="absolute inset-x-0 top-1/2 h-px bg-gray-200 -z-10"></span>
            <span class="px-4 bg-white">其他登录方式</span>
          </div>
          <div class="flex justify-center gap-6 mt-6">
            <button class="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center hover:opacity-90 transition-opacity">
              <ChatDotRound class="w-6 h-6" />
            </button>
            <button class="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center hover:opacity-90 transition-opacity">
              <Cellphone class="w-6 h-6" />
            </button>
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
import { User, Lock, ChatDotRound, Cellphone } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { loginRules } from '@/utils/validate'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const formRef = ref(null)
const loading = ref(false)
const rememberMe = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules = loginRules

const handleLogin = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    loading.value = true
    
    setTimeout(async () => {
      try {
        await userStore.login(form)
        ElMessage.success('登录成功')
        
        const redirect = route.query.redirect || '/'
        router.push(redirect)
      } catch (error) {
        ElMessage.error('登录失败，请重试')
      } finally {
        loading.value = false
      }
    }, 1000)
  } catch (error) {
    console.log('表单验证失败')
  }
}
</script>
