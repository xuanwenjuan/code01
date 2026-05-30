<template>
  <header class="bg-white shadow-sm sticky top-0 z-50">
    <div class="bg-gradient-to-r from-primary to-pink-400 text-white text-sm py-2">
      <div class="container mx-auto px-4 flex justify-between items-center">
        <span>🎉 欢迎来到母婴用品商城，新用户注册立享100元优惠券！</span>
        <div class="flex items-center gap-4">
          <a href="#" class="hover:underline">商家入驻</a>
          <a href="#" class="hover:underline">帮助中心</a>
          <a href="#" class="hover:underline">手机APP</a>
        </div>
      </div>
    </div>
    
    <div class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-3">
          <div class="w-12 h-12 bg-gradient-to-br from-primary to-pink-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            母婴
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-800">母婴用品商城</h1>
            <p class="text-xs text-gray-500">专注母婴 呵护成长</p>
          </div>
        </router-link>
        
        <div class="flex-1 max-w-2xl mx-8">
          <div class="flex">
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="搜索您想要的母婴好物..."
              class="flex-1 border-2 border-primary rounded-l-full px-6 py-3 outline-none focus:border-pink-500"
              @keyup.enter="handleSearch"
            />
            <button
              class="bg-primary text-white px-8 rounded-r-full hover:bg-pink-500 transition-colors"
              @click="handleSearch"
            >
              <Search class="inline-block w-5 h-5 mr-1" />
              搜索
            </button>
          </div>
          <div class="flex gap-3 mt-2 text-sm text-gray-500">
            <span>热门搜索：</span>
            <a href="#" class="hover:text-primary" v-for="tag in hotTags" :key="tag">{{ tag }}</a>
          </div>
        </div>
        
        <div class="flex items-center gap-6">
          <router-link to="/favorites" class="flex flex-col items-center text-gray-600 hover:text-primary transition-colors">
            <Star class="w-6 h-6" />
            <span class="text-xs mt-1">收藏夹</span>
          </router-link>
          
          <router-link to="/cart" class="relative flex flex-col items-center text-gray-600 hover:text-primary transition-colors">
            <ShoppingCart class="w-6 h-6" />
            <span class="text-xs mt-1">购物车</span>
            <span
              v-if="cartStore.totalCount > 0"
              class="absolute -top-1 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
            >
              {{ cartStore.totalCount > 99 ? '99+' : cartStore.totalCount }}
            </span>
          </router-link>
          
          <div v-if="userStore.isLoggedIn" class="relative group">
            <div class="flex items-center gap-2 cursor-pointer">
              <img :src="userStore.userInfo?.avatar" class="w-10 h-10 rounded-full border-2 border-primary" />
              <span class="text-gray-700">{{ userStore.userInfo?.nickname }}</span>
              <CaretBottom class="w-4 h-4 text-gray-500" />
            </div>
            <div class="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 hidden group-hover:block z-50">
              <router-link to="/user/profile" class="block px-4 py-2 hover:bg-gray-50 text-gray-700">
                <User class="inline-block w-4 h-4 mr-2" />
                个人中心
              </router-link>
              <router-link to="/user/orders" class="block px-4 py-2 hover:bg-gray-50 text-gray-700">
                <Document class="inline-block w-4 h-4 mr-2" />
                我的订单
              </router-link>
              <router-link to="/user/favorites" class="block px-4 py-2 hover:bg-gray-50 text-gray-700">
                <Star class="inline-block w-4 h-4 mr-2" />
                我的收藏
              </router-link>
              <div class="border-t my-2"></div>
              <a href="#" class="block px-4 py-2 hover:bg-gray-50 text-red-500" @click.prevent="handleLogout">
                <SwitchButton class="inline-block w-4 h-4 mr-2" />
                退出登录
              </a>
            </div>
          </div>
          
          <div v-else class="flex items-center gap-3">
            <router-link to="/login" class="text-gray-700 hover:text-primary">登录</router-link>
            <span class="text-gray-300">|</span>
            <router-link to="/register" class="text-gray-700 hover:text-primary">注册</router-link>
          </div>
        </div>
      </div>
    </div>
    
    <div class="border-t">
      <div class="container mx-auto px-4">
        <nav class="flex items-center gap-8 py-3">
          <div class="relative group">
            <button class="bg-primary text-white px-6 py-2 rounded-lg flex items-center gap-2">
              <Menu class="w-5 h-5" />
              全部商品分类
            </button>
            <div class="absolute top-full left-0 w-64 bg-white rounded-lg shadow-lg py-2 hidden group-hover:block z-50">
              <div
                v-for="category in categories"
                :key="category.id"
                class="px-4 py-3 hover:bg-pink-50 cursor-pointer flex items-center gap-3 border-b border-gray-100 last:border-0"
                @click="goToCategory(category.id)"
              >
                <span class="text-2xl">{{ category.icon }}</span>
                <div class="flex-1">
                  <div class="font-medium text-gray-800">{{ category.name }}</div>
                  <div class="text-xs text-gray-500 flex gap-2 mt-1">
                    <span v-for="child in category.children.slice(0, 3)" :key="child.id" class="hover:text-primary">
                      {{ child.name }}
                    </span>
                  </div>
                </div>
                <CaretRight class="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
          
          <router-link to="/" class="text-gray-700 hover:text-primary font-medium">首页</router-link>
          <router-link to="/category" class="text-gray-700 hover:text-primary font-medium">全部商品</router-link>
          <a href="#" class="text-gray-700 hover:text-primary font-medium">限时特惠</a>
          <a href="#" class="text-gray-700 hover:text-primary font-medium">品牌专区</a>
          <a href="#" class="text-gray-700 hover:text-primary font-medium">新品上市</a>
          <a href="#" class="text-gray-700 hover:text-primary font-medium">母婴课堂</a>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  ShoppingCart,
  Star,
  User,
  Menu,
  CaretBottom,
  CaretRight,
  Document,
  SwitchButton
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { categories } from '@/data/mock'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()

const searchKeyword = ref('')
const hotTags = ['婴儿奶粉', '纸尿裤', '婴儿推车', '奶瓶', '玩具', '孕妇装']

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/category', query: { keyword: searchKeyword.value } })
  }
}

const goToCategory = (id) => {
  router.push(`/category/${id}`)
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
