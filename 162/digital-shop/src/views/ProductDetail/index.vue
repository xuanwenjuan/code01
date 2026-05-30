<template>
  <div class="product-detail-page">
    <div class="container">
      <Loading :loading="loading">
        <template v-if="product">
          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: '/products' }">全部商品</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: '/products', query: { categoryId: product.categoryId } }">{{ product.categoryName }}</el-breadcrumb-item>
            <el-breadcrumb-item>{{ product.name }}</el-breadcrumb-item>
          </el-breadcrumb>

          <div class="white-card">
            <div class="product-header">
              <div class="product-gallery">
                <div class="main-image">
                  <img :src="currentImage" :alt="product.name" />
                </div>
                <div class="thumb-list">
                  <div
                    v-for="(img, index) in product.images"
                    :key="index"
                    class="thumb-item"
                    :class="{ active: currentImage === img }"
                    @click="currentImage = img"
                  >
                    <img :src="img" :alt="'缩略图' + (index + 1)" />
                  </div>
                </div>
              </div>

              <div class="product-info">
                <h1 class="product-title">{{ product.name }}</h1>
                <div class="product-tags">
                  <span class="tag new" v-if="product.isNew">新品</span>
                  <span class="tag hot" v-if="product.isHot">热卖</span>
                  <span class="sales">已售 {{ product.sales }} 件</span>
                  <span class="comment-count">{{ productReviews.length }} 条评价</span>
                </div>
                <div class="product-price-box">
                  <div class="price-row">
                    <span class="price-label">促销价</span>
                    <span class="current-price">{{ formatPrice(product.price) }}</span>
                    <span class="original-price">{{ formatPrice(product.originalPrice) }}</span>
                    <span class="discount" v-if="product.originalPrice > product.price">
                      {{ ((product.price / product.originalPrice) * 10).toFixed(1) }}折
                    </span>
                  </div>
                </div>
                <div class="product-attrs">
                  <div class="attr-row">
                    <span class="attr-label">品牌</span>
                    <span class="attr-value">{{ product.brandName }}</span>
                  </div>
                  <div class="attr-row">
                    <span class="attr-label">版本</span>
                    <div class="version-list">
                      <span
                        v-for="version in product.versions"
                        :key="version"
                        class="version-item"
                        :class="{ active: selectedVersion === version }"
                        @click="selectedVersion = version"
                      >{{ version }}</span>
                    </div>
                  </div>
                  <div class="attr-row">
                    <span class="attr-label">数量</span>
                    <div class="quantity-wrapper">
                      <el-input-number v-model="quantity" :min="1" :max="99" size="default" />
                      <span class="stock-info">库存充足</span>
                    </div>
                  </div>
                </div>
                <div class="action-buttons">
                  <el-button type="primary" size="large" @click="handleAddToCart">
                    <el-icon><ShoppingCart /></el-icon>
                    加入购物车
                  </el-button>
                  <el-button size="large" @click="handleFavorite">
                    <el-icon>
                      <Star :color="isFavorited ? '#f56c6c' : ''" :fill="isFavorited ? '#f56c6c' : ''" />
                    </el-icon>
                    {{ isFavorited ? '已收藏' : '收藏商品' }}
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <div class="white-card">
            <el-tabs v-model="activeTab">
              <el-tab-pane label="商品详情" name="detail">
                <div class="detail-content">
                  <h3 class="section-title">商品描述</h3>
                  <p class="description">{{ product.description }}</p>
                  <h3 class="section-title">商品参数</h3>
                  <el-table :data="product.params" border>
                    <el-table-column prop="name" label="参数名称" width="200" />
                    <el-table-column prop="value" label="参数值" />
                  </el-table>
                </div>
              </el-tab-pane>
              <el-tab-pane label="用户评价" name="reviews">
                <div class="reviews-content">
                  <div class="review-item" v-for="review in productReviews" :key="review.id">
                    <div class="review-header">
                      <img :src="review.avatar" class="avatar" />
                      <div class="user-info">
                        <span class="user-name">{{ review.userName }}</span>
                        <el-rate v-model="review.rating" disabled size="small" />
                      </div>
                      <span class="review-time">{{ formatDate(review.createTime) }}</span>
                    </div>
                    <p class="review-content">{{ review.content }}</p>
                  </div>
                  <Empty v-if="productReviews.length === 0" description="暂无评价" />
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>

          <div class="white-card" v-if="relatedProducts.length > 0">
            <h3 class="section-title">猜你喜欢</h3>
            <div class="product-grid">
              <ProductCard v-for="p in relatedProducts" :key="p.id" :product="p" />
            </div>
          </div>
        </template>
        <Empty v-else description="商品不存在或已下架" show-action action-text="返回商品列表" @action="$router.push('/products')" />
      </Loading>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ShoppingCart, Star } from '@element-plus/icons-vue'
import Loading from '@/components/Loading.vue'
import Empty from '@/components/Empty.vue'
import ProductCard from '@/components/ProductCard.vue'
import { useProductStore } from '@/stores/product'
import { useCartStore } from '@/stores/cart'
import { useFavoriteStore } from '@/stores/favorite'
import { useHistoryStore } from '@/stores/history'
import { formatPrice, formatDate } from '@/utils'

