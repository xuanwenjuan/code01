<script setup>
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useFavoriteStore } from '../../stores/favorite'
import { useUserStore } from '../../stores/user'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const userStore = useUserStore()
const favoriteStore = useFavoriteStore()

function goToDetail() {
  router.push(`/product/${props.product.id}`)
}

async function toggleFavorite(e) {
  e.stopPropagation()
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  try {
    const result = await favoriteStore.toggleFavorite(userStore.userInfo.id, props.product.id)
    ElMessage.success(result.isFavorited ? '已添加到收藏' : '已取消收藏')
  } catch (err) {
    ElMessage.error('操作失败')
  }
}
</script>

<template>
  <div class="product-card card-hover" @click="goToDetail">
    <div class="product-image">
      <img :src="product.image" :alt="product.name" />
      <span v-if="product.isHot" class="hot-tag">热卖</span>
      <div 
        class="favorite-btn" 
        @click="toggleFavorite"
        :class="{ 'is-favorite': favoriteStore.isFavorite(userStore.userInfo?.id, product.id) }"
      >
        <el-icon>
          <StarFilled v-if="favoriteStore.isFavorite(userStore.userInfo?.id, product.id)" />
          <Star v-else />
        </el-icon>
      </div>
    </div>
    <div class="product-info">
      <h3 class="product-name text-ellipsis">{{ product.name }}</h3>
      <p class="product-desc text-ellipsis">{{ product.description }}</p>
      <div class="product-footer">
        <div class="product-price">
          <span class="price-symbol">¥</span>
          <span class="price-value">{{ product.price.toFixed(2) }}</span>
          <span v-if="product.originalPrice" class="price-original">¥{{ product.originalPrice.toFixed(2) }}</span>
        </div>
        <div class="product-sales">已售{{ product.sales }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.product-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.hot-tag {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #f56c6c;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.favorite-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.favorite-btn:hover {
  background: #fff;
}

.favorite-btn .el-icon {
  color: #909399;
  font-size: 18px;
}

.favorite-btn.is-favorite .el-icon {
  color: #e6a23c;
}

.product-info {
  padding: 12px;
}

.product-name {
  font-size: 14px;
  color: #303133;
  margin: 0 0 6px 0;
  font-weight: 500;
  line-height: 1.4;
  height: 40px;
}

.product-desc {
  font-size: 12px;
  color: #909399;
  margin: 0 0 10px 0;
  line-height: 1.4;
  height: 34px;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.price-symbol {
  color: #f56c6c;
  font-size: 12px;
}

.price-value {
  color: #f56c6c;
  font-size: 18px;
  font-weight: 600;
}

.price-original {
  color: #c0c4cc;
  font-size: 12px;
  text-decoration: line-through;
}

.product-sales {
  color: #909399;
  font-size: 12px;
}
</style>
