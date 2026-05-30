<template>
  <div class="plant-detail-page">
    <div class="container">
      <div class="breadcrumb">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>{{ plant?.categoryName }}</el-breadcrumb-item>
          <el-breadcrumb-item>{{ plant?.name }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div v-loading="plantStore.loading" v-if="plant" class="detail-content">
        <div class="product-main">
          <div class="product-image">
            <el-image
              :src="plant.image"
              :alt="plant.name"
              fit="cover"
              preview-src-list="[plant.image]"
              preview-teleported
            />
            <div class="image-badges">
              <el-tag v-if="plant.isHot" type="danger" effect="dark">热销</el-tag>
              <el-tag v-if="plant.isNew" type="success" effect="dark">新品</el-tag>
            </div>
          </div>

          <div class="product-info">
            <h1 class="product-title">{{ plant.name }}</h1>
            <p class="product-category">{{ plant.categoryName }}</p>
            
            <div class="product-rating">
              <el-rate v-model="plant.rating" disabled show-score text-color="#ff9900" />
              <span class="sales">已售 {{ plant.sales }} 件</span>
            </div>

            <div class="price-section">
              <span class="current-price">¥{{ currentPrice }}</span>
              <span class="original-price" v-if="plant.originalPrice">¥{{ plant.originalPrice }}</span>
              <span class="discount" v-if="plant.originalPrice">
                {{ Math.round((1 - plant.price / plant.originalPrice) * 100) }}% OFF
              </span>
            </div>

            <p class="product-desc">{{ plant.description }}</p>

            <div class="spec-section">
              <h4 class="section-label">选择规格</h4>
              <div class="spec-options">
                <el-radio-group v-model="selectedSpec">
                  <el-radio-button
                    v-for="spec in plant.specifications"
                    :key="spec.name"
                    :value="spec"
                  >
                    {{ spec.name }} - ¥{{ spec.price }}
                  </el-radio-button>
                </el-radio-group>
              </div>
              <p class="stock-info">库存: {{ selectedSpec?.stock || 0 }} 件</p>
            </div>

            <div class="quantity-section">
              <h4 class="section-label">购买数量</h4>
              <el-input-number
                v-model="quantity"
                :min="1"
                :max="selectedSpec?.stock || 1"
                size="large"
              />
            </div>

            <div class="action-buttons">
              <el-button type="primary" size="large" @click="handleAddCart">
                <el-icon><ShoppingCart /></el-icon>
                加入购物车
              </el-button>
              <el-button type="success" size="large" @click="handleBuyNow">
                立即购买
              </el-button>
              <el-button
                size="large"
                :type="isFavorited ? 'warning' : 'default'"
                @click="handleFavorite"
              >
                <el-icon>
                  <component :is="isFavorited ? StarFilled : Star" />
                </el-icon>
                {{ isFavorited ? '已收藏' : '收藏' }}
              </el-button>
            </div>
          </div>
        </div>

        <div class="product-tabs">
          <el-tabs v-model="activeTab" class="detail-tabs">
            <el-tab-pane label="绿植参数" name="params">
              <div class="params-content">
                <el-descriptions :column="3" border>
                  <el-descriptions-item
                    v-for="(value, key) in plant.parameters"
                    :key="key"
                    :label="key"
                  >
                    {{ value }}
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </el-tab-pane>

            <el-tab-pane label="养护说明" name="care">
              <div class="care-content">
                <el-row :gutter="20">
                  <el-col
                    v-for="(value, key) in plant.careGuide"
                    :key="key"
                    :xs="24"
                    :sm="12"
                    :md="8"
                  >
                    <el-card class="care-card">
                      <template #header>
                        <div class="care-header">
                          <el-icon color="#4caf50"><InfoFilled /></el-icon>
                          <span>{{ key }}</span>
                        </div>
                      </template>
                      <p>{{ value }}</p>
                    </el-card>
                  </el-col>
                </el-row>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <EmptyState
        v-if="!plantStore.loading && !plant"
        description="绿植不存在或已下架"
        show-action
        action-text="返回首页"
        @action="$router.push('/')"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlantStore } from '@/stores/plant'
