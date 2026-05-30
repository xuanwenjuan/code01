<template>
  <div class="history-page">
    <div class="page-header">
      <h2 class="page-title">浏览记录</h2>
      <el-button
        v-if="userStore.history.length > 0"
        type="danger"
        link
        @click="handleClear"
      >
        <el-icon><Delete /></el-icon>
        清空记录
      </el-button>
    </div>

    <div v-if="userStore.history.length > 0" class="history-list">
      <div
        v-for="product in userStore.history"
        :key="product.id"
        class="history-item card"
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
          <div class="view-time text-muted">
            浏览于 {{ formatDate(product.viewTime) }}
          </div>
        </div>
        <div class="product-actions">
          <el-button type="primary" size="small" @click="handleAddCart(product)">
            <el-icon><ShoppingCart /></el-icon>
            加入购物车
          </el-button>
        </div>
      </div>
    </div>

    <div v-else class="empty-wrapper">
      <el-empty description="暂无浏览记录">
        <el-button type="primary" @click="goHome">去逛逛</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ShoppingCart, Delete } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { formatPrice, formatSales, formatDate } from '@/utils'

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

const handleClear = () => {
  ElMessageBox.confirm('确定要清空浏览记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.history = []
    ElMessage.success('已清空浏览记录')
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.history-page {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .history-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .history-item {
    display: flex;
    gap: 20px;
    padding: 20px;
    align-items: center;
  }

  .product-image {
    width: 120px;
    height: 120px;
    border-radius: 4px;
    overflow: hidden;
    flex-shrink: 0;
    cursor: pointer;

    :deep(.el-image) {
      width: 100%;
      height: 100%;
    }
  }

  .product-info {
    flex: 1;
  }

  .product-name {
    font-size: 16px;
    color: #333;
    margin: 0 0 8px 0;
    cursor: pointer;
    transition: color 0.3s;

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
      font-size: 20px;
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
    gap: 20px;
    font-size: 12px;
    color: #999;
    margin-bottom: 8px;
  }

  .view-time {
    font-size: 12px;
  }

  .product-actions {
    flex-shrink: 0;
  }
}

@media (max-width: 768px) {
  .history-item {
    flex-wrap: wrap;
  }

  .product-image {
    width: 80px;
    height: 80px;
  }

  .product-info {
    flex: 1;
    min-width: calc(100% - 100px);
  }

  .product-actions {
    width: 100%;
  }
}
</style>
