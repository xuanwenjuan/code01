<template>
  <div class="home-page">
    <section class="banner-section">
      <div class="container">
        <div class="banner-content">
          <div class="banner-text">
            <h1>专业陶艺工具采购平台</h1>
            <p>一站式采购，为陶艺爱好者和工作室提供高品质工具</p>
            <div class="banner-btns">
              <el-button type="primary" size="large" @click="goToCategory">
                立即选购
              </el-button>
              <el-button size="large" @click="goToTutorials">
                查看教程
              </el-button>
            </div>
          </div>
          <div class="banner-image">
            <div class="banner-icons">
              <span class="icon">🏺</span>
              <span class="icon">🎨</span>
              <span class="icon">🔥</span>
              <span class="icon">🔧</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="container">
      <div class="card">
        <h2 class="section-title">热门分类</h2>
        <div class="category-grid">
          <div
            v-for="cat in appStore.categories"
            :key="cat.id"
            class="category-item"
            @click="goToCategory(cat.id)"
          >
            <span class="cat-icon">{{ cat.icon }}</span>
            <span class="cat-name">{{ cat.name }}</span>
            <span class="cat-count">{{ cat.count }}件商品</span>
          </div>
        </div>
      </div>
    </section>

    <section class="container">
      <div class="card">
        <h2 class="section-title">热门推荐</h2>
        <div class="product-grid">
          <ProductCard
            v-for="product in recommendedProducts"
            :key="product.id"
            :product="product"
          />
        </div>
      </div>
    </section>

    <section class="container">
      <div class="card">
        <div class="flex-between">
          <h2 class="section-title" style="margin-bottom: 0">热销榜单</h2>
          <el-button type="text" @click="goToCategory(0)">查看更多</el-button>
        </div>
        <div class="product-grid">
          <ProductCard
            v-for="product in hotProducts"
            :key="product.id"
            :product="product"
          />
        </div>
      </div>
    </section>

    <section class="container">
      <div class="card">
        <div class="flex-between">
          <h2 class="section-title" style="margin-bottom: 0">陶艺教程</h2>
          <el-button type="text" @click="goToTutorials">更多教程</el-button>
        </div>
        <div class="tutorial-grid">
          <div
            v-for="tutorial in appStore.tutorials.slice(0, 4)"
            :key="tutorial.id"
            class="tutorial-item"
            @click="goToTutorials"
          >
            <div class="tutorial-cover">
              <img :src="tutorial.cover" :alt="tutorial.title" />
              <div class="tutorial-level" :class="tutorial.level">
                {{ tutorial.level }}
              </div>
              <div class="play-icon">
                <el-icon :size="40"><VideoPlay /></el-icon>
              </div>
            </div>
            <div class="tutorial-info">
              <h3 class="tutorial-title text-ellipsis">{{ tutorial.title }}</h3>
              <p class="tutorial-desc text-ellipsis">{{ tutorial.description }}</p>
              <div class="tutorial-meta">
                <span class="duration">
                  <el-icon><Timer /></el-icon>
                  {{ tutorial.duration }}
                </span>
                <span class="views">
                  <el-icon><View /></el-icon>
                  {{ formatViews(tutorial.views) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="container">
      <div class="features-section">
        <div class="feature-item">
          <div class="feature-icon">🚚</div>
          <h3>快速配送</h3>
          <p>全国包邮，3-5天送达</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">✅</div>
          <h3>品质保证</h3>
          <p>正品保障，假一赔十</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">💰</div>
          <h3>价格优惠</h3>
          <p>源头工厂，直达底价</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">💝</div>
          <h3>贴心服务</h3>
          <p>7天无理由退换货</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import ProductCard from '@/components/common/ProductCard.vue'

const router = useRouter()
const appStore = useAppStore()

const recommendedProducts = ref([])
const hotProducts = ref([])

onMounted(() => {
  recommendedProducts.value = appStore.getRecommendedProducts()
  hotProducts.value = appStore.getHotProducts()
})

const goToCategory = (id = 0) => {
  router.push(`/category/${id}`)
}

const goToTutorials = () => {
  router.push('/tutorials')
}

const formatViews = (views) => {
  if (views >= 10000) {
    return (views / 10000).toFixed(1) + '万'
  }
  return views
}
</script>

<style scoped>
.banner-section {
  background: linear-gradient(135deg, #d4a574 0%, #e8c9a0 100%);
  padding: 60px 0;
  margin-bottom: 30px;
}

.banner-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.banner-text h1 {
  font-size: 42px;
  color: #fff;
  margin-bottom: 16px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.banner-text p {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 30px;
}

.banner-btns {
  display: flex;
  gap: 16px;
}

.banner-btns .el-button--primary {
  background: #fff;
  color: #d4a574;
  border: none;
}

.banner-btns .el-button--primary:hover {
  background: #f5f5f5;
  color: #c49060;
}

.banner-btns .el-button {
  color: #fff;
  border-color: #fff;
}

.banner-btns .el-button:hover {
  color: #d4a574;
  background: #fff;
}

.banner-icons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.banner-icons .icon {
  font-size: 60px;
  text-align: center;
  animation: float 3s ease-in-out infinite;
}

.banner-icons .icon:nth-child(2) {
  animation-delay: 0.5s;
}

.banner-icons .icon:nth-child(3) {
  animation-delay: 1s;
}

.banner-icons .icon:nth-child(4) {
  animation-delay: 1.5s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 20px;
}

.category-item {
  text-align: center;
  padding: 20px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.category-item:hover {
  background: #f8f4f0;
  transform: translateY(-4px);
}

.cat-icon {
  font-size: 40px;
}

.cat-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.cat-count {
  font-size: 12px;
  color: #999;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.tutorial-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.tutorial-item {
  cursor: pointer;
  transition: transform 0.3s;
}

.tutorial-item:hover {
  transform: translateY(-4px);
}

.tutorial-cover {
  position: relative;
  width: 100%;
  padding-top: 62.5%;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
}

.tutorial-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tutorial-level {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #fff;
}

.tutorial-level.入门 {
  background: #27ae60;
}

.tutorial-level.中级 {
  background: #f39c12;
}

.tutorial-level.高级 {
  background: #e74c3c;
}

.play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  opacity: 0;
  transition: opacity 0.3s;
}

.tutorial-item:hover .play-icon {
  opacity: 1;
}

.tutorial-title {
  font-size: 15px;
  color: #333;
  margin-bottom: 6px;
}

.tutorial-desc {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.tutorial-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
}

.tutorial-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.features-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  padding: 40px 0;
}

.feature-item {
  text-align: center;
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.feature-item h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 8px;
}

.feature-item p {
  font-size: 14px;
  color: #999;
}
</style>
