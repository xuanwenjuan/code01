<template>
  <header class="app-header">
    <div class="container header-content">
      <div class="logo" @click="goHome">
        <el-icon size="32" color="#409eff"><Compass /></el-icon>
        <span class="logo-text">户外装备选购平台</span>
      </div>
      
      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索户外装备..."
          size="large"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button @click="handleSearch">
              <el-icon><Search /></el-icon>
            </el-button>
          </template>
        </el-input>
      </div>
      
      <nav class="nav-menu">
        <router-link to="/" class="nav-item">首页</router-link>
        
        <el-dropdown trigger="click">
          <span class="nav-item">
            分类
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="cat in categories"
                :key="cat.id"
                @click="goCategory(cat.id)"
              >
                <el-icon style="margin-right: 8px"><component :is="cat.icon" /></el-icon>
                {{ cat.name }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        
        <el-dropdown trigger="click">
          <span class="nav-item">
            场景
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="scene in scenes"
                :key="scene.type"
                @click="goScene(scene.type)"
              >
                {{ scene.name }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        
        <template v-if="userStore.isLoggedIn">
          <router-link to="/favorites" class="nav-item">
            <el-icon><Star /></el-icon>
            收藏
          </router-link>
          <router-link to="/orders" class="nav-item">
            <el-icon><List /></el-icon>
            订单
          </router-link>
          
          <el-dropdown trigger="click">
            <div class="user-info">
              <el-avatar :size="32" :src="userStore.userInfo?.avatar" />
              <span class="username">{{ userStore.userInfo?.nickname }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goProfile">
                  <el-icon><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item v-if="userStore.isMerchant" @click="goMerchant">
                  <el-icon><Shop /></el-icon>
                  商家中心
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        
        <template v-else>
          <router-link to="/login" class="nav-item">登录</router-link>
          <router-link to="/register" class="nav-item register-btn">注册</router-link>
        </template>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useProductStore } from '@/stores/product'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const productStore = useProductStore()

const searchKeyword = ref('')
const categories = productStore.categories
const scenes = productStore.scenes

const goHome = () => router.push('/')
const goCategory = (id) => router.push(`/category/${id}`)
const goScene = (type) => router.push(`/scene/${type}`)
const goProfile = () => router.push('/profile')
const goMerchant = () => router.push('/merchant')

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({ name: 'Home', query: { search: searchKeyword.value } })
  }
}

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/')
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.app-header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  height: 70px;
  gap: 30px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  
  .logo-text {
    font-size: 20px;
    font-weight: 700;
    background: linear-gradient(135deg, #409eff, #67c23a);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.search-box {
  flex: 1;
  max-width: 400px;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #606266;
  font-size: 15px;
  cursor: pointer;
  transition: color 0.3s;
  
  &:hover {
    color: #409eff;
  }
  
  &.register-btn {
    background: linear-gradient(135deg, #409eff, #66b1ff);
    color: #fff;
    padding: 6px 16px;
    border-radius: 20px;
    
    &:hover {
      opacity: 0.9;
      color: #fff;
    }
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  
  .username {
    font-size: 14px;
    color: #606266;
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
