<script setup>
import { ref, onMounted } from 'vue'
import { useProductStore } from '../stores/product'
import { useFavoriteStore } from '../stores/favorite'
import { useUserStore } from '../stores/user'
import { mockRecipes } from '../mock/products'
import LoadingState from '../components/common/LoadingState.vue'
import ProductCard from '../components/common/ProductCard.vue'

const productStore = useProductStore()
const favoriteStore = useFavoriteStore()
const userStore = useUserStore()
const activeCategory = ref(null)

onMounted(async () => {
  await productStore.fetchCategories()
  await productStore.fetchProducts()
  if (userStore.isLoggedIn) {
    favoriteStore.fetchFavorites(userStore.userInfo.id)
  }
})

async function selectCategory(categoryId) {
  activeCategory.value = categoryId
  await productStore.fetchProducts(categoryId)
}

function goToRecipe(recipe) {
  console.log('查看配方:', recipe.title)
}
</script>

<template>
  <div class="home-page">
    <div class="banner">
      <div class="banner-content">
        <h1 class="banner-title">烘焙原料商城</h1>
        <p class="banner-subtitle">精选优质原料，烘焙美好时光</p>
      </div>
    </div>

    <div class="container">
      <section class="category-section">
        <h2 class="section-title">原料分类</h2>
        <div class="category-grid">
          <div 
            v-for="category in productStore.categories" 
            :key="category.id"
            class="category-item card-hover"
            :class="{ active: activeCategory === category.id }"
            @click="selectCategory(category.id)"
          >
            <div class="category-icon">
              <el-icon :size="36">
                <component :is="category.icon" />
              </el-icon>
            </div>
            <h3 class="category-name">{{ category.name }}</h3>
            <p class="category-desc">{{ category.description }}</p>
          </div>
        </div>
      </section>

      <section class="products-section">
        <div class="section-header flex-between">
          <h2 class="section-title">{{ activeCategory ? '分类商品' : '热门推荐' }}</h2>
          <el-button v-if="activeCategory" text @click="selectCategory(null)">查看全部</el-button>
        </div>
        <LoadingState v-if="productStore.loading" text="商品加载中..." />
        <div v-else-if="productStore.products.length > 0" class="products-grid">
          <ProductCard 
            v-for="product in productStore.products" 
            :key="product.id" 
            :product="product" 
          />
        </div>
        <div v-else class="empty-state">
          <p>暂无商品</p>
        </div>
      </section>

      <section class="recipes-section">
        <h2 class="section-title">烘焙配方</h2>
        <div class="recipes-grid">
          <div 
            v-for="recipe in mockRecipes" 
            :key="recipe.id"
            class="recipe-card card-hover"
            @click="goToRecipe(recipe)"
          >
            <div class="recipe-image">
              <img :src="recipe.image" :alt="recipe.title" />
            </div>
            <div class="recipe-info">
              <h3 class="recipe-title">{{ recipe.title }}</h3>
              <p class="recipe-desc">{{ recipe.description }}</p>
              <div class="recipe-meta">
                <span class="meta-item">
                  <el-icon><Timer /></el-icon>
                  {{ recipe.time }}
                </span>
                <span class="meta-item">
                  <el-icon><TrendCharts /></el-icon>
                  {{ recipe.difficulty }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  padding-bottom: 40px;
}

.banner {
  background: linear-gradient(135deg, #e6a23c 0%, #f56c6c 100%);
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  text-align: center;
}

.banner-title {
  font-size: 48px;
  margin: 0 0 16px 0;
}

.banner-subtitle {
  font-size: 20px;
  margin: 0;
  opacity: 0.9;
}

.section-title {
  font-size: 24px;
  color: #303133;
  margin: 40px 0 20px 0;
  font-weight: 600;
}

.section-header {
  margin: 40px 0 20px 0;
}

.section-header .section-title {
  margin: 0;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.category-item {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.category-item:hover,
.category-item.active {
  border-color: #e6a23c;
}

.category-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 16px;
  background: #fef5e7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e6a23c;
}

.category-name {
  font-size: 16px;
  color: #303133;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.category-desc {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #909399;
}

.recipes-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.recipe-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}

.recipe-image {
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.recipe-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.recipe-card:hover .recipe-image img {
  transform: scale(1.05);
}

.recipe-info {
  padding: 16px;
}

.recipe-title {
  font-size: 16px;
  color: #303133;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.recipe-desc {
  font-size: 13px;
  color: #909399;
  margin: 0 0 12px 0;
}

.recipe-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
