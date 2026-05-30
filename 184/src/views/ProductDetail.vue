<template>
  <div class="product-detail-page">
    <div class="container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/products' }">商品中心</el-breadcrumb-item>
        <el-breadcrumb-item>{{ product?.name }}</el-breadcrumb-item>
      </el-breadcrumb>
      
      <div v-if="loading" class="loading-wrapper">
        <LoadingState text="商品加载中..." />
      </div>
      <div v-else-if="!product" class="empty-wrapper">
        <EmptyState 
          description="商品不存在或已下架" 
          show-action
          action-text="返回列表"
          @action="router.push('/products')"
        />
      </div>
      <div v-else class="detail-content">
        <div class="product-main card-shadow">
          <div class="product-gallery">
            <div class="main-image">
              <img :src="product.image" :alt="product.name" />
              <div class="image-tags">
                <el-tag v-if="product.isHot" type="danger" effect="dark">热销</el-tag>
                <el-tag v-if="product.isNew" type="success" effect="dark">新品</el-tag>
                <el-tag v-if="product.discount" type="warning" effect="dark">特惠</el-tag>
              </div>
            </div>
            <div class="thumb-list">
              <div 
                v-for="(thumb, index) in product.images || [product.image]" 
                :key="index"
                class="thumb-item"
                :class="{ active: activeImageIndex === index }"
                @click="activeImageIndex = index"
              >
                <img :src="thumb" :alt="`${product.name} ${index + 1}`" />
              </div>
            </div>
          </div>
          
          <div class="product-info">
            <div class="product-header">
              <h1 class="product-name">{{ product.name }}</h1>
              <div class="product-badges">
                <el-tag v-if="product.freeShipping" type="success" effect="plain">包邮</el-tag>
                <el-tag v-if="product.codAvailable" type="primary" effect="plain">货到付款</el-tag>
              </div>
              <div class="product-meta">
                <span class="meta-item">
                  <el-rate :model-value="product.rating" disabled size="small" />
                  <span class="rating-text">{{ product.rating }} 分</span>
                </span>
                <span class="meta-item">
                  <el-icon><ShoppingCart /></el-icon>
                  已售 {{ product.sales }} 件
                </span>
                <span class="meta-item">
                  <el-icon><ChatDotRound /></el-icon>
                  {{ product.commentCount || 0 }} 条评价
                </span>
              </div>
            </div>
            
            <div class="product-price-section">
              <div class="price-row">
                <span class="price-label">促销价</span>
                <span class="current-price">¥{{ currentPrice }}</span>
                <span class="original-price" v-if="product.originalPrice">¥{{ product.originalPrice }}</span>
                <el-tag type="danger" effect="dark" v-if="product.originalPrice">
                  省¥{{ product.originalPrice - currentPrice }}
                </el-tag>
              </div>
              <div class="total-row" v-if="quantity > 1">
                <span class="total-label">合计</span>
                <span class="total-price">¥{{ totalPrice.toFixed(2) }}</span>
                <span class="total-quantity">(共 {{ quantity }} 件)</span>
              </div>
            </div>
            
            <div class="product-desc">
              {{ product.description }}
            </div>
            
            <div class="spec-section">
              <div class="spec-label">
                <span>规格选择</span>
                <span class="selected-spec" v-if="selectedSpec">已选：{{ selectedSpec.name }}</span>
              </div>
              <div class="spec-cards">
                <div 
                  v-for="spec in product.specs" 
                  :key="spec.id"
                  class="spec-card"
                  :class="{ 
                    active: selectedSpecId === spec.id,
                    disabled: spec.stock === 0,
                    low-stock: spec.stock > 0 && spec.stock < 50
                  }"
                  @click="selectSpec(spec)"
                >
                  <div class="spec-card-content">
                    <div class="spec-name">{{ spec.name }}</div>
                    <div class="spec-price">¥{{ spec.price }}</div>
                  </div>
                  <div class="spec-stock">
                    <el-tag v-if="spec.stock === 0" type="info" effect="plain">暂时缺货</el-tag>
                    <el-tag v-else-if="spec.stock < 50" type="warning" effect="plain">仅剩{{ spec.stock }}件</el-tag>
                    <span v-else>库存充足</span>
                  </div>
                  <div class="spec-check" v-if="selectedSpecId === spec.id">
                    <el-icon color="#fff"><Check /></el-icon>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="quantity-section">
              <div class="spec-label">购买数量</div>
              <div class="quantity-control">
                <div class="quantity-buttons">
                  <button 
                    class="qty-btn" 
                    :disabled="quantity <= 1"
                    @click="decreaseQuantity"
                  >
                    <el-icon><Minus /></el-icon>
                  </button>
                  <input 
                    type="number" 
                    v-model.number="quantity" 
                    class="qty-input"
                    :min="1"
                    :max="maxQuantity"
                    @change="validateQuantity"
                  />
                  <button 
                    class="qty-btn" 
                    :disabled="quantity >= maxQuantity"
                    @click="increaseQuantity"
                  >
                    <el-icon><Plus /></el-icon>
                  </button>
                </div>
                <div class="quick-quantity">
                  <span class="quick-label">快速选择：</span>
                  <el-tag 
                    v-for="num in quickQuantities" 
                    :key="num"
                    class="quick-tag"
                    :class="{ active: quantity === num }"
                    :disabled="num > maxQuantity"
                    @click="num <= maxQuantity && (quantity = num)"
                  >
                    {{ num }}件
                  </el-tag>
                </div>
              </div>
            </div>
            
            <div class="action-section">
              <el-button 
                type="primary" 
                size="large" 
                class="action-btn"
                :disabled="!selectedSpec || selectedSpec.stock === 0"
                @click="handleAddToCart"
              >
                <el-icon><ShoppingCart /></el-icon>
                加入购物车
              </el-button>
              <el-button 
                type="danger" 
                size="large" 
                class="action-btn buy-now"
                :disabled="!selectedSpec || selectedSpec.stock === 0"
                @click="handleBuyNow"
              >
                <el-icon><CreditCard /></el-icon>
                立即购买
              </el-button>
              <el-button 
                :type="isFavorited ? 'danger' : 'default'"
                size="large"
                class="favorite-btn"
                @click="handleToggleFavorite"
              >
                <el-icon><Star :fill="isFavorited ? '#f56c6c' : 'none'" /></el-icon>
                {{ isFavorited ? '已收藏' : '收藏' }}
              </el-button>
            </div>
            
            <div class="service-info">
              <div class="service-title">服务保障</div>
              <div class="service-items">
                <span class="service-item">
                  <el-icon color="#67c23a"><CircleCheck /></el-icon>
                  正品保障
                </span>
                <span class="service-item">
                  <el-icon color="#67c23a"><CircleCheck /></el-icon>
                  七天无理由
                </span>
                <span class="service-item">
                  <el-icon color="#67c23a"><CircleCheck /></el-icon>
                  极速发货
                </span>
                <span class="service-item">
                  <el-icon color="#67c23a"><CircleCheck /></el-icon>
                  售后无忧
                </span>
                <span class="service-item">
                  <el-icon color="#67c23a"><CircleCheck /></el-icon>
                  运费险
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="product-detail-tabs card-shadow">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="商品参数" name="params">
              <div class="params-content">
                <h3>基本信息</h3>
                <el-descriptions :column="2" border class="params-table">
                  <el-descriptions-item
                    v-for="param in product.parameters"
                    :key="param.label"
                    :label="param.label"
                  >
                    {{ param.value }}
                  </el-descriptions-item>
                </el-descriptions>
                
                <h3 v-if="product.specs.length > 1" class="spec-compare-title">规格对比</h3>
                <el-table 
                  v-if="product.specs.length > 1"
                  :data="product.specs" 
                  border 
                  class="spec-compare-table"
                >
                  <el-table-column prop="name" label="规格名称" width="150" />
                  <el-table-column prop="price" label="价格" width="120">
                    <template #default="scope">
                      <span class="compare-price">¥{{ scope.row.price }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="stock" label="库存" width="100">
                    <template #default="scope">
                      <el-tag v-if="scope.row.stock === 0" type="info">缺货</el-tag>
                      <el-tag v-else-if="scope.row.stock < 50" type="warning">{{ scope.row.stock }}件</el-tag>
                      <span v-else>{{ scope.row.stock }}件</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="capacity" label="容量" />
                  <el-table-column label="操作" width="120">
                    <template #default="scope">
                      <el-button 
                        type="primary" 
                        size="small" 
                        link
                        :disabled="scope.row.stock === 0"
                        @click="selectSpec(scope.row)"
                      >
                        选择此规格
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="适用模型" name="models">
              <div class="models-content">
                <h3>适用模型类型</h3>
                <div class="models-list">
                  <div 
                    v-for="model in product.suitableModels" 
                    :key="model"
                    class="model-tag"
                  >
                    <el-icon color="#409eff"><Cpu /></el-icon>
                    <span>{{ model }}</span>
                  </div>
                </div>
                
                <div class="models-detail" v-if="product.modelDetails">
                  <h3>详细适配说明</h3>
                  <el-table :data="product.modelDetails" border>
                    <el-table-column prop="type" label="模型类型" width="150" />
                    <el-table-column prop="scale" label="适用比例" width="120" />
                    <el-table-column prop="effect" label="推荐效果" />
                    <el-table-column prop="difficulty" label="操作难度" width="100">
                      <template #default="scope">
                        <el-tag :type="getDifficultyType(scope.row.difficulty)">
                          {{ scope.row.difficulty }}
                        </el-tag>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
                
                <div class="models-tips">
                  <el-alert 
                    title="温馨提示" 
                    type="info" 
                    :closable="false"
                    description="以上为推荐适用范围，具体使用效果可能因个人技术和操作环境有所差异。建议先在不显眼处测试后再大面积使用。如对产品使用有任何疑问，可联系在线客服获取专业指导。"
                  />
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="使用说明" name="usage">
              <div class="usage-content">
                <div class="usage-section">
                  <h3><el-icon color="#409eff"><Reading /></el-icon> 使用方法</h3>
                  <ol class="usage-steps">
                    <li v-for="(step, index) in product.usageSteps || defaultUsageSteps" :key="index">
                      <span class="step-number">{{ index + 1 }}</span>
                      <span class="step-content">{{ step }}</span>
                    </li>
                  </ol>
                </div>
                
                <div class="usage-section">
                  <h3><el-icon color="#e6a23c"><Warning /></el-icon> 注意事项</h3>
                  <ul class="notice-list">
                    <li v-for="(notice, index) in product.notices || defaultNotices" :key="index">
                      <el-icon color="#f56c6c"><BellFilled /></el-icon>
                      {{ notice }}
                    </li>
                  </ul>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="用户评价" name="comments">
              <div class="comments-content">
                <div class="comments-summary">
                  <div class="rating-overview">
                    <div class="rating-score">{{ product.rating }}</div>
                    <div class="rating-detail">
                      <el-rate :model-value="product.rating" disabled />
                      <div class="rating-count">{{ product.commentCount || 0 }} 条评价</div>
                    </div>
                  </div>
                </div>
                
                <div class="comments-list" v-if="product.comments && product.comments.length > 0">
                  <div v-for="comment in product.comments" :key="comment.id" class="comment-item">
                    <div class="comment-header">
                      <el-avatar :size="40">{{ comment.userName.charAt(0) }}</el-avatar>
                      <div class="comment-info">
                        <div class="comment-user">{{ comment.userName }}</div>
                        <div class="comment-meta">
                          <el-rate :model-value="comment.rating" disabled size="small" />
                          <span class="comment-date">{{ comment.date }}</span>
                          <el-tag size="small" type="info">{{ comment.spec }}</el-tag>
                        </div>
                      </div>
                    </div>
                    <div class="comment-content">{{ comment.content }}</div>
                    <div class="comment-images" v-if="comment.images && comment.images.length > 0">
                      <img v-for="(img, idx) in comment.images" :key="idx" :src="img" alt="评价图片" />
                    </div>
                  </div>
                </div>
                <EmptyState v-else description="暂无用户评价，快来发表第一条评价吧！" />
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
        
        <div class="related-products">
          <h2 class="section-title">猜你喜欢</h2>
          <div class="product-grid">
            <ProductCard 
              v-for="item in relatedProducts" 
              :key="item.id"
              :product="item"
            />
          </div>
        </div>
      </div>
    </div>
    
    <el-dialog 
      v-model="showCartDialog" 
      title="已加入购物车" 
      width="480px"
      :close-on-click-modal="false"
    >
      <div class="cart-preview">
        <div class="cart-product">
          <img :src="product.image" :alt="product.name" />
          <div class="cart-product-info">
            <div class="cart-product-name">{{ product.name }}</div>
            <div class="cart-product-spec">{{ selectedSpec?.name }}</div>
            <div class="cart-product-price">
              <span class="price">¥{{ currentPrice }}</span>
              <span class="quantity">x {{ quantity }}</span>
            </div>
          </div>
        </div>
        <div class="cart-total">
          <span>合计：</span>
          <span class="total-price">¥{{ totalPrice.toFixed(2) }}</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="showCartDialog = false">继续购物</el-button>
        <el-button type="primary" @click="goToCart">去购物车结算</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { useCartStore } from '@/stores/cart'
import { useFavoriteStore } from '@/stores/favorite'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import ProductCard from '@/components/ProductCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import LoadingState from '@/components/LoadingState.vue'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const cartStore = useCartStore()
const favoriteStore = useFavoriteStore()
const userStore = useUserStore()

const loading = ref(true)
const product = ref(null)
const selectedSpecId = ref(null)
const quantity = ref(1)
const activeTab = ref('params')
const activeImageIndex = ref(0)
const showCartDialog = ref(false)

const defaultUsageSteps = [
  '使用前请将漆料充分摇匀，建议摇匀1-2分钟',
  '根据需要使用对应稀释剂稀释，建议比例参考商品参数',
  '喷涂时保持15-20cm距离，采用薄喷多层的方式',
  '每层喷涂后等待5-10分钟再喷下一层',
  '完成后建议等待24小时完全干燥后再进行组装'
]

const defaultNotices = [
  '请在通风良好的环境下使用，建议佩戴防护面具',
  '远离火源，避免高温环境存放',
  '请放置在儿童无法触及的地方',
  '如不慎接触皮肤或眼睛，请立即用大量清水冲洗'
]

const quickQuantities = [1, 3, 5, 10]

const selectedSpec = computed(() => {
  if (!product.value) return null
  return product.value.specs.find(s => s.id === selectedSpecId.value) || product.value.specs[0]
})

const currentPrice = computed(() => {
  return selectedSpec.value?.price || product.value?.price || 0
})

const totalPrice = computed(() => {
  return currentPrice.value * quantity.value
})

const maxQuantity = computed(() => {
  return selectedSpec.value?.stock || 100
})

const isFavorited = computed(() => {
  return product.value ? favoriteStore.isFavorite(product.value.id) : false
})

const relatedProducts = computed(() => {
  if (!product.value) return []
  return productStore.productList
    .filter(p => p.categoryId === product.value.categoryId && p.id !== product.value.id)
    .slice(0, 4)
})

function selectSpec(spec) {
  if (spec.stock === 0) {
    ElMessage.warning('该规格暂时缺货')
    return
  }
  selectedSpecId.value = spec.id
  if (quantity.value > spec.stock) {
    quantity.value = spec.stock
    ElMessage.info(`数量已调整为最大库存 ${spec.stock} 件`)
  }
}

function increaseQuantity() {
  if (quantity.value < maxQuantity.value) {
    quantity.value++
  }
}

function decreaseQuantity() {
  if (quantity.value > 1) {
    quantity.value--
  }
}

function validateQuantity() {
  if (quantity.value < 1) {
    quantity.value = 1
  } else if (quantity.value > maxQuantity.value) {
    quantity.value = maxQuantity.value
    ElMessage.info(`数量已调整为最大库存 ${maxQuantity.value} 件`)
  }
  quantity.value = parseInt(quantity.value) || 1
}

function handleAddToCart() {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  if (!selectedSpec.value) {
    ElMessage.warning('请选择规格')
    return
  }
  cartStore.addToCart(product.value, selectedSpec.value, quantity.value)
  showCartDialog.value = true
}

function handleBuyNow() {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  if (!selectedSpec.value) {
    ElMessage.warning('请选择规格')
    return
  }
  cartStore.addToCart(product.value, selectedSpec.value, quantity.value)
  ElMessage.success('正在为您跳转到结算页面')
}

function handleToggleFavorite() {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  const result = favoriteStore.toggleFavorite(product.value.id)
  ElMessage.success(result ? '已添加收藏' : '已取消收藏')
}

function goToCart() {
  showCartDialog.value = false
  router.push('/cart')
}

function getDifficultyType(difficulty) {
  const types = {
    '简单': 'success',
    '中等': 'warning',
    '困难': 'danger'
  }
  return types[difficulty] || 'info'
}

onMounted(async () => {
  await productStore.simulateLoading(300)
  product.value = productStore.getProductById(route.params.id)
  if (product.value && product.value.specs.length > 0) {
    const availableSpec = product.value.specs.find(s => s.stock > 0) || product.value.specs[0]
    selectedSpecId.value = availableSpec.id
  }
  loading.value = false
})
</script>

<style scoped lang="scss">
.product-detail-page {
  padding: 20px 0;
}

.breadcrumb {
  margin-bottom: 20px;
}

.product-main {
  display: flex;
  gap: 40px;
  padding: 30px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 20px;
}

.product-gallery {
  width: 400px;
  flex-shrink: 0;
  
  .main-image {
    position: relative;
    width: 400px;
    height: 400px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #f0f0f0;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    
    &:hover img {
      transform: scale(1.05);
    }
    
    .image-tags {
      position: absolute;
      top: 16px;
      left: 16px;
      display: flex;
      gap: 8px;
      z-index: 1;
    }
  }
  
  .thumb-list {
    display: flex;
    gap: 10px;
    margin-top: 16px;
    
    .thumb-item {
      width: 70px;
      height: 70px;
      border-radius: 6px;
      overflow: hidden;
      border: 2px solid transparent;
      cursor: pointer;
      transition: all 0.2s ease;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      &:hover {
        border-color: #dcdfe6;
      }
      
      &.active {
        border-color: #409eff;
      }
    }
  }
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-header {
  margin-bottom: 20px;
  
  .product-name {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
    line-height: 1.4;
  }
  
  .product-badges {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }
  
  .product-meta {
    display: flex;
    align-items: center;
    gap: 24px;
    
    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #909399;
      font-size: 13px;
      
      .rating-text {
        margin-left: 4px;
        color: #e6a23c;
      }
    }
  }
}

.product-price-section {
  background: linear-gradient(135deg, #fff5f5 0%, #fff0f0 100%);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  
  .price-row {
    display: flex;
    align-items: baseline;
    gap: 12px;
    
    .price-label {
      color: #909399;
      font-size: 14px;
    }
    
    .current-price {
      font-size: 32px;
      font-weight: bold;
      color: #f56c6c;
    }
    
    .original-price {
      font-size: 16px;
      color: #c0c4cc;
      text-decoration: line-through;
    }
  }
  
  .total-row {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px dashed #fde2e2;
    
    .total-label {
      color: #909399;
      font-size: 14px;
    }
    
    .total-price {
      font-size: 20px;
      font-weight: bold;
      color: #f56c6c;
    }
    
    .total-quantity {
      color: #909399;
      font-size: 13px;
    }
  }
}

.product-desc {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 24px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.spec-section, .quantity-section {
  margin-bottom: 20px;
  
  .spec-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 500;
    color: #303133;
    margin-bottom: 12px;
    
    .selected-spec {
      font-size: 13px;
      color: #409eff;
      font-weight: normal;
    }
  }
}

.spec-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  
  .spec-card {
    position: relative;
    padding: 16px;
    border: 2px solid #e4e7ed;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover:not(.disabled) {
      border-color: #c6e2ff;
      background: #f5faff;
    }
    
    &.active {
      border-color: #409eff;
      background: #ecf5ff;
    }
    
    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: #f5f7fa;
    }
    
    &.low-stock {
      border-color: #f5dab1;
    }
    
    .spec-card-content {
      .spec-name {
        font-weight: 500;
        color: #303133;
        margin-bottom: 4px;
      }
      
      .spec-price {
        font-size: 18px;
        font-weight: bold;
        color: #f56c6c;
      }
    }
    
    .spec-stock {
      margin-top: 8px;
      font-size: 12px;
      color: #909399;
    }
    
    .spec-check {
      position: absolute;
      top: 0;
      right: 0;
      width: 24px;
      height: 24px;
      background: #409eff;
      border-radius: 0 6px 0 6px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

.quantity-section {
  .quantity-control {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .quantity-buttons {
    display: flex;
    align-items: center;
    gap: 0;
    
    .qty-btn {
      width: 36px;
      height: 36px;
      border: 1px solid #dcdfe6;
      background: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      
      &:first-child {
        border-radius: 4px 0 0 4px;
      }
      
      &:last-child {
        border-radius: 0 4px 4px 0;
      }
      
      &:hover:not(:disabled) {
        color: #409eff;
        border-color: #c6e2ff;
        background: #f5faff;
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
    
    .qty-input {
      width: 60px;
      height: 36px;
      border: 1px solid #dcdfe6;
      border-left: none;
      border-right: none;
      text-align: center;
      font-size: 14px;
      outline: none;
      
      &:focus {
        border-color: #409eff;
      }
    }
  }
  
  .quick-quantity {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .quick-label {
      color: #909399;
      font-size: 13px;
    }
    
    .quick-tag {
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:hover:not(.is-disabled) {
        border-color: #409eff;
        color: #409eff;
      }
      
      &.active {
        background: #409eff;
        border-color: #409eff;
        color: #fff;
      }
      
      &.is-disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
}

.action-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  
  .action-btn {
    flex: 1;
    height: 48px;
    font-size: 16px;
    
    &.buy-now {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
      border: none;
    }
  }
  
  .favorite-btn {
    min-width: 100px;
    height: 48px;
  }
}

.service-info {
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
  
  .service-title {
    font-weight: 500;
    color: #303133;
    margin-bottom: 12px;
  }
  
  .service-items {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    
    .service-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #606266;
    }
  }
}

.product-detail-tabs {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  
  :deep(.el-tabs__header) {
    margin-bottom: 20px;
  }
}

.params-content, .models-content, .usage-content, .comments-content {
  padding: 10px 0;
  
  h3 {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.params-table {
  margin-bottom: 24px;
}

.spec-compare-title {
  margin-top: 24px;
}

.spec-compare-table {
  .compare-price {
    color: #f56c6c;
    font-weight: bold;
  }
}

.models-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
  
  .model-tag {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: #ecf5ff;
    border: 1px solid #d9ecff;
    border-radius: 20px;
    color: #409eff;
    font-size: 14px;
  }
}

.models-detail {
  margin-bottom: 24px;
}

.models-tips {
  margin-top: 20px;
}

.usage-content {
  .usage-section {
    margin-bottom: 30px;
  }
  
  .usage-steps {
    padding-left: 0;
    margin: 0;
    list-style: none;
    
    li {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 16px;
      padding: 12px 16px;
      background: #f5f7fa;
      border-radius: 8px;
      
      .step-number {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        background: #409eff;
        color: #fff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
      }
      
      .step-content {
        flex: 1;
        color: #606266;
        line-height: 1.6;
      }
    }
  }
  
  .notice-list {
    padding-left: 0;
    margin: 0;
    list-style: none;
    
    li {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 12px;
      color: #606266;
      line-height: 1.6;
    }
  }
}

.comments-content {
  .comments-summary {
    padding: 20px;
    background: #fafafa;
    border-radius: 8px;
    margin-bottom: 24px;
    
    .rating-overview {
      display: flex;
      align-items: center;
      gap: 24px;
      
      .rating-score {
        font-size: 48px;
        font-weight: bold;
        color: #f56c6c;
        line-height: 1;
      }
      
      .rating-detail {
        .rating-count {
          margin-top: 4px;
          color: #909399;
          font-size: 13px;
        }
      }
    }
  }
  
  .comments-list {
    .comment-item {
      padding: 20px 0;
      border-bottom: 1px solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .comment-header {
        display: flex;
        gap: 12px;
        margin-bottom: 12px;
        
        .comment-info {
          flex: 1;
          
          .comment-user {
            font-weight: 500;
            color: #303133;
            margin-bottom: 4px;
          }
          
          .comment-meta {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 13px;
            color: #909399;
          }
        }
      }
      
      .comment-content {
        color: #606266;
        line-height: 1.6;
        margin-bottom: 12px;
      }
      
      .comment-images {
        display: flex;
        gap: 8px;
        
        img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 4px;
          cursor: pointer;
          transition: transform 0.2s ease;
          
          &:hover {
            transform: scale(1.1);
          }
        }
      }
    }
  }
}

.related-products {
  .section-title {
    font-size: 20px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 20px;
  }
  
  .product-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
}

.loading-wrapper, .empty-wrapper {
  background: #fff;
  border-radius: 12px;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-preview {
  .cart-product {
    display: flex;
    gap: 16px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 8px;
    margin-bottom: 16px;
    
    img {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 6px;
    }
    
    .cart-product-info {
      flex: 1;
      
      .cart-product-name {
        font-weight: 500;
        color: #303133;
        margin-bottom: 4px;
      }
      
      .cart-product-spec {
        color: #909399;
        font-size: 13px;
        margin-bottom: 8px;
      }
      
      .cart-product-price {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .price {
          font-size: 18px;
          font-weight: bold;
          color: #f56c6c;
        }
        
        .quantity {
          color: #909399;
        }
      }
    }
  }
  
  .cart-total {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    
    .total-price {
      font-size: 24px;
      font-weight: bold;
      color: #f56c6c;
    }
  }
}

@media (max-width: 1200px) {
  .related-products .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .product-main {
    flex-direction: column;
  }
  
  .product-gallery {
    width: 100%;
    
    .main-image {
      width: 100%;
      height: 300px;
    }
  }
  
  .related-products .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .spec-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
