<template>
  <div class="profile-page">
    <div class="container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>个人中心</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="profile-content">
        <aside class="sidebar">
          <div class="user-card">
            <el-avatar :size="80" :src="userStore.currentUser?.avatar" />
            <h3 class="user-name">{{ userStore.currentUser?.name }}</h3>
            <el-tag :type="userStore.currentUser?.role === 'buyer' ? 'primary' : 'success'" size="small">
              {{ userStore.currentUser?.roleText }}
            </el-tag>
          </div>
          <el-menu
            :default-active="activeMenu"
            class="sidebar-menu"
            @select="handleMenuSelect"
          >
            <el-menu-item index="profile">
              <el-icon><User /></el-icon>
              <span>个人信息</span>
            </el-menu-item>
            <el-menu-item index="orders">
              <el-icon><List /></el-icon>
              <span>我的订单</span>
            </el-menu-item>
            <el-menu-item index="favorites">
              <el-icon><Star /></el-icon>
              <span>我的收藏</span>
            </el-menu-item>
          </el-menu>
        </aside>

        <main class="main-content">
          <div v-if="activeMenu === 'profile'" class="profile-form">
            <h2 class="section-title">个人信息</h2>
            <div v-if="loading" class="form-loading">
              <LoadingState type="spinner" />
            </div>
            <el-form
              v-else
              ref="profileFormRef"
              :model="profileForm"
              :rules="profileRules"
              label-width="100px"
            >
              <el-form-item label="用户名">
                <el-input v-model="profileForm.username" disabled>
                  <template #prefix>
                    <el-icon><User /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item label="姓名" prop="name">
                <el-input v-model="profileForm.name" placeholder="请输入真实姓名">
                  <template #prefix>
                    <el-icon><Avatar /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="profileForm.email" placeholder="请输入邮箱地址">
                  <template #prefix>
                    <el-icon><Message /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item label="手机号" prop="phone">
                <el-input v-model="profileForm.phone" placeholder="请输入手机号码">
                  <template #prefix>
                    <el-icon><Phone /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item label="所属单位" prop="organization">
                <el-input v-model="profileForm.organization" placeholder="请输入所属单位名称">
                  <template #prefix>
                    <el-icon><OfficeBuilding /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item label="角色">
                <el-tag :type="profileForm.role === 'buyer' ? 'primary' : 'success'" effect="dark">
                  <el-icon style="margin-right: 4px">
                    <component :is="profileForm.role === 'buyer' ? 'User' : 'Shop'" />
                  </el-icon>
                  {{ profileForm.roleText }}
                </el-tag>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :loading="saving" @click="handleSave">
                  <el-icon><Check /></el-icon>
                  保存修改
                </el-button>
                <el-button @click="handleReset">
                  <el-icon><Refresh /></el-icon>
                  重置
                </el-button>
              </el-form-item>
            </el-form>
          </div>

          <div v-else-if="activeMenu === 'orders'" class="orders-section">
            <h2 class="section-title">我的订单</h2>
            <el-tabs v-model="orderStatus" class="order-tabs">
              <el-tab-pane label="全部" name="all">
                <OrderList :status="null" />
              </el-tab-pane>
              <el-tab-pane :label="`待付款 (${orderStats.pending})`" name="pending">
                <OrderList status="pending" />
              </el-tab-pane>
              <el-tab-pane :label="`已发货 (${orderStats.shipped})`" name="shipped">
                <OrderList status="shipped" />
              </el-tab-pane>
              <el-tab-pane :label="`已完成 (${orderStats.completed})`" name="completed">
                <OrderList status="completed" />
              </el-tab-pane>
            </el-tabs>
          </div>

          <div v-else-if="activeMenu === 'favorites'" class="favorites-section">
            <h2 class="section-title">我的收藏</h2>
            <FavoriteList />
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useOrderStore } from '@/stores/order'
import { ElMessage } from 'element-plus'
import OrderList from '@/components/OrderList.vue'
import FavoriteList from '@/components/FavoriteList.vue'
import LoadingState from '@/components/LoadingState.vue'

const router = useRouter()
const userStore = useUserStore()
const orderStore = useOrderStore()

const activeMenu = ref('profile')
const profileFormRef = ref(null)
const loading = ref(true)
const saving = ref(false)
const orderStatus = ref('all')
const originalForm = ref({})

const profileForm = reactive({
  username: '',
  name: '',
  email: '',
  phone: '',
  organization: '',
  role: '',
  roleText: ''
})

const orderStats = computed(() => orderStore.getOrderStats)

const validateName = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入姓名'))
  } else if (!/^[\u4e00-\u9fa5a-zA-Z]{2,20}$/.test(value)) {
    callback(new Error('姓名由2-20位中文或英文字母组成'))
  } else {
    callback()
  }
}

const validateEmail = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入邮箱'))
  } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
    callback(new Error('请输入正确的邮箱格式'))
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

const validateOrganization = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入所属单位'))
  } else if (value.length < 2) {
    callback(new Error('单位名称至少2个字符'))
  } else if (value.length > 100) {
    callback(new Error('单位名称不能超过100个字符'))
  } else {
    callback()
  }
}

const profileRules = {
  name: [{ validator: validateName, trigger: 'blur' }],
  email: [{ validator: validateEmail, trigger: 'blur' }],
  phone: [{ validator: validatePhone, trigger: 'blur' }],
  organization: [{ validator: validateOrganization, trigger: 'blur' }]
}

const handleMenuSelect = (index) => {
  activeMenu.value = index
  if (index === 'orders') {
    router.push('/orders')
  } else if (index === 'favorites') {
    router.push('/favorites')
  }
}

const handleReset = () => {
  if (profileFormRef.value) {
    profileFormRef.value.resetFields()
  }
  Object.assign(profileForm, originalForm.value)
}

const handleSave = () => {
  profileFormRef.value.validate((valid) => {
    if (valid) {
      saving.value = true
      setTimeout(() => {
        const { username, role, roleText, ...updateData } = profileForm
        userStore.updateUser(updateData)
        originalForm.value = { ...profileForm }
        saving.value = false
        ElMessage.success('保存成功')
      }, 500)
    }
  })
}

onMounted(() => {
  if (userStore.currentUser) {
    Object.assign(profileForm, userStore.currentUser)
    originalForm.value = { ...profileForm }
    setTimeout(() => {
      loading.value = false
    }, 300)
  }
})
</script>

<style lang="scss" scoped>
.profile-page {
  .breadcrumb {
    margin-bottom: 20px;
  }

  .form-loading {
    padding: 60px 0;
    display: flex;
    justify-content: center;
  }

  .profile-content {
    display: flex;
    gap: 20px;
  }

  .sidebar {
    width: 240px;
    flex-shrink: 0;

    .user-card {
      background: #fff;
      padding: 30px 20px;
      border-radius: 8px;
      text-align: center;
      margin-bottom: 15px;

      .user-name {
        margin: 15px 0 8px;
        font-size: 16px;
        font-weight: 500;
        color: #303133;
      }
    }

    .sidebar-menu {
      border-right: none;
      background: #fff;
      border-radius: 8px;
    }
  }

  .main-content {
    flex: 1;
    background: #fff;
    padding: 30px;
    border-radius: 8px;

    .section-title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 25px;
      color: #303133;

      &::before {
        display: none;
      }
    }

    .profile-form {
      max-width: 500px;
    }

    .order-tabs {
      margin-top: -10px;
    }
  }
}

@media (max-width: 768px) {
  .profile-page {
    .profile-content {
      flex-direction: column;
    }

    .sidebar {
      width: 100%;
    }
  }
}
</style>
