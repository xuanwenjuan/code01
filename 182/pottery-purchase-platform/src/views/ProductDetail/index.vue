<template>
  <div class="product-detail-page container">
    <LoadingState v-if="loading" />
    <template v-else-if="product">
      <div class="breadcrumb">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: `/category/${product.categoryId}` }">
            {{ product.categoryName }}
          </el-breadcrumb-item>
          <el-breadcrumb-item>{{ product.name }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div class="card product-main">
        <div class="product-gallery">
          <div class="main-image">
            <img :src="currentImage" :alt="product.name" />
            <div v-if="product.tags && product.tags.length" class="product-tags">
              <span v-for="tag in product.tags" :key="tag" class="tag" :class="tag">
                {{ tag }}
              </span>
            </div>
          </div>
          <div class="thumbnail-list">
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
          <h1 class="product-title">{{ product.name }}</h1>
          <div class="product-summary">
            {{ product.description }}
          </div>
          <div class="product-price">
            <span class="label">价格</span>
            <span class="current-price">¥{{ selectedSku?.price || product.price }}</span>
            <span v-if="product.originalPrice" class="original-price">
              ¥{{ product.originalPrice }}
            </span>
            <span class="discount" v-if="product.originalPrice">
              {{ Math.round((1 - product.price / product.originalPrice) * 10) }}折
            </span>
          </div>
          <div class="product-stats">
            <span class="stat-item">
              销量 <strong>{{ product.sales }}</strong>
            </span>
            <span class="stat-item">
              评分 <strong>{{ product.rating }}</strong>
            </span>
            <span class="stat-item">
              评价 <strong>{{ product.reviews }}</strong>
            </span>
          </div>
          <div class="product-supplier">
            <span class="label">供应商</span>
            <span class="supplier-name">{{ product.supplierName }}</span>
          </div>

          <div class="product-specs">
            <div class="spec-section">
              <div class="spec-section-header">
                <span class="label">适用陶艺品类</span>
                <el-button type="primary" link size="small" @click="showSuitableDetail = true">
                  查看详情
                </el-button>
              </div>
              <div class="suitable-tags">
                <el-tag
                  v-for="item in product.suitableFor"
                  :key="item"
                  size="large"
                  class="suitable-tag"
                  :effect="hoveredSuitable === item ? 'dark' : 'plain'"
                  @mouseenter="hoveredSuitable = item"
                  @mouseleave="hoveredSuitable = null"
                >
                  {{ item }}
                </el-tag>
              </div>
              <div v-if="hoveredSuitable && product.suitableForDetail?.[hoveredSuitable]" class="suitable-tooltip">
                {{ product.suitableForDetail[hoveredSuitable] }}
              </div>
            </div>

            <div class="spec-section">
              <div class="spec-section-header">
                <span class="label">规格选择</span>
              </div>
              <div class="spec-options">
                <div
                  v-for="sku in product.skus"
                  :key="sku.id"
                  class="spec-card"
                  :class="{ active: selectedSku?.id === sku.id }"
                  @click="selectedSku = sku"
                >
                  <div class="spec-card-header">
                    <span class="spec-name">{{ sku.name }}</span>
                    <span class="spec-price">¥{{ sku.price }}</span>
                  </div>
                  <p class="spec-desc">{{ sku.description }}</p>
                  <p class="spec-stock">库存: {{ sku.stock }}件</p>
                </div>
              </div>
            </div>

            <div class="spec-section">
              <div class="spec-section-header">
                <span class="label">工具材质</span>
                <el-button type="primary" link size="small" @click="showMaterialDetail = true">
                  查看详情
                </el-button>
              </div>
              <div class="material-info">
                <div class="material-item">
                  <span class="material-label">主要材质:</span>
                  <span class="material-value">{{ product.materialDetail?.main || '-' }}</span>
                </div>
                <div v-if="product.materialDetail?.handle" class="material-item">
                  <span class="material-label">手柄材质:</span>
                  <span class="material-value">{{ product.materialDetail.handle }}</span>
                </div>
                <div v-if="product.materialDetail?.shell" class="material-item">
                  <span class="material-label">外壳材质:</span>
                  <span class="material-value">{{ product.materialDetail.shell }}</span>
                </div>
                <div v-if="product.materialDetail?.sensor" class="material-item">
                  <span class="material-label">传感器:</span>
                  <span class="material-value">{{ product.materialDetail.sensor }}</span>
                </div>
              </div>
            </div>

            <div class="spec-row">
              <span class="label">购买数量</span>
              <div class="quantity-selector">
                <el-input-number
                  v-model="quantity"
                  :min="1"
                  :max="selectedSku?.stock || 100"
                  size="large"
                />
              </div>
            </div>
          </div>

          <div class="product-actions">
            <el-button
              type="warning"
              size="large"
              :icon="isFavorite ? StarFilled : Star"
              @click="toggleFavorite"
            >
              {{ isFavorite ? '已收藏' : '收藏' }}
            </el-button>
            <el-button type="primary" size="large" @click="buyNow">
              立即购买
            </el-button>
            <el-button type="success" size="large">
              加入购物车
            </el-button>
          </div>
        </div>
      </div>

      <div class="card product-detail-section">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="商品详情" name="detail">
            <div class="detail-content">
              <h3>商品描述</h3>
              <p>{{ product.detail }}</p>
              
              <h3>材质说明</h3>
              <div class="material-detail-card">
                <div class="material-header">
                  <div class="material-main">
                    <span class="material-icon">🔩</span>
                    <div>
                      <p class="material-title">主要材质: {{ product.materialDetail?.main }}</p>
                      <p v-if="product.materialDetail?.handle" class="material-sub">
                        手柄: {{ product.materialDetail.handle }}
                      </p>
                    </div>
                  </div>
                </div>
                <div class="material-features">
                  <div
                    v-for="(feature, index) in product.materialDetail?.features"
                    :key="index"
                    class="feature-item"
                  >
                    <span class="feature-icon">✓</span>
                    <span>{{ feature }}</span>
                  </div>
                </div>
              </div>

              <h3>规格参数</h3>
              <table class="spec-table">
                <tr v-for="spec in product.specs" :key="spec.name">
                  <td class="spec-name">{{ spec.name }}</td>
                  <td class="spec-value">{{ spec.value }}</td>
                </tr>
              </table>

              <h3>适用场景</h3>
              <div class="suitable-grid">
                <div
                  v-for="item in product.suitableFor"
                  :key="item"
                  class="suitable-card"
                >
                  <span class="suitable-icon">🎯</span>
                  <h4>{{ item }}</h4>
                  <p>{{ product.suitableForDetail?.[item] || '' }}</p>
                </div>
              </div>

              <h3>商品图片</h3>
              <div class="detail-images">
                <img v-for="(img, i) in product.images" :key="i" :src="img" alt="" />
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="规格参数" name="specs">
            <table class="spec-table full-width">
              <tr v-for="spec in product.specs" :key="spec.name">
                <td class="spec-name">{{ spec.name }}</td>
                <td class="spec-value">{{ spec.value }}</td>
              </tr>
            </table>
          </el-tab-pane>
          <el-tab-pane label="材质说明" name="material">
            <div class="material-full-detail">
              <div class="material-full-card">
                <h3>材质详情</h3>
                <div class="material-full-info">
                  <div class="material-full-item">
                    <span class="label">主要材质</span>
                    <span class="value">{{ product.materialDetail?.main }}</span>
                  </div>
                  <div v-if="product.materialDetail?.handle" class="material-full-item">
                    <span class="label">手柄材质</span>
                    <span class="value">{{ product.materialDetail.handle }}</span>
                  </div>
                  <div v-if="product.materialDetail?.shell" class="material-full-item">
                    <span class="label">外壳材质</span>
                    <span class="value">{{ product.materialDetail.shell }}</span>
                  </div>
                  <div v-if="product.materialDetail?.sensor" class="material-full-item">
                    <span class="label">传感器</span>
                    <span class="value">{{ product.materialDetail.sensor }}</span>
                  </div>
                </div>
                <h4>材质特性</h4>
                <ul class="feature-list">
                  <li v-for="(feature, index) in product.materialDetail?.features" :key="index">
                    {{ feature }}
                  </li>
                </ul>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane :label="`评价 (${product.reviews})`" name="reviews">
            <EmptyState description="暂无评价" icon="💬" />
          </el-tab-pane>
        </el-tabs>
      </div>

      <div class="card related-products">
        <h2 class="section-title">相关推荐</h2>
        <div class="product-grid">
          <ProductCard
            v-for="p in relatedProducts"
            :key="p.id"
            :product="p"
          />
        </div>
      </div>
    </template>
    <EmptyState
      v-else
      description="商品不存在或已下架"
      icon="❌"
      show-action
      action-text="返回首页"
      @action="router.push('/')"
    />

    <el-dialog
      v-model="showMaterialDetail"
      title="材质详情说明"
      width="500px"
    >
      <div class="dialog-material-content">
        <div class="dialog-material-header">
          <span class="dialog-icon">🔩</span>
          <div>
            <h3>{{ product.name }}</h3>
            <p class="dialog-subtitle">材质详细说明</p>
          </div>
        </div>
        <div class="dialog-material-info">
          <div class="dialog-material-item">
            <span class="label">主要材质</span>
            <span class="value">{{ product.materialDetail?.main }}</span>
          </div>
          <div v-if="product.materialDetail?.handle" class="dialog-material-item">
            <span class="label">手柄材质</span>
            <span class="value">{{ product.materialDetail.handle }}</span>
          </div>
          <div v-if="product.materialDetail?.shell" class="dialog-material-item">
            <span class="label">外壳材质</span>
            <span class="value">{{ product.materialDetail.shell }}</span>
          </div>
        </div>
        <h4>材质特性</h4>
        <ul class="dialog-feature-list">
          <li v-for="(feature, index) in product.materialDetail?.features" :key="index">
            <span class="feature-check">✓</span>
            {{ feature }}
          </li>
        </ul>
      </div>
    </el-dialog>

    <el-dialog
      v-model="showSuitableDetail"
      title="适用陶艺品类说明"
      width="500px"
    >
      <div class="dialog-suitable-content">
        <div class="dialog-suitable-header">
          <span class="dialog-icon">🎯</span>
          <div>
            <h3>{{ product.name }}</h3>
            <p class="dialog-subtitle">适用场景详细说明</p>
          </div>
        </div>
        <div class="dialog-suitable-list">
          <div
            v-for="item in product.suitableFor"
            :key="item"
            class="dialog-suitable-item"
          >
            <div class="dialog-suitable-title">{{ item }}</div>
            <div class="dialog-suitable-desc">
              {{ product.suitableForDetail?.[item] || '适用于各种陶艺创作场景' }}
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { Star, StarFilled } from '@element-plus/icons-vue'
import ProductCard from '@/components/common/ProductCard.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

const loading = ref(true)
const product = ref(null)
const currentImage = ref('')
const selectedSku = ref(null)
const quantity = ref(1)
const activeTab = ref('detail')
const hoveredSuitable = ref(null)
const showMaterialDetail = ref(false)
const showSuitableDetail = ref(false)

const isFavorite = computed(() => {
  return product.value ? appStore.isFavorite(product.value.id) : false
})

const relatedProducts = computed(() => {
  if (!product.value) return []
  return appStore.getProductsByCategory(product.value.categoryId)
    .filter(p => p.id !== product.value.id)
    .slice(0, 4)
})

const loadProduct = () => {
  loading.value = true
  setTimeout(() => {
    product.value = appStore.getProductById(route.params.id)
    if (product.value) {
      currentImage.value = product.value.images[0]
      selectedSku.value = product.value.skus[0]
    }
    loading.value = false
  }, 300)
}

const toggleFavorite = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  if (isFavorite.value) {
    appStore.removeFromFavorites(product.value.id)
    ElMessage.success('已取消收藏')
  } else {
    appStore.addToFavorites(product.value.id)
    ElMessage.success('收藏成功')
  }
}

