<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-left">
        <div class="brand">
          <span class="brand-icon">🎨</span>
          <h1 class="brand-title">手作DIY商城</h1>
          <p class="brand-subtitle">发现手作之美，开启创意之旅</p>
        </div>
        <div class="features">
          <div class="feature-item">
            <el-icon :size="24"><Goods /></el-icon>
            <span>精选材料</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24"><Trophy /></el-icon>
            <span>品质保证</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24"><Van /></el-icon>
            <span>快速配送</span>
          </div>
        </div>
      </div>
      
      <div class="login-right">
        <div class="login-form-wrapper">
          <h2 class="form-title">欢迎回来</h2>
          <p class="form-subtitle">请登录您的账户</p>
          
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
                clearable
                @blur="validateUsername"
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
                @input="checkPasswordStrength"
              />
            </el-form-item>
            
            <div v-if="form.password" class="password-strength">
              <div class="strength-label">密码强度：</div>
              <div class="strength-bars">
                <div 
                  v-for="i in 4" 
                  :key="i" 
                  class="strength-bar"
                  :class="[getStrengthClass(i), { active: i <= passwordStrength }]"
                ></div>
              </div>
              <span class="strength-text">{{ strengthText }}</span>
            </div>
            
            <el-form-item>
              <div class="form-options">
                <el-checkbox v-model="form.remember">记住我</el-checkbox>
                <a href="#" class="forgot-link" @click.prevent="showForgotPassword">忘记密码?</a>
              </div>
            </el-form-item>
            
            <el-form-item>
              <el-button 
                type="primary" 
                size="large" 
                class="login-btn"
                :loading="userStore.loading"
                @click="handleLogin"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>
          
          <div class="divider">
            <span>或者</span>
          </div>
          
          <div class="social-login">
            <el-button circle size="large" class="social-btn wechat">
              <el-icon :size="20"><ChatDotRound /></el-icon>
            </el-button>
            <el-button circle size="large" class="social-btn qq">
              <el-icon :size="20"><Service /></el-icon>
            </el-button>
            <el-button circle size="large" class="social-btn phone">
              <el-icon :size="20"><Phone /></el-icon>
            </el-button>
          </div>
          
          <div class="register-tip">
            还没有账号？<a href="#" @click.prevent="showRegister">立即注册</a>
          </div>
          
          <div class="role-hint">
            <div class="hint-header">
              <el-icon :size="14" color="#e6a23c"><Warning /></el-icon>
              <span>测试账号</span>
            </div>
            <div class="hint-content">
              <p><b>普通用户：</b>user123 / 123456</p>
              <p><b>手作博主：</b>blogger456 / 123456</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { User, Lock, Goods, Trophy, Van, ChatDotRound, Service, Phone, Warning } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formRef = ref(null)
const form = reactive({
  username: '',
  password: '',
  remember: false
})

const passwordStrength = ref(0)

const strengthText = computed(() => {
  const texts = ['极弱', '弱', '一般', '强', '非常强']
  return texts[passwordStrength.value]
})

const getStrengthClass = (index) => {
  const classes = ['', 'weak', 'normal', 'strong', 'very-strong']
  return classes[passwordStrength.value]
}

const checkPasswordStrength = () => {
  const pwd = form.password
  let strength = 0
  
  if (!pwd) {
    passwordStrength.value = 0
    return
  }
  
  if (pwd.length >= 6) strength++
  if (pwd.length >= 10) strength++
  if (/[A-Z]/.test(pwd)) strength++
  if (/[0-9]/.test(pwd)) strength++
  if (/[^A-Za-z0-9]/.test(pwd)) strength++
  
  passwordStrength.value = Math.min(strength, 4)
}

const validateUsername = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入用户名'))
  } else if (!/^[a-zA-Z]/.test(value)) {
    callback(new Error('用户名必须以字母开头'))
  } else if (!/^[a-zA-Z][a-zA-Z0-9_]{3,19}$/.test(value)) {
    callback(new Error('用户名4-20位，字母开头，只能包含字母、数字和下划线'))
  } else {
    callback()
  }
}

const validatePassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入密码'))
  } else if (value.length < 6) {
    callback(new Error('密码长度不能少于6位'))
  } else if (value.length > 20) {
    callback(new Error('密码长度不能超过20位'))
  } else if (!/[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
    callback(new Error('密码只能包含字母、数字和特殊字符'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, validator: validateUsername, trigger: 'blur' }
  ],
  password: [
    { required: true, validator: validatePassword, trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    await userStore.login(form.username, form.password)
    ElMessage.success('登录成功')
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (error) {
    if (error instanceof Error && error.message !== '表单验证失败') {
      ElMessage.error(error.message)
    }
  }
}

const showForgotPassword = () => {
  ElMessageBox.alert('请联系客服重置密码：400-123-4567', '忘记密码', {
    confirmButtonText: '知道了'
  })
}

const showRegister = () => {
  ElMessageBox.alert('注册功能暂未开放，请使用测试账号登录', '注册提示', {
    confirmButtonText: '知道了'
  })
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-top: 60px;
}

.login-container {
  display: flex;
  width: 100%;
  max-width: 1000px;
  min-height: 600px;
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  
  .brand {
    text-align: center;
    color: #fff;
    margin-bottom: 60px;
    
    .brand-icon {
      font-size: 80px;
      display: block;
      margin-bottom: 20px;
    }
    
    .brand-title {
      font-size: 32px;
      margin-bottom: 12px;
    }
    
    .brand-subtitle {
      font-size: 16px;
      opacity: 0.9;
    }
  }
  
  .features {
    display: flex;
    gap: 40px;
    
    .feature-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
    }
  }
}

.login-right {
  flex: 1;
  padding: 60px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .login-form-wrapper {
    width: 100%;
    max-width: 360px;
    
    .form-title {
      font-size: 28px;
      font-weight: 700;
      color: #333;
      margin-bottom: 8px;
    }
    
    .form-subtitle {
      font-size: 14px;
      color: #999;
      margin-bottom: 32px;
    }
    
    .login-form {
      .form-options {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .forgot-link {
          color: #667eea;
          font-size: 14px;
          
          &:hover {
            text-decoration: underline;
          }
        }
      }
      
      .login-btn {
        width: 100%;
        height: 48px;
        font-size: 16px;
      }
    }
    
    .password-strength {
      margin-top: -10px;
      margin-bottom: 20px;
      
      .strength-label {
        font-size: 12px;
        color: #999;
        margin-bottom: 6px;
      }
      
      .strength-bars {
        display: flex;
        gap: 4px;
        margin-bottom: 6px;
        
        .strength-bar {
          flex: 1;
          height: 4px;
          background: #f0f0f0;
          border-radius: 2px;
          transition: all 0.3s;
          
          &.active {
            &.weak {
              background: #f56c6c;
            }
            
            &.normal {
              background: #e6a23c;
            }
            
            &.strong {
              background: #67c23a;
            }
            
            &.very-strong {
              background: #409eff;
            }
          }
        }
      }
      
      .strength-text {
        font-size: 12px;
        color: #999;
      }
    }
    
    .divider {
      text-align: center;
      margin: 24px 0;
      position: relative;
      
      &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 1px;
        background: #e0e0e0;
      }
      
      span {
        background: #fff;
        padding: 0 16px;
        color: #999;
        font-size: 13px;
        position: relative;
      }
    }
    
    .social-login {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-bottom: 24px;
      
      .social-btn {
        border: 1px solid #e0e0e0;
        
        &.wechat {
          color: #07c160;
          
          &:hover {
            background: #f0fff4;
          }
        }
        
        &.qq {
          color: #12b7f5;
          
          &:hover {
            background: #f0f9ff;
          }
        }
        
        &.phone {
          color: #ff6b6b;
          
          &:hover {
            background: #fff5f5;
          }
        }
      }
    }
    
    .register-tip {
      text-align: center;
      font-size: 14px;
      color: #666;
      
      a {
        color: #667eea;
        font-weight: 500;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }
    
    .role-hint {
      margin-top: 30px;
      padding: 16px;
      background: linear-gradient(135deg, #fff7e6 0%, #fff1cc 100%);
      border-radius: 8px;
      border: 1px solid #ffd591;
      
      .hint-header {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: #d48806;
        font-weight: 500;
        margin-bottom: 10px;
      }
      
      .hint-content {
        font-size: 12px;
        color: #873800;
        line-height: 1.8;
        
        b {
          color: #d46b08;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
    max-width: 400px;
  }
  
  .login-left {
    padding: 30px;
    
    .brand {
      margin-bottom: 30px;
      
      .brand-icon {
        font-size: 60px;
      }
      
      .brand-title {
        font-size: 24px;
      }
    }
    
    .features {
      gap: 24px;
    }
  }
  
  .login-right {
    padding: 40px 20px;
  }
}
</style>
