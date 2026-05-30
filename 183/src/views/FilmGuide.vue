<template>
  <div class="film-guide-page container">
    <h1 class="page-title">胶片适配指南</h1>
    
    <div class="guide-intro card">
      <p>
        选择合适的胶卷是拍出好照片的关键。不同的胶卷有不同的色彩表现、颗粒感和适用场景。
        本指南将帮助您了解各种胶卷的特点，以及如何为您的相机选择最合适的胶卷。
      </p>
    </div>
    
    <div class="section-title">热门胶卷推荐</div>
    <div class="film-grid">
      <div v-for="film in cameraStore.filmTypes" :key="film.id" class="film-card">
        <div class="film-header">
          <h3 class="film-name">{{ film.name }}</h3>
          <span class="film-price">¥{{ film.price }}/卷</span>
        </div>
        <div class="film-tags">
          <el-tag size="small">{{ film.brand }}</el-tag>
          <el-tag size="small" type="success">{{ film.type }}</el-tag>
          <el-tag size="small" type="warning">ISO {{ film.iso }}</el-tag>
          <el-tag size="small" type="info">{{ film.format }}</el-tag>
        </div>
        <p class="film-desc">{{ film.description }}</p>
        <div class="film-detail">
          <div class="detail-item">
            <span class="label">适用相机</span>
            <span class="value">{{ film.suitableCameras.join('、') }}</span>
          </div>
          <div class="detail-item">
            <span class="label">使用建议</span>
            <span class="value">{{ film.tips }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="section-title">胶卷类型详解</div>
    <el-row :gutter="24" class="type-cards">
      <el-col :span="8">
        <div class="type-card color-negative">
          <div class="type-icon">
            <el-icon :size="48"><Picture /></el-icon>
          </div>
          <h3>彩色负片</h3>
          <p>最常见的胶卷类型，色彩自然，宽容度高，适合日常拍摄。冲洗方便，成本较低。</p>
          <div class="type-tips">
            <strong>适合：</strong>日常记录、旅行、家庭合影
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="type-card black-white">
          <div class="type-icon">
            <el-icon :size="48"><Brush /></el-icon>
          </div>
          <h3>黑白负片</h3>
          <p>经典的黑白摄影，强调光影和构图，富有艺术感。可以自己在家冲洗，可玩性高。</p>
          <div class="type-tips">
            <strong>适合：</strong>纪实、街拍、人像、艺术创作
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="type-card slide">
          <div class="type-icon">
            <el-icon :size="48"><Sunny /></el-icon>
          </div>
          <h3>彩色反转片</h3>
          <p>也叫幻灯片，色彩饱和度高，对比度强，直接得到正像。需要精确曝光。</p>
          <div class="type-tips">
            <strong>适合：</strong>风光、商业摄影、收藏
          </div>
        </div>
      </el-col>
    </el-row>
    
    <div class="section-title">ISO选择指南</div>
    <div class="iso-guide card">
      <el-row :gutter="24">
        <el-col :span="8">
          <div class="iso-item">
            <h4>低 ISO (25-100)</h4>
            <p class="iso-desc">颗粒极细，画质锐利，色彩还原好。但需要充足的光线。</p>
            <p class="iso-scene"><strong>适用场景：</strong>晴天户外、风光摄影、静物拍摄</p>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="iso-item">
            <h4>中 ISO (200-400)</h4>
            <p class="iso-desc">画质和感光度的平衡点，适应性强，是最常用的选择。</p>
            <p class="iso-scene"><strong>适用场景：</strong>日常拍摄、阴天户外、室内明亮环境</p>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="iso-item">
            <h4>高 ISO (800-3200)</h4>
            <p class="iso-desc">感光度高，适合弱光环境。颗粒感明显，别有风味。</p>
            <p class="iso-scene"><strong>适用场景：</strong>夜景、室内暗光、运动抓拍</p>
          </div>
        </el-col>
      </el-row>
    </div>
    
    <div class="section-title">拍摄场景推荐</div>
    <el-table :data="sceneRecommendations" border class="scene-table">
      <el-table-column prop="scene" label="拍摄场景" width="150" />
      <el-table-column prop="light" label="光线条件" width="150" />
      <el-table-column prop="filmType" label="推荐胶卷类型" />
      <el-table-column prop="iso" label="推荐ISO" width="120" />
      <el-table-column prop="recommendation" label="具体推荐" />
    </el-table>
  </div>
</template>

<script setup>
import { useCameraStore } from '@/stores/camera'
import { Picture, Brush, Sunny } from '@element-plus/icons-vue'

const cameraStore = useCameraStore()

const sceneRecommendations = [
  {
    scene: '晴天户外',
    light: '强光',
    filmType: '彩色负片 / 彩色反转片',
    iso: 'ISO 50-200',
    recommendation: 'Kodak Ektar 100, Fujifilm Velvia 50'
  },
  {
    scene: '阴天/多云',
    light: '柔光',
    filmType: '彩色负片 / 黑白负片',
    iso: 'ISO 200-400',
    recommendation: 'Kodak Gold 200, Ilford HP5 Plus'
  },
  {
    scene: '人像摄影',
    light: '各种光线',
    filmType: '彩色负片 / 黑白负片',
    iso: 'ISO 100-400',
    recommendation: 'Kodak Portra 400, Ilford Pan F Plus'
  },
  {
    scene: '风光摄影',
    light: '自然光',
    filmType: '彩色反转片 / 彩色负片',
    iso: 'ISO 50-100',
    recommendation: 'Fujifilm Velvia 50, Kodak Ektar 100'
  },
  {
    scene: '街拍/纪实',
    light: '各种光线',
    filmType: '黑白负片 / 彩色负片',
    iso: 'ISO 400-800',
    recommendation: 'Kodak Tri-X 400, Ilford HP5 Plus'
  },
  {
    scene: '夜景/弱光',
    light: '弱光',
    filmType: '黑白负片 / 高感彩色负片',
    iso: 'ISO 800-3200',
    recommendation: 'Ilford HP5 Plus (迫冲), Kodak T-Max 3200'
  }
]
</script>

<style lang="scss" scoped>
.film-guide-page {
  padding-top: 20px;
}

.guide-intro {
  margin-bottom: 30px;
  font-size: 15px;
  line-height: 1.8;
  color: #555;
}

.film-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.film-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(93, 78, 55, 0.08);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(93, 78, 55, 0.15);
  }
}

