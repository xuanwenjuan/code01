<template>
  <div class="products-page">
    <div class="container">
      <div class="page-layout">
        <aside class="sidebar">
          <div class="sidebar-section card-shadow">
            <h3 class="sidebar-title">
              <el-icon color="#409eff"><Grid /></el-icon>
              商品分类
            </h3>
            <ul class="category-list">
              <li 
                :class="{ active: !selectedCategory }"
                @click="selectedCategory = null"
              >
                全部商品
              </li>
              <li 
                v-for="cat in productStore.categoryList" 
                :key="cat.id"
                :class="{ active: selectedCategory === cat.id }"
                @click="selectedCategory = cat.id"
              >
                <el-icon><component :is="cat.icon" /></el-icon>
                {{ cat.name }}
                <span class="count">({{ cat.count }})</span>
              </li>
            </ul>
          </div>
          
          <div class="sidebar-section card-shadow">
            <h3 class="sidebar-title">
              <el-icon color="#f56c6c"><TrendCharts /></el-icon>
              热销排行
            </h3>
            <ul class="hot-list">
              <li v-for="(product, index) in hotProducts" :key="product.id" class="hot-item">
                <span class="rank" :class="{ top3: index < 3 }">{{ index + 1 }}</span>
                <div class="hot-info" @click="goDetail(product.id)">
                  <p class="hot-name text-ellipsis">{{ product.name }}</p>
                  <p class="hot-price">¥{{ product.price }}</p>
                </div>
              </li>
            </ul>
          </div>
        </aside>
        
        <main class="main-content">
          <div class="filter-bar card-shadow">
            <div class="filter-left">
              <span class="filter-label">排序：</span>
              <el-radio-group v-model="sortType" size="default">
                <el-radio-button value="default">综合</el-radio-button>
                <el-radio-button value="sales">销量</el-radio-button>
                <el-radio-button value="price-asc">价格升序</el-radio-button>
                <el-radio-button value="price-desc">价格降序</el-radio-button>
                <el-radio-button value="rating">评分</el-radio-button>
              </el-radio-group>
            </div>
            <div class="filter-right">
              <span class="result-count">共 {{ filteredProducts.length }} 件商品</span>
            </div>
          </div>
          
          <div v-if="productStore.loading" class="loading-wrapper">
            <LoadingState text="商品加载中..." />
          </div>
          <div v-else-if="filteredProducts.length === 0" class="empty-wrapper">
            <EmptyState 
              description="没有找到相关商品" 
              show-action
              action-text="去逛逛"
              @action="selectedCategory = null"
            />
          </div>
          <div v-else class="product-grid">
            <ProductCard 
              v-for="product in sortedProducts" 
              :key="product.id"
              :product="product"
            />
          </div>
          
          <div v-if="filteredProducts.length > 0" class="pagination-wrapper">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[12, 24, 48]"
              :total="filteredProducts.length"
              layout="total, sizes, prev, pager, next, jumper"
              background
            />
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import ProductCard from '@/components/ProductCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import LoadingState from '@/components/LoadingState.vue'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()

const selectedCategory = ref(null)
const sortType = ref('default')
const currentPage = ref(1)
const pageSize = ref(12)

const hotProducts = computed(() => {
  return [...productStore.productList]
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5)
})

const filteredProducts = computed(() => {
  let result = [...productStore.productList]
  
  if (selectedCategory.value) {
    result = result.filter(p => p.categoryId === selectedCategory.value)
  }
  
  if (route.query.keyword) {
    const keyword = route.query.keyword.toLowerCase()
    result = result.filter(p => 
      p.name.toLowerCase().includes(keyword) ||
      p.description.toLowerCase().includes(keyword)
    )
  }
  
  return result
})

const sortedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  let result = [...filteredProducts.value]
  
  switch (sortType.value) {
    case 'sales':
      result.sort((a, b) => b.sales - a.sales)
      break
    case 'price-asc':
      result.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      result.sort((a, b) => b.price - a.price)
      break
    case 'rating':
      result.sort((a, b) => b.rating - a.rating)
      break
    default:
      break
  }
  
  return result.slice(start, end)
})

function goDetail(id) {
  router.push(`/product/${id}`)
}

watch(() => route.query.category, (newVal) => {
  if (newVal) {
    selectedCategory.value = Number(newVal)
  }
}, { immediate: true })

onMounted(async () => {
  await productStore.simulateLoading(300)
})
</script>

<style scoped lang="scss">
.products-page {
  padding: 20px 0;
}

.page-layout {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.sidebar {
  width: 240px;
  flex-shrink: 0;
  position: sticky;
  top: 100px;
}

.sidebar-section {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  
  .sidebar-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
  }
}

.category-list {
  li {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    color: #606266;
    margin-bottom: 4px;
    
    &:hover, &.active {
      background: #ecf5ff;
      color: #409eff;
    }
    
    &.active {
      font-weight: 500;
    }
    
    .count {
      margin-left: auto;
      font-size: 12px;
      color: #909399;
    }
  }
}

.hot-list {
  .hot-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .rank {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f0f0f0;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      color: #909399;
      
      &.top3 {
        background: #f56c6c;
        color: #fff;
      }
    }
    
    .hot-info {
      flex: 1;
      cursor: pointer;
      
      .hot-name {
        font-size: 13px;
        color: #303133;
        margin-bottom: 4px;
      }
      
      .hot-price {
        font-size: 14px;
        font-weight: bold;
        color: #f56c6c;
      }
    }
  }
}

.main-content {
  flex: 1;
  min-width: 0;
}

.filter-bar {
  background: #fff;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .filter-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .filter-label {
    color: #606266;
  }
  
  .result-count {
    color: #909399;
    font-size: 13px;
  }
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.loading-wrapper, .empty-wrapper {
  background: #fff;
  border-radius: 12px;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 1200px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .sidebar {
    display: none;
  }
  
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
