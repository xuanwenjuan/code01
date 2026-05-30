<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useProductStore } from '../stores/product'
import { useFavoriteStore } from '../stores/favorite'
import { useUserStore } from '../stores/user'
import LoadingState from '../components/common/LoadingState.vue'

const route = useRoute()
const productStore = useProductStore()
const favoriteStore = useFavoriteStore()
const userStore = useUserStore()

const activeImageIndex = ref(0)
const selectedSpec = ref(null)
const quantity = ref(1)
const activeTab = ref('params')

const product = computed(() => productStore.currentProduct)

const isFavorited = computed(() => {
  if (!userStore.isLoggedIn) return false
  return favoriteStore.isFavorite(userStore.userInfo.id, product.value?.id)
})

const totalPrice = computed(() => {
  if (!selectedSpec.value) return product.value?.price || 0
  return (selectedSpec.value.price * quantity.value).toFixed(2)
})

onMounted(async () => {
  try {
    await productStore.fetchProductById(route.params.id)
    if (product.value?.specifications?.length > 0) {
      selectedSpec.value = product.value.specifications[0]
    }
    if (userStore.isLoggedIn) {
      favoriteStore.fetchFavorites(userStore.userInfo.id)
    }
  } catch (err) {
    ElMessage.error(err.message)
  }
})

function selectSpec(spec) {
  selectedSpec.value = spec
}

async function toggleFavorite() {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }
  try {
    const result = await favoriteStore.toggleFavorite(userStore.userInfo.id, product.value.id)
    ElMessage.success(result.isFavorited ? '已添加到收藏' : '已取消收藏')
  } catch (err) {
    ElMessage.error('操作失败')
  }
}

function addToCart() {
  ElMessage.success('已加入购物车')
}

function buyNow() {
  ElMessage.success('即将跳转到结算页面')
}
</script>

