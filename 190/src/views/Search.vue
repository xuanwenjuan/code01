<template>
  <div class="search-page container">
    <el-breadcrumb class="breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>搜索结果</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="search-result">
      <h2 class="search-title">
        搜索 "<span class="keyword">{{ keyword }}</span>" 共找到 {{ products.length }} 件商品
      </h2>
      
      <div class="product-grid" v-if="products.length">
        <ProductCard 
          v-for="product in products" 
          :key="product.id" 
          :product="product" 
        />
      </div>

      <EmptyState v-else type="search" text="未找到相关商品" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProductStore } from '@/stores/product'
import ProductCard from '@/components/ProductCard.vue'
import EmptyState from '@/components/EmptyState.vue'

const route = useRoute()
const productStore = useProductStore()

const keyword = ref('')
const products = computed(() => productStore.searchProducts(keyword.value))

onMounted(() => {
  keyword.value = route.query.keyword || ''
})
</script>

<style scoped>
.search-page {
  padding: 20px 0 40px;
}

.breadcrumb {
  margin-bottom: 20px;
}

.search-result {
  background: #fff;
  border-radius: 8px;
  padding: 30px;
}

.search-title {
  font-size: 18px;
  margin: 0 0 25px;
  color: #303133;
}

.search-title .keyword {
  color: #409eff;
  font-weight: bold;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
</style>
