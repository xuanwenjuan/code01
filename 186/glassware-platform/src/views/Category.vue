<template>
  <div class="category-page">
    <div class="container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>{{ category?.name || '分类列表' }}</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="category-content">
        <aside class="sidebar">
          <h3 class="sidebar-title">器皿分类</h3>
          <ul class="category-list">
            <li
              v-for="cat in productStore.categoryList"
              :key="cat.id"
              class="category-item"
              :class="{ active: cat.id === currentCategoryId }"
              @click="goCategory(cat.id)"
            >
              <el-icon size="20">
                <component :is="cat.icon" />
              </el-icon>
              <span>{{ cat.name }}</span>
              <span class="count">({{ cat.count }})</span>
            </li>
          </ul>
        </aside>

        <main class="main-content">
          <div class="toolbar">
            <h2 class="page-title">{{ category?.name }} 系列</h2>
            <div class="filter-bar">
              <el-radio-group v-model="sortBy" size="small">
                <el-radio-button value="default">默认排序</el-radio-button>
                <el-radio-button value="sales">销量优先</el-radio-button>
                <el-radio-button value="price-asc">价格升序</el-radio-button>
                <el-radio-button value="price-desc">价格降序</el-radio-button>
              </el-radio-group>
            </div>
          </div>

          <div v-if="sortedProducts.length > 0" class="products-grid">
            <ProductCard
              v-for="product in sortedProducts"
              :key="product.id"
              :product="product"
            />
          </div>
          <EmptyState
            v-else
            description="该分类下暂无商品"
            show-action
            action-text="去首页看看"
            @action="goHome"
          />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import ProductCard from '@/components/ProductCard.vue'
import EmptyState from '@/components/EmptyState.vue'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const sortBy = ref('default')

const currentCategoryId = computed(() => parseInt(route.params.id))
const category = computed(() => productStore.getCategoryById(route.params.id))
const products = computed(() => productStore.getProductsByCategory(route.params.id))

const sortedProducts = computed(() => {
  const list = [...products.value]
  switch (sortBy.value) {
    case 'sales':
      return list.sort((a, b) => b.sales - a.sales)
    case 'price-asc':
      return list.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return list.sort((a, b) => b.price - a.price)
    default:
      return list
  }
})

const goCategory = (id) => {
  router.push(`/category/${id}`)
}

const goHome = () => {
  router.push('/')
}
</script>

<style lang="scss" scoped>
.category-page {
  .breadcrumb {
    margin-bottom: 20px;
  }

  .category-content {
    display: flex;
    gap: 20px;
  }

  .sidebar {
    width: 240px;
    flex-shrink: 0;

    .sidebar-title {
      font-size: 16px;
      font-weight: 600;
      padding: 15px 20px;
      background: #fff;
      border-radius: 8px 8px 0 0;
      margin-bottom: 1px;
    }

    .category-list {
      background: #fff;
      border-radius: 0 0 8px 8px;
      overflow: hidden;

      .category-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 15px 20px;
        cursor: pointer;
        transition: all 0.3s;
        color: #606266;

        &:hover {
          background: #f5f7fa;
          color: #409eff;
        }

        &.active {
          background: #ecf5ff;
          color: #409eff;
          font-weight: 500;
        }

        .count {
          margin-left: auto;
          color: #909399;
          font-size: 12px;
        }
      }
    }
  }

  .main-content {
    flex: 1;

    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .page-title {
        font-size: 20px;
        font-weight: 600;
        color: #303133;
      }
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }
  }
}

@media (max-width: 1200px) {
  .category-page {
    .main-content {
      .products-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  }
}

@media (max-width: 768px) {
  .category-page {
    .category-content {
      flex-direction: column;
    }

    .sidebar {
      width: 100%;
    }

    .main-content {
      .products-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  }
}
</style>
