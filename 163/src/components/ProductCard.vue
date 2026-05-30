<template>
  <div class="product-card" @click="goDetail">
    <div class="product-image">
      <img :src="product.image" :alt="product.name" />
      <div v-if="product.originalPrice > product.price" class="discount-tag">
        {{ Math.round((1 - product.price / product.originalPrice) * 100) }}%OFF
      </div>
    </div>
    <div class="product-info">
      <h3 class="product-name">{{ product.name }}</h3>
      <div class="product-brand">{{ product.brand }}</div>
      <div class="product-price">
        <span class="current-price">{{ formatPrice(product.price) }}</span>
        <span v-if="product.originalPrice > product.price" class="original-price">
          {{ formatPrice(product.originalPrice) }}
        </span>
      </div>
      <div class="product-meta">
        <span class="sales">销量 {{ formatSales(product.sales) }}</span>
        <span class="rating">⭐ {{ product.rating }}</span>
      </div>
    </div>
    <div class="product-actions">
      <el-button type="primary" size="small" @click.stop="handleAddCart">
        <el-icon><ShoppingCart /></el-icon>
        加入购物车
      </el-button>
      <el-button :type="isFavorited ? 'danger' : 'default'" size="small" @click.stop="handleToggleFavorite">
        <el-icon>
          <Star v-if="isFavorited" :fill="'#f56c6c'" />
          <Star v-else />
        </el-icon>
        收藏
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ShoppingCart, Star } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { formatPrice, formatSales } from '@/utils'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()

const isFavorited = computed(() => userStore.isFavorite(props.product.id))

const goDetail = () => {
  router.push(`/detail/${props.product.id}`)
}

const handleAddCart = () => {
  cartStore.addToCart(props.product, 1)
  ElMessage.success('已加入购物车')
}

const handleToggleFavorite = () => {
  if (userStore.isLoggedIn) {
    const result = userStore.toggleFavorite(props.product)
    ElMessage.success(result ? '已收藏' : '已取消收藏')
  } else {
    ElMessage.warning('请先登录')
    router.push('/login')
  }
}
</script>

<style lang="scss" scoped>
.product-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e4e7ed;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
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
  }

  .discount-tag {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: #f56c6c;
    color: #fff;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
  }
}

.product-info {
  padding: 12px;
}

.product-name {
  font-size: 14px;
  color: #333;
  margin: 0 0 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 40px;
  line-height: 20px;
}

.product-brand {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.product-price {
  margin-bottom: 8px;

  .current-price {
    font-size: 18px;
    color: #f56c6c;
    font-weight: 600;
  }

  .original-price {
    font-size: 12px;
    color: #999;
    text-decoration: line-through;
    margin-left: 8px;
  }
}

.product-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

.product-actions {
  display: flex;
  gap: 8px;
  padding: 0 12px 12px 12px;

  .el-button {
    flex: 1;
  }
}
</style>
