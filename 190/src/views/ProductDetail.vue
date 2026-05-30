<template>
  <div class="product-detail-page container">
    <el-breadcrumb class="breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/category' }">全部商品</el-breadcrumb-item>
      <el-breadcrumb-item>{{ product?.categoryName }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ product?.name }}</el-breadcrumb-item>
    </el-breadcrumb>

    <LoadingState v-if="productStore.loading" />
    
    <div v-else-if="product" class="product-detail">
      <div class="product-main flex">
        <div class="product-gallery">
          <el-image :src="product.image" fit="cover" class="main-image" />
          <div class="thumb-list flex">
            <div class="thumb-item" v-for="i in 4" :key="i">
              <el-image :src="product.image" fit="cover" />
            </div>
          </div>
        </div>
        <div class="product-info">
          <h1 class="product-title">{{ product.name }}</h1>
          <div class="product-tags">
            <el-tag 
              v-for="tag in product.tags" 
              :key="tag" 
              size="small"
              effect="dark"
            >
              {{ tag }}
            </el-tag>
          </div>
          <div class="product-price">
            <span class="price-label">价格</span>
            <span class="price-current">¥{{ currentPrice.toLocaleString() }}</span>
            <span class="price-original">¥{{ originalPrice.toLocaleString() }}</span>
            <span class="price-discount">{{ discount }}折</span>
          </div>
          <div class="product-meta">
            <div class="meta-item">
              <span class="meta-label">销量</span>
              <span class="meta-value">{{ product.sales }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">评分</span>
              <span class="meta-value">
                <el-rate v-model="product.rating" disabled />
              </span>
            </div>
            <div class="meta-item">
              <span class="meta-label">库存</span>
              <span class="meta-value">{{ product.stock }}件</span>
            </div>
          </div>
          <div class="product-params-list">
            <div class="param-row">
              <span class="param-label">功率</span>
              <span class="param-value">{{ product.power }}</span>
            </div>
            <div class="param-row">
              <span class="param-label">耐用年限</span>
              <span class="param-value">{{ product.serviceLife }}</span>
            </div>
            <div class="param-row">
              <span class="param-label">防护等级</span>
              <span class="param-value highlight">{{ product.protectionLevel }}</span>
            </div>
            <div class="param-row">
              <span class="param-label">供货商</span>
              <span class="param-value">{{ product.supplier }}</span>
            </div>
          </div>
          <div class="product-scale">
            <el-icon color="#67c23a"><TrendCharts /></el-icon>
            <span class="scale-text">{{ product.applicableScale }}</span>
          </div>
          <div class="product-scenes">
            <span class="scenes-label">适用场景：</span>
            <el-tag 
              v-for="scene in product.applicableScenes" 
              :key="scene" 
              type="success" 
              size="small"
              style="margin-right: 8px; margin-bottom: 8px"
            >
              {{ scene }}
            </el-tag>
          </div>
          
          <div class="package-selector" v-if="product.packageConfig && product.packageConfig.length">
            <div class="package-title">
              <el-icon color="#409eff"><Present /></el-icon>
              <span>选择套装</span>
            </div>
            <div class="package-options">
              <div 
                v-for="(pkg, index) in product.packageConfig" 
                :key="index"
                class="package-option"
                :class="{ active: selectedPackage === index }"
                @click="selectPackage(index)"
              >
                <div class="package-name">{{ pkg.name }}</div>
                <div class="package-price">
                  <span class="pkg-price">¥{{ pkg.price.toLocaleString() }}</span>
                  <span v-if="pkg.unitPrice" class="pkg-unit">¥{{ pkg.unitPrice }}/件</span>
                </div>
                <div class="package-items">
                  <span v-for="(item, idx) in pkg.items" :key="idx">
                    {{ item }}<span v-if="idx < pkg.items.length - 1">、</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="product-quantity">
            <span class="quantity-label">采购数量</span>
            <div class="quantity-control">
              <el-input-number 
                v-model="quantity" 
                :min="1" 
                :max="product.stock"
                size="large"
              />
              <div class="quantity-tips" v-if="selectedPackage > 0">
                <el-icon color="#67c23a"><CircleCheck /></el-icon>
                批量采购更优惠
              </div>
            </div>
          </div>
          
          <div class="total-calculator">
            <div class="total-row">
              <span class="total-label">单价：</span>
              <span class="total-value">¥{{ currentPrice.toLocaleString() }}</span>
            </div>
            <div class="total-row">
              <span class="total-label">数量：</span>
              <span class="total-value">× {{ quantity }}</span>
            </div>
            <div class="total-row final">
              <span class="total-label">整套总价：</span>
              <span class="total-price">¥{{ totalPrice.toLocaleString() }}</span>
            </div>
            <div class="total-savings" v-if="totalSavings > 0">
              <el-icon color="#f56c6c"><Discount /></el-icon>
              已优惠 <span>¥{{ totalSavings.toLocaleString() }}</span>
            </div>
          </div>
          
          <div class="product-actions">
            <el-button type="primary" size="large" @click="handleAddCart">
              <el-icon><ShoppingCart /></el-icon>
              加入购物车
            </el-button>
            <el-button size="large" :type="isFavorited ? 'danger' : ''" @click="handleFavorite">
              <el-icon><StarFilled v-if="isFavorited" /><Star v-else /></el-icon>
              {{ isFavorited ? '已收藏' : '收藏' }}
            </el-button>
            <el-button type="success" size="large" @click="handleBuyNow">
              <el-icon><CreditCard /></el-icon>
              立即采购
            </el-button>
          </div>
        </div>
      </div>

      <div class="product-detail-section">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="运行参数" name="operation">
            <div class="params-grid">
              <div class="param-card" v-for="(value, key) in product.operationParams" :key="key">
                <div class="param-card-label">{{ key }}</div>
                <div class="param-card-value">{{ value }}</div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="详细参数" name="params">
            <el-table :data="paramsTableData" border style="width: 100%">
              <el-table-column prop="name" label="参数名称" width="200" />
              <el-table-column prop="value" label="参数值" />
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="商品详情" name="detail">
            <div class="detail-content">
              <p>{{ product.description }}</p>
              <h4>产品特点：</h4>
              <ul>
                <li>采用优质材料，坚固耐用</li>
                <li>设计合理，操作简便</li>
                <li>性能稳定，故障率低</li>
                <li>节能环保，降低运营成本</li>
                <li>完善的售后服务体系</li>
              </ul>
              <h4>防护等级说明：</h4>
              <p>本产品防护等级为 <strong>{{ product.protectionLevel }}</strong>，具有良好的防尘防水性能，适用于养殖场等复杂环境。</p>
              <h4>适用养殖规模：</h4>
              <p>{{ product.applicableScale }}</p>
            </div>
          </el-tab-pane>
          <el-tab-pane label="适用场景" name="scenes">
            <div class="scenes-content">
              <el-tag 
                v-for="scene in product.applicableScenes" 
                :key="scene" 
                type="success" 
                size="large"
                style="margin-right: 15px; margin-bottom: 15px"
              >
                <el-icon><Location /></el-icon>
                {{ scene }}
              </el-tag>
            </div>
          </el-tab-pane>
          <el-tab-pane label="套装配置" name="package" v-if="product.packageConfig && product.packageConfig.length">
            <el-table :data="packageTableData" border style="width: 100%">
              <el-table-column prop="name" label="套装名称" width="150" />
              <el-table-column prop="items" label="包含配置" />
              <el-table-column prop="price" label="价格" width="150">
                <template #default="{ row }">
                  <span class="table-price">¥{{ row.price.toLocaleString() }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="unitPrice" label="单价" width="150" v-if="hasUnitPrice">
                <template #default="{ row }">
                  <span v-if="row.unitPrice">¥{{ row.unitPrice.toLocaleString() }}</span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>

      <div class="related-products">
        <h3 class="section-title">相关推荐</h3>
        <div class="product-grid">
          <ProductCard 
            v-for="item in relatedProducts" 
            :key="item.id" 
            :product="item" 
          />
        </div>
      </div>
    </div>

    <EmptyState v-else type="default" text="商品不存在或已下架" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { useOrderStore } from '@/stores/order'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import ProductCard from '@/components/ProductCard.vue'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const orderStore = useOrderStore()
const userStore = useUserStore()

const product = ref(null)
const quantity = ref(1)
const activeTab = ref('operation')
const selectedPackage = ref(0)

const isFavorited = computed(() => product.value ? orderStore.isFavorite(product.value.id) : false)

const currentPrice = computed(() => {
  if (!product.value) return 0
  if (product.value.packageConfig && product.value.packageConfig[selectedPackage.value]) {
    return product.value.packageConfig[selectedPackage.value].price
  }
  return product.value.price
})

const originalPrice = computed(() => {
  if (!product.value) return 0
  return product.value.originalPrice
})

const discount = computed(() => {
  if (!product.value) return 0
  return Math.round((currentPrice.value / originalPrice.value) * 10)
})

const totalPrice = computed(() => {
  return currentPrice.value * quantity.value
})

const totalSavings = computed(() => {
  if (!product.value) return 0
  const originalTotal = originalPrice.value * quantity.value
  return originalTotal - totalPrice.value
})

const paramsTableData = computed(() => {
  if (!product.value) return []
  return Object.entries(product.value.parameters).map(([name, value]) => ({ name, value }))
})

const packageTableData = computed(() => {
  if (!product.value || !product.value.packageConfig) return []
  return product.value.packageConfig.map(pkg => ({
    ...pkg,
    items: pkg.items.join('、')
  }))
})

const hasUnitPrice = computed(() => {
  if (!product.value || !product.value.packageConfig) return false
  return product.value.packageConfig.some(pkg => pkg.unitPrice)
})

const relatedProducts = computed(() => {
  if (!product.value) return []
  return productStore.productList
    .filter(p => p.categoryId === product.value.categoryId && p.id !== product.value.id)
    .slice(0, 4)
})

function selectPackage(index) {
  selectedPackage.value = index
}

onMounted(() => {
  const id = parseInt(route.params.id)
  productStore.getProductById(id).then(res => {
    product.value = res
  })
})

function handleAddCart() {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  const cartProduct = {
    ...product.value,
    price: currentPrice.value,
    packageName: product.value.packageConfig?.[selectedPackage.value]?.name || '标准配置'
  }
  for (let i = 0; i < quantity.value; i++) {
    orderStore.addToCart(cartProduct)
  }
  ElMessage.success(`已添加 ${quantity.value} 件商品到购物车`)
}

function handleFavorite() {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  orderStore.toggleFavorite(product.value.id)
  ElMessage.success(isFavorited.value ? '已取消收藏' : '已加入收藏')
}

function handleBuyNow() {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  handleAddCart()
  router.push('/cart')
}
</script>

<style scoped>
.product-detail-page {
  padding: 20px 0 40px;
}

.breadcrumb {
  margin-bottom: 20px;
}

.product-detail {
  background: #fff;
  border-radius: 8px;
  padding: 30px;
}

.product-main {
  gap: 40px;
  margin-bottom: 40px;
}

.product-gallery {
  width: 450px;
  flex-shrink: 0;
}

.main-image {
  width: 450px;
  height: 450px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 15px;
  border: 1px solid #ebeef5;
}

.thumb-list {
  gap: 10px;
}

.thumb-item {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  border: 2px solid #ebeef5;
  cursor: pointer;
}

.thumb-item:hover {
  border-color: #409eff;
}

.product-info {
  flex: 1;
}

.product-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 15px;
  color: #303133;
}

.product-tags {
  margin-bottom: 20px;
}

.product-tags .el-tag {
  margin-right: 8px;
}

.product-price {
  background: #fff6f6;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.price-label {
  color: #606266;
  font-size: 14px;
}

.price-current {
  font-size: 32px;
  font-weight: bold;
  color: #f56c6c;
}

.price-original {
  font-size: 16px;
  color: #909399;
  text-decoration: line-through;
}

.price-discount {
  background: #f56c6c;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.product-meta {
  display: flex;
  gap: 40px;
  padding: 15px 0;
  border-top: 1px dashed #ebeef5;
  border-bottom: 1px dashed #ebeef5;
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.meta-label {
  color: #606266;
  font-size: 14px;
}

.meta-value {
  color: #303133;
  font-weight: 500;
}

.product-params-list {
  margin-bottom: 15px;
}

.param-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.param-label {
  width: 80px;
  color: #606266;
  font-size: 14px;
}

.param-value {
  color: #303133;
  font-size: 14px;
}

.param-value.highlight {
  color: #409eff;
  font-weight: 500;
}

.product-scale {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 15px;
  background: #f0f9eb;
  border-radius: 6px;
  margin-bottom: 15px;
}

.scale-text {
  color: #67c23a;
  font-size: 14px;
  font-weight: 500;
}

.product-scenes {
  margin-bottom: 20px;
}

.scenes-label {
  color: #606266;
  font-size: 14px;
}

.package-selector {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.package-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 15px;
}

.package-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.package-option {
  background: #fff;
  border: 2px solid #ebeef5;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.package-option:hover {
  border-color: #409eff;
}

.package-option.active {
  border-color: #409eff;
  background: #ecf5ff;
}

.package-option.active .package-name {
  color: #409eff;
}

.package-name {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
}

.package-price {
  margin-bottom: 8px;
}

.pkg-price {
  font-size: 18px;
  font-weight: bold;
  color: #f56c6c;
  margin-right: 10px;
}

.pkg-unit {
  font-size: 12px;
  color: #67c23a;
  background: #f0f9eb;
  padding: 2px 6px;
  border-radius: 4px;
}

.package-items {
  font-size: 12px;
  color: #606266;
  line-height: 1.6;
}

.product-quantity {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 20px;
}

.quantity-label {
  color: #606266;
  font-size: 14px;
  line-height: 40px;
}

.quantity-control {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quantity-tips {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #67c23a;
}

.total-calculator {
  background: linear-gradient(135deg, #fff6f6 0%, #fff0f0 100%);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 25px;
  border: 1px solid #ffcccc;
}

.total-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 10px;
}

.total-row.final {
  padding-top: 10px;
  border-top: 1px dashed #ffcccc;
  margin-top: 10px;
}

.total-label {
  color: #606266;
  font-size: 14px;
  margin-right: 10px;
}

.total-value {
  color: #303133;
  font-size: 16px;
}

.total-price {
  font-size: 28px;
  font-weight: bold;
  color: #f56c6c;
}

.total-savings {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #f56c6c;
}

.total-savings span {
  font-weight: bold;
}

.product-actions {
  display: flex;
  gap: 15px;
}

.product-actions .el-button {
  padding: 0 30px;
}

.product-detail-section {
  margin-bottom: 40px;
}

.params-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  padding: 20px;
}

.param-card {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.param-card-label {
  font-size: 13px;
  color: #606266;
  margin-bottom: 10px;
}

.param-card-value {
  font-size: 18px;
  font-weight: bold;
  color: #409eff;
}

.detail-content {
  padding: 20px;
  line-height: 2;
}

.detail-content h4 {
  margin: 20px 0 10px;
  color: #303133;
}

.detail-content ul {
  padding-left: 20px;
}

.detail-content strong {
  color: #409eff;
}

.scenes-content {
  padding: 20px;
}

.table-price {
  color: #f56c6c;
  font-weight: bold;
}

.related-products .product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
</style>
