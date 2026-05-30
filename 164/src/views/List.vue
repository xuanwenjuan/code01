<template>
  <div class="list-page">
    <div class="container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品列表</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="list-content">
        <aside class="filter-sidebar">
          <div class="filter-section">
            <h3 class="filter-title">花艺用途</h3>
            <div class="filter-options">
              <div 
                v-for="item in purposes" 
                :key="item.id"
                class="filter-option"
                :class="{ active: selectedPurpose === item.id }"
                @click="selectPurpose(item.id)"
              >
                {{ item.name }}
              </div>
            </div>
          </div>

          <div class="filter-section">
            <h3 class="filter-title">花材种类</h3>
            <div class="filter-options">
              <div 
                v-for="item in categories" 
                :key="item.id"
                class="filter-option"
                :class="{ active: selectedCategory === item.id }"
                @click="selectCategory(item.id)"
              >
                <span class="option-icon">{{ item.icon }}</span>
                {{ item.name }}
              </div>
            </div>
          </div>

          <div class="filter-section">
            <h3 class="filter-title">价格区间</h3>
            <div class="filter-options">
              <div 
                v-for="item in priceRanges" 
                :key="item.id"
                class="filter-option"
                :class="{ active: selectedPriceRange === item.id }"
                @click="selectPriceRange(item)"
              >
                {{ item.name }}
              </div>
            </div>
          </div>
        </aside>

        <main class="product-main">
          <div class="sort-bar">
            <div class="sort-left">
              <span>共 {{ total }} 件商品</span>
            </div>
            <div class="sort-right">
              <el-radio-group v-model="sortBy" size="small" @change="handleSortChange">
                <el-radio-button value="">综合</el-radio-button>
                <el-radio-button value="sales">销量</el-radio-button>
                <el-radio-button value="price-asc">价格↑</el-radio-button>
                <el-radio-button value="price-desc">价格↓</el-radio-button>
                <el-radio-button value="rating">好评</el-radio-button>
              </el-radio-group>
            </div>
          </div>

          <div v-if="loading" class="loading-wrapper">
            <el-skeleton v-for="i in 8" :key="i" :rows="4" animated />
          </div>
          
          <template v-else>
            <div v-if="flowerList.length > 0" class="product-grid">
              <FlowerCard v-for="flower in flowerList" :key="flower.id" :flower="flower" />
            </div>
            <EmptyState v-else icon="🔍" text="没有找到相关商品">
              <template #action>
                <el-button type="primary" @click="resetFilters">重置筛选</el-button>
              </template>
            </EmptyState>
          </template>

          <div v-if="total > 0" class="pagination-wrapper">
            <el-pagination
              v-model:current-page="page"
              v-model:page-size="pageSize"
              :page-sizes="[12, 24, 48]"
              :total="total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FlowerCard from '@/components/FlowerCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import { getFlowerList, getCategories, getPurposes, getPriceRanges } from '@/api/flower'

const route = useRoute()
const router = useRouter()

const categories = ref([])
const purposes = ref([])
const priceRanges = ref([])
const flowerList = ref([])
const total = ref(0)
const loading = ref(false)

const filters = reactive({
  categoryId: null,
  purposeId: null,
  minPrice: undefined,
  maxPrice: undefined,
  keyword: '',
  sortBy: ''
})

const page = ref(1)
const pageSize = ref(12)
const sortBy = ref('')

const selectedCategory = ref(null)
const selectedPurpose = ref(null)
const selectedPriceRange = ref(null)

const loadCategories = async () => {
  const res = await getCategories()
  categories.value = res.data
}

const loadPurposes = async () => {
  const res = await getPurposes()
  purposes.value = res.data
}

const loadPriceRanges = async () => {
  const res = await getPriceRanges()
  priceRanges.value = res.data
}

const loadFlowers = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      pageSize: pageSize.value,
      sortBy: filters.sortBy,
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.purposeId && { purposeId: filters.purposeId }),
      ...(filters.minPrice !== undefined && { minPrice: filters.minPrice, maxPrice: filters.maxPrice }),
      ...(filters.keyword && { keyword: filters.keyword })
    }
    const res = await getFlowerList(params)
    flowerList.value = res.data.list
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