import { useOrderStore } from '@/stores/order'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { Star, StarFilled, ShoppingCart } from '@element-plus/icons-vue'
import EmptyState from '@/components/EmptyState.vue'

const route = useRoute()
const router = useRouter()
const plantStore = usePlantStore()
const orderStore = useOrderStore()
const userStore = useUserStore()

const plant = computed(() => plantStore.currentPlant)
const activeTab = ref('params')
const selectedSpec = ref(null)
const quantity = ref(1)

const currentPrice = computed(() => {
  return selectedSpec.value?.price || plant.value?.price || 0
})

const isFavorited = computed(() => {
  return plant.value ? orderStore.isFavorite(plant.value.id) : false
})

const handleAddCart = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  ElMessage.success('已加入购物车')
}

const handleBuyNow = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  const orderData = {
    plantId: plant.value.id,
    plantName: plant.value.name,
    plantImage: plant.value.image,
    spec: selectedSpec.value?.name || '默认',
    price: currentPrice.value,
    quantity: quantity.value,
    totalPrice: currentPrice.value * quantity.value
  }
  
  const result = orderStore.createOrder(orderData)
  if (result.success) {
    ElMessage.success('下单成功')
    router.push('/orders')
  } else {
    ElMessage.error(result.message)
  }
}

const handleFavorite = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  if (isFavorited.value) {
    const favorite = orderStore.userFavorites.find(f => f.plantId === plant.value.id)
    if (favorite) {
      orderStore.removeFavorite(favorite.id)
      ElMessage.success('已取消收藏')
    }
  } else {
    orderStore.addFavorite(plant.value.id, {
      name: plant.value.name,
      image: plant.value.image,
      price: currentPrice.value
    })
    ElMessage.success('收藏成功')
  }
}

onMounted(async () => {
  const id = route.params.id
  await plantStore.fetchPlantDetail(id)
})

watch(
  () => plant.value,
  (newPlant) => {
    if (newPlant && newPlant.specifications?.length > 0 && !selectedSpec.value) {
      selectedSpec.value = newPlant.specifications[0]
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.plant-detail-page {
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.breadcrumb {
  margin-bottom: 20px;
}

.detail-content {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.product-main {
  display: flex;
  gap: 40px;
  margin-bottom: 40px;
}

.product-image {
  position: relative;
  width: 400px;
  height: 400px;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-badges {
  position: absolute;
  top: 15px;
  left: 15px;
  display: flex;
  gap: 8px;
}

.product-info {
  flex: 1;
}

.product-title {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin: 0 0 8px 0;
}

.product-category {
  font-size: 14px;
  color: #4caf50;
  margin: 0 0 16px 0;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.sales {
  font-size: 14px;
  color: #999;
}

.price-section {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 20px;
  background: linear-gradient(135deg, #fff5f5 0%, #ffebee 100%);
  border-radius: 8px;
  margin-bottom: 20px;
}

.current-price {
  font-size: 36px;
  font-weight: bold;
  color: #f56c6c;
}

.original-price {
  font-size: 16px;
  color: #999;
  text-decoration: line-through;
}

.discount {
  padding: 4px 10px;
  background: #f56c6c;
  color: #fff;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.product-desc {
  font-size: 15px;
  color: #666;
  line-height: 1.8;
  margin: 0 0 25px 0;
}

.spec-section,
.quantity-section {
  margin-bottom: 25px;
}

.section-label {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  margin: 0 0 12px 0;
}

.stock-info {
  margin-top: 10px;
  font-size: 13px;
  color: #999;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 30px;
}

.action-buttons .el-button {
  flex: 1;
}

.product-tabs {
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.detail-tabs :deep(.el-tabs__header) {
  margin-bottom: 20px;
}

.params-content {
  padding: 20px 0;
}

.care-content {
  padding: 20px 0;
}

.care-card {
  margin-bottom: 20px;
}

.care-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  color: #333;
}

@media (max-width: 768px) {
  .product-main {
    flex-direction: column;
  }
  
  .product-image {
    width: 100%;
    height: auto;
    aspect-ratio: 1;
  }
}
</style>
