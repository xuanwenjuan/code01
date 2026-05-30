<template>
  <div class="home-page">
    <section class="banner-section">
      <div class="container">
        <div class="banner-content">
          <h1 class="banner-title">复古饰品，时光之美</h1>
          <p class="banner-subtitle">甄选全球经典复古风格饰品，让经典永不褪色</p>
          <div class="banner-actions">
            <el-button type="primary" size="large" @click="router.push('/products')">
              立即选购
            </el-button>
            <el-button size="large" @click="scrollToSection('categories')">
              了解更多
            </el-button>
          </div>
        </div>
        <div class="banner-image">
          <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20jewelry%20elegant%20display%20gold%20necklace%20earrings%20luxury&image_size=landscape_16_9" alt="复古饰品" />
        </div>
      </div>
    </section>
    
    <section id="categories" class="categories-section">
      <div class="container">
        <h2 class="section-title">饰品风格分类</h2>
        <div class="categories-grid">
          <div 
            v-for="cat in productStore.categories" 
            :key="cat.id" 
            class="category-card card-hover vintage-border"
            @click="router.push(`/products?category=${cat.id}`)"
          >
            <span class="category-icon">{{ cat.icon }}</span>
            <h3 class="category-name">{{ cat.name }}</h3>
            <p class="category-desc">{{ cat.description }}</p>
          </div>
        </div>
      </div>
    </section>
    
    <section class="hot-section">
      <div class="container">
        <h2 class="section-title">热门复古款式</h2>
        <div class="products-grid">
          <ProductCard v-for="product in productStore.hotProducts" :key="product.id" :product="product" />
        </div>
        <div class="section-footer">
          <el-button @click="router.push('/products')">查看更多</el-button>
        </div>
      </div>
    </section>
    
    <section class="new-section">
      <div class="container">
        <h2 class="section-title">新品上新</h2>
        <div class="products-grid">
          <ProductCard v-for="product in productStore.newProducts" :key="product.id" :product="product" />
        </div>
        <div class="section-footer">
          <el-button @click="router.push('/products')">查看更多</el-button>
        </div>
      </div>
    </section>
    
    <section class="features-section">
      <div class="container">
        <div class="features-grid">
          <div class="feature-item">
            <el-icon :size="40"><Medal /></el-icon>
            <h3>品质保证</h3>
            <p>严选优质材质，工艺精湛</p>
          </div>
          <div class="feature-item">
            <el-icon :size="40"><Van /></el-icon>
            <h3>免费配送</h3>
            <p>满199元包邮，快速送达</p>
          </div>
          <div class="feature-item">
            <el-icon :size="40"><Money /></el-icon>
            <h3>七天退换</h3>
            <p>不满意就退，购物无忧</p>
          </div>
          <div class="feature-item">
            <el-icon :size="40"><Service /></el-icon>
            <h3>专属客服</h3>
            <p>7x24小时在线服务</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import ProductCard from '@/components/ProductCard.vue'

const router = useRouter()
const productStore = useProductStore()

const scrollToSection = (id) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<style lang="scss" scoped>
.home-page {
  padding-bottom: 0;
}

.banner-section {
  background: linear-gradient(135deg, #f5f0e1 0%, #e8dcc4 100%);
  padding: 60px 0;
  
  .container {
    display: flex;
    align-items: center;
    gap: 60px;
  }
}

.banner-content {
  flex: 1;
  
  .banner-title {
    font-size: 42px;
    font-weight: 700;
    color: #2c1810;
    margin-bottom: 16px;
    line-height: 1.2;
  }
  
  .banner-subtitle {
    font-size: 18px;
    color: #666;
    margin-bottom: 32px;
  }
  
  .banner-actions {
    display: flex;
    gap: 16px;
    
    .el-button--primary {
      background: linear-gradient(135deg, #d4af37, #b8960c);
      border: none;
      
      &:hover {
        background: linear-gradient(135deg, #e5c158, #c9a71d);
      }
    }
  }
}

.banner-image {
  flex: 1;
  
  img {
    width: 100%;
    border-radius: 12px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
}

.categories-section {
  padding: 60px 0;
  background: #fff;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
}

.category-card {
  text-align: center;
  padding: 30px 20px;
  cursor: pointer;
  
  .category-icon {
    font-size: 48px;
    margin-bottom: 12px;
    display: block;
  }
  
  .category-name {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
  }
  
  .category-desc {
    font-size: 12px;
    color: #999;
    line-height: 1.5;
  }
}

.hot-section, .new-section {
  padding: 60px 0;
}

.new-section {
  background: #fff;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.section-footer {
  text-align: center;
  margin-top: 40px;
  
  .el-button {
    padding: 12px 40px;
    border-color: #d4af37;
    color: #8b6914;
    
    &:hover {
      background: #d4af37;
      color: #fff;
    }
  }
}

.features-section {
  background: linear-gradient(135deg, #2c1810 0%, #4a2c1a 100%);
  padding: 60px 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px;
}

.feature-item {
  text-align: center;
  color: #e8dcc4;
  
  .el-icon {
    color: #d4af37;
    margin-bottom: 16px;
  }
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #d4af37;
  }
  
  p {
    font-size: 14px;
    color: #b8a98c;
  }
}

@media (max-width: 1024px) {
  .categories-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .banner-section .container {
    flex-direction: column;
    text-align: center;
  }
  
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
