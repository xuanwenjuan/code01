<template>
  <div class="profile-page">
    <div class="container">
      <div class="breadcrumb">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>个人中心</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div class="profile-layout">
        <div class="sidebar card">
          <div class="user-info">
            <el-avatar :size="80" :icon="UserFilled" />
            <h3>{{ userStore.userInfo?.name }}</h3>
            <el-tag :type="userStore.userInfo?.role === 'buyer' ? 'primary' : 'success'" size="small">
              {{ userStore.userInfo?.role === 'buyer' ? '采购用户' : '仪器商家' }}
            </el-tag>
          </div>
          <el-menu
            :default-active="activeMenu"
            class="side-menu"
            @select="handleMenuSelect"
          >
            <el-menu-item index="info">
              <el-icon><User /></el-icon>
              <span>账户信息</span>
            </el-menu-item>
            <el-menu-item index="orders">
              <el-icon><List /></el-icon>
              <span>采购订单</span>
            </el-menu-item>
            <el-menu-item index="favorites">
              <el-icon><Star /></el-icon>
              <span>我的收藏</span>
            </el-menu-item>
            <el-menu-item index="password">
              <el-icon><Lock /></el-icon>
              <span>修改密码</span>
            </el-menu-item>
          </el-menu>
        </div>

        <div class="main-content">
          <div v-show="activeMenu === 'info'" class="card content-card">
            <h3 class="card-title">账户信息</h3>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="账号">
                {{ userStore.userInfo?.username }}
              </el-descriptions-item>
              <el-descriptions-item label="姓名">
                {{ userStore.userInfo?.name }}
              </el-descriptions-item>
              <el-descriptions-item label="身份">
                <el-tag :type="userStore.userInfo?.role === 'buyer' ? 'primary' : 'success'">
                  {{ userStore.userInfo?.role === 'buyer' ? '采购用户' : '仪器商家' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="手机号码">
                {{ userStore.userInfo?.phone }}
              </el-descriptions-item>
              <el-descriptions-item label="邮箱">
                {{ userStore.userInfo?.email }}
              </el-descriptions-item>
              <el-descriptions-item label="所属企业">
                {{ userStore.userInfo?.company }}
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <div v-show="activeMenu === 'password'" class="card content-card">
            <h3 class="card-title">修改密码</h3>
            <el-form
              ref="passwordFormRef"
              :model="passwordForm"
              :rules="passwordRules"
              label-width="100px"
              class="password-form"
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
                  placeholder="请输入新密码"
                  show-password
                />
              </el-form-item>
              <el-form-item label="确认新密码" prop="confirmPassword">
                <el-input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  placeholder="请再次输入新密码"
                  show-password
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleChangePassword">
                  确认修改
                </el-button>
                <el-button @click="resetPasswordForm">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
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
import { UserFilled, User, List, Star, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const activeMenu = ref('info')
const passwordFormRef = ref(null)

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateNewPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入新密码'))
  } else if (!/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d_]{6,20}$/.test(value)) {
    callback(new Error('密码需包含字母和数字，长度6-20位'))
  } else if (value === passwordForm.oldPassword) {
    callback(new Error('新密码不能与原密码相同'))
  } else {
    callback()
  }
}

const validateConfirmPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请再次输入新密码'))
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20位', trigger: 'blur' }
  ],
  newPassword: [{ validator: validateNewPassword, trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }]
}

const handleMenuSelect = (index) => {
  activeMenu.value = index
  if (index === 'orders') {
    router.push('/orders')
  } else if (index === 'favorites') {
    router.push('/favorites')
  }
}

const handleChangePassword = async () => {
  if (!passwordFormRef.value) return

  await passwordFormRef.value.validate((valid) => {
    if (valid) {
      if (passwordForm.oldPassword !== '123456') {
        ElMessage.error('原密码错误')
        return
      }
      ElMessage.success('密码修改成功')
      resetPasswordForm()
    }
  })
}

const resetPasswordForm = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordFormRef.value?.resetFields()
}
</script>

<style scoped>
.profile-page {
  padding: 24px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.breadcrumb {
  margin-bottom: 16px;
}

.profile-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 20px;
}

.sidebar {
  padding: 20px 0;
  height: fit-content;
}

.user-info {
  text-align: center;
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 10px;
}

.user-info h3 {
  margin: 12px 0 8px;
  font-size: 16px;
  color: #303133;
}

.side-menu {
  border-right: none;
}

.main-content {
  min-height: 400px;
}

.content-card {
  padding: 24px;
}

.card-title {
  font-size: 18px;
  margin: 0 0 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
  color: #303133;
}

.password-form {
  max-width: 400px;
}

@media (max-width: 768px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
  }
}
</style>
