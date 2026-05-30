<template>
  <div class="product-card card-hover" @click="goDetail">
    <div class="product-image">
      <img :src="product.image" :alt="product.name" />
      <div class="product-tags">
        <el-tag v-if="product.isHot" type="danger" size="small" effect="dark">热销</el-tag>
        <el-tag v-if="product.isNew" type="success" size="small" effect="dark">新品</el-tag>
      </div>
      <button 
        class="favorite-btn" 
        @click.stop="toggleFav"
        :class="{ active: isFav }"
      >
        <el-icon :size="18">
          <StarFilled v-if="isFav" />
          <Star v-else />
        </el-icon>
      </button>
    </div>
    <div class="product-info">
      <h3 class="product-name text-ellipsis-2">{{ product.name }}</h3>
      <div class="product-meta">
        <div class="rating">
          <el-rate v-model="product.rating" disabled :size="12" />
          <span class="rating-text">{{ product.rating }}</span>
        </div>
        <span class="sales">已售{{ product.sales }}</span>
      </div>
      <div class="product-price">
        <span class="current-price">¥{{ product.price }}</span>
        <span class="original-price">¥{{ product.originalPrice }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFavoriteStore } from '@/stores/favorite'
import { Star, StarFilled } from '@element-plus/icons-vue'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const favoriteStore = useFavoriteStore()

const isFav = computed(() => favoriteStore.isFavorite(props.product.id))

const goDetail = () => {
  router.push(`/detail/${props.product.id}`)
}

const toggleFav = () => {
  const result = favoriteStore.toggleFavorite(props.product.id)
  ElMessage.success(result ? '已加入收藏' : '已取消收藏')
}
</script>

<style lang="scss" scoped>
.product-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.product-image {
  position: relative;
  width: 100%;
  padding-top: 100%;
  
  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .product-tags {
    position: absolute;
    top: 10px;
    left: 10px;
    display: flex;
    gap: 6px;
  }
  
  .favorite-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    
    &:hover {
      background: #fff;
      transform: scale(1.1);
    }
    
    &.active {
      color: #ff6b6b;
      
      .el-icon {
        color: #ff6b6b;
      }
    }
  }
}

.product-info {
  padding: 16px;
  
  .product-name {
    font-size: 15px;
    line-height: 1.4;
    color: #333;
    margin-bottom: 8px;
    min-height: 42px;
  }
  
  .product-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    
    .rating {
      display: flex;
      align-items: center;
      gap: 4px;
      
      .rating-text {
        font-size: 12px;
        color: #999;
      }
    }
    
    .sales {
      font-size: 12px;
      color: #999;
    }
  }
  
  .product-price {
    display: flex;
    align-items: baseline;
    gap: 8px;
    
    .current-price {
      font-size: 20px;
      font-weight: 700;
      color: #ff6b6b;
    }
    
    .original-price {
      font-size: 13px;
      color: #ccc;
      text-decoration: line-through;
    }
  }
}
</style>
