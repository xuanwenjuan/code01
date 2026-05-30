<template>
  <div class="scene-page">
    <div class="container">
      <div class="page-header">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>{{ sceneInfo?.name || '户外场景' }}</el-breadcrumb-item>
        </el-breadcrumb>
        <h2 class="page-title">{{ sceneInfo?.name }}装备推荐</h2>
        <p class="page-desc">{{ sceneInfo?.description }}</p>
      </div>
      
      <div v-if="products.length > 0" class="products-grid">
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
        />
      </div>
      <EmptyState v-else :text="'该场景暂无推荐装备'" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProductStore } from '@/stores/product'
import ProductCard from '@/components/ProductCard.vue'
import EmptyState from '@/components/EmptyState.vue'

const route = useRoute()
const productStore = useProductStore()

const sceneType = computed(() => route.params.type)
const sceneInfo = computed(() => 
  productStore.scenes.find(s => s.type === sceneType.value)
)

const products = computed(() => 
  productStore.getProductsByScene(sceneType.value)
)
</script>

<style lang="scss" scoped>
.scene-page {
  padding: 40px 0;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  
  .page-title {
    margin-top: 16px;
    font-size: 32px;
    font-weight: 700;
    background: linear-gradient(135deg, #409eff, #67c23a);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .page-desc {
    margin-top: 8px;
    color: #909399;
    font-size: 16px;
  }
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}
</style>
