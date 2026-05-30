<template>
  <div class="favorites-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">
          <el-icon color="#f56c6c"><Star /></el-icon>
          我的收藏
          <span class="count-badge">共 {{ favoriteStore.favoriteCount }} 件商品</span>
        </h1>
        <div class="header-actions">
          <el-button 
            v-if="favoriteStore.favoriteCount > 0 && !batchMode"
            size="small"
            @click="enterBatchMode"
          >
            <el-icon><Select /></el-icon>
            批量管理
          </el-button>
          <template v-else-if="batchMode">
            <el-button 
              size="small"
              @click="selectAll"
            >
              {{ isAllSelected ? '取消全选' : '全选' }}
            </el-button>
            <el-button 
              type="danger" 
              size="small"
              :disabled="selectedCount === 0"
              @click="handleBatchRemove"
            >
              删除选中 ({{ selectedCount }})
            </el-button>
            <el-button 
              size="small"
              @click="exitBatchMode"
            >
              取消
            </el-button>
          </template>
        </div>
      </div>
      
      <div class="filter-toolbar card-shadow" v-if="favoriteStore.favoriteCount > 0">
        <div class="toolbar-left">
          <SearchBar 
            v-model="searchKeyword"
            placeholder="搜索收藏的商品"
            :show-button="false"
            @search="handleSearch"
          />
        </div>
        <div class="toolbar-right">
          <el-select 
            v-model="selectedCategory" 
            placeholder="全部分类"
            size="default"
            style="width: 150px"
            @change="handleCategoryFilter"
          >
            <el-option label="全部分类" value="" />
            <el-option 
              v-for="cat in categories" 
              :key="cat.id" 
              :label="cat.name" 
              :value="cat.id"
            />
          </el-select>
          <el-select 
            v-model="sortBy" 
            placeholder="默认排序"
            size="default"
            style="width: 130px"
            @change="handleSort"
          >
            <el-option label="默认排序" value="" />
            <el-option label="价格从低到高" value="price-asc" />
            <el-option label="价格从高到低" value="price-desc" />
            <el-option label="销量优先" value="sales" />
          </el-select>
        </div>
      </div>
      
      <div v-if="loading" class="loading-wrapper">
        <LoadingState text="加载中..." />
      </div>
      <div v-else-if="filteredProducts.length === 0" class="empty-wrapper">
        <EmptyState 
          :description="favoriteStore.favoriteCount > 0 ? '暂无符合条件的收藏商品' : '您还没有收藏任何商品'" 
          show-action
          :action-text="favoriteStore.favoriteCount > 0 ? '重置筛选' : '去逛逛'"
          @action="favoriteStore.favoriteCount > 0 ? resetFilters() : router.push('/products')"
        />
      </div>
      <div v-else class="product-grid">
        <div 
          v-for="product in filteredProducts" 
          :key="product.id"
          class="product-card-wrapper"
          :class="{ 'batch-mode': batchMode, selected: selectedIds.includes(product.id) }"
        >
          <div 
            v-if="batchMode" 
            class="batch-checkbox"
            @click="toggleSelect(product.id)"
          >
            <el-checkbox :model-value="selectedIds.includes(product.id)" />
          </div>
          <ProductCard :product="product" />
          <div class="card-actions">
            <el-button 
              type="primary" 
              size="small"
              @click="goDetail(product.id)"
            >
              立即查看
            </el-button>
            <el-button 
              type="danger" 
              size="small"
              @click="handleRemove(product.id)"
            >
              取消收藏
            </el-button>
          </div>
        </div>
      </div>
      
      <div class="pagination-wrapper" v-if="totalPages > 1">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="filteredProducts.length"
          layout="prev, pager, next, total"
          background
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useFavoriteStore } from '@/stores/favorite'
import { useProductStore } from '@/stores/product'
import { ElMessage, ElMessageBox } from 'element-plus'
import ProductCard from '@/components/ProductCard.vue'
import SearchBar from '@/components/SearchBar.vue'
import EmptyState from '@/components/EmptyState.vue'
import LoadingState from '@/components/LoadingState.vue'

const router = useRouter()
const favoriteStore = useFavoriteStore()
const productStore = useProductStore()

const loading = ref(true)
const searchKeyword = ref('')
const selectedCategory = ref('')
const sortBy = ref('')
const currentPage = ref(1)
const pageSize = 8
const batchMode = ref(false)
const selectedIds = ref([])

const categories = computed(() => productStore.categoryList)

const favoriteProducts = computed(() => {
  return productStore.productList.filter(p => 
    favoriteStore.isFavorite(p.id)
  )
})

