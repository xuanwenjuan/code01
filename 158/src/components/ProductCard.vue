<template>
  <div class="product-card" @click="goToDetail">
    <div class="product-image">
      <img :src="product.images[0]" :alt="product.name" />
      <div class="product-tags" v-if="product.isHot || product.isNew || product.discount">
        <span class="tag hot" v-if="product.isHot">热卖</span>
        <span class="tag new" v-if="product.isNew">新品</span>
        <span class="tag discount" v-if="product.discount">-{{ product.discount }}%</span>
      </div>
    </div>
    <div class="product-info">
      <h3 class="product-name text-ellipsis-2">{{ product.name }}</h3>
      <div class="product-brand">{{ product.brandName }}</div>
      <div class="product-price">
        <span class="current-price">¥{{ product.price }}</span>
        <span class="original-price" v-if="product.originalPrice">¥{{ product.originalPrice }}</span>
      </div>
      <div class="product-meta">
        <span class="sales">已售{{ product.sales }}</span>
        <span class="rating">
          <el-rate :model-value="product.rating" disabled :size="12" />
        </span>
      </div>
    </div>
    <div class="product-actions">
      <el-button 
        type="primary" 
        size="small" 
        class="add-cart-btn"
        @click.stop="handleAddCart"
      >
        <el-icon><ShoppingCart /></el-icon>
        加入购物车
      </el-button>
      <el-button 
        :type="isFavorited ? 'danger' : 'default'" 
        size="small"
        @click.stop="handleFavorite"
      >
        <el-icon><Star :fill="isFavorited ? '#f56c6c' : 'none'" /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ShoppingCart, Star } from '@element-plus/icons-vue'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

const isFavorited = computed(() => userStore.isFavorite(props.product.id))

const goToDetail = () => {
  router.push(`/product/${props.product.id}`)
}

const handleAddCart = async () => {
  const result = await cartStore.addToCart(props.product.id, 1)
  if (result.success) {
    ElMessage.success('已加入购物车')
  } else {
    ElMessage.error(result.message || '加入购物车失败')
  }
}

const handleFavorite = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  const result = await userStore.toggleFavorite(props.product.id)
  if (result.success) {
    ElMessage.success(result.isFavorite ? '已收藏' : '已取消收藏')
  }
}
</script>

<style lang="scss" scoped>
.product-card {
  background: #fff;
  border-radius: $border-radius;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;

  &:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    transform: translateY(-4px);
    border-color: $primary-color;
  }

  .product-image {
    position: relative;
    width: 100%;
    padding-top: 100%;
    overflow: hidden;
    background: #f8f8f8;

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

    .product-tags {
      position: absolute;
      top: 10px;
      left: 10px;
      display: flex;
      gap: 6px;

      .tag {
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        color: #fff;

        &.hot {
          background: $danger-color;
        }

        &.new {
          background: $success-color;
        }

        &.discount {
          background: $primary-color;
        }
      }
    }
  }

  .product-info {
    padding: 12px;

    .product-name {
      font-size: 14px;
      color: $text-primary;
      line-height: 1.4;
      height: 40px;
      margin-bottom: 6px;
    }

    .product-brand {
      font-size: 12px;
      color: $text-secondary;
      margin-bottom: 8px;
    }

    .product-price {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin-bottom: 8px;

      .current-price {
        font-size: 18px;
        font-weight: bold;
        color: $primary-color;
      }

      .original-price {
        font-size: 12px;
        color: $text-secondary;
        text-decoration: line-through;
      }
    }

    .product-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: $text-secondary;
    }
  }

  .product-actions {
    display: flex;
    gap: 8px;
    padding: 0 12px 12px;

    .add-cart-btn {
      flex: 1;
      background: $primary-color;
      border-color: $primary-color;

      &:hover {
        background: $primary-dark;
        border-color: $primary-dark;
      }
    }
  }
}
</style>
