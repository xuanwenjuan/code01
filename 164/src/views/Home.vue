<template>
  <div class="home-page">
    <section class="banner-section">
      <el-carousel height="400px" :interval="4000" arrow="always">
        <el-carousel-item v-for="banner in banners" :key="banner.id">
          <div class="banner-item" @click="goToLink(banner.link)">
            <img :src="banner.image" :alt="banner.title" />
            <div class="banner-content">
              <h2>{{ banner.title }}</h2>
              <p>{{ banner.subtitle }}</p>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </section>

    <section class="category-section">
      <div class="container">
        <div class="category-grid">
          <div 
            v-for="category in categories" 
            :key="category.id" 
            class="category-item"
            @click="goToCategory(category.id)"
          >
            <div class="category-icon" :style="{ background: category.color + '20' }">
              {{ category.icon }}
            </div>
            <span>{{ category.name }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2 class="section-title">节日花束推荐</h2>
        <div class="flower-grid">
          <FlowerCard v-for="flower in hotFlowers" :key="flower.id" :flower="flower" />
        </div>
      </div>
    </section>

    <section class="section delivery-section">
      <div class="container">
        <div class="delivery-content">
          <div class="delivery-text">
            <h2>🚀 同城配送</h2>
            <p>全城2小时急速送达，新鲜花材，专业配送</p>
            <div class="delivery-features">
              <div class="feature-item">
                <el-icon :size="24" color="#ff6b9d"><Van /></el-icon>
                <span>2小时达</span>
              </div>
              <div class="feature-item">
                <el-icon :size="24" color="#ff6b9d"><Present /></el-icon>
                <span>精美包装</span>
              </div>
              <div class="feature-item">
                <el-icon :size="24" color="#ff6b9d"><Medal /></el-icon>
                <span>品质保证</span>
              </div>
            </div>
          </div>
          <div class="delivery-image">
            <img src="https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=400&h=300&fit=crop" alt="同城配送" />
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2 class="section-title">新品上市</h2>
        <div class="flower-grid">
          <FlowerCard v-for="flower in newFlowers" :key="flower.id" :flower="flower" />
        </div>
      </div>
    </section>

    <section class="section gift-section">
      <div class="container">
        <h2 class="section-title">礼品礼盒推荐</h2>
        <div class="gift-grid">
          <div class="gift-card" @click="goToPurpose(1)">
            <div class="gift-icon">💕</div>
            <h3>爱情告白</h3>
            <p>让鲜花替你说出心里话</p>
          </div>
          <div class="gift-card" @click="goToPurpose(2)">
            <div class="gift-icon">🎂</div>
            <h3>生日祝福</h3>
            <p>给特别的人一份特别的惊喜</p>
          </div>
          <div class="gift-card" @click="goToPurpose(3)">
            <div class="gift-icon">💝</div>
            <h3>感谢恩师</h3>
            <p>用鲜花表达最真挚的谢意</p>
          </div>
          <div class="gift-card" @click="goToPurpose(6)">
            <div class="gift-icon">💒</div>
            <h3>婚礼用花</h3>
            <p>见证人生最美时刻</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2 class="section-title">更多精选</h2>
        <div class="flower-grid">
          <FlowerCard v-for="flower in recommendFlowers" :key="flower.id" :flower="flower" />
        </div>
      </div>
    </section>

    <section class="section welfare-section">
      <div class="container">
        <h2 class="section-title">活动福利</h2>
        <div class="welfare-grid">
          <div class="welfare-card">
            <div class="welfare-icon">🎁</div>
            <h3>新用户专享</h3>
            <p>首单立减50元</p>
            <div class="welfare-btn">立即领取</div>
          </div>
          <div class="welfare-card">
            <div class="welfare-icon">💰</div>
            <h3>满减优惠</h3>
            <p>满299减30，满599减80</p>
            <div class="welfare-btn">去凑单</div>
          </div>
          <div class="welfare-card">
            <div class="welfare-icon">🏆</div>
            <h3>会员特权</h3>
            <p>专属折扣，积分兑换</p>
            <div class="welfare-btn">立即开通</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Van, Present, Medal } from '@element-plus/icons-vue'
import FlowerCard from '@/components/FlowerCard.vue'
import { getBanners, getCategories, getHotList, getNewList, getRecommendList } from '@/api/flower'

const router = useRouter()
const banners = ref([])
const categories = ref([])
const hotFlowers = ref([])
const newFlowers = ref([])
const recommendFlowers = ref([])

