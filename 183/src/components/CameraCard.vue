<template>
  <div class="camera-card" @click="goToDetail">
    <div class="card-image">
      <img :src="camera.images[0]" :alt="camera.name" loading="lazy" />
      <div v-if="camera.isHot" class="hot-badge">
        <el-icon><Fire /></el-icon>
        <span>热门</span>
      </div>
      <div class="condition-badge" :class="camera.condition">
        {{ conditionLabel }}
      </div>
    </div>
    <div class="card-content">
      <div class="brand-row">
        <span class="brand">{{ camera.brand }}</span>
        <span class="stock" v-if="camera.stock <= 3">仅剩{{ camera.stock }}台</span>
      </div>
      <h3 class="camera-name">{{ camera.name }}</h3>
      <p class="camera-desc">{{ camera.description.slice(0, 50) }}...</p>
      <div class="price-row">
        <div class="price">
          <span class="currency">¥</span>
          <span class="amount">{{ camera.price.toLocaleString() }}</span>
        </div>
        <div class="original-price" v-if="camera.originalPrice > camera.price">
          ¥{{ camera.originalPrice.toLocaleString() }}
        </div>
      </div>
      <div class="card-footer">
        <span class="sales">已售{{ camera.sales }}件</span>
        <button 
          class="favorite-btn" 
          :class="{ active: isFavorite }"
          @click.stop="handleFavorite"
        >
          <el-icon><Star :fill="isFavorite ? '#8b6914' : 'none'" /></el-icon>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { conditionOptions } from '@/mock/data'
import { Fire, Star } from '@element-plus/icons-vue'

const props = defineProps({
  camera: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const userStore = useUserStore()

const conditionLabel = computed(() => {
  const option = conditionOptions.find(o => o.value === props.camera.condition)
  return option?.label || props.camera.condition
})

const isFavorite = computed(() => userStore.isFavorite(props.camera.id))

const goToDetail = () => {
  router.push(`/camera/${props.camera.id}`)
}

const handleFavorite = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  userStore.toggleFavorite(props.camera.id)
  ElMessage.success(isFavorite.value ? '已取消收藏' : '已加入收藏')
}
</script>

<style lang="scss" scoped>
.camera-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(93, 78, 55, 0.08);
  
  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 24px rgba(93, 78, 55, 0.15);
  }
}

.card-image {
  position: relative;
  width: 100%;
  padding-top: 75%;
  overflow: hidden;
  background: #f0ebe0;
  
  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
}

.hot-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  color: #fff;
  font-size: 12px;
  border-radius: 20px;
  
  .el-icon {
    font-size: 14px;
  }
}

.condition-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 10px;
  font-size: 12px;
  border-radius: 4px;
  
  &.mint {
    background: rgba(103, 194, 58, 0.15);
    color: #67c23a;
  }
  
  &.excellent {
    background: rgba(64, 158, 255, 0.15);
    color: #409eff;
  }
  
  &.good {
    background: rgba(230, 162, 60, 0.15);
    color: #e6a23c;
  }
  
  &.fair {
    background: rgba(245, 108, 108, 0.15);
    color: #f56c6c;
  }
}

.card-content {
  padding: 16px;
}

.brand-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.brand {
  font-size: 12px;
  color: #8b6914;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stock {
  font-size: 12px;
  color: #f56c6c;
}

.camera-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.camera-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  height: 40px;
  overflow: hidden;
  margin-bottom: 12px;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 12px;
}

.price {
  display: flex;
  align-items: baseline;
  
  .currency {
    font-size: 14px;
    color: #c45c00;
    font-weight: 600;
  }
  
  .amount {
    font-size: 24px;
    font-weight: bold;
    color: #c45c00;
  }
}

.original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0ebe0;
}

.sales {
  font-size: 12px;
  color: #999;
}

.favorite-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
  
  .el-icon {
    font-size: 20px;
    color: #ccc;
    transition: all 0.2s;
  }
  
  &:hover {
    background: rgba(139, 105, 20, 0.1);
    
    .el-icon {
      color: #8b6914;
    }
  }
  
  &.active .el-icon {
    color: #8b6914;
  }
}
</style>
