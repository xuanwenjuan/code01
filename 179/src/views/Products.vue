<template>
  <div class="products-page">
    <div class="container">
      <div class="page-header">
        <h2 class="page-title">全部饰品</h2>
        <div class="breadcrumb">
          <span @click="router.push('/')">首页</span>
          <el-icon><ArrowRight /></el-icon>
          <span class="current">全部饰品</span>
        </div>
      </div>
      
      <div class="filter-section vintage-border">
        <div class="filter-row">
          <span class="filter-label">分类：</span>
          <div class="filter-options">
            <span 
              class="filter-option" 
              :class="{ active: !filters.categoryId }"
              @click="setFilter('categoryId', null)"
            >全部</span>
            <span 
              v-for="cat in productStore.categories" 
              :key="cat.id"
              class="filter-option"
              :class="{ active: filters.categoryId === cat.id }"
              @click="setFilter('categoryId', cat.id)"
            >{{ cat.name }}</span>
          </div>
        </div>
        
        <div class="filter-row">
          <span class="filter-label">价格：</span>
          <div class="filter-options">
            <span 
              class="filter-option" 
              :class="{ active: !priceRange }"
              @click="setPriceRange(null)"
            >全部</span>
            <span 
              class="filter-option"
              :class="{ active: priceRange === '0-100' }"
              @click="setPriceRange('0-100')"
            >¥0 - ¥100</span>
            <span 
              class="filter-option"
              :class="{ active: priceRange === '100-300' }"
              @click="setPriceRange('100-300')"
            >¥100 - ¥300</span>
            <span 
              class="filter-option"
              :class="{ active: priceRange === '300-500' }"
              @click="setPriceRange('300-500')"
            >¥300 - ¥500</span>
            <span 
              class="filter-option"
              :class="{ active: priceRange === '500+' }"
              @click="setPriceRange('500+')"
            >¥500以上</span>
          </div>
        </div>
        
        <div class="filter-row">
          <span class="filter-label">排序：</span>
          <div class="filter-options">
            <span 
              class="filter-option" 
              :class="{ active: !filters.sortBy }"
              @click="setFilter('sortBy', null)"
            >默认</span>
            <span 
              class="filter-option"
              :class="{ active: filters.sortBy === 'sales' }"
              @click="setFilter('sortBy', 'sales')"
            >销量优先</span>
            <span 
              class="filter-option"
              :class="{ active: filters.sortBy === 'price-asc' }"
              @click="setFilter('sortBy', 'price-asc')"
            >价格从低到高</span>
            <span 
              class="filter-option"
              :class="{ active: filters.sortBy === 'price-desc' }"
              @click="setFilter('sortBy', 'price-desc')"
            >价格从高到低</span>
            <span 
              class="filter-option"
              :class="{ active: filters.sortBy === 'newest' }"
              @click="setFilter('sortBy', 'newest')"
            >最新上架</span>
          </div>
        </div>
      </div>
      
      <div v-if="loading" class="content-wrapper">
        <LoadingState />
      </div>
      
      <div v-else class="content-wrapper">
        <div class="results-info">
          共找到 <span class="highlight">{{ filteredProducts.length }}</span> 件商品
        </div>
        
        <div v-if="filteredProducts.length === 0" class="empty-wrapper">
          <EmptyState 
            text="没有找到相关商品" 
            :show-action="true"
            action-text="查看全部商品"
            @action="resetFilters"
          />
        </div>
        
        <div v-else class="products-grid">
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
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProductStore } from '@/stores/product'
import ProductCard from '@/components/ProductCard.vue'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'

const router = useRouter()
const route = useRoute()
const productStore = useProductStore()

const loading = ref(true)
const priceRange = ref(null)

const filters = reactive({
  categoryId: null,
  minPrice: null,
  maxPrice: null,
  sortBy: null
})

const filteredProducts = computed(() => {
  return productStore.filterProducts(filters)
})

onMounted(() => {
  if (route.query.category) {
    filters.categoryId = Number(route.query.category)
  }
  if (route.query.keyword) {
    const keyword = route.query.keyword
    const searched = productStore.searchProducts(keyword)
    productStore.products = searched.length > 0 ? searched : []
  }
  setTimeout(() => {
    loading.value = false
  }, 300)
})

watch(() => route.query, (newQuery) => {
  if (newQuery.category) {
    filters.categoryId = Number(newQuery.category)
  } else {
    filters.categoryId = null
  }
})

const setFilter = (key, value) => {
  filters[key] = value
}

const setPriceRange = (range) => {
  priceRange.value = range
  if (!range) {
    filters.minPrice = null
    filters.maxPrice = null
  } else if (range === '500+') {
    filters.minPrice = 500
    filters.maxPrice = null
  } else {
    const [min, max] = range.split('-').map(Number)
    filters.minPrice = min
    filters.maxPrice = max
  }
}

const resetFilters = () => {
  filters.categoryId = null
  filters.minPrice = null
  filters.maxPrice = null
  filters.sortBy = null
  priceRange.value = null
  router.push('/products')
}
</script>

<style lang="scss" scoped>
.products-page {
  padding: 40px 0;
}

.page-header {
  margin-bottom: 30px;
  
  .page-title {
    font-size: 28px;
    font-weight: 700;
    color: #2c1810;
    margin-bottom: 8px;
  }
  
  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #999;
    
    span {
      cursor: pointer;
      
      &:hover {
        color: #d4af37;
      }
      
      &.current {
        color: #8b6914;
        cursor: default;
      }
    }
    
    .el-icon {
      font-size: 12px;
    }
  }
}

.filter-section {
  padding: 20px 24px;
  margin-bottom: 30px;
  background: #fff;
}

.filter-row {
  display: flex;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  
  &:first-child {
    padding-top: 0;
  }
}

.filter-label {
  width: 80px;
  font-weight: 500;
  color: #666;
  flex-shrink: 0;
  padding-top: 4px;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  flex: 1;
}

.filter-option {
  padding: 4px 16px;
  border-radius: 20px;
  background: #f5f0e1;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background: #e8dcc4;
    color: #8b6914;
  }
  
  &.active {
    background: linear-gradient(135deg, #d4af37, #b8960c);
    color: #fff;
  }
}

.content-wrapper {
  min-height: 300px;
}

.results-info {
  margin-bottom: 20px;
  font-size: 14px;
  color: #666;
  
  .highlight {
    color: #d4af37;
    font-weight: 600;
  }
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.empty-wrapper {
  padding: 60px 0;
}

@media (max-width: 1024px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .filter-label {
    width: 60px;
  }
}
</style>
