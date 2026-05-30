<template>
  <div v-if="product">
    <Breadcrumb :items="breadcrumbItems" />
    
    <div class="bg-white rounded-xl shadow-sm p-8">
      <div class="flex gap-8">
        <div class="w-96 flex-shrink-0">
          <div class="relative aspect-square rounded-xl overflow-hidden bg-gray-100 mb-4">
            <img :src="currentImage" class="w-full h-full object-cover" />
            <div v-if="product.isHot" class="absolute top-4 left-4 bg-red-500 text-white text-sm px-3 py-1 rounded-full">
              热卖商品
            </div>
            <div v-if="product.isNew" class="absolute top-4 left-20 bg-green-500 text-white text-sm px-3 py-1 rounded-full">
              新品上市
            </div>
          </div>
          <div class="flex gap-3">
            <div
              v-for="(img, index) in product.images"
              :key="index"
              class="w-20 h-20 rounded-lg overflow-hidden border-2 cursor-pointer transition-all hover:scale-105"
              :class="{ 'border-primary ring-2 ring-pink-200': currentImage === img, 'border-gray-200 hover:border-gray-400': currentImage !== img }"
              @click="currentImage = img"
            >
              <img :src="img" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>
        
        <div class="flex-1">
          <h1 class="text-2xl font-bold text-gray-800 mb-3 leading-relaxed">{{ product.name }}</h1>
          <p class="text-gray-500 mb-6">{{ product.description }}</p>
          
          <div class="bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl p-6 mb-6">
            <div class="flex items-baseline gap-4 mb-4">
              <span class="text-4xl font-bold text-red-500">¥{{ currentPrice }}</span>
              <span class="text-lg text-gray-400 line-through">¥{{ product.originalPrice }}</span>
              <span class="bg-red-500 text-white text-sm px-3 py-1 rounded-full">
                省 {{ product.originalPrice - currentPrice }} 元
              </span>
            </div>
            <div class="flex items-center gap-8 text-sm text-gray-600">
              <span>销量：<strong class="text-gray-800">{{ product.sales }}</strong></span>
              <span>库存：<strong class="text-gray-800">{{ product.stock }}</strong> 件</span>
              <span class="flex items-center">
                <Star class="w-4 h-4 text-yellow-400 fill-current mr-1" />
                {{ product.rating }} 分
              </span>
              <span>评价：<strong class="text-gray-800">{{ reviews.length }}</strong> 条</span>
            </div>
          </div>
          
          <div class="space-y-6 mb-8">
            <div v-for="spec in product.specs" :key="spec.name" class="flex items-start gap-4">
              <span class="w-20 text-gray-500 pt-2 flex-shrink-0">{{ spec.name }}：</span>
              <div class="flex flex-wrap gap-3">
                <button
                  v-for="option in spec.options"
                  :key="option"
                  class="px-6 py-2.5 border-2 rounded-xl text-sm font-medium transition-all"
                  :class="{
                    'border-primary bg-pink-50 text-primary ring-2 ring-pink-100': selectedSpecs[spec.name] === option,
                    'border-gray-200 hover:border-gray-300 hover:bg-gray-50': selectedSpecs[spec.name] !== option
                  }"
                  @click="selectSpec(spec.name, option)"
                >
                  {{ option }}
                </button>
              </div>
            </div>
            
            <div class="flex items-start gap-4">
              <span class="w-20 text-gray-500 pt-2 flex-shrink-0">数量：</span>
              <div class="flex items-center">
                <QuantitySelector v-model="quantity" :max="product.stock" />
                <span class="ml-4 text-sm text-gray-400">（库存 {{ product.stock }} 件）</span>
              </div>
            </div>
          </div>
          
          <div class="flex gap-4">
            <button
              class="flex-1 py-4 bg-gradient-to-r from-primary to-pink-400 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
              @click="handleAddCart"
            >
              <ShoppingCart class="w-5 h-5" />
              加入购物车
            </button>
            <button
              class="flex-1 py-4 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 hover:shadow-lg transition-all flex items-center justify-center gap-2"
              @click="handleBuyNow"
            >
              <CreditCard class="w-5 h-5" />
              立即购买
            </button>
            <button
              class="w-14 h-14 border-2 border-gray-200 rounded-xl flex items-center justify-center hover:border-primary hover:text-primary hover:bg-pink-50 transition-all"
              :class="{ 'border-primary text-primary bg-pink-50': isFavorited }"
              @click="handleToggleFavorite"
              :title="isFavorited ? '取消收藏' : '收藏商品'"
            >
              <Star class="w-6 h-6" :class="{ 'fill-current': isFavorited }" />
            </button>
          </div>
          
          <div class="mt-6 flex gap-8 text-sm text-gray-500">
            <span class="flex items-center gap-1">
              <CircleCheck class="w-4 h-4 text-green-500" />
              正品保证
            </span>
            <span class="flex items-center gap-1">
              <CircleCheck class="w-4 h-4 text-green-500" />
              七天无理由退换
            </span>
            <span class="flex items-center gap-1">
              <CircleCheck class="w-4 h-4 text-green-500" />
              急速发货
            </span>
            <span class="flex items-center gap-1">
              <CircleCheck class="w-4 h-4 text-green-500" />
              售后无忧
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="mt-6 bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="border-b flex gap-8 px-6">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="py-4 px-2 text-lg font-medium border-b-2 -mb-px transition-colors"
          :class="{
            'border-primary text-primary': activeTab === tab.value,
            'border-transparent text-gray-500 hover:text-gray-800': activeTab !== tab.value
          }"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>
      
      <div class="p-8">
        <div v-if="activeTab === 'detail'" class="max-w-4xl mx-auto">
          <h3 class="section-title !mb-6">商品详情</h3>
          <div class="prose max-w-none text-gray-600 leading-relaxed">
            <p class="mb-4 text-lg">{{ product.description }}</p>
            <p class="mb-4">
              本产品采用优质材料制成，经过严格的质量检测，符合国家相关标准。
              专为宝宝设计，安全环保，给宝宝最贴心的呵护。
            </p>
            <div class="grid grid-cols-2 gap-6 my-8">
              <div v-for="(img, index) in product.images" :key="index" class="rounded-xl overflow-hidden shadow-md">
                <img :src="img" class="w-full h-full object-cover" />
              </div>
            </div>
            <div class="bg-pink-50 rounded-xl p-6 mt-8">
              <h4 class="font-bold text-gray-800 mb-3">💝 温馨提示</h4>
              <ul class="space-y-2 text-gray-600">
                <li>• 请放置在儿童无法触及的地方，避免误食</li>
                <li>• 使用前请仔细阅读产品说明书</li>
                <li>• 如有任何问题，请及时联系客服</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div v-else-if="activeTab === 'specs'" class="max-w-4xl mx-auto">
          <h3 class="section-title !mb-6">规格参数</h3>
          <div class="bg-gray-50 rounded-xl overflow-hidden">
            <table class="w-full">
              <tbody>
                <tr class="border-b border-gray-200">
                  <td class="py-4 px-6 w-40 text-gray-500 font-medium">商品名称</td>
                  <td class="py-4 px-6 text-gray-800">{{ product.name }}</td>
                </tr>
                <tr class="border-b border-gray-200">
                  <td class="py-4 px-6 text-gray-500 font-medium">商品价格</td>
                  <td class="py-4 px-6 text-red-500 font-bold text-xl">¥{{ currentPrice }}</td>
                </tr>
                <tr class="border-b border-gray-200">
                  <td class="py-4 px-6 text-gray-500 font-medium">商品库存</td>
                  <td class="py-4 px-6 text-gray-800">{{ product.stock }} 件</td>
                </tr>
                <tr class="border-b border-gray-200">
                  <td class="py-4 px-6 text-gray-500 font-medium">商品销量</td>
                  <td class="py-4 px-6 text-gray-800">{{ product.sales }}</td>
                </tr>
                <tr class="border-b border-gray-200">
                  <td class="py-4 px-6 text-gray-500 font-medium">商品评分</td>
                  <td class="py-4 px-6 text-gray-800 flex items-center">
                    <Star class="w-5 h-5 text-yellow-400 fill-current mr-2" />
                    {{ product.rating }} 分
                  </td>
                </tr>
                <tr v-for="spec in product.specs" :key="spec.name" class="border-b border-gray-200">
                  <td class="py-4 px-6 text-gray-500 font-medium">{{ spec.name }}</td>
                  <td class="py-4 px-6 text-gray-800">{{ spec.options.join(' / ') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div v-else-if="activeTab === 'reviews'" class="max-w-4xl mx-auto">
          <h3 class="section-title !mb-6">用户评价 ({{ reviews.length }})</h3>
          <div class="space-y-6">
            <div v-for="review in reviews" :key="review.id" class="border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div class="flex items-start gap-4">
                <img :src="review.avatar" class="w-12 h-12 rounded-full flex-shrink-0 border-2 border-pink-100" />
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-3">
                    <span class="font-medium text-gray-800">{{ review.username }}</span>
                    <div class="flex">
                      <Star
                        v-for="i in 5"
                        :key="i"
                        class="w-4 h-4"
                        :class="i <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'"
                      />
                    </div>
                    <span class="text-xs text-gray-400 ml-auto">{{ review.createdAt }}</span>
                  </div>
                  <p class="text-gray-600 mb-4 leading-relaxed">{{ review.content }}</p>
                  <div v-if="review.images.length > 0" class="flex gap-3 mb-4">
                    <img
                      v-for="(img, index) in review.images"
                      :key="index"
                      :src="img"
                      class="w-24 h-24 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity border border-gray-100"
                    />
                  </div>
                  <span class="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                    规格：{{ review.specs }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <div v-else class="bg-white rounded-xl shadow-sm p-16 text-center">
    <el-empty description="商品不存在或已下架">
      <router-link to="/" class="el-button el-button--primary">
        返回首页
      </router-link>
    </el-empty>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Star,
  ShoppingCart,
  CreditCard,
  CircleCheck
} from '@element-plus/icons-vue'
import QuantitySelector from '@/components/QuantitySelector.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import { getProductById, reviews, categories } from '@/data/mock'
import { useCartStore } from '@/stores/cart'
import { useFavoritesStore } from '@/stores/favorites'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const favoritesStore = useFavoritesStore()
const userStore = useUserStore()

const product = ref(null)
const currentImage = ref('')
const quantity = ref(1)
const selectedSpecs = reactive({})
const activeTab = ref('detail')

const tabs = [
  { label: '商品详情', value: 'detail' },
  { label: '规格参数', value: 'specs' },
  { label: '用户评价', value: 'reviews' }
]

const isFavorited = computed(() => {
  return product.value ? favoritesStore.isFavorite(product.value.id) : false
})

const currentPrice = computed(() => {
  if (!product.value?.priceMap) return product.value?.price || 0
  const specKey = Object.values(selectedSpecs).join(' / ')
  return product.value.priceMap[specKey] || product.value.price
})

const getCategoryName = (categoryId) => {
  for (const category of categories) {
    const child = category.children.find(c => c.id === categoryId)
    if (child) return child.name
    if (category.id === categoryId) return category.name
  }
  return '全部商品'
}

const breadcrumbItems = computed(() => {
  if (!product.value) return []
  return [
    { name: '首页', path: '/' },
    { name: getCategoryName(product.value.categoryId), path: `/category/${product.value.categoryId}` },
    { name: product.value.name }
  ]
})

const selectSpec = (name, value) => {
  selectedSpecs[name] = value
}

const getSpecString = () => {
  return Object.values(selectedSpecs).join(' / ')
}

const handleAddCart = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  const item = {
    ...product.value,
    price: currentPrice.value
  }
  cartStore.addToCart(item, quantity.value, getSpecString())
  ElMessage.success('已加入购物车')
}

const handleBuyNow = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  const item = {
    ...product.value,
    price: currentPrice.value
  }
  cartStore.addToCart(item, quantity.value, getSpecString())
  router.push('/checkout')
}

const handleToggleFavorite = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  const result = favoritesStore.toggleFavorite(product.value)
  ElMessage.success(result ? '已收藏' : '已取消收藏')
}

onMounted(() => {
  const id = route.params.id
  product.value = getProductById(id)
  if (product.value) {
    currentImage.value = product.value.images?.[0] || ''
    product.value.specs?.forEach(spec => {
      selectedSpecs[spec.name] = spec.options[0]
    })
  }
})
</script>
