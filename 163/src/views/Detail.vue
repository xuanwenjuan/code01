<template>
  <div class="detail-page" v-loading="loading">
    <div class="container">
      <div class="breadcrumb">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/list' }">配件列表</el-breadcrumb-item>
          <el-breadcrumb-item>配件详情</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div v-if="product" class="detail-content card">
        <div class="detail-main">
          <div class="product-gallery">
            <div class="main-image">
              <el-image
                :src="currentImage"
                fit="cover"
                :preview-src-list="product.images"
                :initial-index="activeImage"
              />
            </div>
            <div class="thumbnail-list">
              <div
                v-for="(img, idx) in product.images"
                :key="idx"
                class="thumbnail"
                :class="{ active: activeImage === idx }"
                @click="activeImage = idx"
              >
                <el-image :src="img" fit="cover" />
              </div>
            </div>
          </div>

          <div class="product-info">
            <h1 class="product-name">{{ product.name }}</h1>
            <div class="product-summary">
              <span class="rating">⭐ {{ product.rating }}</span>
              <span class="sales">销量 {{ formatSales(product.sales) }}</span>
              <span class="brand">品牌：{{ product.brand }}</span>
            </div>
            <div class="product-price-block">
              <div class="price-row">
                <span class="price-label">促销价</span>
                <span class="current-price">{{ formatPrice(product.price) }}</span>
                <span v-if="product.originalPrice > product.price" class="original-price">
                  {{ formatPrice(product.originalPrice) }}
                </span>
              </div>
            </div>

            <div v-if="product.specs.length > 0" class="specs-section">
              <div
                v-for="spec in product.specs"
                :key="spec.name"
                class="spec-row"
              >
                <span class="spec-label">{{ spec.name }}：</span>
                <div class="spec-options">
                  <el-tag
                    v-for="val in spec.values"
                    :key="val"
                    :type="selectedSpecs[spec.name] === val ? 'primary' : 'info'"
                    class="spec-tag"
                    @click="selectSpec(spec.name, val)"
                  >
                    {{ val }}
                  </el-tag>
                </div>
              </div>
            </div>

            <div v-if="product.specs.length > 0" class="selected-specs">
              <span class="spec-label">已选：</span>
              <span class="spec-value">{{ getSelectedSpecsText }}</span>
            </div>

            <div class="quantity-row">
              <span class="quantity-label">数量：</span>
              <el-input-number
                v-model="quantity"
                :min="1"
                :max="product.stock"
                size="large"
              />
              <span class="stock">库存 {{ product.stock }} 件</span>
              <span class="delivery-info">
                <el-icon><Van /></el-icon> 预计明天送达
              </span>
            </div>

            <div class="action-buttons">
              <el-button type="primary" size="large" @click="handleAddCart">
                <el-icon><ShoppingCart /></el-icon>
                加入购物车
              </el-button>
              <el-button size="large" @click="handleBuyNow">
                立即购买
              </el-button>
              <el-button
                :type="isFavorited ? 'danger' : 'default'"
                size="large"
                @click="handleToggleFavorite"
              >
                <el-icon>
                  <Star v-if="isFavorited" :fill="'#f56c6c'" />
                  <Star v-else />
                </el-icon>
                {{ isFavorited ? '已收藏' : '收藏' }}
              </el-button>
            </div>

            <div class="services">
              <span class="service-item">
                <el-icon><CircleCheck /></el-icon> 正品保证
              </span>
              <span class="service-item">
                <el-icon><Van /></el-icon> 极速配送
              </span>
              <span class="service-item">
                <el-icon><Refresh /></el-icon> 7天无理由退换
              </span>
            </div>
          </div>
        </div>

        <el-tabs v-model="activeTab" class="detail-tabs">
          <el-tab-pane label="商品详情" name="detail">
            <div class="tab-content">
              <h3 class="tab-title">商品描述</h3>
              <p class="description">{{ product.description }}</p>
              
              <h3 class="tab-title">规格参数</h3>
              <el-table :data="product.params" border :show-header="false">
                <el-table-column prop="label" width="150" />
                <el-table-column prop="value" />
              </el-table>
            </div>
          </el-tab-pane>

          <el-tab-pane :label="`用户评价 (${product.reviews.length})`" name="reviews">
            <div class="tab-content">
              <div v-if="product.reviews.length > 0" class="review-list">
                <div v-for="review in product.reviews" :key="review.id" class="review-item">
                  <div class="review-header">
                    <el-avatar :src="review.avatar" size="40" />
                    <div class="review-user">
                      <div class="username">{{ review.user }}</div>
                      <div class="review-rating">
                        <span v-for="i in 5" :key="i">
                          {{ i <= review.rating ? '⭐' : '☆' }}
                        </span>
                      </div>
                    </div>
                    <div class="review-time">{{ review.time }}</div>
                  </div>
                  <div class="review-content">{{ review.content }}</div>
                </div>
              </div>
              <div v-else class="empty-wrapper">
                <el-empty description="暂无评价" />
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <div v-else class="empty-wrapper">
        <el-empty description="商品不存在" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ShoppingCart, Star, CircleCheck, Van, Refresh } from '@element-plus/icons-vue'
