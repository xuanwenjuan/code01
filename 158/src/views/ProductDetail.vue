<template>
  <div class="product-detail-page" v-if="product">
    <div class="container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/list', query: { category: product.categoryId } }">
          {{ product.categoryName }}
        </el-breadcrumb-item>
        <el-breadcrumb-item>{{ product.name }}</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="detail-content">
        <div class="product-gallery">
          <div class="main-image">
            <img :src="currentImage" :alt="product.name" />
            <div class="image-nav">
              <button class="nav-btn prev" @click="prevImage">
                <el-icon><ArrowLeft /></el-icon>
              </button>
              <button class="nav-btn next" @click="nextImage">
                <el-icon><ArrowRight /></el-icon>
              </button>
            </div>
          </div>
          <div class="thumbnail-list">
            <div
              v-for="(img, index) in product.images"
              :key="index"
              class="thumbnail"
              :class="{ active: currentIndex === index }"
              @click="currentIndex = index"
            >
              <img :src="img" :alt="`缩略图${index + 1}`" />
            </div>
          </div>
        </div>

        <div class="product-info">
          <h1 class="product-name">{{ product.name }}</h1>
          <div class="product-brand">品牌：{{ product.brandName }}</div>
          
          <div class="product-price-section">
            <div class="price-row">
              <span class="price-label">促销价</span>
              <span class="current-price">¥{{ product.price }}</span>
              <span class="original-price" v-if="product.originalPrice">¥{{ product.originalPrice }}</span>
              <span class="discount-tag" v-if="product.discount">省{{ product.discount }}%</span>
            </div>
          </div>

          <div class="product-stats">
            <div class="stat-item">
              <span class="stat-value">{{ product.sales }}</span>
              <span class="stat-label">月销量</span>
            </div>
            <div class="stat-item">
              <el-rate :model-value="product.rating" disabled :size="16" />
              <span class="stat-label">{{ product.rating }}分</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ product.reviews }}</span>
              <span class="stat-label">评价</span>
            </div>
          </div>

          <div class="spec-section">
            <div class="spec-group" v-for="spec in product.specs" :key="spec.name">
              <label class="spec-label">{{ spec.name }}：</label>
              <div class="spec-options">
                <el-tag
                  v-for="option in spec.options"
                  :key="option"
                  :type="selectedSpecs[spec.name] === option ? 'danger' : 'info'"
                  effect="plain"
                  class="spec-tag"
                  @click="selectSpec(spec.name, option)"
                >
                  {{ option }}
                </el-tag>
              </div>
            </div>
          </div>

          <div class="quantity-section">
            <label class="quantity-label">数量：</label>
            <el-input-number
              v-model="quantity"
              :min="1"
              :max="product.stock"
              size="large"
            />
            <span class="stock-info">库存{{ product.stock }}件</span>
          </div>

          <div class="action-section">
            <el-button type="primary" size="large" class="add-cart-btn" @click="handleAddCart">
              <el-icon><ShoppingCart /></el-icon>
              加入购物车
            </el-button>
            <el-button type="danger" size="large" class="buy-now-btn" @click="handleBuyNow">
              立即购买
            </el-button>
            <el-button 
              :type="isFavorited ? 'danger' : 'default'" 
              size="large"
              class="favorite-btn"
              @click="handleFavorite"
            >
              <el-icon><Star :fill="isFavorited ? '#f56c6c' : 'none'" /></el-icon>
              {{ isFavorited ? '已收藏' : '收藏' }}
            </el-button>
          </div>

          <div class="service-section">
            <span class="service-item"><el-icon><CircleCheck /></el-icon> 正品保证</span>
            <span class="service-item"><el-icon><CircleCheck /></el-icon> 7天无理由</span>
            <span class="service-item"><el-icon><CircleCheck /></el-icon> 急速发货</span>
            <span class="service-item"><el-icon><CircleCheck /></el-icon> 售后无忧</span>
          </div>
        </div>
      </div>

      <div class="detail-tabs">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="商品详情" name="detail">
            <div class="tab-content">
              <div class="product-description">
                <h3>商品描述</h3>
                <p>{{ product.description }}</p>
              </div>
              <div class="product-details">
                <h3>产品详情</h3>
                <ul>
                  <li v-for="(detail, index) in product.details" :key="index">{{ detail }}</li>
                </ul>
              </div>
              <div class="product-images">
                <h3>产品展示</h3>
                <img v-for="(img, index) in product.images" :key="index" :src="img" :alt="`详情图${index + 1}`" />
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="规格参数" name="specs">
            <div class="tab-content">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="商品名称">{{ product.name }}</el-descriptions-item>
                <el-descriptions-item label="品牌">{{ product.brandName }}</el-descriptions-item>
                <el-descriptions-item label="分类">{{ product.categoryName }}</el-descriptions-item>
                <el-descriptions-item label="售价">¥{{ product.price }}</el-descriptions-item>
                <el-descriptions-item label="库存">{{ product.stock }}件</el-descriptions-item>
                <el-descriptions-item label="月销量">{{ product.sales }}</el-descriptions-item>
                <el-descriptions-item label="商品评分">{{ product.rating }}分</el-descriptions-item>
                <el-descriptions-item label="商品评价">{{ product.reviews }}条</el-descriptions-item>
              </el-descriptions>
            </div>
          </el-tab-pane>
          <el-tab-pane label="商品评价" name="reviews">
            <div class="tab-content">
              <div class="review-summary">
                <div class="rating-score">
                  <span class="score">{{ product.rating }}</span>
                  <el-rate :model-value="product.rating" disabled />
                  <span class="count">{{ product.reviews }}条评价</span>
                </div>
              </div>
              <div class="review-list">
                <div class="review-item" v-for="i in 5" :key="i">
                  <div class="review-header">
                    <el-avatar :size="32">U{{ i }}</el-avatar>
                    <span class="username">用户***{{ 1000 + i }}</span>
                    <el-rate :model-value="5" disabled :size="14" />
                    <span class="time">{{ i }}天前</span>
                  </div>
                  <div class="review-content">
                    商品质量很好，包装精美，物流也很快，非常满意的一次购物！
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, ArrowRight, ShoppingCart, Star, CircleCheck } from '@element-plus/icons-vue'
import { useProductStore } from '@/stores/product'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const cartStore = useCartStore()
const userStore = useUserStore()

