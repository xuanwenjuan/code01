<template>
  <div class="category-page">
    <div class="container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>{{ categoryInfo?.name || '器材分类' }}</el-breadcrumb-item>
      </el-breadcrumb>

      <div v-if="loading" class="loading-wrapper">
        <LoadingState text="正在加载器材列表..." />
      </div>

      <div v-else class="content-wrapper">
        <div class="sidebar">
          <div class="category-sidebar">
            <h3 class="sidebar-title">器材分类</h3>
            <ul class="category-list">
              <li
                v-for="cat in categories"
                :key="cat.id"
                class="category-item"
                :class="{ active: Number(route.params.id) === cat.id }"
                @click="goCategory(cat.id)"
              >
                <el-icon><component :is="cat.icon" /></el-icon>
                <span>{{ cat.name }}</span>
                <el-icon class="arrow"><ArrowRight /></el-icon>
              </li>
            </ul>
          </div>

          <div class="sub-category-sidebar" v-if="categoryInfo">
            <h3 class="sidebar-title">{{ categoryInfo.name }}</h3>
            <ul class="sub-category-list">
              <li
                v-for="sub in categoryInfo.subCategories"
                :key="sub"
                class="sub-category-item"
                :class="{ active: selectedSubCategory === sub }"
                @click="filterBySubCategory(sub)"
              >
                {{ sub }}
              </li>
            </ul>
          </div>
        </div>

        <div class="main-content">
          <div class="filter-bar">
            <div class="filter-left">
              <span class="result-count">共 {{ filteredProducts.length }} 件商品</span>
            </div>
            <div class="filter-right">
              <el-radio-group v-model="sortBy" size="default">
                <el-radio-button label="default">默认排序</el-radio-button>
                <el-radio-button label="price-asc">价格从低到高</el-radio-button>
                <el-radio-button label="price-desc">价格从高到低</el-radio-button>
                <el-radio-button label="sales">销量优先</el-radio-button>
                <el-radio-button label="rating">评分优先</el-radio-button>
              </el-radio-group>
            </div>
          </div>

          <div v-if="filteredProducts.length > 0" class="product-grid">
            <ProductCard
              v-for="product in sortedProducts"
              :key="product.id"
              :product="product"
            />
          </div>

          <EmptyState
            v-else
            icon="Goods"
            text="该分类下暂无商品"
          >
            <template #action>
              <el-button type="primary" @click="goHome">返回首页</el-button>
            </template>
          </EmptyState>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { categories, products } from '@/mock/data'
import ProductCard from '@/components/ProductCard.vue'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const selectedSubCategory = ref('')
const sortBy = ref('default')

const categoryInfo = computed(() => 
  categories.find(c => c.id === Number(route.params.id))
)

const categoryProducts = computed(() => 
  products.filter(p => p.categoryId === Number(route.params.id))
)

const filteredProducts = computed(() => {
  if (!selectedSubCategory.value) {
    return categoryProducts.value
  }
  return categoryProducts.value.filter(p => p.subCategory === selectedSubCategory.value)
})

const sortedProducts = computed(() => {
  const list = [...filteredProducts.value]
  switch (sortBy.value) {
    case 'price-asc':
      return list.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return list.sort((a, b) => b.price - a.price)
    case 'sales':
      return list.sort((a, b) => b.sales - a.sales)
    case 'rating':
      return list.sort((a, b) => b.rating - a.rating)
    default:
      return list
  }
})

const goCategory = (id) => {
  selectedSubCategory.value = ''
  router.push(`/category/${id}`)
}

const filterBySubCategory = (sub) => {
  selectedSubCategory.value = selectedSubCategory.value === sub ? '' : sub
}

const goHome = () => {
  router.push('/')
}

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 300)
})

watch(() => route.params.id, () => {
  loading.value = true
  selectedSubCategory.value = ''
  setTimeout(() => {
    loading.value = false
  }, 300)
})
</script>

<style lang="scss" scoped>
.category-page {
  .breadcrumb {
    margin-bottom: 20px;
  }

  .content-wrapper {
    display: flex;
    gap: 24px;
  }

  .sidebar {
    width: 240px;
    flex-shrink: 0;
  }

  .category-sidebar,
  .sub-category-sidebar {
    background: #fff;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;

    .sidebar-title {
      font-size: 16px;
      color: #333;
      margin: 0 0 12px 0;
      padding-bottom: 12px;
      border-bottom: 1px solid #ebeef5;
    }
  }

  .category-list {
    list-style: none;
    padding: 0;
    margin: 0;

    .category-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      color: #666;
      margin-bottom: 4px;

      &:hover {
        background: #f5f7fa;
        color: #333;
      }

      &.active {
        background: linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(212, 175, 55, 0.05));
        color: #d4af37;
        font-weight: 500;
      }

      .arrow {
        margin-left: auto;
        font-size: 12px;
      }
    }
  }

  .sub-category-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .sub-category-item {
      padding: 6px 12px;
      background: #f5f7fa;
      border-radius: 16px;
      font-size: 13px;
      color: #666;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: #e8eaed;
      }

      &.active {
        background: linear-gradient(135deg, #d4af37, #8b6914);
        color: #fff;
      }
    }
  }

  .main-content {
    flex: 1;
    min-width: 0;
  }

  .filter-bar {
    background: #fff;
    padding: 16px 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .result-count {
      color: #666;
      font-size: 14px;
    }
  }

  .product-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
}
</style>
