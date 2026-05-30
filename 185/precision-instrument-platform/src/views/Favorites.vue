<template>
  <div class="favorites-page">
    <div class="container">
      <div class="breadcrumb">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>个人中心</el-breadcrumb-item>
          <el-breadcrumb-item>我的收藏</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div class="page-header card">
        <div class="header-left">
          <h2>
            <el-icon><StarFilled /></el-icon>
            我的收藏
          </h2>
          <span class="count">共 {{ favoriteProducts.length }} 件商品</span>
        </div>
        <div class="header-right">
          <el-checkbox v-model="selectAll" :indeterminate="isIndeterminate" @change="handleSelectAll">
            全选
          </el-checkbox>
          <el-button
            v-if="selectedProducts.length > 0"
            type="danger"
            @click="handleBatchRemove"
          >
            <el-icon><Delete /></el-icon>
            批量删除 ({{ selectedProducts.length }})
          </el-button>
          <el-button type="primary" @click="goToCategory">
            <el-icon><ShoppingBag /></el-icon>
            继续选购
          </el-button>
        </div>
      </div>

      <SearchFilter
        v-model:keyword="searchKeyword"
        v-model:activeTab="activeCategory"
        :tabs="categoryTabs"
        :showDateRange="false"
        :showActions="false"
        searchPlaceholder="搜索收藏商品名称..."
        @search="handleSearch"
        @filterChange="handleFilterChange"
      />

      <div v-if="loading" class="loading-wrapper">
        <AppLoading :loading="true" text="正在加载收藏数据..." />
      </div>

      <template v-else>
        <div v-if="paginatedProducts.length > 0" class="product-grid">
          <FavoriteCard
            v-for="product in paginatedProducts"
            :key="product.id"
            :product="product"
            :showCheckbox="true"
            @click="handleProductClick"
            @remove="handleRemove"
            @buy="handleBuy"
            @check="handleProductCheck"
          />
        </div>

        <AppEmpty
          v-else
          description="暂无符合条件的收藏商品"
          show-action
          action-text="去逛逛"
          @action="goToCategory"
        />

        <AppPagination
          v-if="filteredProducts.length > 0"
          v-model:currentPage="currentPage"
          v-model:pageSize="pageSize"
          :total="filteredProducts.length"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useProductStore } from '@/stores/product'
import { ElMessage, ElMessageBox } from 'element-plus'
import { StarFilled, Delete, ShoppingBag } from '@element-plus/icons-vue'
import SearchFilter from '@/components/common/SearchFilter.vue'
import FavoriteCard from '@/components/common/FavoriteCard.vue'
import AppPagination from '@/components/common/AppPagination.vue'
import AppLoading from '@/components/common/AppLoading.vue'
import AppEmpty from '@/components/common/AppEmpty.vue'

const router = useRouter()
const userStore = useUserStore()
const productStore = useProductStore()

const loading = ref(false)
const searchKeyword = ref('')
const activeCategory = ref('all')
const currentPage = ref(1)
const pageSize = ref(12)
const selectedProducts = ref([])
const selectAll = ref(false)

const favoriteProducts = computed(() => {
  return productStore.allProducts.filter(p => userStore.favorites.includes(p.id))
})

const categoryTabs = computed(() => {
  const categories = [{ label: '全部', value: 'all', count: favoriteProducts.value.length }]
  const categoryMap = {}

  favoriteProducts.value.forEach(p => {
    if (!categoryMap[p.categoryId]) {
      categoryMap[p.categoryId] = {
        label: p.category,
        value: p.categoryId,
        count: 0
      }
    }
    categoryMap[p.categoryId].count++
  })

  Object.values(categoryMap).forEach(c => categories.push(c))
  return categories
})

const filteredProducts = computed(() => {
  let result = [...favoriteProducts.value]

  if (activeCategory.value !== 'all') {
    result = result.filter(p => p.categoryId === activeCategory.value)
  }

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(p =>
      p.name.toLowerCase().includes(keyword) ||
      p.description.toLowerCase().includes(keyword) ||
      p.category.toLowerCase().includes(keyword)
    )
  }

  return result
})

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredProducts.value.slice(start, end)
})

const isIndeterminate = computed(() => {
  return selectedProducts.value.length > 0 && selectedProducts.value.length < filteredProducts.value.length
})

const handleSearch = () => {
  currentPage.value = 1
  selectedProducts.value = []
  selectAll.value = false
}

const handleFilterChange = ({ type }) => {
  if (type === 'tab') {
    currentPage.value = 1
    selectedProducts.value = []
    selectAll.value = false
  }
}

const handlePageChange = () => {
  selectedProducts.value = []
  selectAll.value = false
}

const handleSizeChange = () => {
  currentPage.value = 1
  selectedProducts.value = []
  selectAll.value = false
}

const handleSelectAll = (val) => {
  if (val) {
    selectedProducts.value = filteredProducts.value.map(p => p.id)
  } else {
    selectedProducts.value = []
  }
}

const handleProductCheck = ({ product, checked }) => {
  if (checked) {
    if (!selectedProducts.value.includes(product.id)) {
      selectedProducts.value.push(product.id)
    }
  } else {
    const index = selectedProducts.value.indexOf(product.id)
    if (index > -1) {
      selectedProducts.value.splice(index, 1)
    }
  }

  if (selectedProducts.value.length === filteredProducts.value.length) {
    selectAll.value = true
  } else {
    selectAll.value = false
  }
}

const handleRemove = (product) => {
  userStore.removeFavorite(product.id)
  const index = selectedProducts.value.indexOf(product.id)
  if (index > -1) {
    selectedProducts.value.splice(index, 1)
  }
  ElMessage.success('已取消收藏')
}

const handleBatchRemove = () => {
  if (selectedProducts.value.length === 0) {
    ElMessage.warning('请先选择要删除的商品')
    return
  }

  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedProducts.value.length} 件收藏商品吗？`,
    '批量删除',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    selectedProducts.value.forEach(productId => {
      userStore.removeFavorite(productId)
    })
    selectedProducts.value = []
    selectAll.value = false
    ElMessage.success('批量删除成功')
  }).catch(() => {})
}

const handleProductClick = (product) => {
  router.push(`/product/${product.id}`)
}

const handleBuy = (product) => {
  router.push(`/product/${product.id}`)
}

const goToCategory = () => {
  router.push('/category')
}

watch(activeCategory, () => {
  currentPage.value = 1
  selectedProducts.value = []
  selectAll.value = false
})
</script>

<style scoped>
.favorites-page {
  padding: 24px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.breadcrumb {
  margin-bottom: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 16px;
}

.header-left h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-left h2 .el-icon {
  color: #f56c6c;
}

.count {
  font-size: 14px;
  color: #909399;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.loading-wrapper {
  padding: 60px 0;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

@media (max-width: 1200px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .product-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-right {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}
</style>
