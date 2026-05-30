<template>
  <div class="list-page">
    <div class="container">
      <div class="breadcrumb">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>配件列表</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div class="filter-section card">
        <div class="filter-row">
          <span class="filter-label">适用车型：</span>
          <div class="filter-options">
            <el-tag
              v-for="brand in carBrands"
              :key="brand.id"
              :type="selectedBrand === brand.id ? 'primary' : 'info'"
              class="filter-tag"
              @click="selectBrand(brand.id)"
            >
              {{ brand.logo }} {{ brand.name }}
            </el-tag>
            <el-tag
              v-if="selectedBrand"
              type="danger"
              class="filter-tag"
              @click="selectedBrand = null"
            >
              清除
            </el-tag>
          </div>
        </div>

        <div class="filter-row">
          <span class="filter-label">配件品类：</span>
          <div class="filter-options">
            <el-tag
              v-for="cat in categories"
              :key="cat.id"
              :type="selectedCategory === cat.id ? 'primary' : 'info'"
              class="filter-tag"
              @click="selectCategory(cat.id)"
            >
              {{ cat.icon }} {{ cat.name }}
            </el-tag>
            <el-tag
              v-if="selectedCategory"
              type="danger"
              class="filter-tag"
              @click="selectedCategory = null"
            >
              清除
            </el-tag>
          </div>
        </div>

        <div v-if="selectedCategory && currentCategory?.children?.length > 0" class="filter-row">
          <span class="filter-label">子分类：</span>
          <div class="filter-options">
            <el-tag
              v-for="sub in currentCategory.children"
              :key="sub"
              :type="selectedSubCategory === sub ? 'primary' : 'info'"
              class="filter-tag"
              @click="selectSubCategory(sub)"
            >
              {{ sub }}
            </el-tag>
            <el-tag
              v-if="selectedSubCategory"
              type="danger"
              class="filter-tag"
              @click="selectedSubCategory = null"
            >
              清除
            </el-tag>
          </div>
        </div>

        <div class="filter-row">
          <span class="filter-label">价格区间：</span>
          <div class="filter-options">
            <el-slider
              v-model="priceRange"
              range
              :min="0"
              :max="2000"
              :step="50"
              :show-tooltip="true"
              format-tooltip="formatPriceTooltip"
              style="width: 300px; margin-right: 16px;"
            />
            <span class="price-display">
              ¥{{ priceRange[0] }} - ¥{{ priceRange[1] }}
            </span>
          </div>
        </div>

        <div class="filter-row">
          <span class="filter-label">快速筛选：</span>
          <div class="filter-options">
            <el-tag
              v-for="quick in quickFilters"
              :key="quick.label"
              :type="activeQuickFilter === quick.label ? 'success' : 'info'"
              class="filter-tag"
              @click="applyQuickFilter(quick)"
            >
              {{ quick.label }}
            </el-tag>
            <el-tag
              v-if="activeQuickFilter"
              type="danger"
              class="filter-tag"
              @click="clearQuickFilter"
            >
              清除
            </el-tag>
          </div>
        </div>
      </div>

      <div class="list-header">
        <div class="sort-options">
          <span class="sort-label">排序：</span>
          <el-radio-group v-model="sortBy" size="default">
            <el-radio-button value="default">综合</el-radio-button>
            <el-radio-button value="sales">销量</el-radio-button>
            <el-radio-button value="price-asc">价格↑</el-radio-button>
            <el-radio-button value="price-desc">价格↓</el-radio-button>
            <el-radio-button value="rating">好评</el-radio-button>
          </el-radio-group>
        </div>
        <div class="list-info">
          共 <span class="text-price">{{ filteredProducts.length }}</span> 件商品
        </div>
      </div>

      <div v-if="filteredProducts.length > 0" class="product-grid">
        <ProductCard
          v-for="product in paginatedProducts"
          :key="product.id"
          :product="product"
        />
      </div>

      <div v-else class="empty-wrapper">
        <el-empty description="没有找到符合条件的商品" />
      </div>

      <div v-if="filteredProducts.length > 0" class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[12, 24, 48]"
          :total="filteredProducts.length"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import ProductCard from '@/components/ProductCard.vue'
import { carBrands, categories, products } from '@/mock/data'

const route = useRoute()

const selectedBrand = ref(null)
const selectedCategory = ref(null)
const selectedSubCategory = ref(null)
const priceRange = ref([0, 2000])
const sortBy = ref('default')
const currentPage = ref(1)
const pageSize = ref(12)
const activeQuickFilter = ref(null)

