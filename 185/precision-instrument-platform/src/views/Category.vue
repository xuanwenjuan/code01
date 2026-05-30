<template>
  <div class="category-page">
    <div class="container">
      <div class="breadcrumb">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>全部配件</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div class="filter-section card">
        <div class="filter-row">
          <label class="filter-label">品类筛选：</label>
          <div class="filter-options">
            <el-tag
              v-for="cat in productStore.allCategories"
              :key="cat.id"
              :type="productStore.selectedCategory === cat.id ? 'primary' : 'info'"
              class="filter-tag"
              @click="toggleCategory(cat.id)"
            >
              {{ cat.name }}
            </el-tag>
          </div>
        </div>
        <div class="filter-row">
          <label class="filter-label">价格区间：</label>
          <div class="filter-options">
            <el-slider
              v-model="priceRange"
              range
              :min="0"
              :max="3000"
              :step="100"
              style="width: 300px"
              @change="handlePriceChange"
            />
            <span class="price-display">¥{{ priceRange[0] }} - ¥{{ priceRange[1] }}</span>
          </div>
        </div>
        <div class="filter-actions">
          <el-button size="small" @click="clearAll">清除筛选</el-button>
        </div>
      </div>

      <div class="results-info">
        共找到 <strong>{{ productStore.filteredProducts.length }}</strong> 件商品
        <el-divider direction="vertical" />
        <el-radio-group v-model="sortType" size="small" @change="handleSort">
          <el-radio-button label="default">综合排序</el-radio-button>
          <el-radio-button label="sales">销量优先</el-radio-button>
          <el-radio-button label="price-asc">价格从低到高</el-radio-button>
          <el-radio-button label="price-desc">价格从高到低</el-radio-button>
        </el-radio-group>
      </div>

      <div v-if="productStore.filteredProducts.length > 0" class="product-grid">
        <ProductCard
          v-for="product in sortedProducts"
          :key="product.id"
          :product="product"
        />
      </div>

      <AppEmpty
        v-else
        description="没有找到符合条件的商品"
        show-action
        action-text="清除筛选"
        @action="clearAll"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductStore } from '@/stores/product'
import ProductCard from '@/components/common/ProductCard.vue'
import AppEmpty from '@/components/common/AppEmpty.vue'

const productStore = useProductStore()

const priceRange = ref([0, 3000])
const sortType = ref('default')

const sortedProducts = computed(() => {
  const products = [...productStore.filteredProducts]
  
  switch (sortType.value) {
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

const toggleCategory = (categoryId) => {
  if (productStore.selectedCategory === categoryId) {
    productStore.setCategory(null)
  } else {
    productStore.setCategory(categoryId)
  }
}

const handlePriceChange = () => {
  productStore.setPriceRange(priceRange.value)
}

const handleSort = () => {}

const clearAll = () => {
  productStore.clearFilters()
  priceRange.value = [0, 3000]
  sortType.value = 'default'
}

onMounted(() => {
  if (!productStore.selectedCategory && !productStore.priceRange) {
    productStore.clearFilters()
  }
})
</script>

<style scoped>
.category-page {
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

.filter-section {
  padding: 20px;
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.filter-row:last-child {
  margin-bottom: 0;
}

.filter-label {
  width: 80px;
  color: #606266;
  font-size: 14px;
  flex-shrink: 0;
}

.filter-options {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.price-display {
  color: #409eff;
  font-size: 14px;
  font-weight: 500;
}

.filter-actions {
  text-align: right;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.results-info {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  color: #606266;
  font-size: 14px;
}

.results-info strong {
  color: #f56c6c;
  margin: 0 4px;
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
}
</style>