const route = useRoute()
const productStore = useProductStore()
const cartStore = useCartStore()
const favoriteStore = useFavoriteStore()
const historyStore = useHistoryStore()

const loading = ref(true)
const product = ref(null)
const currentImage = ref('')
const selectedVersion = ref('')
const quantity = ref(1)
const activeTab = ref('detail')

const isFavorited = computed(() => {
  return product.value ? favoriteStore.isFavorited(product.value.id) : false
})

const productReviews = computed(() => {
  return product.value ? productStore.getReviewsByProductId(product.value.id) : []
})

const relatedProducts = computed(() => {
  return product.value ? productStore.getRelatedProducts(product.value.id, product.value.categoryId) : []
})

onMounted(() => {
  setTimeout(() => {
    const id = route.params.id
    product.value = productStore.getProductById(id)
    if (product.value) {
      currentImage.value = product.value.images[0]
      selectedVersion.value = product.value.versions[0]
      historyStore.addHistory(product.value)
    }
    loading.value = false
  }, 300)
})

function handleAddToCart() {
  cartStore.addToCart(product.value, selectedVersion.value, quantity.value)
  ElMessage.success('已加入购物车')
}

function handleFavorite() {
  const result = favoriteStore.toggleFavorite(product.value)
  ElMessage.success(result ? '收藏成功' : '已取消收藏')
}
</script>

<style scoped lang="scss">
.product-detail-page {
  padding: 20px 0;

  .breadcrumb {
    margin-bottom: 20px;
  }
}

.product-header {
  display: flex;
  gap: 30px;
}

.product-gallery {
  width: 400px;
  flex-shrink: 0;

  .main-image {
    width: 400px;
    height: 400px;
    overflow: hidden;
    border-radius: 8px;
    margin-bottom: 15px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .thumb-list {
    display: flex;
    gap: 10px;

    .thumb-item {
      width: 70px;
      height: 70px;
      border: 2px solid transparent;
      border-radius: 4px;
      overflow: hidden;
      cursor: pointer;

      &.active {
        border-color: #409eff;
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
  flex: 1;

  .product-title {
    font-size: 24px;
    color: #333;
    margin-bottom: 15px;
  }

  .product-tags {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 20px;

    .tag {
      padding: 3px 10px;
      border-radius: 4px;
      font-size: 12px;
      color: #fff;

      &.new {
        background: #67c23a;
      }
      &.hot {
        background: #f56c6c;
      }
    }

    .sales, .comment-count {
      font-size: 14px;
      color: #999;
    }
  }

  .product-price-box {
    background: #fff5f5;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    border-left: 3px solid #ff4d4f;

    .price-row {
      display: flex;
      align-items: baseline;
      gap: 10px;

      .price-label {
        font-size: 14px;
        color: #666;
      }

      .current-price {
        font-size: 36px;
        font-weight: bold;
        color: #ff4d4f;
      }

      .original-price {
        font-size: 16px;
        color: #999;
        text-decoration: line-through;
      }

      .discount {
        padding: 2px 8px;
        background: #ff4d4f;
        color: #fff;
        font-size: 12px;
        border-radius: 4px;
      }
    }
  }

  .product-attrs {
    .attr-row {
      display: flex;
      align-items: center;
      margin-bottom: 20px;

      .attr-label {
        width: 80px;
        color: #999;
        font-size: 14px;
        flex-shrink: 0;
      }

      .attr-value {
        color: #333;
        font-size: 14px;
      }

      .version-list {
        display: flex;
        gap: 10px;

        .version-item {
          padding: 8px 20px;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;

          &:hover, &.active {
            border-color: #409eff;
            color: #409eff;
          }

          &.active {
            background: #ecf5ff;
          }
        }
      }

      .quantity-wrapper {
        display: flex;
        align-items: center;
        gap: 15px;

        .stock-info {
          font-size: 14px;
          color: #67c23a;
        }
      }
    }
  }

  .action-buttons {
    display: flex;
    gap: 20px;
    margin-bottom: 25px;

    .el-button {
      padding: 12px 40px;
      font-size: 16px;
    }
  }
}

.detail-content {
  padding: 20px 0;

  .section-title {
    font-size: 18px;
    color: #333;
    margin: 25px 0 15px;
    padding-left: 12px;
    border-left: 4px solid #409eff;
    font-weight: normal;

    &:first-child {
      margin-top: 0;
    }
  }

  .description {
    color: #666;
    line-height: 2;
    padding: 0 12px;
  }
}

.reviews-content {
  padding: 20px 0;

  .review-item {
    padding: 20px 0;
    border-bottom: 1px solid #eee;

    .review-header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 10px;

      .avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
      }

      .user-info {
        flex: 1;

        .user-name {
          display: block;
          color: #333;
          font-size: 14px;
          margin-bottom: 5px;
        }
      }

      .review-time {
        color: #999;
        font-size: 12px;
      }
    }

    .review-content {
      color: #666;
      line-height: 1.8;
      padding-left: 65px;
    }
  }
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
</style>
