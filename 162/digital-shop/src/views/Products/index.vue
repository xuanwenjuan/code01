<template>
  <div class="products-page">
    <div class="container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>全部商品</el-breadcrumb-item>
        <el-breadcrumb-item v-if="currentCategoryName">{{ currentCategoryName }}</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="white-card">
        <div class="filter-row">
          <span class="filter-label">分类：</span>
          <div class="filter-options">
            <span
              class="filter-item"
              :class="{ active: !productStore.filters.categoryId }"
              @click="productStore.setFilter('categoryId', null)"
            >全部</span>
            <span
              v-for="cat in productStore.allCategories"
              :key="cat.id"
              class="filter-item"
              :class="{ active: productStore.filters.categoryId == cat.id }"
              @click="productStore.setFilter('categoryId', cat.id)"
            >{{ cat.name }}</span>
          </div>
        </div>
        <div class="filter-row">
          <span class="filter-label">品牌：</span>
          <div class="filter-options">
            <span
              class="filter-item"
              :class="{ active: !productStore.filters.brandId }"
              @click="productStore.setFilter('brandId', null)"
            >全部</span>
            <span
              v-for="brand in productStore.allBrands"
              :key="brand.id"
              class="filter-item"
              :class="{ active: productStore.filters.brandId == brand.id }"
              @click="productStore.setFilter('brandId', brand.id)"
            >{{ brand.name }}</span>
          </div>
        </div>
        <div class="filter-row">
          <span class="filter-label">价格：</span>
          <div class="filter-options">
            <span
              class="filter-item"
              :class="{ active: !productStore.filters.priceRange }"
              @click="productStore.setFilter('priceRange', null)"
            >全部</span>
            <span
              v-for="range in productStore.priceRanges"
              :key="range.label"
              class="filter-item"
              :class="{ active: productStore.filters.priceRange?.label === range.label }"
              @click="productStore.setFilter('priceRange', range)"
            >{{ range.label }}</span>
          </div>
        </div>
      </div>

      <div class="white-card">
        <div class="sort-bar">
          <div class="sort-options">
            <span
              class="sort-item"
              :class="{ active: productStore.sortType === 'default' }"
              @click="productStore.setSort('default')"
            >综合</span>
            <span
              class="sort-item"
              :class="{ active: productStore.sortType === 'sales' }"
              @click="productStore.setSort('sales')"
            >销量</span>
            <span
              class="sort-item"
              :class="{ active: productStore.sortType === 'price-asc' || productStore.sortType === 'price-desc' }"
              @click="togglePriceSort"
            >
              价格
              <el-icon v-if="productStore.sortType === 'price-asc'"><SortUp /></el-icon>
              <el-icon v-else-if="productStore.sortType === 'price-desc'"><SortDown /></el-icon>
            </span>
            <span
              class="sort-item"
              :class="{ active: productStore.sortType === 'new' }"
              @click="productStore.setSort('new')"
            >最新</span>
          </div>
          <div class="product-count">共 <span class="count-num">{{ productStore.filteredProducts.length }}</span> 件商品</div>
        </div>

        <Loading :loading="loading">
          <template v-if="productStore.filteredProducts.length > 0">
            <div class="product-grid">
              <ProductCard v-for="product in productStore.paginatedProducts" :key="product.id" :product="product" />
            </div>
            <div class="pagination-wrapper">
              <el-pagination
                v-model:current-page="productStore.currentPage"
                v-model:page-size="productStore.pageSize"
                :page-sizes="[12, 24, 48]"
                :total="productStore.filteredProducts.length"
                layout="total, sizes, prev, pager, next, jumper"
                background
              />
            </div>
          </template>
          <Empty v-else description="没有找到相关商品，换个筛选条件试试吧" show-action action-text="清除筛选" @action="productStore.resetFilters" />
        </Loading>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { SortUp, SortDown } from '@element-plus/icons-vue'
import { useProductStore } from '@/stores/product'
import ProductCard from '@/components/ProductCard.vue'
import Loading from '@/components/Loading.vue'
import Empty from '@/components/Empty.vue'

const route = useRoute()
const productStore = useProductStore()
const loading = ref(true)

const currentCategoryName = computed(() => {
  if (!productStore.filters.categoryId) return ''
  const cat = productStore.allCategories.find(c => c.id === productStore.filters.categoryId)
  return cat?.name || ''
})

onMounted(() => {
  if (route.query.categoryId) productStore.setFilter('categoryId', Number(route.query.categoryId))
  if (route.query.brandId) productStore.setFilter('brandId', Number(route.query.brandId))
  if (route.query.keyword) productStore.setFilter('keyword', route.query.keyword)
  if (route.query.isNew) productStore.setFilter('isNew', true)
  if (route.query.isHot) productStore.setFilter('isHot', true)
  setTimeout(() => (loading.value = false), 300)
})

function togglePriceSort() {
  if (productStore.sortType === 'price-asc') {
    productStore.setSort('price-desc')
  } else if (productStore.sortType === 'price-desc') {
    productStore.setSort('default')
  } else {
    productStore.setSort('price-asc')
  }
}
</script>

<style scoped lang="scss">
.products-page {
  padding: 20px 0;

  .breadcrumb {
    margin-bottom: 20px;
  }
}

.filter-row {
  display: flex;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px dashed #eee;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &:first-child {
    padding-top: 0;
  }

  .filter-label {
    width: 60px;
    color: #999;
    flex-shrink: 0;
    padding-top: 6px;
    font-size: 14px;
  }

  .filter-options {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .filter-item {
      padding: 6px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      color: #666;
      transition: all 0.3s ease;

      &:hover {
        color: #409eff;
        background: #ecf5ff;
      }

      &.active {
        background: #409eff;
        color: #fff;
      }
    }
  }
}

.sort-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
  margin-bottom: 20px;

  .sort-options {
    display: flex;
    gap: 0;

    .sort-item {
      display: flex;
      align-items: center;
      gap: 5px;
      cursor: pointer;
      color: #666;
      font-size: 14px;
      padding: 8px 20px;
      border-radius: 4px;
      transition: all 0.3s ease;

      &:hover {
        color: #409eff;
      }

      &.active {
        color: #fff;
        background: #409eff;
      }
    }
  }

  .product-count {
    color: #999;
    font-size: 14px;

    .count-num {
      color: #ff4d4f;
      font-weight: bold;
      margin: 0 3px;
    }
  }
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}
</style>
