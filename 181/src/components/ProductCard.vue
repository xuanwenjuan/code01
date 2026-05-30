<template>
  <div class="product-card card-hover" @click="goDetail">
    <div class="product-image">
      <img :src="product.image" :alt="product.name" loading="lazy" />
      <div class="product-tags">
        <span v-if="product.isHot" class="hot-tag">热销</span>
      </div>
      <div class="favorite-btn" @click.stop="toggleFavorite">
        <el-icon :color="isFavorited ? '#f56c6c' : '#c0c4cc'">
          <Star :fill="isFavorited ? '#f56c6c' : 'none'" />
        </el-icon>
      </div>
    </div>
    <div class="product-info">
      <h3 class="product-name text-ellipsis-2">{{ product.name }}</h3>
      <div class="product-brand">{{ product.brand }}</div>
      <div class="product-price">
        <span class="price">¥{{ product.price }}</span>
        <span v-if="product.originalPrice" class="original-price">¥{{ product.originalPrice }}</span>
        <span v-if="product.originalPrice" class="discount-tag">
          {{ Math.round((1 - product.price / product.originalPrice) * 100) }}%OFF
        </span>
      </div>
      <div class="product-meta">
        <span class="sales">已售{{ product.sales }}件</span>
        <span class="rating">
          <el-icon size="12" color="#f59e0b"><Star /></el-icon>
          {{ product.rating }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFavoriteStore } from '@/stores/favorite'
import { ElMessage } from 'element-plus'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const favoriteStore = useFavoriteStore()

const isFavorited = computed(() => favoriteStore.isFavorite(props.product.id))

const goDetail = () => {
  router.push(`/product/${props.product.id}`)
}

const toggleFavorite = () => {
  favoriteStore.toggleFavorite(props.product)
  ElMessage.success(isFavorited.value ? '已加入收藏' : '已取消收藏')
}
</script>

<style lang="scss" scoped>
.product-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
}

.product-image {
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
    transition: transform 0.3s;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
}

.product-tags {
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
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  
  &:hover {
    background: #fff;
    transform: scale(1.1);
  }
}

.product-info {
  padding: 16px;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
  line-height: 1.4;
  height: 40px;
}

.product-brand {
  font-size: 12px;
  color: #909399;
  margin-bottom: 10px;
}

.product-price {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  
  .price {
    font-size: 20px;
    font-weight: 700;
  }
  
  .original-price {
    font-size: 13px;
  }
}

.product-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
  
  .rating {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #f59e0b;
  }
}
</style>