const product = ref(null)
const currentIndex = ref(0)
const activeTab = ref('detail')
const quantity = ref(1)
const selectedSpecs = reactive({})

const currentImage = computed(() => product.value?.images?.[currentIndex.value] || '')
const isFavorited = computed(() => userStore.isFavorite(product.value?.id))

const prevImage = () => {
  if (!product.value) return
  currentIndex.value = currentIndex.value > 0 ? currentIndex.value - 1 : product.value.images.length - 1
}

const nextImage = () => {
  if (!product.value) return
  currentIndex.value = currentIndex.value < product.value.images.length - 1 ? currentIndex.value + 1 : 0
}

const selectSpec = (specName, option) => {
  selectedSpecs[specName] = option
}

const handleAddCart = async () => {
  const result = await cartStore.addToCart(product.value.id, quantity.value, { ...selectedSpecs })
  if (result.success) {
    ElMessage.success('已加入购物车')
  } else {
    ElMessage.error(result.message || '加入购物车失败')
  }
}

const handleBuyNow = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  await cartStore.addToCart(product.value.id, quantity.value, { ...selectedSpecs })
  router.push('/checkout')
}

const handleFavorite = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  const result = await userStore.toggleFavorite(product.value.id)
  if (result.success) {
    ElMessage.success(result.isFavorite ? '已收藏' : '已取消收藏')
  }
}

const loadProduct = () => {
  const id = route.params.id
  product.value = productStore.getProductById(id)
  if (!product.value) {
    ElMessage.error('商品不存在')
    router.push('/')
    return
  }
  product.value.specs.forEach(spec => {
    if (spec.options.length > 0) {
      selectedSpecs[spec.name] = spec.options[0]
    }
  })
}

onMounted(() => {
  loadProduct()
})

watch(() => route.params.id, () => {
  loadProduct()
})
</script>