import { products } from '@/mock/data'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { formatPrice, formatSales } from '@/utils'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()

const loading = ref(true)
const product = ref(null)
const activeImage = ref(0)
const activeTab = ref('detail')
const quantity = ref(1)
const selectedSpecs = ref({})

const currentImage = computed(() => product.value?.images?.[activeImage.value] || '')

const isFavorited = computed(() => 
  product.value ? userStore.isFavorite(product.value.id) : false
)

const getSelectedSpecsText = computed(() => {
  if (!product.value || product.value.specs.length === 0) return ''
  return product.value.specs
    .map(spec => `${spec.name}: ${selectedSpecs.value[spec.name] || '未选择'}`)
    .join('，')
})

onMounted(() => {
  const id = Number(route.params.id)
  product.value = products.find(p => p.id === id) || null
  
  if (product.value) {
    product.value.specs.forEach(spec => {
      selectedSpecs.value[spec.name] = spec.values[0]
    })
    
    if (userStore.isLoggedIn) {
      userStore.addHistory(product.value)
    }
  }
  
  setTimeout(() => {
    loading.value = false
  }, 300)
})

const selectSpec = (name, value) => {
  selectedSpecs.value[name] = value
}

const handleAddCart = () => {
  cartStore.addToCart(product.value, quantity.value, { ...selectedSpecs.value })
  ElMessage.success('已加入购物车')
}

const handleBuyNow = () => {
  cartStore.addToCart(product.value, quantity.value, { ...selectedSpecs.value })
  router.push('/cart')
}

const handleToggleFavorite = () => {
  if (userStore.isLoggedIn) {
    const result = userStore.toggleFavorite(product.value)
    ElMessage.success(result ? '已收藏' : '已取消收藏')
  } else {
    ElMessage.warning('请先登录')
    router.push('/login')
  }
}
</script>

<style lang="scss" scoped>
.detail-page {
  padding: 24px 0 48px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 140px);
}

.breadcrumb {
  margin-bottom: 20px;
  
  :deep(.el-breadcrumb__inner) {
    font-size: 14px;
  }
  
  :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
    color: #409eff;
    font-weight: 500;
  }
}

