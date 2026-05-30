<template>
  <div class="flower-card" @click="goDetail">
    <div class="card-image">
      <img :src="flower.image" :alt="flower.name" />
      <div class="card-tags">
        <span v-if="flower.isHot" class="tag tag-hot">热卖</span>
        <span v-if="flower.isNew" class="tag tag-new">新品</span>
      </div>
      <div class="card-actions">
        <el-button 
          type="primary" 
          circle 
          size="small"
          @click.stop="handleAddWishlist"
          class="action-btn"
        >
          <el-icon><Star /></el-icon>
        </el-button>
        <el-button 
          type="primary" 
          circle 
          size="small"
          @click.stop="handleAddCart"
          class="action-btn"
        >
          <el-icon><ShoppingCart /></el-icon>
        </el-button>
      </div>
    </div>
    <div class="card-info">
      <h3 class="card-title">{{ flower.name }}</h3>
      <p class="card-desc">{{ flower.description }}</p>
      <div class="card-footer">
        <div class="price">
          <span class="current-price">{{ formatPrice(flower.price) }}</span>
          <span v-if="flower.originalPrice" class="original-price">{{ formatPrice(flower.originalPrice) }}</span>
        </div>
        <div class="sales">已售 {{ flower.sales }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Star, ShoppingCart } from '@element-plus/icons-vue'
import { formatPrice } from '@/utils'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { addToWishlist } from '@/api/order'

const props = defineProps({
  flower: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()

const goDetail = () => {
  router.push(`/detail/${props.flower.id}`)
}

const handleAddWishlist = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  try {
    await addToWishlist(props.flower)
    ElMessage.success('已加入心愿单')
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  }
}

const handleAddCart = () => {
  const defaultSpec = props.flower.specs[0]
  cartStore.addToCart(props.flower, defaultSpec, 1)
  ElMessage.success('已加入购物车')
}
</script>

<style lang="scss" scoped>
.flower-card {
  background: #fff;
  border-radius: $radius;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(255, 107, 157, 0.15);
    
    .card-actions {
      opacity: 1;
    }
  }
  
  .card-image {
    position: relative;
    width: 100%;
    padding-top: 100%;
    overflow: hidden;
    
    img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s;
    }
    
    &:hover img {
      transform: scale(1.05);
    }
    
    .card-tags {
      position: absolute;
      top: 10px;
      left: 10px;
      display: flex;
      gap: 6px;
      z-index: 2;
      
      .tag {
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        color: #fff;
        
        &.tag-hot {
          background: $primary-color;
        }
        
        &.tag-new {
          background: $secondary-color;
        }
      }
    }
    
    .card-actions {
      position: absolute;
      top: 10px;
      right: 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      opacity: 0;
      transition: opacity 0.3s;
      z-index: 2;
      
      .action-btn {
        --el-button-bg-color: rgba(255, 255, 255, 0.9);
        --el-button-hover-bg-color: #fff;
        --el-button-text-color: $primary-color;
        --el-button-hover-text-color: $primary-dark;
        --el-button-border-color: transparent;
      }
    }
  }
  
  .card-info {
    padding: 16px;
    
    .card-title {
      font-size: 16px;
      font-weight: 500;
      color: $text-primary;
      margin-bottom: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .card-desc {
      font-size: 13px;
      color: $text-secondary;
      margin-bottom: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      min-height: 36px;
    }
    
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .price {
        display: flex;
        align-items: baseline;
        gap: 8px;
        
        .current-price {
          font-size: 18px;
          font-weight: bold;
          color: $primary-color;
        }
        
        .original-price {
          font-size: 13px;
          color: $text-light;
          text-decoration: line-through;
        }
      }
      
      .sales {
        font-size: 12px;
        color: $text-light;
      }
    }
  }
}
</style>