<style lang="scss" scoped>
.product-detail-page {
  padding: 20px 0;

  .breadcrumb {
    margin-bottom: 20px;
  }

  .detail-content {
    display: grid;
    grid-template-columns: 480px 1fr;
    gap: 30px;
    background: #fff;
    padding: 30px;
    border-radius: $border-radius;
    margin-bottom: 20px;
  }

  .product-gallery {
    .main-image {
      position: relative;
      width: 100%;
      padding-top: 100%;
      background: #f8f8f8;
      border-radius: $border-radius;
      overflow: hidden;
      margin-bottom: 12px;

      img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .image-nav {
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        transform: translateY(-50%);
        display: flex;
        justify-content: space-between;
        padding: 0 10px;
        opacity: 0;
        transition: opacity 0.3s;

        .nav-btn {
          width: 36px;
          height: 36px;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 50%;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s;

          &:hover {
            background: rgba(0, 0, 0, 0.7);
          }
        }
      }

      &:hover .image-nav {
        opacity: 1;
      }
    }

    .thumbnail-list {
      display: flex;
      gap: 10px;

      .thumbnail {
        width: 80px;
        height: 80px;
        border: 2px solid transparent;
        border-radius: $border-radius;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s;

        &.active,
        &:hover {
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

  .product-info {
    .product-name {
      font-size: 24px;
      font-weight: 600;
      color: $text-primary;
      margin-bottom: 8px;
      line-height: 1.4;
    }

    .product-brand {
      font-size: 14px;
      color: $text-secondary;
      margin-bottom: 16px;
    }

    .product-price-section {
      background: linear-gradient(to right, #fff5f7, #fff);
      padding: 20px;
      border-radius: $border-radius;
      margin-bottom: 20px;

      .price-row {
        display: flex;
        align-items: baseline;
        gap: 12px;

        .price-label {
          font-size: 14px;
          color: $text-secondary;
        }

        .current-price {
          font-size: 36px;
          font-weight: bold;
          color: $primary-color;
        }

        .original-price {
          font-size: 16px;
          color: $text-secondary;
          text-decoration: line-through;
        }

        .discount-tag {
          background: $primary-color;
          color: #fff;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
      }
    }

    .product-stats {
      display: flex;
      gap: 30px;
      padding: 16px 0;
      border-top: 1px solid $border-light;
      border-bottom: 1px solid $border-light;
      margin-bottom: 20px;

      .stat-item {
        display: flex;
        align-items: center;
        gap: 6px;

        .stat-value {
          font-weight: 600;
          color: $primary-color;
        }

        .stat-label {
          color: $text-secondary;
          font-size: 13px;
        }
      }
    }

    .spec-section {
      margin-bottom: 20px;

      .spec-group {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 16px;

        .spec-label {
          min-width: 60px;
          color: $text-secondary;
          padding-top: 4px;
        }

        .spec-options {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          .spec-tag {
            cursor: pointer;
            margin: 0;
          }
        }
      }
    }

    .quantity-section {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;

      .quantity-label {
        color: $text-secondary;
      }

      .stock-info {
        color: $text-secondary;
        font-size: 13px;
      }
    }

    .action-section {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;

      .add-cart-btn,
      .buy-now-btn {
        flex: 1;
        height: 48px;
        font-size: 16px;
      }

      .add-cart-btn {
        background: $primary-color;
        border-color: $primary-color;

        &:hover {
          background: $primary-dark;
          border-color: $primary-dark;
        }
      }

      .favorite-btn {
        min-width: 120px;
      }
    }

    .service-section {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;

      .service-item {
        display: flex;
        align-items: center;
        gap: 4px;
        color: $success-color;
        font-size: 13px;
      }
    }
  }

  .detail-tabs {
    background: #fff;
    border-radius: $border-radius;
    padding: 20px;

    .tab-content {
      padding: 20px 0;

      h3 {
        font-size: 18px;
        margin-bottom: 16px;
        color: $text-primary;
      }

      .product-description {
        margin-bottom: 30px;

        p {
          color: $text-regular;
          line-height: 1.8;
        }
      }

      .product-details {
        margin-bottom: 30px;

        ul {
          li {
            padding: 8px 0;
            color: $text-regular;
            border-bottom: 1px dashed $border-light;
          }
        }
      }

      .product-images {
        img {
          max-width: 100%;
          margin-bottom: 20px;
          border-radius: $border-radius;
        }
      }

      .review-summary {
        padding: 20px;
        background: #f8f8f8;
        border-radius: $border-radius;
        margin-bottom: 20px;

        .rating-score {
          display: flex;
          align-items: center;
          gap: 12px;

          .score {
            font-size: 36px;
            font-weight: bold;
            color: $primary-color;
          }

          .count {
            color: $text-secondary;
          }
        }
      }

      .review-list {
        .review-item {
          padding: 16px 0;
          border-bottom: 1px solid $border-light;

          .review-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;

            .username {
              font-weight: 500;
            }

            .time {
              color: $text-secondary;
              font-size: 12px;
              margin-left: auto;
            }
          }

          .review-content {
            color: $text-regular;
            line-height: 1.6;
          }
        }
      }
    }
  }
}

@media (max-width: 1200px) {
  .product-detail-page {
    .detail-content {
      grid-template-columns: 1fr;
    }
  }
}
</style>