const quickFilters = [
  { label: '促销商品', filter: (p) => p.originalPrice > p.price },
  { label: '高评分', filter: (p) => p.rating >= 4.8 },
  { label: '热销榜', filter: (p) => p.sales >= 10000 },
  { label: '有货', filter: (p) => p.stock > 0 }
]

const currentCategory = computed(() => {
  return categories.find(c => c.id === selectedCategory.value)
})

watch(() => route.query, (query) => {
  if (query.brandId) {
    selectedBrand.value = Number(query.brandId)
  }
  if (query.category) {
    selectedCategory.value = Number(query.category)
  }
  if (query.keyword) {
    keyword.value = query.keyword
  }
  currentPage.value = 1
}, { immediate: true })

const keyword = ref('')

const filteredProducts = computed(() => {
  let result = [...products]

  if (selectedBrand.value) {
    result = result.filter(p => p.brandId === selectedBrand.value)
  }

  if (selectedCategory.value) {
    result = result.filter(p => p.category === selectedCategory.value)
  }

  if (selectedSubCategory.value) {
    result = result.filter(p => p.subCategory === selectedSubCategory.value)
  }

  if (activeQuickFilter.value) {
    const quickFilter = quickFilters.find(q => q.label === activeQuickFilter.value)
    if (quickFilter) {
      result = result.filter(quickFilter.filter)
    }
  }

  result = result.filter(p => 
    p.price >= priceRange.value[0] && p.price <= priceRange.value[1]
  )

  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    result = result.filter(p => 
      p.name.toLowerCase().includes(kw) || 
      p.brand.toLowerCase().includes(kw) ||
      p.description.toLowerCase().includes(kw)
    )
  }

  switch (sortBy.value) {
    case 'sales':
      result.sort((a, b) => b.sales - a.sales)
      break
    case 'price-asc':
      result.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      result.sort((a, b) => b.price - a.price)
      break
    case 'rating':
      result.sort((a, b) => b.rating - a.rating)
      break
  }

  return result
})

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredProducts.value.slice(start, end)
})

const selectBrand = (id) => {
  selectedBrand.value = selectedBrand.value === id ? null : id
  currentPage.value = 1
}

const selectCategory = (id) => {
  selectedCategory.value = selectedCategory.value === id ? null : id
  selectedSubCategory.value = null
  currentPage.value = 1
}

const selectSubCategory = (sub) => {
  selectedSubCategory.value = selectedSubCategory.value === sub ? null : sub
  currentPage.value = 1
}

const applyQuickFilter = (quick) => {
  activeQuickFilter.value = activeQuickFilter.value === quick.label ? null : quick.label
  currentPage.value = 1
}

const clearQuickFilter = () => {
  activeQuickFilter.value = null
  currentPage.value = 1
}

const formatPriceTooltip = (value) => {
  return `¥${value}`
}
</script>

<style lang="scss" scoped>
.list-page {
  padding: 24px 0 48px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 140px);
}

.breadcrumb {
  margin-bottom: 20px;
  
  :deep(.el-breadcrumb__inner) {
    font-size: 14px;
  }
  
  :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
    color: #409eff;
    font-weight: 500;
  }
}

.filter-section {
  padding: 24px;
  margin-bottom: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.filter-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px dashed #e4e7ed;

  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
}

.filter-label {
  width: 100px;
  flex-shrink: 0;
  font-weight: 600;
  color: #303133;
  padding-top: 6px;
  font-size: 14px;
}

.filter-options {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.filter-tag {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 4px;
  padding: 0 12px;
  height: 32px;
  line-height: 30px;
  font-size: 13px;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
}

.price-display {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  margin-left: 8px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  padding: 16px 24px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 16px;
}

.sort-label {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.list-info {
  color: #606266;
  font-size: 14px;
  
  .text-price {
    color: #f56c6c;
    font-weight: 600;
    font-size: 16px;
    margin: 0 4px;
  }
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.empty-wrapper {
  background-color: #fff;
  border-radius: 8px;
  padding: 60px 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

@media (max-width: 768px) {
  .list-page {
    padding: 16px 0 32px;
  }

  .filter-section {
    padding: 16px;
  }

  .filter-row {
    flex-direction: column;
    gap: 12px;
    padding-bottom: 16px;
    margin-bottom: 16px;
  }

  .filter-label {
    width: auto;
    padding-top: 0;
  }

  .list-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
    padding: 16px;
  }

  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }

  :deep(.el-slider) {
    width: 100% !important;
  }
}
</style>
