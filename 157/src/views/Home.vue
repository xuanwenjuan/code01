<template>
  <div class="space-y-12">
    <div class="flex gap-6">
      <div class="flex-1">
        <el-carousel :interval="4000" height="400px" class="rounded-xl overflow-hidden">
          <el-carousel-item v-for="banner in banners" :key="banner.id">
            <div class="relative w-full h-full">
              <img :src="banner.image" :alt="banner.title" class="w-full h-full object-cover" />
              <div class="absolute inset-0 flex items-center">
                <div class="ml-16 text-white">
                  <h2 class="text-4xl font-bold mb-3">{{ banner.title }}</h2>
                  <p class="text-xl mb-6">{{ banner.subtitle }}</p>
                  <button class="bg-white text-primary px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors">
                    立即抢购
                  </button>
                </div>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>
      <div class="w-64 space-y-4">
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <h3 class="font-bold text-gray-800 mb-3 flex items-center">
            <Bell class="w-5 h-5 text-primary mr-2" />
            公告
          </h3>
          <ul class="space-y-2 text-sm text-gray-600">
            <li class="hover:text-primary cursor-pointer truncate">🎉 新年特惠活动进行中，全场满300减50</li>
            <li class="hover:text-primary cursor-pointer truncate">📦 春节期间发货通知</li>
            <li class="hover:text-primary cursor-pointer truncate">🎁 新用户注册送100元优惠券</li>
            <li class="hover:text-primary cursor-pointer truncate">⭐ 会员积分兑换活动开始了</li>
          </ul>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div v-for="nav in quickNavs" :key="nav.name" class="bg-white rounded-xl p-4 shadow-sm text-center cursor-pointer hover:shadow-md transition-shadow">
            <div class="text-3xl mb-2">{{ nav.icon }}</div>
            <div class="text-sm text-gray-700">{{ nav.name }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="grid grid-cols-8 gap-4">
        <div
          v-for="category in categories"
          :key="category.id"
          class="text-center cursor-pointer group"
          @click="goToCategory(category.id)"
        >
          <div class="w-16 h-16 mx-auto bg-gradient-to-br from-pink-50 to-pink-100 rounded-full flex items-center justify-center text-3xl mb-2 group-hover:scale-110 transition-transform">
            {{ category.icon }}
          </div>
          <div class="text-gray-700 text-sm group-hover:text-primary transition-colors">{{ category.name }}</div>
        </div>
      </div>
    </div>
    
    <section id="hot">
      <div class="flex items-center justify-between mb-6">
        <h2 class="section-title">爆款推荐</h2>
        <router-link to="/category" class="text-gray-500 hover:text-primary text-sm flex items-center">
          查看更多
          <ArrowRight class="w-4 h-4 ml-1" />
        </router-link>
      </div>
      <div class="grid grid-cols-5 gap-6">
        <ProductCard v-for="product in hotProducts" :key="product.id" :product="product" />
      </div>
    </section>
    
    <section id="new">
      <div class="flex items-center justify-between mb-6">
        <h2 class="section-title">新品上市</h2>
        <router-link to="/category" class="text-gray-500 hover:text-primary text-sm flex items-center">
          查看更多
          <ArrowRight class="w-4 h-4 ml-1" />
        </router-link>
      </div>
      <div class="grid grid-cols-5 gap-6">
        <ProductCard v-for="product in newProducts" :key="product.id" :product="product" />
      </div>
    </section>
    
    <section
      v-for="(floor, index) in floors"
      :key="floor.id"
      :id="`floor${floor.id}`"
      class="bg-gradient-to-b to-white rounded-xl p-6 shadow-sm"
      :class="floor.bgColor"
    >
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-800 flex items-center">
          <span class="w-1 h-6 bg-primary rounded-full mr-3"></span>
          {{ floor.name }}
        </h2>
        <div class="flex gap-2">
          <span
            v-for="child in getCategoryChildren(floor.categoryId)"
            :key="child.id"
            class="text-sm text-gray-500 hover:text-primary cursor-pointer px-3 py-1 rounded-full hover:bg-pink-50 transition-colors"
            @click="goToCategory(child.id)"
          >
            {{ child.name }}
          </span>
        </div>
      </div>
      <div class="grid grid-cols-5 gap-6">
        <ProductCard v-for="product in getFloorProducts(floor.categoryId)" :key="product.id" :product="product" />
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Bell, ArrowRight } from '@element-plus/icons-vue'
import ProductCard from '@/components/ProductCard.vue'
import { categories, banners, products, floors, getHotProducts, getNewProducts } from '@/data/mock'

const router = useRouter()

const quickNavs = [
  { name: '限时秒杀', icon: '⚡' },
  { name: '优惠券', icon: '🎫' },
  { name: '积分商城', icon: '🎁' },
  { name: '免费试用', icon: '🆓' }
]

const hotProducts = computed(() => getHotProducts())
const newProducts = computed(() => getNewProducts())

const getCategoryChildren = (categoryId) => {
  const category = categories.find(c => c.id === categoryId)
  return category?.children || []
}

const getFloorProducts = (categoryId) => {
  const childIds = getCategoryChildren(categoryId).map(c => c.id)
  return products.filter(p => childIds.includes(p.categoryId)).slice(0, 5)
}

const goToCategory = (id) => {
  router.push(`/category/${id}`)
}
</script>
