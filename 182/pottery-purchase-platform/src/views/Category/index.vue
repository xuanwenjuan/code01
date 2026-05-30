<template>
  <div class="category-page container">
    <div class="card">
      <div class="breadcrumb">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-if="currentCategory">{{ currentCategory.name }}</el-breadcrumb-item>
          <el-breadcrumb-item v-else>全部商品</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div class="category-sidebar">
        <div class="sidebar-title">
          <el-icon><Menu /></el-icon>
          商品分类
        </div>
        <ul class="category-list">
          <li
            class="category-item"
            :class="{ active: !route.params.id || route.params.id == 0 }"
            @click="goToCategory(0)"
          >
            全部商品
          </li>
          <li
            v-for="cat in appStore.categories"
            :key="cat.id"
            class="category-item"
            :class="{ active: route.params.id == cat.id }"
            @click="goToCategory(cat.id)"
          >
            {{ cat.icon }} {{ cat.name }}
            <span class="count">({{ cat.count }})</span>
          </li>
        </ul>
      </div>

      <div class="category-main">
        <div class="filter-bar">
          <div class="filter-tabs">
            <span class="filter-label">排序：</span>
            <button
              class="tab-btn"
              :class="{ active: sortBy === 'default' }"
              @click="sortBy = 'default'"
            >
              综合
            </button>
            <button
              class="tab-btn"
              :class="{ active: sortBy === 'sales' }"
              @click="sortBy = 'sales'"
            >
              销量
            </button>
            <button
              class="tab-btn"
              :class="{ active: sortBy === 'price-asc' }"
              @click="sortBy = 'price-asc'"
            >
              价格↑
            </button>
            <button
              class="tab-btn"
              :class="{ active: sortBy === 'price-desc' }"
              @click="sortBy = 'price-desc'"
            >
              价格↓
            </button>
          </div>
          <div class="filter-result">
            共 <span class="result-count">{{ filteredProducts.length }}</span> 件商品
          </div>
        </div>

        <LoadingState v-if="loading" />
        <EmptyState
          v-else-if="filteredProducts.length === 0"
          description="没有找到相关商品"
          icon="🔍"
          show-action
          action-text="去首页看看"
          @action="router.push('/')"
        />
        <div v-else class="product-grid">
          <ProductCard
            v-for="product in filteredProducts"
            :key="product.id"
            :product="product"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import ProductCard from '@/components/common/ProductCard.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const loading = ref(true)
const sortBy = ref('default')

const currentCategory = computed(() => {
  if (!route.params.id || route.params.id == 0) return null
  return appStore.getCategoryById(route.params.id)
})

const products = computed(() => {
  const keyword = route.query.keyword
  if (keyword) {
    return appStore.searchProducts(keyword)
  }
  return appStore.getProductsByCategory(route.params.id)
})

const filteredProducts = computed(() => {
  let list = [...products.value]
  switch (sortBy.value) {
    case 'sales':
      list.sort((a, b) => b.sales - a.sales)
      break
    case 'price-asc':
      list.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      list.sort((a, b) => b.price - a.price)
      break
    default:
      break
  }
  return list
})

const goToCategory = (id) => {
  router.push(`/category/${id}`)
}

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 300)
})

watch(() => route.params.id, () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 200)
})
</script>

<style scoped>
.category-page {
  padding-top: 20px;
}

.breadcrumb {
  margin-bottom: 20px;
}

.card {
  display: flex;
  gap: 20px;
}

.category-sidebar {
  width: 200px;
  flex-shrink: 0;
  border-right: 1px solid #eee;
  padding-right: 20px;
}

.sidebar-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
}

.category-list {
  list-style: none;
}

.category-item {
  padding: 10px 12px;
  margin-bottom: 4px;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.category-item:hover {
  background: #f5f5f5;
  color: #d4a574;
}

.category-item.active {
  background: #f8f4f0;
  color: #d4a574;
  font-weight: 500;
}

.category-item .count {
  font-size: 12px;
  color: #999;
}

.category-main {
  flex: 1;
  min-width: 0;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
  margin-bottom: 20px;
}

.filter-tabs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  color: #666;
  margin-right: 8px;
}

.tab-btn {
  padding: 6px 16px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
  transition: all 0.3s;
}

.tab-btn:hover {
  border-color: #d4a574;
  color: #d4a574;
}

.tab-btn.active {
  background: #d4a574;
  border-color: #d4a574;
  color: #fff;
}

.result-count {
  color: #d4a574;
  font-weight: bold;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
</style>
