<template>
  <div class="detail-page" v-loading="loading">
    <div class="container" v-if="flower">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/list' }">商品列表</el-breadcrumb-item>
        <el-breadcrumb-item>{{ flower.name }}</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="detail-content">
        <div class="gallery-section">
          <div class="main-image">
            <img :src="currentImage" :alt="flower.name" />
          </div>
          <div class="thumbnails">
            <div 
              v-for="(img, index) in flower.images" 
              :key="index"
              class="thumbnail"
              :class="{ active: currentImage === img }"
              @click="currentImage = img"
            >
              <img :src="img" :alt="flower.name" />
            </div>
          </div>
        </div>

        <div class="info-section">
          <h1 class="flower-name">{{ flower.name }}</h1>
          <div class="flower-tags">
            <el-tag v-if="flower.isHot" type="danger" effect="light">热卖</el-tag>
            <el-tag v-if="flower.isNew" type="success" effect="light">新品</el-tag>
            <el-tag type="info" effect="light">{{ flower.delivery }}</el-tag>
          </div>

          <div class="price-section">
            <div class="current-price">{{ formatPrice(selectedSpec?.price || flower.price) }}</div>
            <div class="original-price" v-if="flower.originalPrice">{{ formatPrice(flower.originalPrice) }}</div>
            <div class="discount" v-if="flower.originalPrice">
              省 {{ formatPrice(flower.originalPrice - (selectedSpec?.price || flower.price)) }}
            </div>
          </div>

          <div class="info-row">
            <span class="label">销量</span>
            <span class="value">{{ flower.sales }} 件</span>
            <el-divider direction="vertical" />
            <span class="label">评分</span>
            <span class="value">
              <el-rate v-model="flower.rating" disabled :max="5" :show-score="true" />
            </span>
          </div>

          <div class="spec-section">
            <div class="section-label">选择规格</div>
            <div class="spec-options">
              <div 
                v-for="spec in flower.specs" 
                :key="spec.id"
                class="spec-option"
                :class="{ active: selectedSpec?.id === spec.id }"
                @click="selectedSpec = spec"
              >
                <span class="spec-name">{{ spec.name }}</span>
                <span class="spec-price">{{ formatPrice(spec.price) }}</span>
              </div>
            </div>
          </div>

          <div class="quantity-section">
            <div class="section-label">购买数量</div>
            <el-input-number 
              v-model="quantity" 
              :min="1" 
              :max="flower.stock" 
              size="large"
            />
            <span class="stock-tip">库存 {{ flower.stock }} 件</span>
          </div>

          <div class="action-buttons">
            <el-button type="primary" size="large" class="btn-cart" @click="handleAddCart">
              <el-icon><ShoppingCart /></el-icon>
              加入购物车
            </el-button>
            <el-button size="large" class="btn-buy" @click="handleBuyNow">
              立即购买
            </el-button>
            <el-button 
              size="large" 
              class="btn-wishlist"
              @click="handleAddWishlist"
            >
              <el-icon><Star /></el-icon>
              加入心愿单
            </el-button>
          </div>

          <div class="delivery-info">
            <div class="info-item">
              <el-icon color="#ff6b9d"><Van /></el-icon>
              <span>同城2小时送达</span>
            </div>
            <div class="info-item">
              <el-icon color="#ff6b9d"><Present /></el-icon>
              <span>精美包装</span>
            </div>
            <div class="info-item">
              <el-icon color="#ff6b9d"><Medal /></el-icon>
              <span>品质保证</span>
            </div>
          </div>
        </div>
      </div>

      <div class="detail-tabs">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="商品详情" name="detail">
            <div class="tab-content">
              <h3 class="tab-title">商品描述</h3>
              <p class="tab-text">{{ flower.description }}</p>
              
              <h3 class="tab-title">花艺寓意</h3>
              <div class="meaning-box">
                <p class="tab-text">{{ flower.meaning }}</p>
              </div>
              
              <h3 class="tab-title">产品展示</h3>
              <div class="product-gallery">
                <img v-for="(img, index) in flower.images" :key="index" :src="img" :alt="flower.name" />
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="买家评价" name="reviews">
            <div class="tab-content">
              <div class="reviews-header">
                <div class="reviews-summary">
                  <span class="rating-score">{{ flower.rating }}</span>
                  <el-rate v-model="flower.rating" disabled :max="5" />
                  <span class="reviews-count">{{ reviews.length }} 条评价</span>
                </div>
              </div>
              
              <div v-if="reviews.length > 0" class="reviews-list">
                <div v-for="review in reviews" :key="review.id" class="review-item">
                  <div class="review-header">
                    <el-avatar :size="40" :src="review.avatar" />
                    <div class="reviewer-info">
                      <span class="reviewer-name">{{ review.userName }}</span>
                      <el-rate v-model="review.rating" disabled :max="5" size="small" />
                    </div>
                    <span class="review-time">{{ review.createTime }}</span>
                  </div>
                  <p class="review-content">{{ review.content }}</p>
                  <div v-if="review.images.length > 0" class="review-images">
                    <img v-for="(img, index) in review.images" :key="index" :src="img" alt="" />
                  </div>
                  <div class="review-spec">规格：{{ review.spec }}</div>
                </div>
              </div>
              <EmptyState v-else icon="💬" text="暂无评价" />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ShoppingCart, Star, Van, Present, Medal } from '@element-plus/icons-vue'
