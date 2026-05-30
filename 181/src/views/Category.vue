<template>
  <div class="category-page">
    <div class="container">
      <div class="page-header">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>{{ categoryName }}</el-breadcrumb-item>
        </el-breadcrumb>
        <h2 class="page-title">{{ categoryName }}</h2>
      </div>
      
      <div class="filter-bar">
        <span class="filter-label">排序：</span>
        <el-radio-group v-model="sortBy" size="small">
          <el-radio-button value="default">综合</el-radio-button>
          <el-radio-button value="sales">销量</el-radio-button>
          <el-radio-button value="price-asc">价格↑</el-radio-button>
          <el-radio-button value="price-desc">价格↓</el-radio-button>
          <el-radio-button value="rating">评分</el-radio-button>
        </el-radio-group>
        <span class="product-count">共 {{ sortedProducts.length }} 件商品</span>
      </div>
      
      <div v-if="sortedProducts.length > 0" class="products-grid">
        <ProductCard
          v-for="product in sortedProducts"
          :key="product.id"
          :product="product"
        />
      </div>
      <EmptyState v-else :text="'该分类暂无商品'" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProductStore } from '@/stores/product'
import ProductCard from '@/components/ProductCard.vue'
import EmptyState from '@/components/EmptyState.vue'

const route = useRoute()
const productStore = useProductStore()

const categoryId = computed(() => Number(route.params.id))
const category = computed(() => 
  productStore.categories.find(c => c.id === categoryId.value)
)
const categoryName = computed(() => category.value?.name || '商品分类')

const sortBy = ref('default')

const products = computed(() => 
  productStore.getProductsByCategory(categoryId.value)
)

const sortedProducts = computed(() => {
  const list = [...products.value]
  switch (sortBy.value) {
    case 'sales':
      return list.sort((a, b) => b.sales - a.sales)
    case 'price-asc':
      return list.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return list.sort((a, b) => b.price - a.price)
    case 'rating':
      return list.sort((a, b) => b.rating - a.rating)
    default:
      return list
  }
})
</script>

<style lang="scss" scoped>
.category-page {
  padding: 40px 0;
}

.page-header {
  margin-bottom: 30px;
  
  .page-title {
    margin-top: 16px;
    font-size: 28px;
    font-weight: 600;
    color: #1f2937;
  }
}

.filter-bar {
  background: #fff;
  padding: 16px 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  
  .filter-label {
    color: #606266;
    font-weight: 500;
  }
  
  .product-count {
    margin-left: auto;
    color: #909399;
    font-size: 14px;
  }
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}
</style>
