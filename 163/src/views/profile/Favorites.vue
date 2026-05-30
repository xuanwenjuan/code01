<template>
  <div class="favorites-page">
    <h2 class="page-title">我的收藏</h2>

    <div v-if="userStore.favorites.length > 0" class="product-grid">
      <div
        v-for="product in userStore.favorites"
        :key="product.id"
        class="favorite-item card"
      >
        <div class="product-image" @click="goDetail(product.id)">
          <el-image :src="product.image" fit="cover" />
        </div>
        <div class="product-info">
          <h3 class="product-name" @click="goDetail(product.id)">{{ product.name }}</h3>
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
          <div class="favorite-time text-muted">
            收藏于 {{ formatDateOnly(product.favoriteTime) }}
          </div>
        </div>
        <div class="product-actions">
          <el-button type="primary" size="small" @click="handleAddCart(product)">
            <el-icon><ShoppingCart /></el-icon>
            加入购物车
          </el-button>
          <el-button type="danger" size="small" @click="handleRemove(product)">
            <el-icon><Delete /></el-icon>
            取消收藏
          </el-button>
        </div>
      </div>
    </div>

    <div v-else class="empty-wrapper">
      <el-empty description="暂无收藏商品">
        <el-button type="primary" @click="goHome">去逛逛</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ShoppingCart, Delete } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { formatPrice, formatSales, formatDateOnly } from '@/utils'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()

const goDetail = (id) => {
  router.push(`/detail/${id}`)
}

const goHome = () => {
  router.push('/')
}

const handleAddCart = (product) => {
  cartStore.addToCart(product, 1)
  ElMessage.success('已加入购物车')
}

const handleRemove = (product) => {
  userStore.toggleFavorite(product)
  ElMessage.success('已取消收藏')
}
</script>

<style lang="scss" scoped>
.favorites-page {
  .product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }

  .favorite-item {
    padding: 16px;
  }

  .product-image {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 12px;
    cursor: pointer;

    :deep(.el-image) {
      width: 100%;
      height: 100%;
    }
  }

  .product-info {
    margin-bottom: 12px;
  }

  .product-name {
    font-size: 14px;
    color: #333;
    margin: 0 0 8px 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    cursor: pointer;
    line-height: 20px;
    height: 40px;

    &:hover {
      color: #409eff;
    }
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
    margin-bottom: 8px;
  }

  .favorite-time {
    font-size: 12px;
  }

  .product-actions {
    display: flex;
    gap: 8px;

    .el-button {
      flex: 1;
    }
  }
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: 1fr;
  }
}
</style>