import EmptyState from '@/components/EmptyState.vue'
import { formatPrice } from '@/utils'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { getFlowerDetail, getFlowerReviews } from '@/api/flower'
import { addToWishlist } from '@/api/order'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()

const loading = ref(false)
const flower = ref(null)
const reviews = ref([])
const currentImage = ref('')
const selectedSpec = ref(null)
const quantity = ref(1)
const activeTab = ref('detail')

const loadData = async (id) => {
  loading.value = true
  try {
    const [flowerRes, reviewsRes] = await Promise.all([
      getFlowerDetail(id),
      getFlowerReviews(id)
    ])
    flower.value = flowerRes.data
    reviews.value = reviewsRes.data
    currentImage.value = flowerRes.data.images[0]
    selectedSpec.value = flowerRes.data.specs[0]
  } finally {
    loading.value = false
  }
}

const handleAddCart = () => {
  cartStore.addToCart(flower.value, selectedSpec.value, quantity.value)
  ElMessage.success('已加入购物车')
}

const handleBuyNow = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  cartStore.addToCart(flower.value, selectedSpec.value, quantity.value)
  router.push('/checkout?buyNow=1')
}

const handleAddWishlist = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  try {
    await addToWishlist(flower.value)
    ElMessage.success('已加入心愿单')
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  }
}

watch(() => route.params.id, (newId) => {
  if (newId) {
    loadData(newId)
  }
}, { immediate: true })

onMounted(() => {
  const id = route.params.id
  if (id) {
    loadData(id)
  }
})
</script>

