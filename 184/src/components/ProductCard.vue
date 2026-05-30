<template>
  <div class="product-card card-shadow" @click="goDetail">
    <div class="card-image">
      <img :src="product.image" :alt="product.name" />
      <div class="card-tags">
        <el-tag v-if="product.isHot" type="danger" size="small" effect="dark">热销</el-tag>
        <el-tag v-if="product.isNew" type="success" size="small" effect="dark">新品</el-tag>
      </div>
      <button 
        class="favorite-btn" 
        :class="{ active: isFavorited }"
        @click.stop="toggleFavorite"
        v-if="userStore.isBuyer"
      >
        <el-icon><Star :fill="isFavorited ? '#f56c6c' : 'none'" /></el-icon>
      </button>
    </div>
    <div class="card-content">
      <h3 class="card-title text-ellipsis">{{ product.name }}</h3>
      <p class="card-desc text-ellipsis">{{ product.description }}</p>
      <div class="card-tags-row">
        <el-tag 
          v-for="model in product.suitableModels.slice(0, 3)" 
          :key="model" 
          size="small" 
          type="info"
          effect="plain"
        >
          {{ model }}
        </el-tag>
      </div>
      <div class="card-footer">
        <div class="card-price">
          <span class="price-current">¥{{ product.price }}</span>
          <span class="price-original" v-if="product.originalPrice">¥{{ product.originalPrice }}</span>
        </div>
        <div class="card-sales">
          <el-rate :model-value="product.rating" disabled size="small" />
          <span class="sales-count">已售{{ formatSales(product.sales) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFavoriteStore } from '@/stores/favorite'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const favoriteStore = useFavoriteStore()
const userStore = useUserStore()

const isFavorited = computed(() => favoriteStore.isFavorite(props.product.id))

function goDetail() {
  router.push(`/product/${props.product.id}`)
}

function toggleFavorite() {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  const result = favoriteStore.toggleFavorite(props.product.id)
  ElMessage.success(result ? '已添加收藏' : '已取消收藏')
}

function formatSales(sales) {
  if (sales >= 10000) {
    return (sales / 10000).toFixed(1) + '万'
  }
  return sales
}
</script>

<style scoped lang="scss">
.product-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    
    .card-image img {
      transform: scale(1.05);
    }
  }
}

.card-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }
  
  .card-tags {
    position: absolute;
    top: 12px;
    left: 12px;
    display: flex;
    gap: 6px;
  }
  
  .favorite-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    color: #909399;
    
    &:hover, &.active {
      color: #f56c6c;
      background: #fff;
    }
  }
}

.card-content {
  padding: 16px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
  line-height: 1.4;
}

.card-desc {
  font-size: 13px;
  color: #909399;
  margin-bottom: 12px;
  line-height: 1.4;
}

.card-tags-row {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.card-price {
  display: flex;
  align-items: baseline;
  gap: 8px;
  
  .price-current {
    font-size: 18px;
    font-weight: bold;
    color: #f56c6c;
  }
  
  .price-original {
    font-size: 13px;
    color: #c0c4cc;
    text-decoration: line-through;
  }
}

.card-sales {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  
  .sales-count {
    font-size: 12px;
    color: #909399;
  }
}
</style>
