<template>
  <div class="profile-page">
    <div class="container">
      <div class="page-layout">
        <aside class="sidebar">
          <div class="user-card card-shadow">
            <div class="user-avatar">
              <el-avatar :size="80" :src="userStore.currentUser?.avatar" />
              <el-tag 
                :type="userStore.isBuyer ? 'primary' : 'success'" 
                size="small"
                class="role-tag"
              >
                {{ userStore.isBuyer ? '采购用户' : '供应商' }}
              </el-tag>
            </div>
            <div class="user-info">
              <h3 class="username">{{ userStore.currentUser?.nickname }}</h3>
              <p class="user-account">账号：{{ userStore.currentUser?.username }}</p>
            </div>
          </div>
          
          <div class="menu-card card-shadow">
            <el-menu
              :default-active="activeMenu"
              class="profile-menu"
              @select="handleMenuSelect"
            >
              <el-menu-item index="profile">
                <el-icon><User /></el-icon>
                <span>个人信息</span>
              </el-menu-item>
              <el-menu-item index="orders" v-if="userStore.isBuyer">
                <el-icon><List /></el-icon>
                <span>我的订单</span>
              </el-menu-item>
              <el-menu-item index="favorites" v-if="userStore.isBuyer">
                <el-icon><Star /></el-icon>
                <span>我的收藏</span>
              </el-menu-item>
              <el-menu-item index="supplier" v-if="userStore.isSupplier">
                <el-icon><Management /></el-icon>
                <span>商品管理</span>
              </el-menu-item>
              <el-menu-item index="security">
                <el-icon><Lock /></el-icon>
                <span>账号安全</span>
              </el-menu-item>
            </el-menu>
          </div>
        </aside>
        
        <main class="main-content">
          <div v-if="activeMenu === 'profile'" class="content-card card-shadow">
            <h2 class="card-title">个人信息</h2>
            <el-form 
              ref="profileFormRef"
              :model="profileForm" 
              :rules="profileRules"
              label-width="100px"
              class="profile-form"
            >
              <el-form-item label="用户名">
                <el-input :model-value="userStore.currentUser?.username" disabled />
              </el-form-item>
              <el-form-item label="昵称" prop="nickname">
                <el-input 
                  v-model="profileForm.nickname" 
                  placeholder="请输入昵称" 
                  maxlength="20"
                  show-word-limit
                />
              </el-form-item>
              <el-form-item label="手机号" prop="phone">
                <el-input 
                  v-model="profileForm.phone" 
                  placeholder="请输入手机号" 
                  maxlength="11"
                />
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input 
                  v-model="profileForm.email" 
                  placeholder="请输入邮箱" 
                />
              </el-form-item>
              <template v-if="userStore.isBuyer">
                <el-form-item label="收货地址" prop="address">
                  <el-input 
                    v-model="profileForm.address" 
                    type="textarea"
                    :rows="3"
                    placeholder="请输入详细收货地址"
                    maxlength="200"
                    show-word-limit
                  />
                </el-form-item>
              </template>
              <template v-else>
                <el-form-item label="公司名称">
                  <el-input :model-value="userStore.currentUser?.company" disabled />
                </el-form-item>
                <el-form-item label="营业执照">
                  <el-input :model-value="userStore.currentUser?.license" disabled />
                </el-form-item>
              </template>
              <el-form-item>
                <el-button type="primary" @click="handleSaveProfile" :loading="saving">
                  <el-icon><Check /></el-icon>
                  保存修改
                </el-button>
                <el-button @click="resetProfileForm">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
          
          <div v-if="activeMenu === 'security'" class="content-card card-shadow">
            <h2 class="card-title">账号安全</h2>
            <div class="security-list">
              <div class="security-item">
                <div class="security-info">
                  <el-icon :size="24" color="#409eff"><Lock /></el-icon>
                  <div>
                    <h4>登录密码</h4>
                    <p>定期修改密码可以提高账号安全性</p>
                  </div>
                </div>
                <el-button type="primary" @click="showPasswordDialog = true">
                  修改密码
                </el-button>
              </div>
              <div class="security-item">
                <div class="security-info">
                  <el-icon :size="24" color="#67c23a"><Phone /></el-icon>
                  <div>
                    <h4>绑定手机</h4>
                    <p>已绑定：{{ userStore.currentUser?.phone || '未绑定' }}</p>
                  </div>
                </div>
                <el-button @click="showPhoneDialog = true">
                  {{ userStore.currentUser?.phone ? '更换' : '绑定' }}
                </el-button>
              </div>
              <div class="security-item">
                <div class="security-info">
                  <el-icon :size="24" color="#e6a23c"><Message /></el-icon>
                  <div>
                    <h4>绑定邮箱</h4>
                    <p>已绑定：{{ userStore.currentUser?.email || '未绑定' }}</p>
                  </div>
                </div>
                <el-button @click="showEmailDialog = true">
                  {{ userStore.currentUser?.email ? '更换' : '绑定' }}
                </el-button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
    
    <el-dialog 
      v-model="showPasswordDialog" 
      title="修改密码" 
      width="480px"
      :close-on-click-modal="false"
      @closed="resetPasswordForm"
    >
      <el-form 
        ref="passwordFormRef"
        :model="passwordForm" 
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input 
            v-model="passwordForm.oldPassword" 
            type="password" 
            placeholder="请输入原密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input 
            v-model="passwordForm.newPassword" 
            type="password" 
            placeholder="请输入新密码（6-20个字符）"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="passwordForm.confirmPassword" 
            type="password" 
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="handleChangePassword" :loading="passwordChanging">
          确认修改
        </el-button>
      </template>
    </el-dialog>
    
    <el-dialog 
      v-model="showPhoneDialog" 
      title="绑定手机号" 
      width="480px"
      :close-on-click-modal="false"
      @closed="resetPhoneForm"
    >
      <el-form 
        ref="phoneFormRef"
        :model="phoneForm" 
        :rules="phoneRules"
        label-width="100px"
      >
        <el-form-item label="手机号" prop="phone">
          <el-input 
            v-model="phoneForm.phone" 
            placeholder="请输入手机号"
            maxlength="11"
          />
        </el-form-item>
        <el-form-item label="验证码" prop="code">
          <div class="code-input-wrapper">
            <el-input 
              v-model="phoneForm.code" 
              placeholder="请输入验证码"
              maxlength="6"
            />
            <el-button 
              type="primary" 
              :disabled="countdown > 0"
              @click="sendCode('phone')"
              class="code-btn"
            >
              {{ countdown > 0 ? `${countdown}s后重发` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPhoneDialog = false">取消</el-button>
        <el-button type="primary" @click="handleBindPhone" :loading="phoneBinding">
          确认绑定
        </el-button>
      </template>
    </el-dialog>
    
    <el-dialog 
      v-model="showEmailDialog" 
      title="绑定邮箱" 
      width="480px"
      :close-on-click-modal="false"
      @closed="resetEmailForm"
    >
      <el-form 
        ref="emailFormRef"
        :model="emailForm" 
        :rules="emailRules"
        label-width="100px"
      >
        <el-form-item label="邮箱" prop="email">
          <el-input 
            v-model="emailForm.email" 
            placeholder="请输入邮箱地址"
          />
        </el-form-item>
        <el-form-item label="验证码" prop="code">
          <div class="code-input-wrapper">
            <el-input 
              v-model="emailForm.code" 
              placeholder="请输入验证码"
              maxlength="6"
            />
            <el-button 
              type="primary" 
              :disabled="countdown > 0"
              @click="sendCode('email')"
              class="code-btn"
            >
              {{ countdown > 0 ? `${countdown}s后重发` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEmailDialog = false">取消</el-button>
        <el-button type="primary" @click="handleBindEmail" :loading="emailBinding">
          确认绑定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { validators } from '@/utils/validators'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const profileFormRef = ref(null)
const passwordFormRef = ref(null)
const phoneFormRef = ref(null)
const emailFormRef = ref(null)

const activeMenu = ref('profile')
const saving = ref(false)
const passwordChanging = ref(false)
const phoneBinding = ref(false)
const emailBinding = ref(false)
const countdown = ref(0)

const showPasswordDialog = ref(false)
const showPhoneDialog = ref(false)
const showEmailDialog = ref(false)

const profileForm = reactive({
  nickname: '',
  phone: '',
  email: '',
  address: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const phoneForm = reactive({
  phone: '',
  code: ''
})

const emailForm = reactive({
  email: '',
  code: ''
})

const profileRules = computed(() => ({
  nickname: validators.nickname,
  phone: validators.phone,
  email: validators.email,
  address: userStore.isBuyer ? validators.address : []
}))

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: validators.password,
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const phoneRules = {
  phone: validators.phone,
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位数字', trigger: 'blur' }
  ]
}

const emailRules = {
  email: validators.email,
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位数字', trigger: 'blur' }
  ]
}

function handleMenuSelect(index) {
  activeMenu.value = index
  if (index === 'orders') {
    router.push('/orders')
  } else if (index === 'favorites') {
    router.push('/favorites')
  } else if (index === 'supplier') {
    router.push('/supplier')
  }
}

async function handleSaveProfile() {
  if (!profileFormRef.value) return
  
  try {
    await profileFormRef.value.validate()
  } catch (error) {
    return
  }
  
  saving.value = true
  await new Promise(resolve => setTimeout(resolve, 800))
  userStore.updateProfile(profileForm)
  saving.value = false
  ElMessage.success('个人信息修改成功')
}

function resetProfileForm() {
  initProfileForm()
}

function initProfileForm() {
  if (userStore.currentUser) {
    profileForm.nickname = userStore.currentUser.nickname || ''
    profileForm.phone = userStore.currentUser.phone || ''
    profileForm.email = userStore.currentUser.email || ''
    profileForm.address = userStore.currentUser.address || ''
  }
}

async function handleChangePassword() {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
  } catch (error) {
    return
  }
  
  if (passwordForm.oldPassword !== userStore.currentUser.password) {
    ElMessage.error('原密码错误')
    return
  }
  
  passwordChanging.value = true
  await new Promise(resolve => setTimeout(resolve, 800))
  userStore.updatePassword(passwordForm.newPassword)
  passwordChanging.value = false
  showPasswordDialog.value = false
  ElMessage.success('密码修改成功，请重新登录')
  userStore.logout()
  router.push('/login')
}

function resetPasswordForm() {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordFormRef.value?.clearValidate()
}

function sendCode(type) {
  ElMessage.success('验证码已发送，请查收')
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

async function handleBindPhone() {
  if (!phoneFormRef.value) return
  
  try {
    await phoneFormRef.value.validate()
  } catch (error) {
    return
  }
  
  if (phoneForm.code !== '123456') {
    ElMessage.error('验证码错误')
    return
  }
  
  phoneBinding.value = true
  await new Promise(resolve => setTimeout(resolve, 800))
  userStore.updateProfile({ phone: phoneForm.phone })
  profileForm.phone = phoneForm.phone
  phoneBinding.value = false
  showPhoneDialog.value = false
  ElMessage.success('手机号绑定成功')
}

function resetPhoneForm() {
  phoneForm.phone = ''
  phoneForm.code = ''
  countdown.value = 0
  phoneFormRef.value?.clearValidate()
}

async function handleBindEmail() {
  if (!emailFormRef.value) return
  
  try {
    await emailFormRef.value.validate()
  } catch (error) {
    return
  }
  
  if (emailForm.code !== '123456') {
    ElMessage.error('验证码错误')
    return
  }
  
  emailBinding.value = true
  await new Promise(resolve => setTimeout(resolve, 800))
  userStore.updateProfile({ email: emailForm.email })
  profileForm.email = emailForm.email
  emailBinding.value = false
  showEmailDialog.value = false
  ElMessage.success('邮箱绑定成功')
}

function resetEmailForm() {
  emailForm.email = ''
  emailForm.code = ''
  countdown.value = 0
  emailFormRef.value?.clearValidate()
}

onMounted(() => {
  initProfileForm()
  if (route.query.tab) {
    activeMenu.value = route.query.tab
  }
})
</script>

<style scoped lang="scss">
.profile-page {
  padding: 20px 0;
}

.page-layout {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.sidebar {
  width: 260px;
  flex-shrink: 0;
}

.user-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  margin-bottom: 20px;
  
  .user-avatar {
    position: relative;
    display: inline-block;
    margin-bottom: 16px;
    
    .role-tag {
      position: absolute;
      bottom: -4px;
      left: 50%;
      transform: translateX(-50%);
      white-space: nowrap;
    }
  }
  
  .user-info {
    .username {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 4px;
    }
    
    .user-account {
      font-size: 13px;
      color: #909399;
    }
  }
}

.menu-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  
  :deep(.el-menu) {
    border-right: none;
  }
}

.main-content {
  flex: 1;
  min-width: 0;
}

.content-card {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
  
  .card-title {
    font-size: 20px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;
  }
}

.profile-form {
  max-width: 500px;
}

.security-list {
  .security-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background: #f5f7fa;
    border-radius: 8px;
    margin-bottom: 16px;
    transition: all 0.2s ease;
    
    &:hover {
      background: #ecf5ff;
    }
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .security-info {
      display: flex;
      align-items: center;
      gap: 16px;
      
      h4 {
        font-size: 15px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 4px;
      }
      
      p {
        font-size: 13px;
        color: #909399;
        margin: 0;
      }
    }
  }
}

.code-input-wrapper {
  display: flex;
  gap: 12px;
  width: 100%;
  
  .el-input {
    flex: 1;
  }
  
  .code-btn {
    flex-shrink: 0;
    width: 120px;
  }
}

@media (max-width: 900px) {
  .page-layout {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
  }
}

@media (max-width: 600px) {
  .content-card {
    padding: 20px;
  }
  
  .security-item {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start !important;
  }
  
  .code-input-wrapper {
    flex-direction: column;
    
    .code-btn {
      width: 100%;
    }
  }
}
</style>
