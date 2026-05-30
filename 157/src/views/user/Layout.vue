<template>
  <div class="flex gap-6">
    <aside class="w-64 flex-shrink-0">
      <div class="bg-white rounded-xl shadow-sm sticky top-24">
        <div class="p-6 border-b text-center">
          <img
            :src="userStore.userInfo?.avatar"
            class="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-primary"
          />
          <h3 class="font-bold text-gray-800">{{ userStore.userInfo?.nickname }}</h3>
          <p class="text-sm text-gray-500 mt-1">{{ userStore.userInfo?.phone }}</p>
        </div>
        
        <nav class="p-4">
          <div
            v-for="item in menuItems"
            :key="item.path"
            class="mb-1"
          >
            <router-link
              :to="item.path"
              class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
              :class="{
                'bg-primary text-white': isActive(item.path),
                'text-gray-600 hover:bg-pink-50 hover:text-primary': !isActive(item.path)
              }"
            >
              <component :is="item.icon" class="w-5 h-5" />
              <span>{{ item.label }}</span>
            </router-link>
          </div>
          
          <div class="border-t my-4 pt-4">
            <button
              class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
              @click="handleLogout"
            >
              <SwitchButton class="w-5 h-5" />
              <span>退出登录</span>
            </button>
          </div>
        </nav>
      </div>
    </aside>
    
    <main class="flex-1">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  User,
  Document,
  Location,
  Star,
  Lock,
  SwitchButton
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const menuItems = [
  { label: '个人资料', path: '/user/profile', icon: User },
  { label: '订单管理', path: '/user/orders', icon: Document },
  { label: '收货地址', path: '/user/address', icon: Location },
  { label: '我的收藏', path: '/user/favorites', icon: Star },
  { label: '修改密码', path: '/user/password', icon: Lock }
]

const isActive = (path) => {
  return route.path === path
}

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
    ElMessage.success('退出登录成功')
    router.push('/')
  }).catch(() => {})
}
</script>