<template>
  <div class="product-detail" v-if="product">
    <div class="container">
      <LoadingState v-if="productStore.loading" text="商品加载中..." />
      <div v-else class="detail-content">
        <div class="product-gallery">
          <div class="main-image">
            <img :src="product.images[activeImageIndex]" :alt="product.name" />
          </div>
          <div class="thumb-list">
            <div 
              v-for="(img, index) in product.images" 
              :key="index"
              class="thumb-item"
              :class="{ active: activeImageIndex === index }"
              @click="activeImageIndex = index"
            >
              <img :src="img" :alt="`缩略图${index + 1}`" />
            </div>
          </div>
        </div>

        <div class="product-info">
          <h1 class="product-title">{{ product.name }}</h1>
          <p class="product-desc">{{ product.description }}</p>
          
          <div class="product-rating">
            <el-rate v-model="product.rating" disabled show-score text-color="#ff9900" />
            <span class="review-count">{{ product.reviewCount }}条评价</span>
            <span class="sales-count">已售{{ product.sales }}</span>
          </div>

          <div class="price-section">
            <span class="price-label">价格</span>
            <span class="current-price">
              ¥{{ selectedSpec ? selectedSpec.price.toFixed(2) : product.price.toFixed(2) }}
            </span>
            <span v-if="product.originalPrice" class="original-price">
              ¥{{ product.originalPrice.toFixed(2) }}
            </span>
          </div>

          <div class="spec-section">
            <span class="spec-label">规格</span>
            <div class="spec-list">
              <div 
                v-for="spec in product.specifications" 
                :key="spec.id"
                class="spec-item"
                :class="{ active: selectedSpec?.id === spec.id, disabled: spec.stock === 0 }"
                @click="spec.stock > 0 && selectSpec(spec)"
              >
                <span class="spec-name">{{ spec.name }}</span>
                <span class="spec-price">¥{{ spec.price.toFixed(2) }}</span>
                <span v-if="spec.stock <= 10 && spec.stock > 0" class="spec-stock-tip">仅剩{{ spec.stock }}件</span>
                <span v-if="spec.stock === 0" class="spec-stock-tip sold-out">已售罄</span>
              </div>
            </div>
          </div>

          <div class="quantity-section">
            <span class="quantity-label">数量</span>
            <el-input-number 
              v-model="quantity" 
              :min="1" 
              :max="selectedSpec?.stock || product.stock" 
              size="large"
            />
            <span class="stock-info">库存{{ selectedSpec?.stock || product.stock }}件</span>
          </div>

          <div class="action-section">
            <el-button type="primary" size="large" @click="addToCart">加入购物车</el-button>
            <el-button type="danger" size="large" @click="buyNow">立即购买</el-button>
            <el-button 
              size="large" 
              :type="isFavorited ? 'warning' : 'default'"
              @click="toggleFavorite"
            >
              <el-icon>
                <StarFilled v-if="isFavorited" />
                <Star v-else />
              </el-icon>
              {{ isFavorited ? '已收藏' : '收藏' }}
            </el-button>
          </div>

          <div class="info-section">
            <div class="info-item">
              <el-icon><Service /></el-icon>
              <span>正品保证</span>
            </div>
            <div class="info-item">
              <el-icon><Van /></el-icon>
              <span>满99包邮</span>
            </div>
            <div class="info-item">
              <el-icon><Refresh /></el-icon>
              <span>7天无理由退换</span>
            </div>
          </div>
        </div>
      </div>

      <div class="product-tabs">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="商品参数" name="params">
            <div class="params-content">
              <div class="shelf-life-info">
                <h3><el-icon><Warning /></el-icon> 保质期说明</h3>
                <div class="shelf-life-detail">
                  <div class="shelf-item">
                    <span class="shelf-label">保质期：</span>
                    <span class="shelf-value">{{ product.shelfLife }}</span>
                  </div>
                  <div class="shelf-item">
                    <span class="shelf-label">储存条件：</span>
                    <span class="shelf-value">{{ product.storageCondition }}</span>
                  </div>
                </div>
              </div>
              <h3>详细参数</h3>
              <el-table :data="product.params" border style="width: 100%">
                <el-table-column prop="name" label="参数名称" width="200" />
                <el-table-column prop="value" label="参数值" />
              </el-table>
            </div>
          </el-tab-pane>
          <el-tab-pane label="规格选择" name="specs">
            <div class="specs-content">
              <h3>可选规格</h3>
              <el-table :data="product.specifications" border style="width: 100%">
                <el-table-column prop="name" label="规格名称" width="200" />
                <el-table-column prop="price" label="价格" width="150">
                  <template #default="scope">
                    <span class="table-price">¥{{ scope.row.price.toFixed(2) }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="stock" label="库存">
                  <template #default="scope">
                    <el-tag :type="scope.row.stock > 50 ? 'success' : 'warning'" size="small">
                      {{ scope.row.stock > 50 ? '库存充足' : `仅剩${scope.row.stock}件` }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120">
                  <template #default="scope">
                    <el-button 
                      size="small" 
                      type="primary" 
                      plain
                      @click="selectSpec(scope.row)"
                    >
                      选择
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
          <el-tab-pane label="用量参考" name="usage">
            <div class="usage-content">
              <div class="usage-tip">
                <el-icon><InfoFilled /></el-icon>
                <span>以下用量仅供参考，具体用量请根据实际配方调整</span>
              </div>
              <el-table :data="product.usageReference" border style="width: 100%">
                <el-table-column prop="recipe" label="烘焙食品" width="200">
                  <template #default="scope">
                    <div class="recipe-name">
                      <el-icon><Food /></el-icon>
                      {{ scope.row.recipe }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="amount" label="参考用量">
                  <template #default="scope">
                    <span class="usage-amount">{{ scope.row.amount }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="note" label="说明" width="200">
                  <template #default="scope">
                    <el-tag type="info" size="small">{{ scope.row.note }}</el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
          <el-tab-pane label="商品详情" name="detail">
            <div class="detail-images">
              <img v-for="(img, index) in product.images" :key="index" :src="img" :alt="`详情图${index + 1}`" />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-detail {
  padding: 20px 0 40px;
}

.detail-content {
  display: flex;
  gap: 40px;
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.product-gallery {
  width: 450px;
  flex-shrink: 0;
}

.main-image {
  width: 450px;
  height: 450px;
  overflow: hidden;
  border-radius: 8px;
  background: #f5f7fa;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-list {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.thumb-item {
  width: 70px;
  height: 70px;
  border: 2px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.3s;
}

.thumb-item.active,
.thumb-item:hover {
  border-color: #e6a23c;
}

.thumb-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  flex: 1;
}

.product-title {
  font-size: 24px;
  color: #303133;
  margin: 0 0 12px 0;
  font-weight: 600;
}

.product-desc {
  font-size: 14px;
  color: #909399;
  margin: 0 0 16px 0;
  line-height: 1.6;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.review-count,
.sales-count {
  font-size: 14px;
  color: #909399;
}

.price-section {
  background: #fef5e7;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 24px;
}

.price-label {
  font-size: 14px;
  color: #909399;
}

.current-price {
  font-size: 32px;
  font-weight: 600;
  color: #f56c6c;
}

.original-price {
  font-size: 16px;
  color: #c0c4cc;
  text-decoration: line-through;
}

.spec-section,
.quantity-section {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.spec-label,
.quantity-label {
  width: 60px;
  font-size: 14px;
  color: #606266;
  padding-top: 8px;
}

.spec-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.spec-item {
  padding: 12px 20px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 120px;
  position: relative;
}

.spec-item:hover:not(.disabled) {
  border-color: #e6a23c;
  color: #e6a23c;
}

.spec-item.active {
  border-color: #e6a23c;
  background: #fef5e7;
  color: #e6a23c;
}

.spec-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f5f7fa;
}

.spec-name {
  font-weight: 500;
}

.spec-price {
  color: #f56c6c;
  font-weight: 600;
  font-size: 13px;
}

.spec-stock-tip {
  font-size: 11px;
  color: #f56c6c;
  background: #fef0f0;
  padding: 2px 8px;
  border-radius: 10px;
}

.spec-stock-tip.sold-out {
  background: #f5f7fa;
  color: #909399;
}

.stock-info {
  font-size: 14px;
  color: #909399;
  padding-top: 8px;
}

.action-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.action-section .el-button {
  flex: 1;
}

.info-section {
  display: flex;
  gap: 24px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #606266;
}

.product-tabs {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.params-content h3,
.specs-content h3 {
  font-size: 18px;
  color: #303133;
  margin: 20px 0 16px 0;
}

.shelf-life-info {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.shelf-life-info h3 {
  margin-top: 0;
}

.shelf-life-detail {
  display: flex;
  gap: 40px;
}

.shelf-item {
  font-size: 14px;
}

.shelf-label {
  color: #909399;
}

.shelf-value {
  color: #303133;
}

.detail-images {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-images img {
  width: 100%;
  border-radius: 8px;
}

.params-content h3,
.specs-content h3,
.usage-content h3 {
  font-size: 18px;
  color: #303133;
  margin: 20px 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.shelf-life-info h3 {
  margin-top: 0;
}

.table-price {
  color: #f56c6c;
  font-weight: 600;
  font-size: 16px;
}

.usage-tip {
  background: #ecf5ff;
  border: 1px solid #d9ecff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #409eff;
  font-size: 14px;
}

.usage-tip .el-icon {
  font-size: 20px;
}

.recipe-name {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #303133;
  font-weight: 500;
}

.recipe-name .el-icon {
  color: #e6a23c;
}

.usage-amount {
  color: #67c23a;
  font-weight: 500;
}
</style>
