<template>
  <div class="home-page">
    <div class="container">
      <section class="banner-section">
        <el-carousel height="300px" :interval="4000" arrow="always">
          <el-carousel-item v-for="item in banners" :key="item.id">
            <div class="banner-item" :style="{ background: item.bg }">
              <div class="banner-content">
                <h2>{{ item.title }}</h2>
                <p>{{ item.desc }}</p>
                <el-button type="primary" size="large" @click="goProducts">立即选购</el-button>
              </div>
              <div class="banner-image">
                <el-icon :size="120" :color="item.iconColor"><Brush /></el-icon>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </section>
      
      <section class="section category-section">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon color="#409eff"><Grid /></el-icon>
            耗材分类
          </h2>
        </div>
        <div class="category-grid">
          <div 
            v-for="category in productStore.categoryList" 
            :key="category.id"
            class="category-item"
            @click="goCategory(category.id)"
          >
            <div class="category-icon" :style="{ background: category.color + '20', color: category.color }">
              <el-icon :size="32">
                <component :is="category.icon" />
              </el-icon>
            </div>
            <div class="category-info">
              <h3>{{ category.name }}</h3>
              <p>{{ category.count }}件商品</p>
            </div>
          </div>
        </div>
      </section>
      
      <section class="section bundle-section">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon color="#e6a23c"><Present /></el-icon>
            套装推荐
          </h2>
          <router-link to="/products" class="see-more">查看全部 <el-icon><ArrowRight /></el-icon></router-link>
        </div>
        <div class="bundle-grid">
          <div 
            v-for="bundle in productStore.bundleList" 
            :key="bundle.id"
            class="bundle-card card-shadow"
          >
            <div class="bundle-image">
              <img :src="bundle.image" :alt="bundle.name" />
              <el-tag type="warning" effect="dark" class="bundle-tag">超值套装</el-tag>
            </div>
            <div class="bundle-content">
              <h3 class="bundle-title">{{ bundle.name }}</h3>
              <p class="bundle-desc">{{ bundle.description }}</p>
              <div class="bundle-rating">
                <el-rate :model-value="bundle.rating" disabled size="small" />
                <span>已售{{ bundle.sales }}件</span>
              </div>
              <div class="bundle-footer">
                <div class="bundle-price">
                  <span class="current">¥{{ bundle.price }}</span>
                  <span class="original">¥{{ bundle.originalPrice }}</span>
                </div>
                <el-button type="primary" size="small">立即购买</el-button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section class="section hot-section">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon color="#f56c6c"><HotWater /></el-icon>
            热销商品
          </h2>
        </div>
        <div v-if="productStore.loading" class="loading-wrapper">
          <LoadingState text="加载中..." />
        </div>
        <div v-else class="product-grid">
          <ProductCard 
            v-for="product in productStore.hotProducts" 
            :key="product.id"
            :product="product"
          />
        </div>
      </section>
      
      <section class="section color-section">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon color="#67c23a"><Guide /></el-icon>
            配色方案
          </h2>
          <router-link to="/color-schemes" class="see-more">查看全部 <el-icon><ArrowRight /></el-icon></router-link>
        </div>
        <div class="color-scheme-grid">
          <div 
            v-for="scheme in productStore.colorSchemeList" 
            :key="scheme.id"
            class="scheme-card card-shadow"
            @click="goColorSchemes"
          >
            <div class="scheme-image">
              <img :src="scheme.image" :alt="scheme.name" />
            </div>
            <div class="scheme-content">
              <el-tag size="small" type="info">{{ scheme.series }}</el-tag>
              <h3 class="scheme-title">{{ scheme.name }}</h3>
              <div class="color-preview">
                <div 
                  v-for="color in scheme.colors" 
                  :key="color.code"
                  class="color-dot"
                  :style="{ background: color.hex }"
                  :title="`${color.name}: ${color.code}`"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section class="section new-section">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon color="#409eff"><MagicStick /></el-icon>
            新品上架
          </h2>
        </div>
        <div v-if="productStore.loading" class="loading-wrapper">
          <LoadingState text="加载中..." />
        </div>
        <div v-else class="product-grid">
          <ProductCard 
            v-for="product in productStore.newProducts" 
            :key="product.id"
            :product="product"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import ProductCard from '@/components/ProductCard.vue'