const loadData = async () => {
  try {
    const [bannerRes, categoryRes, hotRes, newRes, recommendRes] = await Promise.all([
      getBanners(),
      getCategories(),
      getHotList(),
      getNewList(),
      getRecommendList()
    ])
    banners.value = bannerRes.data
    categories.value = categoryRes.data
    hotFlowers.value = hotRes.data
    newFlowers.value = newRes.data
    recommendFlowers.value = recommendRes.data
  } catch (error) {
    console.error('加载数据失败', error)
  }
}

const goToLink = (link) => {
  router.push(link)
}

const goToCategory = (categoryId) => {
  router.push(`/list?category=${categoryId}`)
}

const goToPurpose = (purposeId) => {
  router.push(`/list?purpose=${purposeId}`)
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.home-page {
  .banner-section {
    .el-carousel {
      :deep(.el-carousel__arrow) {
        background: rgba(0, 0, 0, 0.3);
        
        &:hover {
          background: rgba(0, 0, 0, 0.5);
        }
      }
    }
    
    .banner-item {
      position: relative;
      width: 100%;
      height: 100%;
      cursor: pointer;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .banner-content {
        position: absolute;
        left: 10%;
        top: 50%;
        transform: translateY(-50%);
        color: #fff;
        
        h2 {
          font-size: 42px;
          margin-bottom: 12px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        p {
          font-size: 20px;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        }
      }
    }
  }
  
  .category-section {
    padding: 30px 0;
    background: #fff;
    
    .category-grid {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 20px;
      
      .category-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        padding: 16px;
        border-radius: $radius;
        cursor: pointer;
        transition: all 0.3s;
        
        &:hover {
          background: $bg-color;
          transform: translateY(-2px);
        }
        
        .category-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
        }
        
        span {
          font-size: 14px;
          color: $text-secondary;
        }
      }
    }
  }
  
  .section {
    padding: 40px 0;
    
    .flower-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
    }
  }
  
  .delivery-section {
    background: linear-gradient(135deg, #fff5f7 0%, #fff0f3 100%);
    
    .delivery-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      align-items: center;
      
      .delivery-text {
        h2 {
          font-size: 32px;
          margin-bottom: 16px;
          color: $text-primary;
        }
        
        p {
          font-size: 16px;
          color: $text-secondary;
          margin-bottom: 24px;
        }
        
        .delivery-features {
          display: flex;
          gap: 32px;
          
          .feature-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            
            span {
              font-size: 14px;
              color: $text-secondary;
            }
          }
        }
      }
      
      .delivery-image {
        img {
          width: 100%;
          border-radius: $radius;
          box-shadow: $shadow;
        }
      }
    }
  }
  
  .gift-section {
    .gift-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      
      .gift-card {
        background: #fff;
        padding: 30px;
        border-radius: $radius;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        
        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(255, 107, 157, 0.15);
        }
        
        .gift-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        
        h3 {
          font-size: 18px;
          margin-bottom: 8px;
          color: $text-primary;
        }
        
        p {
          font-size: 14px;
          color: $text-secondary;
        }
      }
    }
  }
  
  .welfare-section {
    background: linear-gradient(135deg, #fff0f3 0%, #ffe8ec 100%);
    
    .welfare-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      
      .welfare-card {
        background: #fff;
        padding: 30px;
        border-radius: $radius;
        text-align: center;
        transition: all 0.3s;
        
        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(255, 107, 157, 0.2);
        }
        
        .welfare-icon {
          font-size: 56px;
          margin-bottom: 16px;
        }
        
        h3 {
          font-size: 20px;
          margin-bottom: 8px;
          color: $text-primary;
        }
        
        p {
          font-size: 14px;
          color: $text-secondary;
          margin-bottom: 20px;
        }
        
        .welfare-btn {
          display: inline-block;
          padding: 8px 24px;
          background: linear-gradient(135deg, $primary-color, $primary-dark);
          color: #fff;
          border-radius: 20px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s;
          
          &:hover {
            transform: scale(1.05);
          }
        }
      }
    }
  }
}

@media (max-width: 1024px) {
  .home-page {
    .category-grid {
      grid-template-columns: repeat(4, 1fr) !important;
    }
    
    .flower-grid {
      grid-template-columns: repeat(3, 1fr) !important;
    }
    
    .gift-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
    
    .delivery-content {
      grid-template-columns: 1fr !important;
    }
  }
}

@media (max-width: 768px) {
  .home-page {
    .flower-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
    
    .welfare-grid {
      grid-template-columns: 1fr !important;
    }
    
    .banner-item {
      .banner-content {
        left: 5%;
        
        h2 {
          font-size: 28px !important;
        }
        
        p {
          font-size: 16px !important;
        }
      }
    }
  }
}
</style>
