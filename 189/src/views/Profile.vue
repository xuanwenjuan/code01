<template>
  <div class="profile-page">
    <div class="container page-wrapper">
      <h2 class="page-title">个人中心</h2>

      <div class="profile-layout">
        <aside class="profile-sidebar card">
          <div class="avatar-section">
            <el-avatar :size="80" :src="userStore.userInfo?.avatar">
              {{ userStore.userInfo?.name?.charAt(0) }}
            </el-avatar>
            <h3 class="user-name">{{ userStore.userInfo?.name }}</h3>
            <el-tag :type="userStore.isBuyer ? 'success' : 'primary'" effect="light">
              {{ userStore.isBuyer ? '采购方' : '供货商' }}
            </el-tag>
          </div>

          <el-menu :default-active="activeMenu" class="profile-menu" @select="handleMenuSelect">
            <el-menu-item index="info">
              <el-icon><User /></el-icon>
              <span>基本信息</span>
            </el-menu-item>
            <el-menu-item index="security">
              <el-icon><Lock /></el-icon>
              <span>账号安全</span>
            </el-menu-item>
            <el-menu-item index="orders" v-if="userStore.isBuyer">
              <el-icon><Document /></el-icon>
              <span>我的订单</span>
            </el-menu-item>
            <el-menu-item index="favorites" v-if="userStore.isBuyer">
              <el-icon><Star /></el-icon>
              <span>我的收藏</span>
            </el-menu-item>
          </el-menu>
        </aside>

        <main class="profile-main">
          <div class="card profile-content">
            <template v-if="activeMenu === 'info'">
              <h3 class="content-title">基本信息</h3>
              <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" class="profile-form">
                <el-form-item label="姓名" prop="name">
                  <el-input v-model="form.name" />
                </el-form-item>
                <el-form-item label="手机号" prop="phone">
                  <el-input v-model="form.phone" />
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="form.email" />
                </el-form-item>
                <el-form-item v-if="userStore.isBuyer" label="工坊名称" prop="workshopName">
                  <el-input v-model="form.workshopName" />
                </el-form-item>
                <el-form-item v-else label="公司名称" prop="companyName">
                  <el-input v-model="form.companyName" />
                </el-form-item>
                <el-form-item label="联系地址" prop="address">
                  <el-input v-model="form.address" type="textarea" :rows="3" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" :loading="saving" @click="handleSave">保存修改</el-button>
                </el-form-item>
              </el-form>
            </template>

            <template v-else-if="activeMenu === 'security'">
              <h3 class="content-title">账号安全</h3>
              <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="120px" class="profile-form">
                <el-form-item label="原密码" prop="oldPassword">
                  <el-input v-model="passwordForm.oldPassword" type="password" show-password />
                </el-form-item>
                <el-form-item label="新密码" prop="newPassword">
                  <el-input v-model="passwordForm.newPassword" type="password" show-password />
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                  <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" :loading="changing" @click="handleChangePassword">修改密码</el-button>
                </el-form-item>
              </el-form>
            </template>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Document, Star } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

const activeMenu = ref('info')
const formRef = ref(null)
const passwordFormRef = ref(null)
const saving = ref(false)
const changing = ref(false)

const form = reactive({
  name: '',
  phone: '',
  email: '',
  workshopName: '',
  companyName: '',
  address: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  workshopName: [{ required: true, message: '请输入工坊名称', trigger: 'blur' }],
  companyName: [{ required: true, message: '请输入公司名称', trigger: 'blur' }],
  address: [{ required: true, message: '请输入联系地址', trigger: 'blur' }]
}

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

function handleMenuSelect(index) {
  if (index === 'orders') {
    router.push('/orders')
  } else if (index === 'favorites') {
    router.push('/favorites')
  } else {
    activeMenu.value = index
  }
}

function handleSave() {
  formRef.value.validate((valid) => {
    if (valid) {
      saving.value = true
      setTimeout(() => {
        Object.assign(userStore.userInfo, form)
        localStorage.setItem('userInfo', JSON.stringify(userStore.userInfo))
        ElMessage.success('保存成功')
        saving.value = false
      }, 500)
    }
  })
}

function handleChangePassword() {
  passwordFormRef.value.validate((valid) => {
    if (valid) {
      changing.value = true
      setTimeout(() => {
        ElMessage.success('密码修改成功')
        passwordForm.oldPassword = ''
        passwordForm.newPassword = ''
        passwordForm.confirmPassword = ''
        changing.value = false
      }, 500)
    }
  })
}

onMounted(() => {
  Object.assign(form, userStore.userInfo)
})
</script>

<style lang="scss" scoped>
.profile-page {
  .page-title {
    font-size: 24px;
    font-weight: 600;
    color: $text-color;
    margin-bottom: 20px;
  }

  .profile-layout {
    display: flex;
    gap: 20px;
    align-items: flex-start;
  }

  .profile-sidebar {
    width: 240px;
    padding: 24px 0;
    flex-shrink: 0;

    .avatar-section {
      text-align: center;
      padding: 0 20px 24px;
      border-bottom: 1px solid $border-color;

      .user-name {
        font-size: 16px;
        font-weight: 600;
        color: $text-color;
        margin: 12px 0 8px;
      }
    }

    .profile-menu {
      border-right: none;
      padding: 16px 0;
    }
  }

  .profile-main {
    flex: 1;

    .profile-content {
      padding: 24px;

      .content-title {
        font-size: 18px;
        font-weight: 600;
        color: $text-color;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid $border-color;
      }

      .profile-form {
        max-width: 500px;
      }
    }
  }
}

@media (max-width: 768px) {
  .profile-layout {
    flex-direction: column;
  }

  .profile-sidebar {
    width: 100%;
  }
}
</style>