import LoadingState from '@/components/LoadingState.vue'

const router = useRouter()
const productStore = useProductStore()

const banners = [
  {
    id: 1,
    title: '专业模型喷涂耗材',
    desc: '汇聚全球知名品牌，为模型爱好者提供优质产品',
    bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    iconColor: 'rgba(255,255,255,0.3)'
  },
  {
    id: 2,
    title: '新品上市 限时特惠',
    desc: '2024年最新款喷涂工具，下单立享8折优惠',
    bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    iconColor: 'rgba(255,255,255,0.3)'
  },
  {
    id: 3,
    title: '专业配色方案',
    desc: '热门模型专属配色参考，让您的作品更出彩',
    bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    iconColor: 'rgba(255,255,255,0.3)'
  }
]

function goProducts() {
  router.push('/products')
}

function goCategory(categoryId) {
  router.push({ name: 'Products', query: { category: categoryId } })
}

function goColorSchemes() {
  router.push('/color-schemes')
}

onMounted(async () => {
  await productStore.simulateLoading(500)
})
</script>

<style scoped lang="scss">
.home-page {
  padding: 20px 0;
}

.banner-section {
  margin-bottom: 30px;
  
  .el-carousel__item {
    border-radius: 12px;
    overflow: hidden;
  }
  
  .banner-item {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 60px;
    color: #fff;
  }
  
  .banner-content {
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
  
  .banner-image {
    opacity: 0.5;
  }
}

.section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  .section-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 22px;
    font-weight: 600;
    color: #303133;
  }
  
  .see-more {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #909399;
    font-size: 14px;
    
    &:hover {
      color: #409eff;
    }
  }
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 16px;
}

.category-item {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
  
  .category-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px;
  }
  
  .category-info {
    h3 {
      font-size: 15px;
      color: #303133;
      margin-bottom: 4px;
    }
    
    p {
      font-size: 12px;
      color: #909399;
    }
  }
}

.bundle-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.bundle-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
  
  .bundle-image {
    position: relative;
    height: 180px;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .bundle-tag {
      position: absolute;
      top: 12px;
      right: 12px;
    }
  }
  
  .bundle-content {
    padding: 16px;
    
    .bundle-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 8px;
    }
    
    .bundle-desc {
      font-size: 13px;
      color: #909399;
      margin-bottom: 12px;
      line-height: 1.5;
    }
    
    .bundle-rating {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      font-size: 12px;
      color: #909399;
    }
    
    .bundle-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .bundle-price {
        .current {
          font-size: 20px;
          font-weight: bold;
          color: #f56c6c;
        }
        
        .original {
          font-size: 13px;
          color: #c0c4cc;
          text-decoration: line-through;
          margin-left: 8px;
        }
      }
    }
  }
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.color-scheme-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.scheme-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
  
  .scheme-image {
    height: 160px;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .scheme-content {
    padding: 16px;
    
    .scheme-title {
      font-size: 15px;
      font-weight: 600;
      color: #303133;
      margin: 10px 0 12px;
    }
    
    .color-preview {
      display: flex;
      gap: 8px;
      
      .color-dot {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid #fff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
        cursor: pointer;
        transition: transform 0.2s;
        
        &:hover {
          transform: scale(1.2);
        }
      }
    }
  }
}

.loading-wrapper {
  padding: 40px 0;
}

@media (max-width: 1200px) {
  .category-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .bundle-grid, .color-scheme-grid {
    grid-template-columns: 1fr;
  }
  
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
