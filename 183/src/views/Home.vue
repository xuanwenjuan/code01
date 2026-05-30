<template>
  <div class="home-page">
    <section class="hero-section">
      <div class="container hero-content">
        <div class="hero-text">
          <h1 class="hero-title">探索经典胶片相机</h1>
          <p class="hero-subtitle">重温光影艺术，记录生活中的美好瞬间</p>
          <div class="hero-buttons">
            <el-button type="primary" size="large" @click="$router.push('/cameras')">
              立即选购
            </el-button>
            <el-button size="large" @click="$router.push('/film-guide')">
              胶片指南
            </el-button>
          </div>
        </div>
        <div class="hero-image">
          <img src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600" alt="复古相机" />
        </div>
      </div>
    </section>

    <section class="section categories-section">
      <div class="container">
        <h2 class="section-title">相机分类</h2>
        <div class="categories-grid">
          <div 
            v-for="category in cameraStore.categories" 
            :key="category.id"
            class="category-card"
            @click="goToCategory(category.id)"
          >
            <div class="category-icon">
              <el-icon :size="40" color="#8b6914">
                <component :is="category.icon" />
              </el-icon>
            </div>
            <h3 class="category-name">{{ category.name }}</h3>
            <p class="category-desc">{{ category.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section hot-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">热门机型</h2>
          <el-button type="primary" link @click="$router.push('/cameras')">
            查看全部 <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
        <div class="cameras-grid">
          <CameraCard 
            v-for="camera in cameraStore.hotCameras" 
            :key="camera.id"
            :camera="camera"
          />
        </div>
      </div>
    </section>

    <section class="section guide-section">
      <div class="container">
        <div class="guide-content">
          <div class="guide-text">
            <h2 class="section-title">胶片适配指南</h2>
            <p class="guide-desc">
              不同的相机需要搭配不同的胶卷才能发挥最佳效果。
              我们为您整理了详细的胶片选购指南，帮助您找到最适合的胶卷。
            </p>
            <ul class="guide-features">
              <li><el-icon><Check /></el-icon> 8种热门胶卷详细评测</li>
              <li><el-icon><Check /></el-icon> 各型号相机适配推荐</li>
              <li><el-icon><Check /></el-icon> 拍摄场景与胶卷选择</li>
            </ul>
            <el-button type="primary" size="large" @click="$router.push('/film-guide')">
              查看指南
            </el-button>
          </div>
          <div class="guide-image">
            <img src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500" alt="胶片指南" />
          </div>
        </div>
      </div>
    </section>

    <section class="section new-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">新品上架</h2>
          <el-button type="primary" link @click="$router.push('/cameras')">
            查看全部 <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
        <div class="cameras-grid">
          <CameraCard 
            v-for="camera in cameraStore.newCameras" 
            :key="camera.id"
            :camera="camera"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useCameraStore } from '@/stores/camera'
import CameraCard from '@/components/CameraCard.vue'
import { ArrowRight, Check, Camera, VideoCamera, Picture, MagicStick, Grid, Tickets } from '@element-plus/icons-vue'

const cameraStore = useCameraStore()

const goToCategory = (categoryId) => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style lang="scss" scoped>
.home-page {
  padding: 0;
}

.hero-section {
  background: linear-gradient(135deg, #f5e6c8 0%, #e8dcc0 100%);
  padding: 60px 0;
  margin-bottom: 40px;
}

.hero-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
}

.hero-text {
  flex: 1;
}

.hero-title {
  font-size: 48px;
  font-weight: bold;
  color: #5d4e37;
  margin-bottom: 20px;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 20px;
  color: #7d6e57;
  margin-bottom: 30px;
}

.hero-buttons {
  display: flex;
  gap: 15px;
  
  :deep(.el-button--primary) {
    background: #8b6914;
    border-color: #8b6914;
    
    &:hover {
      background: #a67c00;
      border-color: #a67c00;
    }
  }
}

.hero-image {
  flex: 1;
  
  img {
    width: 100%;
    border-radius: 16px;
    box-shadow: 0 20px 40px rgba(93, 78, 55, 0.2);
  }
}

.section {
  padding: 20px 0;
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
}

.category-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(93, 78, 55, 0.08);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(93, 78, 55, 0.15);
  }
}

.category-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 16px;
  background: rgba(139, 105, 20, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.category-desc {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.cameras-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.guide-section {
  background: #fff;
  padding: 40px 0;
  border-radius: 16px;
  margin: 40px 20px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0 4px 20px rgba(93, 78, 55, 0.1);
}

.guide-content {
  display: flex;
  align-items: center;
  gap: 60px;
}

.guide-text {
  flex: 1;
  
  .section-title {
    margin-top: 0;
  }
}

.guide-desc {
  font-size: 16px;
  color: #666;
  line-height: 1.8;
  margin-bottom: 24px;
}

.guide-features {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 30px;
  
  li {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
    color: #555;
    
    .el-icon {
      color: #67c23a;
      font-size: 18px;
    }
  }
}

.guide-image {
  flex: 1;
  
  img {
    width: 100%;
    border-radius: 12px;
  }
}

@media (max-width: 1024px) {
  .categories-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .cameras-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .hero-title {
    font-size: 36px;
  }
}

@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
  }
  
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .cameras-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .guide-content {
    flex-direction: column;
  }
}
</style>