const selectCategory = (id) => {
  if (selectedCategory.value === id) {
    selectedCategory.value = null
    filters.categoryId = null
  } else {
    selectedCategory.value = id
    filters.categoryId = id
  }
  page.value = 1
  loadFlowers()
}

const selectPurpose = (id) => {
  if (selectedPurpose.value === id) {
    selectedPurpose.value = null
    filters.purposeId = null
  } else {
    selectedPurpose.value = id
    filters.purposeId = id
  }
  page.value = 1
  loadFlowers()
}

const selectPriceRange = (range) => {
  if (selectedPriceRange.value === range.id) {
    selectedPriceRange.value = null
    filters.minPrice = undefined
    filters.maxPrice = undefined
  } else {
    selectedPriceRange.value = range.id
    filters.minPrice = range.min
    filters.maxPrice = range.max
  }
  page.value = 1
  loadFlowers()
}

const handleSortChange = (value) => {
  filters.sortBy = value
  page.value = 1
  loadFlowers()
}

const handlePageChange = () => {
  loadFlowers()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleSizeChange = () => {
  page.value = 1
  loadFlowers()
}

const resetFilters = () => {
  selectedCategory.value = null
  selectedPurpose.value = null
  selectedPriceRange.value = null
  filters.categoryId = null
  filters.purposeId = null
  filters.minPrice = undefined
  filters.maxPrice = undefined
  filters.keyword = ''
  sortBy.value = ''
  filters.sortBy = ''
  page.value = 1
  router.push('/list')
  loadFlowers()
}

watch(() => route.query, (query) => {
  if (query.category) {
    selectedCategory.value = parseInt(query.category)
    filters.categoryId = parseInt(query.category)
  }
  if (query.purpose) {
    selectedPurpose.value = parseInt(query.purpose)
    filters.purposeId = parseInt(query.purpose)
  }
  if (query.keyword) {
    filters.keyword = query.keyword
  }
  page.value = 1
  loadFlowers()
}, { immediate: true })

onMounted(() => {
  loadCategories()
  loadPurposes()
  loadPriceRanges()
})
</script>

<style lang="scss" scoped>
.list-page {
  padding: 20px 0;
  
  .breadcrumb {
    margin-bottom: 20px;
  }
  
  .list-content {
    display: grid;
    grid-template-columns: 220px 1fr;
    gap: 24px;
    align-items: flex-start;
  }
  
  .filter-sidebar {
    background: #fff;
    border-radius: $radius;
    padding: 20px;
    position: sticky;
    top: 80px;
    
    .filter-section {
      margin-bottom: 24px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .filter-title {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 12px;
        color: $text-primary;
      }
      
      .filter-options {
        display: flex;
        flex-direction: column;
        gap: 8px;
        
        .filter-option {
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          color: $text-secondary;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
          
          &:hover {
            background: $bg-color;
            color: $primary-color;
          }
          
          &.active {
            background: $primary-color;
            color: #fff;
            
            .option-icon {
              filter: brightness(0) invert(1);
            }
          }
          
          .option-icon {
            font-size: 16px;
          }
        }
      }
    }
  }
  
  .product-main {
    .sort-bar {
      background: #fff;
      border-radius: $radius;
      padding: 16px 20px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .sort-left {
        font-size: 14px;
        color: $text-secondary;
      }
    }
    
    .loading-wrapper {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
    }
    
    .product-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
    }
    
    .pagination-wrapper {
      display: flex;
      justify-content: center;
      margin-top: 30px;
    }
  }
}

@media (max-width: 1024px) {
  .list-page {
    .list-content {
      grid-template-columns: 1fr;
    }
    
    .filter-sidebar {
      position: static;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      
      .filter-section {
        margin-bottom: 0;
      }
    }
    
    .product-main {
      .loading-wrapper,
      .product-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  }
}

@media (max-width: 768px) {
  .list-page {
    .filter-sidebar {
      grid-template-columns: 1fr;
    }
    
    .product-main {
      .loading-wrapper,
      .product-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  }
}
</style>
