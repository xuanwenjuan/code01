<template>
  <div class="user-center-page">
    <div class="container" v-loading="loading">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="8" :md="6">
          <el-card class="user-card">
            <div class="user-info">
              <el-avatar :size="80" :src="userStore.user.avatar" />
              <h3 class="username">{{ userStore.user.nickname }}</h3>
              <el-tag :type="userStore.user.role === 'merchant' ? 'warning' : 'primary'" size="small">
                {{ userStore.user.role === 'merchant' ? '商家账号' : '普通用户' }}
              </el-tag>
            </div>
            <el-menu
              :default-active="activeMenu"
              class="user-menu"
              @select="handleMenuSelect"
            >
              <el-menu-item index="profile">
                <el-icon><User /></el-icon>
                <span>个人资料</span>
              </el-menu-item>
              <el-menu-item index="orders">
                <el-icon><Tickets /></el-icon>
                <span>我的订单</span>
              </el-menu-item>
              <el-menu-item index="favorites">
                <el-icon><Star /></el-icon>
                <span>我的收藏</span>
              </el-menu-item>
              <el-menu-item index="security">
                <el-icon><Lock /></el-icon>
                <span>账号安全</span>
              </el-menu-item>
            </el-menu>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="16" :md="18">
          <el-card v-show="activeMenu === 'profile'" class="content-card">
            <template #header>
              <div class="card-header">
                <span>个人资料</span>
                <el-button type="primary" size="small" @click="editMode = !editMode">
                  {{ editMode ? '取消' : '编辑' }}
                </el-button>
              </div>
            </template>
            
            <el-form
              ref="profileFormRef"
              :model="profileForm"
              :rules="profileRules"
              label-width="100px"
              class="profile-form"
            >
              <el-form-item label="用户名">
                <el-input v-model="profileForm.username" disabled />
              </el-form-item>
              <el-form-item label="昵称" prop="nickname">
                <el-input v-model="profileForm.nickname" :disabled="!editMode" />
              </el-form-item>
              <el-form-item label="手机号" prop="phone">
                <el-input v-model="profileForm.phone" :disabled="!editMode" />
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="profileForm.email" :disabled="!editMode" />
              </el-form-item>
              <el-form-item label="性别">
                <el-radio-group v-model="profileForm.gender" :disabled="!editMode">
                  <el-radio value="male">男</el-radio>
                  <el-radio value="female">女</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="生日">
                <el-date-picker
                  v-model="profileForm.birthday"
                  type="date"
                  placeholder="选择日期"
                  :disabled="!editMode"
                  style="width: 100%"
                />
              </el-form-item>
              <el-form-item label="收货地址">
                <el-input
                  v-model="profileForm.address"
                  type="textarea"
                  :rows="2"
                  :disabled="!editMode"
                />
              </el-form-item>
              <el-form-item v-if="editMode">
                <el-button type="primary" @click="handleSaveProfile">保存</el-button>
                <el-button @click="editMode = false">取消</el-button>
              </el-form-item>
            </el-form>
          </el-card>

          <el-card v-show="activeMenu === 'orders'" class="content-card">
            <template #header>
              <span>我的订单</span>
            </template>
            <order-list />
          </el-card>

          <el-card v-show="activeMenu === 'favorites'" class="content-card">
            <template #header>
              <span>我的收藏</span>
            </template>
            <favorites-list />
          </el-card>

          <el-card v-show="activeMenu === 'security'" class="content-card">
            <template #header>
              <span>账号安全</span>
            </template>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="登录密码">
                已设置
                <el-button type="text" style="margin-left: 20px">修改密码</el-button>
              </el-descriptions-item>
              <el-descriptions-item label="绑定手机">
                {{ userStore.user.phone }}
                <el-button type="text" style="margin-left: 20px">修改</el-button>
              </el-descriptions-item>
              <el-descriptions-item label="绑定邮箱">
                {{ userStore.user.email }}
                <el-button type="text" style="margin-left: 20px">修改</el-button>
              </el-descriptions-item>
              <el-descriptions-item label="注册时间">
                {{ userStore.user.createdAt ? formatDate(userStore.user.createdAt) : '-' }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { validateNickname, validatePhone, validateEmail, formatDate } from '@/utils/validate'
import OrderList from '@/components/OrderList.vue'
import FavoritesList from '@/components/FavoritesList.vue'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const activeMenu = ref('profile')
const editMode = ref(false)
const profileFormRef = ref(null)

const fetchData = async () => {
  loading.value = true
  await new Promise(resolve => setTimeout(resolve, 300))
  loading.value = false
}

const profileForm = reactive({
  username: '',
  nickname: '',
  phone: '',
  email: '',
  gender: 'male',
  birthday: '',
  address: ''
})

const profileRules = {
  nickname: [{ validator: validateNickname, trigger: 'blur' }],
  phone: [{ validator: validatePhone, trigger: 'blur' }],
  email: [{ validator: validateEmail, trigger: 'blur' }]
}

const handleMenuSelect = (index) => {
  if (index === 'orders') {
    router.push('/orders')
  } else if (index === 'favorites') {
    router.push('/favorites')
  } else {
    activeMenu.value = index
  }
}

const handleSaveProfile = async () => {
  if (!profileFormRef.value) return
  
  await profileFormRef.value.validate((valid) => {
    if (valid) {
      const result = userStore.updateUserInfo(profileForm)
      if (result.success) {
        ElMessage.success(result.message)
        editMode.value = false
      } else {
        ElMessage.error(result.message)
      }
    }
  })
}

onMounted(() => {
  fetchData()
  const user = userStore.user
  profileForm.username = user.username || ''
  profileForm.nickname = user.nickname || ''
  profileForm.phone = user.phone || ''
  profileForm.email = user.email || ''
  profileForm.gender = user.gender || 'male'
  profileForm.birthday = user.birthday || ''
  profileForm.address = user.address || ''
})
</script>

<style scoped>
.user-center-page {
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.user-card {
  position: sticky;
  top: 100px;
}

.user-info {
  text-align: center;
  padding: 20px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.username {
  margin: 15px 0 10px 0;
  font-size: 18px;
  font-weight: bold;
}

.user-menu {
  border-right: none;
}

.content-card {
  min-height: 500px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.profile-form {
  max-width: 500px;
}

@media (max-width: 768px) {
  .user-card {
    position: static;
    margin-bottom: 20px;
  }
}
</style>