const filteredProducts = computed(() => {
  let products = favoriteProducts.value
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    products = products.filter(p => 
      p.name.toLowerCase().includes(keyword) ||
      p.description.toLowerCase().includes(keyword)
    )
  }
  
  if (selectedCategory.value) {
    products = products.filter(p => p.categoryId === selectedCategory.value)
  }
  
  if (sortBy.value) {
    products = [...products].sort((a, b) => {
      switch (sortBy.value) {
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'sales':
          return b.sales - a.sales
        default:
          return 0
      }
    })
  }
  
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return products.slice(start, end)
})

const totalPages = computed(() => {
  const total = favoriteProducts.value
  if (searchKeyword.value || selectedCategory.value) {
    const filtered = favoriteProducts.value.filter(p => {
      const matchKeyword = !searchKeyword.value || 
        p.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
        p.description.toLowerCase().includes(searchKeyword.value.toLowerCase())
      const matchCategory = !selectedCategory.value || p.categoryId === selectedCategory.value
      return matchKeyword && matchCategory
    })
    return Math.ceil(filtered.length / pageSize)
  }
  return Math.ceil(total.length / pageSize)
})

const isAllSelected = computed(() => {
  return filteredProducts.value.length > 0 && 
    filteredProducts.value.every(p => selectedIds.value.includes(p.id))
})

const selectedCount = computed(() => selectedIds.value.length)

function goDetail(id) {
  router.push(`/product/${id}`)
}

function handleSearch() {
  currentPage.value = 1
}

function handleCategoryFilter() {
  currentPage.value = 1
}

function handleSort() {
  currentPage.value = 1
}

function resetFilters() {
  searchKeyword.value = ''
  selectedCategory.value = ''
  sortBy.value = ''
  currentPage.value = 1
}

function handleRemove(id) {
  ElMessageBox.confirm('确定要取消收藏该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    favoriteStore.removeFavorite(id)
    selectedIds.value = selectedIds.value.filter(sid => sid !== id)
    ElMessage.success('已取消收藏')
  }).catch(() => {})
}

function enterBatchMode() {
  batchMode.value = true
  selectedIds.value = []
}

function exitBatchMode() {
  batchMode.value = false
  selectedIds.value = []
}

function toggleSelect(id) {
  const index = selectedIds.value.indexOf(id)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  } else {
    selectedIds.value.push(id)
  }
}

function selectAll() {
  if (isAllSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = filteredProducts.value.map(p => p.id)
  }
}

function handleBatchRemove() {
  if (selectedIds.value.length === 0) return
  
  ElMessageBox.confirm(`确定要取消选中的 ${selectedIds.value.length} 件商品吗？`, '批量取消收藏', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    selectedIds.value.forEach(id => {
      favoriteStore.removeFavorite(id)
    })
    ElMessage.success(`已取消 ${selectedIds.value.length} 件商品的收藏`)
    selectedIds.value = []
    if (favoriteStore.favoriteCount === 0) {
      batchMode.value = false
    }
  }).catch(() => {})
}

watch(filteredProducts, () => {
  if (currentPage.value > totalPages.value && totalPages.value > 0) {
    currentPage.value = totalPages.value
  }
})

onMounted(async () => {
  await productStore.simulateLoading(300)
  loading.value = false
})
</script>

<style scoped lang="scss">
.favorites-page {
  padding: 20px 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  .page-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    
    .count-badge {
      font-size: 14px;
      font-weight: normal;
      color: #909399;
    }
  }
  
  .header-actions {
    display: flex;
    gap: 8px;
  }
}

.filter-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 24px;
  
  .toolbar-left {
    flex: 1;
  }
  
  .toolbar-right {
    display: flex;
    gap: 12px;
    align-items: center;
  }
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.product-card-wrapper {
  position: relative;
  transition: all 0.2s ease;
  
  &.batch-mode {
    .batch-checkbox {
      opacity: 1;
      pointer-events: auto;
    }
  }
  
  &.selected {
    .card-actions {
      border-color: #409eff;
    }
  }
  
  .batch-checkbox {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 10;
    background: rgba(255, 255, 255, 0.9);
    padding: 4px;
    border-radius: 4px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
    cursor: pointer;
  }
  
  .card-actions {
    display: flex;
    gap: 8px;
    padding: 12px;
    background: #fff;
    border-radius: 0 0 12px 12px;
    border: 1px solid #f0f0f0;
    border-top: none;
    
    .el-button {
      flex: 1;
    }
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 30px 0;
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
  .filter-toolbar {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
    
    .toolbar-right {
      flex-wrap: wrap;
      
      .el-select {
        flex: 1;
        min-width: 120px;
      }
    }
  }
  
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .page-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .product-grid {
    grid-template-columns: 1fr;
  }
}
</style>
