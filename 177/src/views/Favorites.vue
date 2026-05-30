<template>
  <div class="favorites-page">
    <div class="container">
      <div class="page-header">
        <div class="header-left">
          <h2 class="page-title">我的收藏</h2>
          <p class="page-subtitle">共 {{ favoriteStore.favoriteCount }} 件商品</p>
        </div>
        <div class="header-actions" v-if="favoriteStore.favoriteCount > 0">
          <el-button type="danger" plain @click="clearAllFavorites">
            <el-icon :size="16"><Delete /></el-icon>
            清空收藏
          </el-button>
        </div>
      </div>
      
      <EmptyState 
        v-if="favoriteStore.favoriteProducts.length === 0" 
        icon="💔" 
        text="暂无收藏商品"
      >
        <template #action>
          <el-button type="primary" @click="goShopping">去逛逛</el-button>
        </template>
      </EmptyState>
      
      <div v-else class="favorites-grid">
        <div 
          v-for="product in favoriteStore.favoriteProducts" 
          :key="product.id" 
          class="favorite-item"
        >
          <div class="product-card card-hover" @click="goDetail(product.id)">
            <div class="product-image">
              <img :src="product.image" :alt="product.name" />
              <div class="product-tags">
                <el-tag v-if="product.isHot" type="danger" size="small" effect="dark">热销</el-tag>
                <el-tag v-if="product.isNew" type="success" size="small" effect="dark">新品</el-tag>
              </div>
              <button 
                class="favorite-toggle" 
                @click.stop="toggleFavorite(product.id)"
                title="取消收藏"
              >
                <el-icon :size="18" color="#ff6b6b"><StarFilled /></el-icon>
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
          <div class="item-actions">
            <el-button size="small" type="primary" @click.stop="addToCart(product)">
              <el-icon :size="14"><ShoppingCart /></el-icon>
              加入购物车
            </el-button>
            <el-button size="small" type="success" @click.stop="buyNow(product)">
              <el-icon :size="14"><Money /></el-icon>
              立即购买
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useFavoriteStore } from '@/stores/favorite'
import EmptyState from '@/components/EmptyState.vue'
import { StarFilled, ShoppingCart, Money, Delete } from '@element-plus/icons-vue'

const router = useRouter()
const favoriteStore = useFavoriteStore()

const goShopping = () => {
  router.push('/')
}

const goDetail = (productId) => {
  router.push(`/detail/${productId}`)
}

const toggleFavorite = (productId) => {
  ElMessageBox.confirm('确定要取消收藏该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    favoriteStore.removeFavorite(productId)
    ElMessage.success('已取消收藏')
  }).catch(() => {})
}

const clearAllFavorites = () => {
  ElMessageBox.confirm('确定要清空所有收藏吗？清空后无法恢复。', '提示', {
    confirmButtonText: '确定清空',
    cancelButtonText: '再想想',
    type: 'warning'
  }).then(() => {
    favoriteStore.clearFavorites()
    ElMessage.success('已清空收藏')
  }).catch(() => {})
}

const addToCart = (product) => {
  ElMessage.success(`已将「${product.name}」加入购物车`)
}

const buyNow = (product) => {
  router.push(`/detail/${product.id}`)
}
</script>

<style lang="scss" scoped>
.favorites-page {
  padding: 30px 0 60px;
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 24px;
    
    .header-left {
      display: flex;
      align-items: baseline;
      gap: 16px;
      
      .page-title {
        font-size: 24px;
        font-weight: 600;
        color: #333;
        margin: 0;
      }
      
      .page-subtitle {
        font-size: 14px;
        color: #999;
        margin: 0;
      }
    }
  }
  
  .favorites-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    
    @media (max-width: 1200px) {
      grid-template-columns: repeat(3, 1fr);
    }
    
    @media (max-width: 900px) {
      grid-template-columns: repeat(2, 1fr);
    }
    
    @media (max-width: 600px) {
      grid-template-columns: 1fr;
    }
    
    .favorite-item {
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      transition: box-shadow 0.3s;
      
      &:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      }
      
      .product-card {
        cursor: pointer;
        
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
          
          .favorite-toggle {
            position: absolute;
            top: 10px;
            right: 10px;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: none;
            background: rgba(255, 255, 255, 0.95);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
            
            &:hover {
              background: #fff;
              transform: scale(1.1);
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
      }
      
      .item-actions {
        display: flex;
        gap: 8px;
        padding: 12px 16px 16px;
        border-top: 1px solid #f0f0f0;
        
        .el-button {
          flex: 1;
          padding: 8px;
        }
      }
    }
  }
}
</style>