const buyNow = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  ElMessage.success('订单创建成功！')
  setTimeout(() => {
    router.push('/user/orders')
  }, 1000)
}

onMounted(() => {
  loadProduct()
})

watch(() => route.params.id, () => {
  loadProduct()
})
</script>

<style scoped>
.product-detail-page {
  padding-top: 20px;
}

.breadcrumb {
  margin-bottom: 20px;
}

.product-main {
  display: flex;
  gap: 30px;
  padding: 30px;
}

.product-gallery {
  width: 400px;
  flex-shrink: 0;
}

.main-image {
  position: relative;
  width: 400px;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}

.main-image img {
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

.tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #fff;
}

.tag.热销 {
  background: #e74c3c;
}

.tag.新品 {
  background: #27ae60;
}

.tag.推荐 {
  background: #f39c12;
}

.thumbnail-list {
  display: flex;
  gap: 10px;
}

.thumbnail {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  transition: border-color 0.3s;
}

.thumbnail.active {
  border-color: #d4a574;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 12px;
  line-height: 1.4;
}

.product-summary {
  color: #666;
  margin-bottom: 20px;
  font-size: 14px;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: #fdf8f5;
  border-radius: 6px;
  margin-bottom: 20px;
}

.product-price .label {
  color: #999;
}

.current-price {
  font-size: 36px;
  font-weight: bold;
  color: #e74c3c;
}

