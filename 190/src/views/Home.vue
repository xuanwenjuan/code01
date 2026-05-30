<template>
  <div class="home-page">
    <div class="banner-section">
      <el-carousel height="380px" indicator-position="outside" :interval="4000">
        <el-carousel-item>
          <div class="banner-item banner-1">
            <div class="banner-content">
              <h2>智慧养殖，设备先行</h2>
              <p>一站式畜牧养殖器械采购平台</p>
              <el-button type="primary" size="large" @click="$router.push('/category')">
                立即选购
              </el-button>
            </div>
          </div>
        </el-carousel-item>
        <el-carousel-item>
          <div class="banner-item banner-2">
            <div class="banner-content">
              <h2>品质保证，厂家直供</h2>
              <p>精选优质养殖设备，助力养殖产业升级</p>
              <el-button type="success" size="large" @click="$router.push('/package')">
                查看套餐
              </el-button>
            </div>
          </div>
        </el-carousel-item>
        <el-carousel-item>
          <div class="banner-item banner-3">
            <div class="banner-content">
              <h2>防疫消毒，安全第一</h2>
              <p>专业防疫设备，保障养殖场生物安全</p>
              <el-button type="warning" size="large" @click="$router.push('/zone/disinfection')">
                防疫专区
              </el-button>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <div class="container">
      <section class="category-section">
        <h2 class="section-title">器械品类分类</h2>
        <div class="category-grid">
          <div 
            class="category-item card-hover" 
            v-for="cat in productStore.categoryList" 
            :key="cat.id"
            @click="goToCategory(cat.id)"
          >
            <div class="category-icon">
              <el-icon :size="40">
                <component :is="cat.icon" />
              </el-icon>
            </div>
            <div class="category-name">{{ cat.name }}</div>
            <div class="category-children">
              <span v-for="(child, idx) in cat.children.slice(0, 3)" :key="child.id">
                {{ child.name }}<span v-if="idx < 2 && cat.children.length > 1"> · </span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section class="zone-section">
        <h2 class="section-title">
          <el-icon color="#e6a23c"><Odometer /></el-icon>
          恒温养殖器械专区
        </h2>
        <div class="zone-banner constant-temp-banner">
          <div class="zone-banner-content">
            <h3>智能恒温 · 科学养殖</h3>
            <p>专业温控设备，为畜禽提供最佳生长环境</p>
          </div>
        </div>
        <div class="product-grid">
          <ProductCard 
            v-for="product in constantTempDisplay" 
            :key="product.id" 
            :product="product" 
          />
        </div>
        <div class="view-more">
          <el-button type="primary" @click="$router.push('/zone/constantTemp')">
            查看更多 <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </section>

      <section class="zone-section">
        <h2 class="section-title">
          <el-icon color="#f56c6c"><FirstAidKit /></el-icon>
          防疫消毒器械专区
        </h2>
        <div class="zone-banner disinfection-banner">
          <div class="zone-banner-content">
            <h3>科学防疫 · 安全养殖</h3>
            <p>全方位消毒防疫设备，守护养殖场生物安全</p>
          </div>
        </div>
        <div class="product-grid">
          <ProductCard 
            v-for="product in disinfectionDisplay" 
            :key="product.id" 
            :product="product" 
          />
        </div>
        <div class="view-more">
          <el-button type="danger" @click="$router.push('/zone/disinfection')">
            查看更多 <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </section>

      <section class="package-section">
        <h2 class="section-title">
          <el-icon color="#67c23a"><Present /></el-icon>
          养殖场成套设备采购套餐推荐
        </h2>
        <div class="package-grid">
          <el-card 
            class="package-card card-hover" 
            v-for="pkg in productStore.packageList" 
            :key="pkg.id"
          >
            <div class="package-tag">{{ pkg.tag }}</div>
            <div class="package-image">
              <el-image :src="pkg.image" fit="cover" height="200" />
            </div>
            <div class="package-info">
              <h3 class="package-name">{{ pkg.name }}</h3>
              <p class="package-desc">{{ pkg.description }}</p>
              <ul class="package-items">
                <li v-for="(item, idx) in pkg.items.slice(0, 4)" :key="idx">
                  <el-icon><Check /></el-icon> {{ item }}
                </li>
              </ul>
              <div class="package-footer flex items-center justify-between">
                <div class="package-price">
                  <span class="current-price">¥{{ pkg.price.toLocaleString() }}</span>
                  <span class="original-price">¥{{ pkg.originalPrice.toLocaleString() }}</span>
                </div>
                <div class="package-savings">{{ pkg.savings }}</div>
              </div>
              <el-button type="primary" class="package-btn" block @click="$router.push('/package')">
                立即采购
              </el-button>
            </div>
          </el-card>
        </div>
      </section>

      <section class="hot-products" v-if="hasMoreProducts">
        <div class="section-header flex items-center justify-between">
          <h2 class="section-title" style="margin: 0">
            <el-icon color="#409eff"><Fire /></el-icon>
            热门推荐
          </h2>
          <div class="load-more-info">
            <span v-if="loadingMore">正在加载更多...</span>
            <span v-else>已加载 {{ hotProductsDisplay.length }} / {{ hotProducts.length }} 件商品</span>
          </div>
        </div>
        <div class="product-grid">
          <ProductCard 
            v-for="product in hotProductsDisplay" 
            :key="product.id" 
            :product="product" 
          />
        </div>
        <div v-if="hasMoreProducts" class="view-more">
          <el-button 
            type="primary" 
            :loading="loadingMore"
            @click="loadMore"
          >
            {{ loadingMore ? '加载中...' : '加载更多' }}
          </el-button>
        </div>
      </section>

      <div ref="loadMoreObserver" class="load-more-observer"></div>
    </div>

    <div v-if="showBackTop" class="back-top" @click="scrollToTop">
      <el-icon :size="20"><Top /></el-icon>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, ref as vueRef, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import ProductCard from '@/components/ProductCard.vue'