<style lang="scss" scoped>
.detail-page {
  padding: 20px 0;
  
  .breadcrumb {
    margin-bottom: 20px;
  }
  
  .detail-content {
    display: grid;
    grid-template-columns: 500px 1fr;
    gap: 40px;
    background: #fff;
    border-radius: $radius;
    padding: 30px;
    margin-bottom: 20px;
  }
  
  .gallery-section {
    .main-image {
      width: 100%;
      padding-top: 100%;
      position: relative;
      border-radius: $radius;
      overflow: hidden;
      margin-bottom: 16px;
      
      img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .thumbnails {
      display: flex;
      gap: 12px;
      
      .thumbnail {
        width: 80px;
        height: 80px;
        border-radius: 4px;
        overflow: hidden;
        cursor: pointer;
        border: 2px solid transparent;
        transition: all 0.2s;
        
        &.active {
          border-color: $primary-color;
        }
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
  }
  
  .info-section {
    .flower-name {
      font-size: 28px;
      font-weight: 500;
      margin-bottom: 12px;
      color: $text-primary;
    }
    
    .flower-tags {
      margin-bottom: 20px;
      display: flex;
      gap: 8px;
    }
    
    .price-section {
      background: linear-gradient(135deg, #fff5f7 0%, #fff0f3 100%);
      padding: 20px;
      border-radius: $radius;
      margin-bottom: 20px;
      display: flex;
      align-items: baseline;
      gap: 16px;
      
      .current-price {
        font-size: 36px;
        font-weight: bold;
        color: $primary-color;
      }
      
      .original-price {
        font-size: 18px;
        color: $text-light;
        text-decoration: line-through;
      }
      
      .discount {
        background: $primary-color;
        color: #fff;
        padding: 4px 12px;
        border-radius: 4px;
        font-size: 14px;
      }
    }
    
    .info-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      font-size: 14px;
      
      .label {
        color: $text-light;
      }
      
      .value {
        color: $text-primary;
      }
    }
    
    .spec-section, .quantity-section {
      margin-bottom: 24px;
      
      .section-label {
        font-size: 15px;
        font-weight: 500;
        margin-bottom: 12px;
        color: $text-primary;
      }
      
      .spec-options {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        
        .spec-option {
          padding: 12px 20px;
          border: 2px solid $border-color;
          border-radius: $radius;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          
          &:hover {
            border-color: $primary-light;
          }
          
          &.active {
            border-color: $primary-color;
            background: $primary-color + '10';
          }
          
          .spec-name {
            font-size: 14px;
            color: $text-primary;
          }
          
          .spec-price {
            font-size: 16px;
            font-weight: bold;
            color: $primary-color;
          }
        }
      }
      
      .stock-tip {
        margin-left: 12px;
        color: $text-light;
        font-size: 14px;
      }
    }
    
    .action-buttons {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      
      .btn-cart {
        flex: 1;
        height: 48px;
        font-size: 16px;
      }
      
      .btn-buy {
        flex: 1;
        height: 48px;
        font-size: 16px;
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
        border: none;
        color: #fff;
        
        &:hover {
          opacity: 0.9;
        }
      }
      
      .btn-wishlist {
        height: 48px;
        min-width: 120px;
        font-size: 16px;
      }
    }
    
    .delivery-info {
      display: flex;
      gap: 24px;
      padding-top: 20px;
      border-top: 1px solid $border-color;
      
      .info-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        color: $text-secondary;
      }
    }
  }
  
  .detail-tabs {
    background: #fff;
    border-radius: $radius;
    padding: 20px;
    
    :deep(.el-tabs__header) {
      margin: 0 0 20px 0;
    }
    
    .tab-content {
      .tab-title {
        font-size: 18px;
        font-weight: 500;
        margin: 20px 0 12px 0;
        color: $text-primary;
        
        &:first-child {
          margin-top: 0;
        }
      }
      
      .tab-text {
        font-size: 15px;
        line-height: 1.8;
        color: $text-secondary;
      }
      
      .meaning-box {
        background: linear-gradient(135deg, #fff5f7 0%, #fff0f3 100%);
        padding: 20px;
        border-radius: $radius;
        border-left: 4px solid $primary-color;
      }
      
      .product-gallery {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        margin-top: 16px;
        
        img {
          width: 100%;
          border-radius: $radius;
        }
      }
      
      .reviews-header {
        margin-bottom: 20px;
        
        .reviews-summary {
          display: flex;
          align-items: center;
          gap: 12px;
          
          .rating-score {
            font-size: 32px;
            font-weight: bold;
            color: $primary-color;
          }
          
          .reviews-count {
            color: $text-light;
            font-size: 14px;
          }
        }
      }
      
      .reviews-list {
        .review-item {
          padding: 20px 0;
          border-bottom: 1px solid $border-color;
          
          &:last-child {
            border-bottom: none;
          }
          
          .review-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
            
            .reviewer-info {
              flex: 1;
              display: flex;
              flex-direction: column;
              gap: 4px;
              
              .reviewer-name {
                font-size: 14px;
                color: $text-primary;
              }
            }
            
            .review-time {
              font-size: 13px;
              color: $text-light;
            }
          }
          
          .review-content {
            font-size: 14px;
            line-height: 1.6;
            color: $text-secondary;
            margin-bottom: 12px;
          }
          
          .review-images {
            display: flex;
            gap: 8px;
            margin-bottom: 12px;
            
            img {
              width: 80px;
              height: 80px;
              border-radius: 4px;
              object-fit: cover;
              cursor: pointer;
            }
          }
          
          .review-spec {
            font-size: 13px;
            color: $text-light;
          }
        }
      }
    }
  }
}

@media (max-width: 1024px) {
  .detail-page {
    .detail-content {
      grid-template-columns: 1fr;
    }
  }
}
</style>