.original-price {
  font-size: 16px;
  color: #999;
  text-decoration: line-through;
}

.discount {
  padding: 2px 8px;
  background: #e74c3c;
  color: #fff;
  border-radius: 4px;
  font-size: 12px;
}

.product-stats {
  display: flex;
  gap: 40px;
  padding: 16px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.stat-item {
  color: #999;
  font-size: 14px;
}

.stat-item strong {
  color: #333;
  margin-left: 4px;
}

.product-supplier {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.product-supplier .label {
  color: #999;
}

.supplier-name {
  color: #d4a574;
}

.product-specs {
  margin-bottom: 30px;
}

.spec-section {
  margin-bottom: 20px;
}

.spec-section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.spec-section-header .label {
  width: 80px;
  color: #999;
  flex-shrink: 0;
}

.suitable-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-left: 92px;
}

.suitable-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.suitable-tooltip {
  margin-left: 92px;
  margin-top: 8px;
  padding: 10px 12px;
  background: #f8f4f0;
  border-radius: 4px;
  font-size: 13px;
  color: #666;
}

.spec-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-left: 92px;
}

.spec-card {
  padding: 12px;
  border: 2px solid #eee;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.spec-card:hover {
  border-color: #d4a574;
}

.spec-card.active {
  border-color: #d4a574;
  background: #fdf8f5;
}