.film-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.film-name {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.film-price {
  font-size: 18px;
  font-weight: bold;
  color: #c45c00;
}

.film-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.film-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
}

.film-detail {
  border-top: 1px solid #f0ebe0;
  padding-top: 16px;
}

.detail-item {
  display: flex;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .label {
    width: 80px;
    font-size: 13px;
    color: #888;
    flex-shrink: 0;
  }
  
  .value {
    flex: 1;
    font-size: 13px;
    color: #555;
  }
}

.type-cards {
  margin-bottom: 40px;
}

.type-card {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(93, 78, 55, 0.08);
  
  h3 {
    font-size: 20px;
    margin: 16px 0 12px;
    color: #333;
  }
  
  p {
    font-size: 14px;
    color: #666;
    line-height: 1.6;
    margin-bottom: 16px;
  }
}

.color-negative .type-icon {
  color: #409eff;
}

.black-white .type-icon {
  color: #606266;
}

.slide .type-icon {
  color: #e6a23c;
}

.type-tips {
  font-size: 13px;
  color: #8b6914;
  background: rgba(139, 105, 20, 0.08);
  padding: 10px;
  border-radius: 6px;
}

.iso-guide {
  margin-bottom: 40px;
}

.iso-item {
  text-align: center;
  padding: 20px;
  
  h4 {
    font-size: 18px;
    color: #333;
    margin-bottom: 12px;
  }
  
  .iso-desc {
    font-size: 14px;
    color: #666;
    line-height: 1.6;
    margin-bottom: 12px;
  }
  
  .iso-scene {
    font-size: 13px;
    color: #8b6914;
  }
}

.scene-table {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

@media (max-width: 768px) {
  .film-grid {
    grid-template-columns: 1fr;
  }
}
</style>
