<template>
  <div class="detail-page">
    <div class="container">
      <el-page-header @back="goBack" content="返回列表" class="page-header" />
      
      <LoadingState v-if="loading" text="加载中..." />
      
      <template v-else-if="product">
        <div class="detail-content">
          <div class="product-gallery">
            <div class="main-image">
              <img :src="currentImage" :alt="product.name" />
              <div v-if="product.isNew" class="corner-badge new">新品</div>
              <div v-if="product.isHot" class="corner-badge hot">热销</div>
            </div>
            <div class="thumbnails">
              <div 
                v-for="(img, index) in product.images" 
                :key="index"
                class="thumbnail"
                :class="{ active: currentImage === img }"
                @click="currentImage = img"
              >
                <img :src="img" alt="" />
              </div>
            </div>
          </div>
          
          <div class="product-info">
            <div class="product-categories">
              <el-tag :type="getCategoryTagType(product.categoryId)" effect="light">
                {{ product.category }}
              </el-tag>
            </div>
            
            <h1 class="product-name">{{ product.name }}</h1>
            
            <div class="product-rating">
              <div class="rating-stars">
                <el-rate v-model="product.rating" disabled :size="16" />
                <span class="rating-value">{{ product.rating }}</span>
              </div>
              <span class="rating-divider">|</span>
              <span class="sales">已售 {{ product.sales }} 件</span>
              <span class="rating-divider">|</span>
              <span class="comment-count">1,234 条评价</span>
            </div>
            
            <div class="product-price">
              <div class="price-row">
                <span class="price-label">活动价</span>
                <span class="current-price">¥{{ selectedSet ? selectedSet.price : product.price }}</span>
                <span class="original-price">¥{{ product.originalPrice }}</span>
                <span class="discount-badge">省{{ product.originalPrice - (selectedSet ? selectedSet.price : product.price) }}元</span>
              </div>
              <div class="price-tips">
                <el-icon color="#f56c6c"><Warning /></el-icon>
                <span>限时优惠，距结束还剩 <b>{{ countdown }}</b></span>
              </div>
            </div>
            
            <div class="product-desc-card">
              <h4 class="desc-title">
                <el-icon><Document /></el-icon>
                商品描述
              </h4>
              <p class="product-desc">{{ product.description }}</p>
            </div>
            
            <el-divider />
            
            <div class="product-params">
              <h3 class="section-title">
                <el-icon><Tickets /></el-icon>
                产品参数
              </h3>
              <div class="params-table">
                <div 
                  v-for="param in product.parameters" 
                  :key="param.label" 
                  class="params-row"
                >
                  <span class="params-label">{{ param.label }}</span>
                  <span class="params-value">{{ param.value }}</span>
                </div>
              </div>
            </div>
            
            <div class="product-sets">
              <h3 class="section-title">
                <el-icon><Box /></el-icon>
                选择套装
              </h3>
              <div class="sets-grid">
                <div 
                  v-for="set in product.sets" 
                  :key="set.id"
                  class="set-card"
                  :class="{ active: selectedSet?.id === set.id }"
                  @click="selectSet(set)"
                >
                  <div class="set-header">
                    <div class="set-name-row">
                      <el-radio v-model="selectedSet" :label="set" class="set-radio">
                        {{ set.name }}
                      </el-radio>
                      <span class="set-price">¥{{ set.price }}</span>
                    </div>
                    <div class="set-save" v-if="set.price < product.originalPrice">
                      <el-tag type="danger" size="small" effect="light">
                        省{{ product.originalPrice - set.price }}元
                      </el-tag>
                    </div>
                  </div>
                  <div class="set-divider"></div>
                  <div class="set-content">
                    <div class="set-items-title">包含：</div>
                    <ul class="set-items">
                      <li v-for="(item, idx) in set.items" :key="idx">
                        <el-icon :size="12" color="#67c23a"><CircleCheck /></el-icon>
                        {{ item }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <el-divider />
            
            <div class="quantity-section">
              <span class="quantity-label">
                <el-icon><Goods /></el-icon>
                购买数量
              </span>
              <div class="quantity-controls">
                <el-input-number 
                  v-model="quantity" 
                  :min="1" 
                  :max="99"
                  size="large"
                  :step="1"
                  :step-strictly="true"
                />
                <span class="stock-info">库存 999 件</span>
              </div>
            </div>
            
            <div class="delivery-info">
              <div class="delivery-item">
                <el-icon color="#67c23a"><Van /></el-icon>
                <span>配送：免运费，预计3天内发货</span>
              </div>
              <div class="delivery-item">
                <el-icon color="#67c23a"><Service /></el-icon>
                <span>服务：7天无理由退货 · 正品保证</span>
              </div>
            </div>
            
            <div class="action-section">
              <el-button size="large" @click="handleFavorite" :type="isFav ? 'danger' : 'default'">
                <el-icon :size="18">
                  <StarFilled v-if="isFav" />
                  <Star v-else />
                </el-icon>
                {{ isFav ? '已收藏' : '收藏' }}
              </el-button>
              <el-button type="primary" size="large" @click="handleAddCart">
                <el-icon :size="18"><ShoppingCart /></el-icon>
                加入购物车
              </el-button>
              <el-button type="success" size="large" @click="handleBuyNow">
                <el-icon :size="18"><Money /></el-icon>
                立即购买
              </el-button>
            </div>
          </div>
        </div>
        
        <div class="price-preview-card" v-if="selectedSet">
          <el-card shadow="hover" class="sticky-card">
            <template #header>
              <div class="card-header">
                <el-icon color="#667eea"><ShoppingCart /></el-icon>
                <span>价格预览</span>
              </div>
            </template>
            <div class="card-product">
              <img :src="product.image" :alt="product.name" class="card-product-img" />
              <div class="card-product-info">
                <p class="card-product-name text-ellipsis">{{ product.name }}</p>
                <p class="card-product-set">{{ selectedSet.name }}</p>
              </div>
            </div>
            <el-divider />
            <div class="price-breakdown">
              <div class="price-row">
                <span class="label">商品单价</span>
                <span class="value">¥{{ selectedSet.price }}</span>
              </div>
              <div class="price-row">
                <span class="label">购买数量</span>
                <span class="value">x {{ quantity }}</span>
              </div>
              <div class="price-row">
                <span class="label">商品原价</span>
                <span class="value original">¥{{ product.originalPrice * quantity }}</span>
              </div>
              <div class="price-row discount">
                <span class="label">优惠金额</span>
                <span class="value">-¥{{ (product.originalPrice - selectedSet.price) * quantity }}</span>
              </div>
            </div>
            <el-divider />
            <div class="total-section">
              <span class="total-label">应付总额</span>
              <span class="total-price">¥{{ selectedSet.price * quantity }}</span>
            </div>
            <div class="save-notice">
              <el-icon color="#f56c6c"><Present /></el-icon>
              <span>本单已省 <b>¥{{ (product.originalPrice - selectedSet.price) * quantity }}</b> 元</span>
            </div>
          </el-card>
        </div>
      </template>
      
      <EmptyState v-else icon="❓" text="商品不存在或已下架">
        <template #action>
          <el-button type="primary" @click="goBack">返回首页</el-button>
        </template>
      </EmptyState>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { useFavoriteStore } from '@/stores/favorite'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'
import { 
  Star, StarFilled, Warning, Document, Tickets, Box, 
  Goods, Van, Service, ShoppingCart, Money, CircleCheck,
  Present
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const favoriteStore = useFavoriteStore()

const loading = ref(true)
const product = ref(null)
const currentImage = ref('')
const selectedSet = ref(null)
const quantity = ref(1)
const countdown = ref('')
let timer = null

const isFav = computed(() => product.value ? favoriteStore.isFavorite(product.value.id) : false)

const getCategoryTagType = (categoryId) => {
  const types = ['', 'danger', 'warning', 'primary', 'success', 'info', '', '', '']
  return types[categoryId] || 'info'
}

const updateCountdown = () => {
  const hours = Math.floor(Math.random() * 12)
  const minutes = Math.floor(Math.random() * 60)
  const seconds = Math.floor(Math.random() * 60)
  countdown.value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const selectSet = (set) => {
  selectedSet.value = set
}

const goBack = () => {
  router.back()
}

const handleFavorite = () => {
  if (product.value) {
    const result = favoriteStore.toggleFavorite(product.value.id)
    ElMessage.success(result ? '已加入收藏' : '已取消收藏')
  }
}

const handleAddCart = () => {
  if (!selectedSet.value) {
    ElMessage.warning('请先选择套装')
    return
  }
  ElMessage.success(`已将「${product.value.name} - ${selectedSet.value.name}」加入购物车`)
}

const handleBuyNow = () => {
  if (!selectedSet.value) {
    ElMessage.warning('请先选择套装')
    return
  }
  ElMessage.success(`跳转至结算页面，共${quantity}件商品，合计¥${selectedSet.value.price * quantity}`)
}

onMounted(() => {
  setTimeout(() => {
    const id = route.params.id
    product.value = productStore.getProductById(id)
    if (product.value) {
      currentImage.value = product.value.images[0]
      selectedSet.value = product.value.sets[0]
    }
    loading.value = false
    updateCountdown()
    timer = setInterval(updateCountdown, 1000)
  }, 500)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style lang="scss" scoped>
.detail-page {
  padding: 20px 0 60px;
  
  .page-header {
    margin-bottom: 20px;
  }
}

.detail-content {
  display: grid;
  grid-template-columns: 480px 1fr 320px;
  gap: 30px;
  margin-bottom: 40px;
  
  @media (max-width: 1400px) {
    grid-template-columns: 480px 1fr;
    
    .price-preview-card {
      grid-column: 1 / -1;
    }
  }
  
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.product-gallery {
  .main-image {
    width: 100%;
    padding-top: 100%;
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    background: #f5f5f5;
    
    img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .corner-badge {
      position: absolute;
      top: 16px;
      padding: 6px 12px;
      border-radius: 0 20px 20px 0;
      font-size: 12px;
      font-weight: 600;
      color: #fff;
      
      &.new {
        background: linear-gradient(90deg, #67c23a, #85ce61);
      }
      
      &.hot {
        background: linear-gradient(90deg, #f56c6c, #f78989);
        top: 52px;
      }
    }
  }
  
  .thumbnails {
    display: flex;
    gap: 12px;
    margin-top: 16px;
    
    .thumbnail {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.3s;
      
      &:hover {
        transform: scale(1.05);
      }
      
      &.active {
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
      }
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
}

.product-info {
  .product-categories {
    margin-bottom: 12px;
  }
  
  .product-name {
    font-size: 24px;
    font-weight: 600;
    color: #333;
    margin-bottom: 16px;
    line-height: 1.4;
  }
  
  .product-rating {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    
    .rating-stars {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .rating-value {
        font-size: 16px;
        color: #ff9900;
        font-weight: 600;
      }
    }
    
    .rating-divider {
      color: #e0e0e0;
    }
    
    .sales,
    .comment-count {
      font-size: 14px;
      color: #999;
    }
  }
  
  .product-price {
    background: linear-gradient(135deg, #fff5f5 0%, #fff0f0 100%);
    border: 1px solid #ffd4d4;
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 20px;
    
    .price-row {
      display: flex;
      align-items: baseline;
      gap: 12px;
      margin-bottom: 12px;
      
      .price-label {
        font-size: 14px;
        color: #666;
      }
      
      .current-price {
        font-size: 36px;
        font-weight: 700;
        color: #ff6b6b;
      }
      
      .original-price {
        font-size: 16px;
        color: #ccc;
        text-decoration: line-through;
      }
      
      .discount-badge {
        background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
        color: #fff;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
      }
    }
    
    .price-tips {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #f56c6c;
      
      b {
        font-family: 'Courier New', monospace;
        font-size: 14px;
      }
    }
  }
  
  .product-desc-card {
    background: #fafafa;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 20px;
    
    .desc-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
    }
    
    .product-desc {
      font-size: 14px;
      color: #666;
      line-height: 1.8;
      margin: 0;
    }
  }
  
  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 16px;
  }
  
  .product-params {
    margin-bottom: 24px;
    
    .params-table {
      background: #fafafa;
      border-radius: 8px;
      overflow: hidden;
      
      .params-row {
        display: flex;
        padding: 12px 16px;
        border-bottom: 1px solid #f0f0f0;
        
        &:last-child {
          border-bottom: none;
        }
        
        .params-label {
          width: 100px;
          color: #999;
          font-size: 14px;
          flex-shrink: 0;
        }
        
        .params-value {
          color: #333;
          font-size: 14px;
          flex: 1;
        }
      }
    }
  }
  
  .product-sets {
    margin-bottom: 24px;
    
    .sets-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .set-card {
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover {
        border-color: #667eea;
      }
      
      &.active {
        border-color: #667eea;
        background: linear-gradient(135deg, #f0f4ff 0%, #e8edff 100%);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
      }
      
      .set-header {
        .set-name-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          
          .set-radio {
            margin-right: 0;
            
            :deep(.el-radio__label) {
              font-weight: 600;
              color: #333;
              font-size: 15px;
            }
          }
          
          .set-price {
            font-size: 20px;
            font-weight: 700;
            color: #ff6b6b;
          }
        }
        
        .set-save {
          margin-bottom: 0;
        }
      }
      
      .set-divider {
        height: 1px;
        background: #e0e0e0;
        margin: 12px 0;
      }
      
      .set-content {
        .set-items-title {
          font-size: 13px;
          color: #999;
          margin-bottom: 8px;
        }
        
        .set-items {
          li {
            font-size: 13px;
            color: #666;
            margin-bottom: 6px;
            display: flex;
            align-items: center;
            gap: 6px;
          }
        }
      }
    }
  }
  
  .quantity-section {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;
    
    .quantity-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
      color: #333;
      font-weight: 500;
      min-width: 100px;
    }
    
    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 16px;
      
      .stock-info {
        font-size: 13px;
        color: #67c23a;
      }
    }
  }
  
  .delivery-info {
    background: #f8fff8;
    border: 1px solid #d1f0d1;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 24px;
    
    .delivery-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #666;
      margin-bottom: 8px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  
  .action-section {
    display: flex;
    gap: 12px;
    
    .el-button {
      flex: 1;
      height: 48px;
      font-size: 15px;
      border-radius: 8px;
    }
  }
}

.price-preview-card {
  .sticky-card {
    position: sticky;
    top: 80px;
    
    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      font-size: 16px;
    }
    
    .card-product {
      display: flex;
      gap: 12px;
      
      .card-product-img {
        width: 64px;
        height: 64px;
        object-fit: cover;
        border-radius: 8px;
      }
      
      .card-product-info {
        flex: 1;
        
        .card-product-name {
          font-size: 14px;
          color: #333;
          margin-bottom: 4px;
        }
        
        .card-product-set {
          font-size: 12px;
          color: #999;
          background: #f0f0f0;
          padding: 2px 8px;
          border-radius: 4px;
          display: inline-block;
        }
      }
    }
    
    .price-breakdown {
      .price-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 0;
        font-size: 14px;
        color: #666;
        
        .label {
          color: #999;
        }
        
        .value {
          color: #333;
          
          &.original {
            text-decoration: line-through;
            color: #ccc;
          }
        }
        
        &.discount {
          .value {
            color: #f56c6c;
          }
        }
      }
    }
    
    .total-section {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 12px;
      
      .total-label {
        font-size: 15px;
        color: #333;
        font-weight: 500;
      }
      
      .total-price {
        font-size: 28px;
        font-weight: 700;
        color: #ff6b6b;
      }
    }
    
    .save-notice {
      background: linear-gradient(135deg, #fff5f5 0%, #ffeeee 100%);
      padding: 12px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #f56c6c;
      
      b {
        font-size: 15px;
      }
    }
  }
}
</style>
