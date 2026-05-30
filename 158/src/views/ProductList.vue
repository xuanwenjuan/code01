<template>
  <div class="product-list-page">
    <div class="container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item v-if="currentCategory">{{ currentCategory?.name || '商品列表' }}</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="list-content">
        <aside class="sidebar">
          <div class="filter-card">
            <h3 class="filter-title">商品分类</h3>
            <ul class="category-list">
              <li
                :class="{ active: !filters.categoryId }"
                @click="setCategory(null)"
              >
                全部商品
              </li>
              <li
                v-for="cat in categories"
                :key="cat.id"
                :class="{ active: filters.categoryId == cat.id }"
                @click="setCategory(cat.id)"
              >
                {{ cat.icon }} {{ cat.name }}
              </li>
            </ul>
          </div>

          <div class="filter-card">
            <h3 class="filter-title">品牌筛选</h3>
            <ul class="brand-list">
              <li
                v-for="brand in brands"
                :key="brand.id"
                :class="{ active: filters.brandId == brand.id }"
                @click="setBrand(brand.id)"
              >
                {{ brand.name }}
              </li>
            </ul>
          </div>

          <div class="filter-card">
            <h3 class="filter-title">价格区间</h3>
            <div class="price-filter">
              <el-input
                v-model="priceRange.min"
                type="number"
                placeholder="最低价"
                size="small"
                style="width: 80px"
              />
              <span class="separator">-</span>
              <el-input
                v-model="priceRange.max"
                type="number"
                placeholder="最高价"
                size="small"
                style="width: 80px"
              />
              <el-button type="primary" size="small" @click="applyPriceFilter">确定</el-button>
            </div>
          </div>
        </aside>

        <div class="main-content">
          <div class="sort-bar">
            <div class="sort-options">
              <span class="sort-label">排序：</span>
              <el-button-group>
                <el-button
                  :type="filters.sort === 'default' ? 'primary' : 'default'"
                  size="small"
                  @click="setSort('default')"
                >
                  综合
                </el-button>
                <el-button
                  :type="filters.sort === 'sales' ? 'primary' : 'default'"
                  size="small"
                  @click="setSort('sales')"
                >
                  销量
                </el-button>
                <el-button
                  :type="filters.sort === 'price-asc' ? 'primary' : 'default'"
                  size="small"
                  @click="setSort('price-asc')"
                >
                  价格↑
                </el-button>
                <el-button
                  :type="filters.sort === 'price-desc' ? 'primary' : 'default'"
                  size="small"
                  @click="setSort('price-desc')"
                >
                  价格↓
                </el-button>
                <el-button
                  :type="filters.sort === 'newest' ? 'primary' : 'default'"
                  size="small"
                  @click="setSort('newest')"
                >
                  最新
                </el-button>
              </el-button-group>
            </div>
            <div class="result-info">
              共 <span class="count">{{ paginatedProducts.length }}</span> 件商品
            </div>
          </div>

          <div v-loading="loading" class="products-grid">
            <ProductCard
              v-for="product in paginatedProducts"
              :key="product.id"
              :product="product"
            />
          </div>

          <div v-if="filteredProducts.length === 0" class="empty-state">
            <el-empty description="没有找到相关商品" />
          </div>

          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="filteredProducts.length"
              layout="prev, pager, next, jumper, total"
              background
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProductCard from '@/components/ProductCard.vue'
import { useProductStore } from '@/stores/product'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()

const categories = productStore.getCategories()
const brands = productStore.getBrands()

const loading = ref(false)
const currentPage = ref(1)
const pageSize = 12

const filters = reactive({
  categoryId: null,
  brandId: null,
  keyword: '',
  minPrice: null,
  maxPrice: null,
  sort: 'default'
})

const priceRange = reactive({
  min: '',
  max: ''
})

const currentCategory = computed(() => {
  if (filters.categoryId) {
    return categories.find(c => c.id === Number(filters.categoryId))
  }
  return null
})

const filteredProducts = computed(() => {
  return productStore.filterProducts(filters)
})

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredProducts.value.slice(start, start + pageSize)
})

const setCategory = (categoryId) => {
  filters.categoryId = categoryId
  filters.brandId = null
  currentPage.value = 1
  updateRoute()
}

const setBrand = (brandId) => {
  filters.brandId = filters.brandId == brandId ? null : brandId
  currentPage.value = 1
  updateRoute()
}

const setSort = (sort) => {
  filters.sort = sort
  updateRoute()
}

const applyPriceFilter = () => {
  filters.minPrice = priceRange.min ? Number(priceRange.min) : null
  filters.maxPrice = priceRange.max ? Number(priceRange.max) : null
  currentPage.value = 1
  updateRoute()
}

const updateRoute = () => {
  router.replace({
    path: '/list',
    query: {
      category: filters.categoryId || undefined,
      brand: filters.brandId || undefined,
      keyword: filters.keyword || undefined,
      sort: filters.sort !== 'default' ? filters.sort : undefined
    }
  })
}

const initFromRoute = () => {
  const query = route.query
  filters.categoryId = query.category || null
  filters.brandId = query.brand || null
  filters.keyword = query.keyword || ''
  filters.sort = query.sort || 'default'
  currentPage.value = 1
}

watch(() => route.query, () => {
  initFromRoute()
}, { immediate: true })

onMounted(() => {
  initFromRoute()
})
</script>

<style lang="scss" scoped>
.product-list-page {
  padding: 20px 0;

  .breadcrumb {
    margin-bottom: 20px;
  }

  .list-content {
    display: grid;
    grid-template-columns: 220px 1fr;
    gap: 20px;
  }

  .sidebar {
    .filter-card {
      background: #fff;
      border-radius: $border-radius;
      padding: 16px;
      margin-bottom: 16px;

      .filter-title {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid $border-light;
      }

      .category-list,
      .brand-list {
        li {
          padding: 8px 12px;
          margin-bottom: 4px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;

          &:hover,
          &.active {
            background: $primary-color;
            color: #fff;
          }
        }
      }

      .price-filter {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;

        .separator {
          color: $text-secondary;
        }
      }
    }
  }

  .main-content {
    .sort-bar {
      background: #fff;
      border-radius: $border-radius;
      padding: 16px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .sort-options {
        display: flex;
        align-items: center;
        gap: 12px;

        .sort-label {
          color: $text-secondary;
        }
      }

      .result-info {
        color: $text-secondary;

        .count {
          color: $primary-color;
          font-weight: 600;
        }
      }
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }

    .empty-state {
      padding: 60px 0;
    }

    .pagination-wrapper {
      margin-top: 30px;
      display: flex;
      justify-content: center;
    }
  }
}

@media (max-width: 1200px) {
  .product-list-page {
    .list-content {
      grid-template-columns: 1fr;
    }

    .main-content .products-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}
</style>
