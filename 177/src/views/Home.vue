<template>
  <div class="home-page">
    <section class="banner-section">
      <div class="container">
        <div class="banner-content">
          <h1 class="banner-title">发现手作之美</h1>
          <p class="banner-subtitle">精选DIY材料套装，开启你的创意之旅</p>
          <el-button type="primary" size="large" @click="scrollToProducts">
            立即探索
          </el-button>
        </div>
      </div>
    </section>

    <section class="categories-section">
      <div class="container">
        <h2 class="section-title">🎨 DIY品类</h2>
        <div class="categories-grid">
          <div 
            v-for="category in productStore.categoryList" 
            :key="category.id"
            class="category-card card-hover"
            :style="{ background: `linear-gradient(135deg, ${category.color} 0%, ${category.color}dd 100%)` }"
            @click="selectCategory(category.id)"
          >
            <span class="category-icon">{{ category.icon }}</span>
            <span class="category-name">{{ category.name }}</span>
            <span class="category-count">{{ category.count }}件商品</span>
          </div>
        </div>
      </div>
    </section>

    <section class="products-section" id="products">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">🔥 热门推荐</h2>
          <el-button 
            type="primary" 
            link 
            @click="productStore.setCategory(null)"
            v-if="productStore.currentCategory"
          >
            查看全部
          </el-button>
        </div>
        <LoadingState v-if="productStore.loading" text="加载中..." />
        <template v-else>
          <EmptyState 
            v-if="displayProducts.length === 0" 
            icon="📦" 
            text="该分类暂无商品"
          />
          <div v-else class="products-grid">
            <ProductCard 
              v-for="product in displayProducts" 
              :key="product.id" 
              :product="product" 
            />
          </div>
        </template>
      </div>
    </section>

    <section class="tutorials-section">
      <div class="container">
        <h2 class="section-title">📚 新手教程</h2>
        <div class="tutorials-grid">
          <div 
            v-for="tutorial in productStore.tutorialList" 
            :key="tutorial.id"
            class="tutorial-card card-hover"
          >
            <div class="tutorial-cover">
              <img :src="tutorial.cover" :alt="tutorial.title" />
              <div class="tutorial-duration">
                <el-icon><VideoPlay /></el-icon>
                {{ tutorial.duration }}
              </div>
            </div>
            <div class="tutorial-info">
              <h3 class="tutorial-title">{{ tutorial.title }}</h3>
              <div class="tutorial-meta">
                <el-tag size="small">{{ tutorial.category }}</el-tag>
                <span class="level">{{ tutorial.level }}</span>
                <span class="views">
                  <el-icon><View /></el-icon>
                  {{ tutorial.views }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2>成为手作博主</h2>
          <p>分享你的作品，获得粉丝关注，专属权益等你来</p>
          <el-button type="warning" size="large">
            立即申请
          </el-button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useProductStore } from '@/stores/product'
import ProductCard from '@/components/ProductCard.vue'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'
import { VideoPlay, View } from '@element-plus/icons-vue'

const productStore = useProductStore()

const displayProducts = computed(() => {
  if (productStore.currentCategory) {
    return productStore.filteredProducts
  }
  return productStore.hotProducts
})

const selectCategory = async (categoryId) => {
  productStore.setCategory(categoryId)
  await productStore.simulateLoading()
  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
}

const scrollToProducts = () => {
  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
  productStore.simulateLoading()
})
</script>

<style lang="scss" scoped>
.home-page {
  padding-bottom: 0;
}

.banner-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 80px 0;
  color: #fff;
  
  .banner-content {
    text-align: center;
    
    .banner-title {
      font-size: 48px;
      margin-bottom: 16px;
      font-weight: 700;
    }
    
    .banner-subtitle {
      font-size: 20px;
      margin-bottom: 32px;
      opacity: 0.9;
    }
  }
}

.categories-section {
  padding: 60px 0;
  background: #fff;
  
  .categories-grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 16px;
    
    @media (max-width: 1200px) {
      grid-template-columns: repeat(4, 1fr);
    }
    
    @media (max-width: 600px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  .category-card {
    padding: 24px 16px;
    border-radius: 12px;
    color: #fff;
    text-align: center;
    cursor: pointer;
    
    .category-icon {
      font-size: 36px;
      display: block;
      margin-bottom: 8px;
    }
    
    .category-name {
      font-size: 15px;
      font-weight: 600;
      display: block;
      margin-bottom: 4px;
    }
    
    .category-count {
      font-size: 12px;
      opacity: 0.85;
    }
  }
}

.products-section {
  padding: 60px 0;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .products-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    
    @media (max-width: 900px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}

.tutorials-section {
  padding: 60px 0;
  background: #fff;
  
  .tutorials-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    
    @media (max-width: 900px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  .tutorial-card {
    background: #fafafa;
    border-radius: 12px;
    overflow: hidden;
    
    .tutorial-cover {
      position: relative;
      width: 100%;
      padding-top: 62.5%;
      
      img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .tutorial-duration {
        position: absolute;
        bottom: 8px;
        right: 8px;
        background: rgba(0, 0, 0, 0.7);
        color: #fff;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
    
    .tutorial-info {
      padding: 16px;
      
      .tutorial-title {
        font-size: 15px;
        color: #333;
        margin-bottom: 10px;
        line-height: 1.4;
        min-height: 42px;
      }
      
      .tutorial-meta {
        display: flex;
        align-items: center;
        gap: 10px;
        
        .level {
          font-size: 12px;
          color: #667eea;
        }
        
        .views {
          font-size: 12px;
          color: #999;
          display: flex;
          align-items: center;
          gap: 4px;
          margin-left: auto;
        }
      }
    }
  }
}

.cta-section {
  padding: 60px 0;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  
  .cta-content {
    text-align: center;
    color: #fff;
    
    h2 {
      font-size: 32px;
      margin-bottom: 12px;
    }
    
    p {
      font-size: 16px;
      margin-bottom: 24px;
      opacity: 0.9;
    }
  }
}
</style>