const router = useRouter()
const productStore = useProductStore()

const PAGE_SIZE = 8
const INITIAL_LOAD = 4
const LOAD_MORE_COUNT = 4

const hotProductsPage = ref(1)
const loadingMore = ref(false)
const showBackTop = ref(false)
const loadMoreObserver = vueRef(null)

const hotProducts = computed(() => {
  return [...productStore.productList]
    .sort((a, b) => b.sales - a.sales)
})

const constantTempDisplay = computed(() => {
  return productStore.constantTempProducts.slice(0, INITIAL_LOAD)
})

const disinfectionDisplay = computed(() => {
  return productStore.disinfectionProducts.slice(0, INITIAL_LOAD)
})

const hotProductsDisplay = computed(() => {
  const displayCount = hotProductsPage.value * PAGE_SIZE
  return hotProducts.value.slice(0, Math.min(displayCount, hotProducts.value.length))
})

const hasMoreProducts = computed(() => {
  return hotProductsDisplay.value.length < hotProducts.value.length
})

function goToCategory(catId) {
  router.push(`/category?catId=${catId}`)
}

function loadMore() {
  if (loadingMore.value) return
  
  loadingMore.value = true
  
  setTimeout(() => {
    hotProductsPage.value++
    loadingMore.value = false
  }, 500)
}

function handleScroll() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  showBackTop.value = scrollTop > 300
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

function setupInfiniteScroll() {
  if (!('IntersectionObserver' in window)) return
  
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && hasMoreProducts.value && !loadingMore.value) {
      loadMore()
    }
  }, {
    rootMargin: '100px'
  })
  
  nextTick(() => {
    if (loadMoreObserver.value) {
      observer.observe(loadMoreObserver.value)
    }
  })
  
  return observer
}

let observer = null

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  observer = setupInfiniteScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (observer && observer.disconnect) {
    observer.disconnect()
  }
})
</script>

<style scoped>
.home-page {
  padding-bottom: 40px;
}

.banner-section {
  margin-bottom: 30px;
}

.banner-item {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding-left: 15%;
  color: #fff;
}

.banner-1 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.banner-2 {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.banner-3 {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.banner-content h2 {
  font-size: 42px;
  margin-bottom: 15px;
}

.banner-content p {
  font-size: 18px;
  margin-bottom: 25px;
  opacity: 0.9;
}

.category-section {
  margin-bottom: 40px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.category-item {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  border: 1px solid #ebeef5;
}

.category-icon {
  width: 70px;
  height: 70px;
  background: #ecf5ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409eff;
  margin-bottom: 15px;
}

.category-name {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.category-children {
  font-size: 12px;
  color: #909399;
  line-height: 1.6;
}

.zone-section {
  margin-bottom: 40px;
}

.zone-banner {
  height: 100px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  padding: 0 30px;
  color: #fff;
}

.constant-temp-banner {
  background: linear-gradient(90deg, #f6d365 0%, #fda085 100%);
}

.disinfection-banner {
  background: linear-gradient(90deg, #ff9a9e 0%, #fecfef 100%);
}

.zone-banner-content h3 {
  font-size: 22px;
  margin: 0 0 5px;
}

.zone-banner-content p {
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.view-more {
  text-align: center;
  margin-top: 25px;
}

.package-section {
  margin-bottom: 40px;
}

.package-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.package-card {
  position: relative;
  overflow: hidden;
}

.package-tag {
  position: absolute;
  top: 15px;
  left: -30px;
  background: #f56c6c;
  color: #fff;
  padding: 5px 40px;
  font-size: 12px;
  transform: rotate(-45deg);
  z-index: 10;
}

.package-image {
  margin: -20px -20px 15px;
}

.package-name {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 10px;
  color: #303133;
}

.package-desc {
  font-size: 13px;
  color: #606266;
  margin-bottom: 12px;
}

.package-items {
  list-style: none;
  padding: 0;
  margin: 0 0 15px;
}

.package-items li {
  font-size: 12px;
  color: #606266;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.package-footer {
  padding: 10px 0;
  border-top: 1px solid #ebeef5;
  margin-bottom: 15px;
}

.current-price {
  font-size: 24px;
  font-weight: bold;
  color: #f56c6c;
}

.original-price {
  font-size: 13px;
  color: #909399;
  text-decoration: line-through;
  margin-left: 10px;
}

.package-savings {
  font-size: 12px;
  color: #67c23a;
  background: #f0f9eb;
  padding: 3px 8px;
  border-radius: 4px;
}

.package-btn {
  font-size: 15px;
}

.hot-products {
  margin-bottom: 40px;
}

.section-header {
  margin-bottom: 20px;
  padding: 0;
}

.load-more-info {
  font-size: 13px;
  color: #909399;
}

.load-more-observer {
  height: 20px;
}

.back-top {
  position: fixed;
  right: 30px;
  bottom: 80px;
  width: 48px;
  height: 48px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #409eff;
  transition: all 0.3s;
  z-index: 1000;
}

.back-top:hover {
  background: #409eff;
  color: #fff;
}
</style>
