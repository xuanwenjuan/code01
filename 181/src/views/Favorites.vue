<template>
  <div class="favorites-page">
    <div class="container">
      <PageHeader title="我的收藏">
        <template #extra>
          <template v-if="favoriteStore.favorites.length > 0">
            <span class="favorite-count">共 {{ favoriteStore.favorites.length }} 件收藏商品</span>
            <el-button size="small" @click="toggleSelectMode">
              {{ selectMode ? '取消' : '管理' }}
            </el-button>
            <el-button
              v-if="selectMode"
              size="small"
              type="primary"
              :disabled="selectedIds.length === 0"
              @click="batchRemove"
            >
              批量删除 ({{ selectedIds.length }})
            </el-button>
            <el-button
              v-if="!selectMode"
              type="danger"
              size="small"
              @click="clearFavorites"
            >
              清空收藏
            </el-button>
          </template>
        </template>
      </PageHeader>
      
      <LoadingState v-if="loading" />
      
      <template v-else>
        <div v-if="favoriteStore.favorites.length > 0" class="products-grid">
          <div
            v-for="product in favoriteStore.favorites"
            :key="product.id"
            class="favorite-item"
          >
            <div class="product-card card-hover" @click="goProduct(product.id)">
              <div class="product-image">
                <img :src="product.image" :alt="product.name" />
                <div v-if="selectMode" class="select-checkbox" @click.stop="toggleSelect(product.id)">
                  <el-checkbox :model-value="selectedIds.includes(product.id)" />
                </div>
                <div v-else class="remove-btn" @click.stop="removeFavorite(product.id)">
                  <el-icon><Close /></el-icon>
                </div>
                <div v-if="product.tag" class="product-tag">{{ product.tag }}</div>
              </div>
              <div class="product-info">
                <h3 class="product-name text-ellipsis-2">{{ product.name }}</h3>
                <div class="product-brand">{{ product.brand }}</div>
                <div class="product-price">
                  <span class="price">¥{{ product.price }}</span>
                  <span v-if="product.originalPrice" class="original-price">¥{{ product.originalPrice }}</span>
                </div>
                <div class="product-actions">
                  <el-button type="primary" size="small" @click.stop="addToCart(product)">
                    加入购物车
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <EmptyState v-else text="暂无收藏" action-text="去逛逛" @action="goHome" />
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFavoriteStore } from '@/stores/favorite'
import { useCartStore } from '@/stores/cart'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeader from '@/components/PageHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import LoadingState from '@/components/LoadingState.vue'

const router = useRouter()
const favoriteStore = useFavoriteStore()
const cartStore = useCartStore()

const loading = ref(false)
const selectMode = ref(false)
const selectedIds = ref([])

const goProduct = (id) => router.push(`/product/${id}`)
const goHome = () => router.push('/')

const toggleSelectMode = () => {
  selectMode.value = !selectMode.value
  selectedIds.value = []
}

const toggleSelect = (id) => {
  const index = selectedIds.value.indexOf(id)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  } else {
    selectedIds.value.push(id)
  }
}

const removeFavorite = (id) => {
  ElMessageBox.confirm('确定要取消收藏该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    favoriteStore.removeFavorite(id)
    ElMessage.success('已取消收藏')
  }).catch(() => {})
}

const batchRemove = () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的商品')
    return
  }
  ElMessageBox.confirm(`确定要取消收藏选中的 ${selectedIds.value.length} 件商品吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    selectedIds.value.forEach(id => {
      favoriteStore.removeFavorite(id)
    })
    ElMessage.success('已批量取消收藏')
    selectMode.value = false
    selectedIds.value = []
  }).catch(() => {})
}

const clearFavorites = () => {
  ElMessageBox.confirm('确定要清空所有收藏吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    favoriteStore.clearFavorites()
    ElMessage.success('已清空收藏')
  }).catch(() => {})
}

const addToCart = (product) => {
  const defaultSpec = product.specs ? product.specs[0] : '默认规格'
  cartStore.addToCart({
    productId: product.id,
    name: product.name,
    image: product.image,
    price: product.price,
    spec: defaultSpec,
    quantity: 1
  })
  ElMessage.success('已加入购物车')
}

onMounted(() => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
})
</script>

<style lang="scss" scoped>
.favorites-page {
  padding: 40px 0;
}

.favorite-count {
  color: #909399;
  font-size: 14px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.product-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  
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
    
    .remove-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 32px;
      height: 32px;
      background: rgba(245, 108, 108, 0.9);
      color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
      
      &:hover {
        background: #f56c6c;
        transform: scale(1.1);
      }
    }
    
    .select-checkbox {
      position: absolute;
      top: 12px;
      left: 12px;
    }
    
    .product-tag {
      position: absolute;
      top: 12px;
      left: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }
  }
  
  .product-info {
    padding: 16px;
    
    .product-name {
      font-size: 14px;
      font-weight: 500;
      color: #303133;
      margin-bottom: 8px;
      line-height: 1.4;
      min-height: 40px;
    }
    
    .product-brand {
      font-size: 12px;
      color: #909399;
      margin-bottom: 10px;
    }
    
    .product-price {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      
      .price {
        font-size: 20px;
        font-weight: 700;
        color: #f56c6c;
      }
      
      .original-price {
        font-size: 13px;
        color: #909399;
        text-decoration: line-through;
        margin-left: 8px;
      }
    }
    
    .product-actions {
      display: flex;
      gap: 8px;
    }
  }
}
</style>