.detail-content {
  padding: 24px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.detail-main {
  display: flex;
  gap: 40px;
  margin-bottom: 32px;
}

.product-gallery {
  width: 450px;
  flex-shrink: 0;
}

.main-image {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
  border: 1px solid #e4e7ed;
  background-color: #f5f7fa;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.thumbnail-list {
  display: flex;
  gap: 12px;
}

.thumbnail {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  background-color: #f5f7fa;

  &.active {
    border-color: #409eff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  }

  &:hover {
    transform: translateY(-2px);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 22px;
  color: #303133;
  margin: 0 0 16px 0;
  line-height: 1.5;
  font-weight: 600;
}

.product-summary {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
  font-size: 14px;
  color: #606266;

  .rating {
    color: #f56c6c;
    font-weight: 500;
  }
  
  .sales {
    color: #606266;
  }
  
  .brand {
    color: #606266;
  }
}

.product-price-block {
  background: linear-gradient(135deg, #fff7f7 0%, #fff0f0 100%);
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 24px;
  border: 1px solid #fde2e2;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 12px;

  .price-label {
    font-size: 14px;
    color: #909399;
  }

  .current-price {
    font-size: 36px;
    color: #f56c6c;
    font-weight: 700;
  }

  .original-price {
    font-size: 16px;
    color: #c0c4cc;
    text-decoration: line-through;
  }
}

.specs-section {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #fafafa;
  border-radius: 8px;
}

.spec-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.spec-label {
  width: 80px;
  flex-shrink: 0;
  color: #606266;
  padding-top: 6px;
  font-weight: 500;
  font-size: 14px;
}

.spec-options {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.spec-tag {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 4px;
  padding: 0 14px;
  height: 32px;
  line-height: 30px;
  font-size: 13px;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  }
}

.selected-specs {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px 16px;
  background-color: #ecf5ff;
  border-radius: 6px;
  border-left: 3px solid #409eff;
  
  .spec-label {
    padding-top: 0;
    width: auto;
    margin-right: 8px;
    color: #409eff;
    font-weight: 600;
  }
  
  .spec-value {
    color: #303133;
    font-size: 14px;
  }
}

.quantity-row {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
  padding: 16px 0;
  border-top: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;

  .quantity-label {
    color: #606266;
    font-weight: 500;
    font-size: 14px;
  }

  .stock {
    color: #909399;
    font-size: 14px;
  }
  
  .delivery-info {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #67c23a;
    font-size: 14px;
    
    .el-icon {
      font-size: 16px;
    }
  }
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;

  .el-button {
    flex: 1;
    height: 48px;
    font-size: 16px;
    font-weight: 500;
    border-radius: 6px;
  }
}

.services {
  display: flex;
  gap: 28px;
  font-size: 14px;
  color: #606266;
  padding-top: 16px;
  border-top: 1px dashed #e4e7ed;

  .service-item {
    display: flex;
    align-items: center;
    gap: 6px;

    .el-icon {
      color: #67c23a;
      font-size: 16px;
    }
  }
}

.detail-tabs {
  border-top: 1px solid #ebeef5;
  padding-top: 20px;
  
  :deep(.el-tabs__nav-wrap::after) {
    background-color: #ebeef5;
  }
  
  :deep(.el-tabs__item) {
    font-size: 15px;
    font-weight: 500;
    height: 50px;
    line-height: 50px;
  }
  
  :deep(.el-tabs__active-bar) {
    background-color: #409eff;
  }
}

.tab-content {
  padding: 24px 0;
}

.tab-title {
  font-size: 16px;
  color: #303133;
  margin: 28px 0 16px 0;
  font-weight: 600;
  padding-left: 12px;
  border-left: 3px solid #409eff;

  &:first-child {
    margin-top: 0;
  }
}

.description {
  color: #606266;
  line-height: 1.8;
  font-size: 14px;
  padding: 0 12px;
}

.review-list {
  .review-item {
    padding: 20px 0;
    border-bottom: 1px solid #f0f2f5;

    &:last-child {
      border-bottom: none;
    }
  }

  .review-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  .review-user {
    flex: 1;

    .username {
      font-weight: 600;
      color: #303133;
      margin-bottom: 4px;
      font-size: 14px;
    }

    .review-rating {
      font-size: 12px;
    }
  }

  .review-time {
    color: #909399;
    font-size: 12px;
  }

  .review-content {
    color: #606266;
    line-height: 1.6;
    padding-left: 52px;
    font-size: 14px;
  }
}

.empty-wrapper {
  background-color: #fff;
  border-radius: 8px;
  padding: 60px 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

@media (max-width: 768px) {
  .detail-page {
    padding: 16px 0 32px;
  }

  .detail-content {
    padding: 16px;
  }

  .detail-main {
    flex-direction: column;
    gap: 24px;
  }

  .product-gallery {
    width: 100%;
  }

  .thumbnail {
    width: 60px;
    height: 60px;
  }

  .product-name {
    font-size: 18px;
  }

  .product-price-block {
    padding: 16px;
  }

  .current-price {
    font-size: 28px !important;
  }

  .specs-section {
    padding: 16px;
  }

  .action-buttons {
    flex-wrap: wrap;
  }

  .action-buttons .el-button {
    flex: 1 1 calc(50% - 6px);
  }

  .services {
    flex-wrap: wrap;
    gap: 16px;
  }
}
</style>
