<template>
  <div class="wishlist-page">
    <div class="page-header">
      <h2 class="page-title">心愿单</h2>
      <el-button
        v-if="wishlist.length > 0"
        type="danger"
        text
        @click="handleClearAll"
      >
        清空心愿单
      </el-button>
    </div>

    <div v-if="loading" class="loading-wrapper">
      <el-skeleton v-for="i in 8" :key="i" :rows="4" animated />
    </div>

    <template v-else>
      <div v-if="wishlist.length > 0" class="wishlist-grid">
        <div
          v-for="item in wishlist"
          :key="item.id"
          class="wishlist-card"
        >
          <div class="card-image" @click="goToDetail(item.flowerId)">
            <img :src="item.image" :alt="item.name" />
            <div class="remove-btn" @click.stop="handleRemove(item.flowerId)">
              <el-icon><Close /></el-icon>
            </div>
          </div>
          <div class="card-body">
            <h3 class="card-title" @click="goToDetail(item.flowerId)">{{ item.name }}</h3>
            <div class="card-price">{{ formatPrice(item.price) }}</div>
            <div class="card-time">{{ item.createTime }}</div>
            <div class="card-actions">
              <el-button type="primary" size="small" @click="handleAddCart(item)">
                加入购物车
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <EmptyState v-else icon="⭐" text="心愿单空空如也">
        <template #action>
          <el-button type="primary" @click="goShopping">去添加心仪的商品</el-button>
        </template>
      </EmptyState>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Close } from '@element-plus/icons-vue'
import EmptyState from '@/components/EmptyState.vue'
import { formatPrice } from '@/utils'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { getWishlist, removeFromWishlist } from '@/api/order'
import { getFlowerDetail } from '@/api/flower'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()

const wishlist = ref([])
const loading = ref(false)

const loadWishlist = async () => {
  loading.value = true
  try {
    const userId = userStore.userInfo?.id
    if (userId) {
      const res = await getWishlist(userId)
      wishlist.value = res.data
    }
  } finally {
    loading.value = false
  }
}

const handleRemove = async (flowerId) => {
  ElMessageBox.confirm('确定要从心愿单中移除吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await removeFromWishlist(flowerId)
    ElMessage.success('已移除')
    loadWishlist()
  }).catch(() => {})
}

const handleClearAll = async () => {
  ElMessageBox.confirm('确定要清空心愿单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    for (const item of wishlist.value) {
      await removeFromWishlist(item.flowerId)
    }
    ElMessage.success('已清空')
    loadWishlist()
  }).catch(() => {})
}

const handleAddCart = async (item) => {
  try {
    const res = await getFlowerDetail(item.flowerId)
    const flower = res.data
    cartStore.addToCart(flower, flower.specs[0], 1)
    ElMessage.success('已加入购物车')
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  }
}

const goToDetail = (flowerId) => {
  router.push(`/detail/${flowerId}`)
}

const goShopping = () => {
  router.push('/list')
}

onMounted(() => {
  loadWishlist()
})
</script>

<style lang="scss" scoped>
.wishlist-page {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    
    .page-title {
      font-size: 20px;
      font-weight: 500;
      color: $text-primary;
      margin: 0;
    }
  }
  
  .loading-wrapper {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }
  
  .wishlist-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
    
    .wishlist-card {
      background: #fff;
      border: 1px solid $border-color;
      border-radius: $radius;
      overflow: hidden;
      transition: all 0.3s;
      
      &:hover {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        transform: translateY(-4px);
      }
      
      .card-image {
        position: relative;
        width: 100%;
        padding-top: 100%;
        cursor: pointer;
        
        img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .remove-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 28px;
          height: 28px;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s;
          
          &:hover {
            background: rgba(255, 107, 157, 0.9);
          }
        }
      }
      
      .card-body {
        padding: 16px;
        
        .card-title {
          font-size: 14px;
          font-weight: 500;
          color: $text-primary;
          margin-bottom: 8px;
          cursor: pointer;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
          
          &:hover {
            color: $primary-color;
          }
        }
        
        .card-price {
          font-size: 18px;
          font-weight: bold;
          color: $primary-color;
          margin-bottom: 8px;
        }
        
        .card-time {
          font-size: 12px;
          color: $text-light;
          margin-bottom: 12px;
        }
        
        .card-actions {
          .el-button {
            width: 100%;
          }
        }
      }
    }
  }
}

@media (max-width: 1024px) {
  .wishlist-page {
    .loading-wrapper,
    .wishlist-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
}

@media (max-width: 768px) {
  .wishlist-page {
    .loading-wrapper,
    .wishlist-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}
</style>
