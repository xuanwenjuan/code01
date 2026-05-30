<template>
  <div class="flex gap-6">
    <aside class="w-64 flex-shrink-0">
      <div class="bg-white rounded-xl shadow-sm sticky top-24">
        <div class="p-4 border-b">
          <h3 class="font-bold text-gray-800 flex items-center">
            <Menu class="w-5 h-5 text-primary mr-2" />
            商品分类
          </h3>
        </div>
        <div class="p-4">
          <div
            v-for="category in categories"
            :key="category.id"
            class="mb-4 last:mb-0"
          >
            <div
              class="font-medium text-gray-700 mb-2 flex items-center cursor-pointer hover:text-primary transition-colors"
              @click="selectCategory(category.id)"
            >
              <span class="mr-2">{{ category.icon }}</span>
              {{ category.name }}
              <CaretRight class="w-4 h-4 ml-auto text-gray-400" />
            </div>
            <div class="pl-6 space-y-1">
              <div
                v-for="child in category.children"
                :key="child.id"
                class="text-sm text-gray-500 cursor-pointer py-1.5 px-3 rounded-lg hover:bg-pink-50 hover:text-primary transition-colors"
                :class="{ 'bg-pink-50 text-primary font-medium': filters.categoryId === child.id }"
                @click="selectCategory(child.id)"
              >
                {{ child.name }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
    
    <main class="flex-1">
      <Breadcrumb :items="breadcrumbItems" />
      
      <div class="bg-white rounded-xl shadow-sm mb-6">
        <div class="p-4 border-b">
          <h2 class="section-title !mb-0">商品筛选</h2>
        </div>
        <div class="p-4 space-y-4">
          <div class="flex items-start gap-4">
            <span class="w-20 text-gray-500 pt-1.5 flex-shrink-0">价格：</span>
            <div class="flex items-center gap-3 flex-wrap">
              <span
                v-for="range in priceRanges"
                :key="range.label"
                class="px-4 py-1.5 rounded-lg text-sm cursor-pointer transition-colors"
                :class="{
                  'bg-primary text-white': filters.priceRange === range.label,
                  'bg-gray-100 text-gray-600 hover:bg-gray-200': filters.priceRange !== range.label
                }"
                @click="setPriceRange(range)"
              >
                {{ range.label }}
              </span>
              <div class="flex items-center gap-2 ml-2">
                <input
                  v-model.number="customPrice.min"
                  type="number"
                  placeholder="最低价"
                  class="w-20 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:border-primary focus:outline-none"
                />
                <span class="text-gray-400">-</span>
                <input
                  v-model.number="customPrice.max"
                  type="number"
                  placeholder="最高价"
                  class="w-20 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:border-primary focus:outline-none"
                />
                <button
                  class="px-4 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-pink-500 transition-colors"
                  @click="applyCustomPrice"
                >
                  确定
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="px-4 py-3 bg-gray-50 border-t flex items-center gap-6">
          <span class="text-gray-500">排序：</span>
          <div class="flex gap-2">
            <button
              v-for="sort in sortOptions"
              :key="sort.value"
              class="px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-1"
              :class="{
                'bg-primary text-white': filters.sort === sort.value,
                'bg-white text-gray-600 hover:bg-pink-50 hover:text-primary border border-gray-200': filters.sort !== sort.value
              }"
              @click="setSort(sort.value)"
            >
              {{ sort.label }}
              <span v-if="sort.value === 'price'" class="text-xs">
                {{ filters.sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </button>
          </div>
          <div class="ml-auto flex items-center gap-4">
            <span class="text-sm text-gray-500">共 {{ total }} 件商品</span>
            <div class="flex items-center gap-2">
              <button
                class="p-2 rounded-lg transition-colors"
                :class="{ 'bg-primary text-white': filters.viewMode, 'bg-gray-100 text-gray-600 hover:bg-gray-200': !filters.viewMode }"
                @click="filters.viewMode = true"
                title="网格视图"
              >
                <Grid class="w-4 h-4" />
              </button>
              <button
                class="p-2 rounded-lg transition-colors"
                :class="{ 'bg-primary text-white': !filters.viewMode, 'bg-gray-100 text-gray-600 hover:bg-gray-200': filters.viewMode }"
                @click="filters.viewMode = false"
                title="列表视图"
              >
                <List class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="filteredProducts.length > 0">
        <div :class="filters.viewMode ? 'grid grid-cols-4 gap-6' : 'space-y-4'">
          <template v-if="filters.viewMode">
            <ProductCard
              v-for="product in paginatedProducts"
              :key="product.id"
              :product="product"
            />
          </template>
          <template v-else>
            <div
              v-for="product in paginatedProducts"
              :key="product.id"
              class="bg-white rounded-xl shadow-sm p-6 flex gap-6 cursor-pointer hover:shadow-md transition-all"
              @click="goToDetail(product.id)"
            >
              <div class="relative w-48 h-48 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                <img :src="product.images?.[0]" class="w-full h-full object-cover" />
                <div class="absolute top-2 left-2 flex gap-1">
                  <span v-if="product.isHot" class="bg-red-500 text-white text-xs px-2 py-1 rounded">热卖</span>
                  <span v-if="product.isNew" class="bg-green-500 text-white text-xs px-2 py-1 rounded">新品</span>
                </div>
              </div>
              <div class="flex-1 flex flex-col justify-between">
                <div>
                  <h3 class="text-xl font-medium text-gray-800 mb-2 hover:text-primary transition-colors">{{ product.name }}</h3>
                  <p class="text-gray-500 text-sm mb-4 line-clamp-2">{{ product.description }}</p>
                  <div class="flex items-center gap-4 text-sm text-gray-500">
                    <span class="flex items-center">
                      <Star class="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      {{ product.rating }} 分
                    </span>
                    <span>销量 {{ product.sales }}</span>
                    <span>库存 {{ product.stock }} 件</span>
                  </div>
                </div>
                <div class="flex items-end justify-between">
                  <div>
                    <span class="text-3xl font-bold text-red-500">¥{{ product.price }}</span>
                    <span class="text-sm text-gray-400 line-through ml-3">¥{{ product.originalPrice }}</span>
                  </div>
                  <button
                    class="px-8 py-2.5 bg-gradient-to-r from-primary to-pink-400 text-white rounded-full font-medium hover:shadow-lg transition-all"
                    @click.stop="handleAddCart(product)"
                  >
                    <ShoppingCart class="w-4 h-4 inline-block mr-1" />
                    加入购物车
                  </button>
                </div>
              </div>
            </div>
          </template>
        </div>
        
        <div class="mt-8">
          <Pagination
            v-model:currentPage="filters.page"
            :page-size="filters.pageSize"
            :total="total"
            @change="handlePageChange"
          />
        </div>
      </div>
      
      <div v-else class="bg-white rounded-xl shadow-sm p-16 text-center">
        <el-empty description="没有找到相关商品">
          <router-link to="/" class="el-button el-button--primary">
            返回首页
          </router-link>
        </el-empty>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Menu, CaretRight, Grid, List, Star, ShoppingCart } from '@element-plus/icons-vue'
import ProductCard from '@/components/ProductCard.vue'
import Pagination from '@/components/Pagination.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import { categories, products } from '@/data/mock'
import { useCartStore } from '@/stores/cart'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const filters = reactive({
  categoryId: null,
  priceRange: null,
  priceMin: null,
  priceMax: null,
  sort: 'default',
  sortOrder: 'desc',
  page: 1,
  pageSize: 20,
  viewMode: true
})

const customPrice = reactive({
  min: null,
  max: null
})

const priceRanges = [
  { label: '0-100', min: 0, max: 100 },
  { label: '100-300', min: 100, max: 300 },
  { label: '300-500', min: 300, max: 500 },
  { label: '500-1000', min: 500, max: 1000 },
  { label: '1000以上', min: 1000, max: Infinity }
]

const sortOptions = [
  { label: '综合排序', value: 'default' },
  { label: '销量优先', value: 'sales' },
  { label: '价格', value: 'price' },
  { label: '最新上架', value: 'new' }
]

const allCategoryChildren = computed(() => categories.flatMap(c => c.children))

const currentCategoryName = computed(() => {
  if (!filters.categoryId) return ''
  const child = allCategoryChildren.value.find(c => c.id === filters.categoryId)
  if (child) return child.name
  const parent = categories.find(c => c.id === filters.categoryId)
  return parent?.name || ''
})

const breadcrumbItems = computed(() => {
  const items = [{ name: '首页', path: '/' }]
  if (currentCategoryName.value) {
    items.push({ name: currentCategoryName.value })
  } else {
    items.push({ name: '全部商品' })
  }
  if (route.query.keyword) {
    items.push({ name: `搜索: "${route.query.keyword}"` })
  }
  return items
})

const filteredProducts = computed(() => {
  let result = [...products]
  
  if (filters.categoryId) {
    result = result.filter(p => p.categoryId === filters.categoryId)
  }
  
  if (route.query.keyword) {
    const keyword = route.query.keyword.toLowerCase()
    result = result.filter(p => p.name.toLowerCase().includes(keyword))
  }
  
  if (filters.priceMin !== null) {
    result = result.filter(p => p.price >= filters.priceMin)
  }
  if (filters.priceMax !== null) {
    result = result.filter(p => p.price <= filters.priceMax)
  }
  
  switch (filters.sort) {
    case 'sales':
      result.sort((a, b) => b.sales - a.sales)
      break
    case 'price':
      result.sort((a, b) => filters.sortOrder === 'asc' ? a.price - b.price : b.price - a.price)
      break
    case 'new':
      result.sort((a, b) => b.id - a.id)
      break
  }
  
  return result
})

const total = computed(() => filteredProducts.value.length)

const paginatedProducts = computed(() => {
  const start = (filters.page - 1) * filters.pageSize
  return filteredProducts.value.slice(start, start + filters.pageSize)
})

const selectCategory = (id) => {
  filters.categoryId = filters.categoryId === id ? null : id
  filters.page = 1
}

const setPriceRange = (range) => {
  if (filters.priceRange === range.label) {
    filters.priceRange = null
    filters.priceMin = null
    filters.priceMax = null
  } else {
    filters.priceRange = range.label
    filters.priceMin = range.min
    filters.priceMax = range.max
    customPrice.min = null
    customPrice.max = null
  }
  filters.page = 1
}

const applyCustomPrice = () => {
  const min = customPrice.min
  const max = customPrice.max
  
  if (min !== null && max !== null && min > max) {
    ElMessage.warning('最低价不能大于最高价')
    return
  }
  
  filters.priceRange = null
  filters.priceMin = min
  filters.priceMax = max
  filters.page = 1
}

const setSort = (value) => {
  if (filters.sort === value && value === 'price') {
    filters.sortOrder = filters.sortOrder === 'asc' ? 'desc' : 'asc'
  } else {
    filters.sort = value
    if (value === 'price') {
      filters.sortOrder = 'desc'
    }
  }
  filters.page = 1
}

const goToDetail = (id) => {
  router.push(`/product/${id}`)
}

const handleAddCart = (product) => {
  cartStore.addToCart(product, 1, product.specs?.[0]?.options?.[0] || '')
  ElMessage.success('已加入购物车')
}

const handlePageChange = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

watch(() => route.params.id, (id) => {
  if (id) {
    filters.categoryId = parseInt(id)
    filters.page = 1
  }
})

onMounted(() => {
  if (route.params.id) {
    filters.categoryId = parseInt(route.params.id)
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
