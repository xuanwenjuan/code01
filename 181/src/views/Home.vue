<template>
  <div class="home-page">
    <section class="banner-section">
      <div class="container">
        <div class="banner-content">
          <h1>探索自然 装备先行</h1>
          <p>专业户外装备，陪你征服每一段旅程</p>
          <el-button type="primary" size="large" @click="scrollToProducts">
            立即选购
            <el-icon><ArrowDown /></el-icon>
          </el-button>
        </div>
      </div>
    </section>
    
    <section class="categories-section">
      <div class="container">
        <h2 class="section-title">装备分类</h2>
        <div class="categories-grid">
          <div
            v-for="cat in categories"
            :key="cat.id"
            class="category-item card-hover"
            @click="goCategory(cat.id)"
          >
            <div class="category-icon">
              <el-icon size="36"><component :is="cat.icon" /></el-icon>
            </div>
            <h3>{{ cat.name }}</h3>
            <span>{{ cat.count }}件商品</span>
          </div>
        </div>
      </div>
    </section>
    
    <section class="scenes-section">
      <div class="container">
        <h2 class="section-title">户外场景</h2>
        <div class="scenes-grid">
          <div
            v-for="scene in scenes"
            :key="scene.type"
            class="scene-item card-hover"
            @click="goScene(scene.type)"
          >
            <img :src="scene.image" :alt="scene.name" />
            <div class="scene-overlay">
              <h3>{{ scene.name }}</h3>
              <p>{{ scene.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <section class="hot-products-section" id="products">
      <div class="container">
        <h2 class="section-title">热门装备</h2>
        <div v-if="filteredProducts.length > 0" class="products-grid">
          <ProductCard
            v-for="product in filteredProducts"
            :key="product.id"
            :product="product"
          />
        </div>
        <EmptyState v-else :text="'未找到相关商品'" />
      </div>
    </section>
    
    <section class="new-products-section">
      <div class="container">
        <h2 class="section-title">新品上架</h2>
        <div class="products-grid">
          <ProductCard
            v-for="product in productStore.newProducts"
            :key="product.id"
            :product="product"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import ProductCard from '@/components/ProductCard.vue'
import EmptyState from '@/components/EmptyState.vue'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()

const categories = productStore.categories
const scenes = productStore.scenes

const searchKeyword = ref('')

const filteredProducts = computed(() => {
  if (searchKeyword.value) {
    return productStore.searchProducts(searchKeyword.value)
  }
  return productStore.hotProducts
})

onMounted(() => {
  if (route.query.search) {
    searchKeyword.value = route.query.search
  }
})

watch(() => route.query.search, (val) => {
  searchKeyword.value = val || ''
})

const goCategory = (id) => router.push(`/category/${id}`)
const goScene = (type) => router.push(`/scene/${type}`)

const scrollToProducts = () => {
  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style lang="scss" scoped>
.banner-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 100px 0;
  color: #fff;
  margin-bottom: 60px;
  
  .banner-content {
    text-align: center;
    
    h1 {
      font-size: 48px;
      font-weight: 700;
      margin-bottom: 16px;
    }
    
    p {
      font-size: 20px;
      margin-bottom: 32px;
      opacity: 0.9;
    }
  }
}

.categories-section {
  margin-bottom: 60px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 20px;
}

.category-item {
  background: #fff;
  border-radius: 12px;
  padding: 24px 16px;
  text-align: center;
  cursor: pointer;
  
  .category-icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 12px;
    background: linear-gradient(135deg, #ecf5ff, #d9ecff);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #409eff;
    transition: all 0.3s;
  }
  
  &:hover .category-icon {
    background: linear-gradient(135deg, #409eff, #66b1ff);
    color: #fff;
    transform: scale(1.1);
  }
  
  h3 {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 4px;
  }
  
  span {
    font-size: 12px;
    color: #909399;
  }
}

.scenes-section {
  margin-bottom: 60px;
}

.scenes-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.scene-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  aspect-ratio: 4/3;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
  
  .scene-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 24px;
    background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
    color: #fff;
    
    h3 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    p {
      font-size: 14px;
      opacity: 0.9;
    }
  }
}

.hot-products-section,
.new-products-section {
  margin-bottom: 60px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}
</style>
