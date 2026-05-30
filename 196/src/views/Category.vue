<template>
  <div class="category-page">
    <div class="container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item @click="$router.push('/')">首页</el-breadcrumb-item>
        <el-breadcrumb-item v-if="currentCategory">{{ currentCategory.name }}</el-breadcrumb-item>
        <el-breadcrumb-item v-else>全部商品</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="page-layout">
        <aside class="sidebar">
          <div class="sidebar-card">
            <h3>商品分类</h3>
            <ul class="category-list">
              <li
                @click="$router.push('/category/all')"
                :class="{ active: route.params.id === 'all' }"
              >
                全部商品
              </li>
              <li
                v-for="cat in productStore.categories"
                :key="cat.id"
                @click="$router.push(`/category/${cat.id}`)"
                :class="{ active: route.params.id == cat.id }"
              >
                <el-icon><component :is="cat.icon" /></el-icon>
                {{ cat.name }}
                <span class="count">({{ cat.count }})</span>
              </li>
            </ul>
          </div>

          <div class="sidebar-card">
            <h3>筛选条件</h3>
            <div class="filter-item">
              <span>价格区间</span>
              <div class="price-inputs">
                <el-input v-model="priceMin" placeholder="最低" size="small" />
                <span>-</span>
                <el-input v-model="priceMax" placeholder="最高" size="small" />
              </div>
            </div>
            <div class="filter-item">
              <span>是否包邮</span>
              <el-switch v-model="freeShipping" />
            </div>
            <div class="filter-item">
              <span>仅显示有货</span>
              <el-switch v-model="inStock" />
            </div>
            <el-button type="primary" size="small" block @click="applyFilter">
              应用筛选
            </el-button>
          </div>
        </aside>

        <main class="main-content">
          <div class="toolbar">
            <div class="sort-options">
              <span>排序：</span>
              <el-button-group>
                <el-button
                  :type="sortBy === 'default' ? 'primary' : 'default'"
                  size="small"
                  @click="sortBy = 'default'"
                >
                  综合
                </el-button>
                <el-button
                  :type="sortBy === 'sales' ? 'primary' : 'default'"
                  size="small"
                  @click="sortBy = 'sales'"
                >
                  销量
                </el-button>
                <el-button
                  :type="sortBy === 'price-asc' ? 'primary' : 'default'"
                  size="small"
                  @click="sortBy = 'price-asc'"
                >
                  价格↑
                </el-button>
                <el-button
                  :type="sortBy === 'price-desc' ? 'primary' : 'default'"
                  size="small"
                  @click="sortBy = 'price-desc'"
                >
                  价格↓
                </el-button>
              </el-button-group>
            </div>
            <div class="result-count">
              共 <span class="count">{{ filteredProducts.length }}</span> 件商品
            </div>
          </div>

          <StateWrapper :empty="filteredProducts.length === 0" description="没有找到相关商品">
            <div class="product-grid">
              <ProductCard
                v-for="product in sortedProducts"
                :key="product.id"
                :product="product"
              />
            </div>
          </StateWrapper>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProductStore } from '@/stores'
import ProductCard from '@/components/ProductCard.vue'
import StateWrapper from '@/components/StateWrapper.vue'

const route = useRoute()
const productStore = useProductStore()

const sortBy = ref('default')
const priceMin = ref('')
const priceMax = ref('')
const freeShipping = ref(false)
const inStock = ref(false)

const currentCategory = computed(() => {
  const id = route.params.id
  if (id && id !== 'all') {
    return productStore.getCategoryById(id)
  }
  return null
})

const categoryProducts = computed(() => {
  const keyword = route.query.keyword
  if (keyword) {
    return productStore.searchProducts(keyword)
  }
  return productStore.getProductsByCategory(route.params.id)
})

const filteredProducts = computed(() => {
  let products = categoryProducts.value

  if (priceMin.value) {
    products = products.filter(p => p.price >= Number(priceMin.value))
  }
  if (priceMax.value) {
    products = products.filter(p => p.price <= Number(priceMax.value))
  }
  if (inStock.value) {
    products = products.filter(p => p.stock > 0)
  }

  return products
})

const sortedProducts = computed(() => {
  const products = [...filteredProducts.value]

  switch (sortBy.value) {
    case 'sales':
      return products.sort((a, b) => b.sales - a.sales)
    case 'price-asc':
      return products.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return products.sort((a, b) => b.price - a.price)
    default:
      return products
  }
})

function applyFilter() {
  // 筛选已在computed中实现
}

onMounted(() => {
  if (route.query.keyword) {
    // 搜索结果页
  }
})
</script>

<style lang="scss" scoped>
.category-page {
  padding: 20px 0;

  .breadcrumb {
    margin-bottom: 20px;
  }

  .page-layout {
    display: flex;
    gap: 24px;
  }

  .sidebar {
    width: 240px;
    flex-shrink: 0;

    .sidebar-card {
      background: #fff;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;

      h3 {
        font-size: 16px;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid #f0f0f0;
      }

      .category-list {
        padding: 0;

        li {
          padding: 8px 12px;
          cursor: pointer;
          border-radius: 4px;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;

          &:hover {
            background: #fff7ed;
            color: var(--primary-color);
          }

          &.active {
            background: #fff7ed;
            color: var(--primary-color);
            font-weight: 500;
          }

          .count {
            margin-left: auto;
            color: var(--text-secondary);
            font-size: 12px;
          }
        }
      }

      .filter-item {
        margin-bottom: 16px;

        > span {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          color: var(--text-regular);
        }

        .price-inputs {
          display: flex;
          align-items: center;
          gap: 8px;

          .el-input {
            flex: 1;
          }
        }
      }
    }
  }

  .main-content {
    flex: 1;
    min-width: 0;

    .toolbar {
      background: #fff;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .sort-options {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .result-count {
        color: var(--text-secondary);

        .count {
          color: var(--primary-color);
          font-weight: 600;
        }
      }
    }

    .product-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
  }
}
</style>
