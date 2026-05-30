<template>
  <header class="app-header">
    <div class="container header-inner">
      <div class="logo" @click="$router.push('/')">
        <el-icon :size="32" color="#409eff"><House /></el-icon>
        <span class="logo-text">同城租房</span>
      </div>

      <div class="city-selector" @click="showCityDialog = true">
        <el-icon><Location /></el-icon>
        <span>{{ currentCity.name }}</span>
        <el-icon class="arrow"><ArrowDown /></el-icon>
      </div>

      <nav class="nav-menu">
        <router-link to="/" class="nav-item" :class="{ active: $route.path === '/' }">首页</router-link>
        <router-link to="/house/list" class="nav-item" :class="{ active: $route.path.startsWith('/house') }">租房</router-link>
        <router-link to="/new-house" class="nav-item" :class="{ active: $route.path.startsWith('/new-house') }">新房</router-link>
        <router-link to="/news" class="nav-item" :class="{ active: $route.path.startsWith('/news') }">资讯</router-link>
      </nav>

      <div class="header-right">
        <template v-if="userStore.isLogin">
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32" :src="userStore.userInfo?.avatar" />
              <span class="username">{{ userStore.userInfo?.nickname }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon> 个人中心
                </el-dropdown-item>
                <el-dropdown-item command="favorites">
                  <el-icon><StarFilled /></el-icon> 我的收藏
                </el-dropdown-item>
                <el-dropdown-item command="appointments">
                  <el-icon><Calendar /></el-icon> 预约记录
                </el-dropdown-item>
                <el-dropdown-item command="footprints">
                  <el-icon><View /></el-icon> 浏览足迹
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon> 退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <router-link to="/login" class="login-btn">登录</router-link>
          <router-link to="/register" class="register-btn">注册</router-link>
        </template>
      </div>
    </div>

    <el-dialog v-model="showCityDialog" title="选择城市" width="500px">
      <div class="city-dialog">
        <div class="hot-cities">
          <div class="label">热门城市</div>
          <div class="city-list">
            <span
              v-for="city in hotCities"
              :key="city.code"
              class="city-item"
              :class="{ active: currentCity.code === city.code }"
              @click="selectCity(city)"
            >{{ city.name }}</span>
          </div>
        </div>
        <div class="all-cities">
          <div class="label">全部城市</div>
          <div class="city-list">
            <span
              v-for="city in allCities"
              :key="city.code"
              class="city-item"
              :class="{ active: currentCity.code === city.code }"
              @click="selectCity(city)"
            >{{ city.name }}</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { mockApi } from '@/utils/mockApi'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

const showCityDialog = ref(false)
const hotCities = ref([])
const allCities = ref([])

const currentCity = computed(() => appStore.currentCity)

mockApi.getCities().then((res) => {
  if (res.code === 200) {
    hotCities.value = res.data.filter((c) => c.hot)
    allCities.value = res.data
  }
})

const selectCity = (city) => {
  appStore.setCity(city)
  showCityDialog.value = false
  ElMessage.success(`已切换到${city.name}`)
}

const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/user/profile')
      break
    case 'favorites':
      router.push('/user/favorites')
      break
    case 'appointments':
      router.push('/user/appointments')
      break
    case 'footprints':
      router.push('/user/footprints')
      break
    case 'logout':
      ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        userStore.logout()
        ElMessage.success('已退出登录')
        router.push('/')
      }).catch(() => {})
      break
  }
}
</script>

<style lang="scss" scoped>
.app-header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  display: flex;
  align-items: center;
  height: 64px;
}

.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-right: 30px;

  .logo-text {
    font-size: 20px;
    font-weight: 600;
    color: #303133;
    margin-left: 8px;
  }
}

.city-selector {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 30px;
  transition: all 0.2s;

  &:hover {
    background: #ecf5ff;
  }

  .arrow {
    font-size: 12px;
    margin-left: 4px;
  }
}

.nav-menu {
  display: flex;
  flex: 1;

  .nav-item {
    padding: 0 20px;
    font-size: 15px;
    color: #606266;
    transition: all 0.2s;

    &:hover,
    &.active {
      color: #409eff;
      font-weight: 500;
    }
  }
}

.header-right {
  display: flex;
  align-items: center;

  .login-btn,
  .register-btn {
    padding: 6px 16px;
    border-radius: 4px;
    font-size: 14px;
    margin-left: 12px;
    transition: all 0.2s;
  }

  .login-btn {
    color: #606266;

    &:hover {
      color: #409eff;
    }
  }

  .register-btn {
    background: #409eff;
    color: #fff;

    &:hover {
      background: #66b1ff;
    }
  }

  .user-info {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      background: #f5f7fa;
    }

    .username {
      margin: 0 8px;
      color: #606266;
    }
  }
}

.city-dialog {
  .label {
    font-size: 14px;
    color: #909399;
    margin-bottom: 12px;
  }

  .city-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 20px;
  }

  .city-item {
    padding: 6px 16px;
    background: #f5f7fa;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover,
    &.active {
      background: #409eff;
      color: #fff;
    }
  }
}
</style>
