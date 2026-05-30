<template>
  <div class="category-page">
    <div class="container">
      <el-page-header @back="goBack" :content="pageTitle" class="mb-20" />
      
      <div class="filter-bar">
        <div class="filter-item">
          <span class="filter-label">排序：</span>
          <el-radio-group v-model="sortBy" size="small" @change="loadProducts">
            <el-radio-button value="default">默认</el-radio-button>
            <el-radio-button value="sales">销量</el-radio-button>
            <el-radio-button value="price-asc">价格升序</el-radio-button>
            <el-radio-button value="price-desc">价格降序</el-radio-button>
            <el-radio-button value="rating">评分</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <div class="products-container" v-loading="loading">
        <EmptyState
          v-if="!loading && products.length === 0"
          description="没有找到相关商品"
          show-action
          action-text="去首页看看"
          @action="goHome"
        />
        <div v-else class="product-grid">
          <ProductCard v-for="product in products" :key="product.id" :product="product" />
        </div>
      </div>

      <div class="pagination-container" v-if="total > pageSize">
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next, jumper"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProductsApi, getCategoriesApi } from '@/api/product'
import ProductCard from '@/components/common/ProductCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const products = ref([])
const categories = ref([])
const sortBy = ref('default')
const page = ref(1)
const pageSize = ref(12)
const total = ref(0)

const pageTitle = computed(() => {
  if (route.query.keyword) {
    return `搜索：${route.query.keyword}`
  }
  const categoryId = parseInt(route.params.id)
  const cat = categories.value.find(c => c.id === categoryId)
  if (cat) return cat.name
  const subCat = categories.value.flatMap(c => c.children).find(c => c.id === categoryId)
  if (subCat) return subCat.name
  return '全部商品'
})

onMounted(async () => {
  await loadCategories()
  await loadProducts()
})

watch(() => route.params.id, () => {
  page.value = 1
  loadProducts()
})

watch(() => route.query.keyword, () => {
  page.value = 1
  loadProducts()
})

const loadCategories = async () => {
  const res = await getCategoriesApi()
  if (res.code === 200) {
    categories.value = res.data
  }
}

const loadProducts = async () => {
  loading.value = true
  try {
    const params = {
      sortBy: sortBy.value === 'default' ? undefined : sortBy.value,
      page: page.value,
      pageSize: pageSize.value
    }
    
    if (route.params.id) {
      params.categoryId = parseInt(route.params.id)
    }
    
    if (route.query.keyword) {
      params.keyword = route.query.keyword
    }
    
    const res = await getProductsApi(params)
    if (res.code === 200) {
      products.value = res.data.list
      total.value = res.data.total
    }
  } finally {
    loading.value = false
  }
}

const handlePageChange = () => {
  loadProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const goBack = () => {
  router.back()
}

const goHome = () => {
  router.push({ name: 'Home' })
}
</script>

<style lang="scss" scoped>
.category-page {
  .filter-bar {
    background: #fff;
    padding: 16px 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 24px;

    .filter-item {
      display: flex;
      align-items: center;
      gap: 12px;

      .filter-label {
        color: #606266;
        font-size: 14px;
      }
    }
  }

  .products-container {
    min-height: 400px;
  }

  .product-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }

  .pagination-container {
    margin-top: 30px;
    display: flex;
    justify-content: center;
  }
}
</style>