.spec-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.spec-name {
  font-weight: 500;
  color: #333;
}

.spec-price {
  color: #e74c3c;
  font-weight: bold;
}

.spec-desc {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.spec-stock {
  font-size: 12px;
  color: #27ae60;
}

.material-info {
  margin-left: 92px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.material-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.material-label {
  color: #999;
  font-size: 14px;
}

.material-value {
  color: #333;
  font-weight: 500;
}

.spec-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.spec-row .label {
  width: 80px;
  color: #999;
  flex-shrink: 0;
  line-height: 32px;
}

.product-actions {
  display: flex;
  gap: 16px;
}

.product-actions .el-button {
  flex: 1;
}

.product-detail-section {
  padding: 20px;
}

.detail-content h3 {
  font-size: 18px;
  margin: 24px 0 12px;
  color: #333;
}

.detail-content p {
  color: #666;
  line-height: 1.8;
  margin-bottom: 16px;
}

.material-detail-card {
  background: #fafafa;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
}

.material-header {
  margin-bottom: 20px;
}

.material-main {
  display: flex;
  align-items: center;
  gap: 16px;
}

.material-icon {
  font-size: 48px;
}

.material-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0 0 4px;
}

.material-sub {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.material-features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px;
  background: #fff;
  border-radius: 4px;
  font-size: 14px;
  color: #666;
}

.feature-icon {
  color: #27ae60;
  font-weight: bold;
}

.spec-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.spec-table.full-width {
  width: 100%;
}

.spec-table tr {
  border-bottom: 1px solid #eee;
}

.spec-table td {
  padding: 12px 16px;
}

.spec-name {
  width: 150px;
  background: #fafafa;
  color: #999;
}

.spec-value {
  color: #333;
}

.suitable-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.suitable-card {
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  text-align: center;
}

.suitable-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.suitable-card h4 {
  font-size: 16px;
  margin-bottom: 8px;
  color: #333;
}

.suitable-card p {
  font-size: 13px;
  color: #666;
  margin: 0;
}

.detail-images {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.detail-images img {
  width: 100%;
  border-radius: 8px;
}

.material-full-detail {
  padding: 20px 0;
}

.material-full-card {
  max-width: 600px;
}

.material-full-card h3 {
  font-size: 18px;
  margin-bottom: 16px;
  color: #333;
}

.material-full-card h4 {
  font-size: 16px;
  margin: 20px 0 12px;
  color: #333;
}

.material-full-info {
  background: #fafafa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.material-full-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.material-full-item:last-child {
  border-bottom: none;
}

.material-full-item .label {
  color: #999;
}

.material-full-item .value {
  color: #333;
  font-weight: 500;
}

.feature-list {
  list-style: none;
  padding: 0;
}

.feature-list li {
  padding: 10px 0;
  color: #666;
  border-bottom: 1px dashed #eee;
}

.feature-list li:last-child {
  border-bottom: none;
}

.related-products .product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.dialog-material-content,
.dialog-suitable-content {
  padding: 10px 0;
}

.dialog-material-header,
.dialog-suitable-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.dialog-icon {
  font-size: 48px;
}

.dialog-material-header h3,
.dialog-suitable-header h3 {
  font-size: 18px;
  margin: 0 0 4px;
  color: #333;
}

.dialog-subtitle {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.dialog-material-info {
  margin-bottom: 20px;
}

.dialog-material-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.dialog-material-item .label {
  color: #999;
}

.dialog-material-item .value {
  color: #333;
  font-weight: 500;
}

.dialog-feature-list {
  list-style: none;
  padding: 0;
}

.dialog-feature-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 0;
  color: #666;
}

.feature-check {
  color: #27ae60;
  font-weight: bold;
}

.dialog-suitable-item {
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  margin-bottom: 12px;
}

.dialog-suitable-item:last-child {
  margin-bottom: 0;
}

.dialog-suitable-title {
  font-weight: 500;
  color: #333;
  margin-bottom: 6px;
}

.dialog-suitable-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}
</style>
