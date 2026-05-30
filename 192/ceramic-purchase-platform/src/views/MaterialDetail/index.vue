<template>
  <div class="material-detail-page">
    <div class="container" v-if="material">
      <el-page-header @back="goBack" class="mb-20">
        <template #content>
          <span>{{ material.name }}</span>
        </template>
      </el-page-header>

      <div class="detail-header card">
        <el-row :gutter="40">
          <el-col :span="10">
            <el-image
              :src="material.image"
              :preview-src-list="material.images"
              fit="cover"
              class="main-image"
            />
          </el-col>
          <el-col :span="14">
            <div class="material-info">
              <h1 class="material-title">{{ material.name }}</h1>
              <div class="material-meta">
                <el-tag type="success" size="large">品质保证</el-tag>
                <span class="sales">已售 {{ material.sales }} 件</span>
                <span class="rating">
                  <el-rate v-model="material.rating" :max="5" disabled show-text />
                </span>
              </div>
              <div class="price-area">
                <span class="price-label">价格</span>
                <span class="current-price">¥{{ material.price }}</span>
                <span class="price-unit">/ {{ material.unit }}</span>
              </div>
              <div class="supplier-info">
                <el-icon><OfficeBuilding /></el-icon>
                <span>供应商：{{ material.supplierName }}</span>
              </div>
              <div class="stock-info">
                <el-icon><Box /></el-icon>
                <span>库存：{{ material.stock }} {{ material.unit }}</span>
              </div>
              <div class="features">
                <span class="label">产品特点：</span>
                <el-tag v-for="feature in material.features" :key="feature" type="info" size="small">
                  {{ feature }}
                </el-tag>
              </div>
              <div class="certifications">
                <span class="label">资质认证：</span>
                <el-tag v-for="cert in material.certifications" :key="cert" type="success" size="small" effect="plain">
                  {{ cert }}
                </el-tag>
              </div>
              <div class="action-area">
                <div class="quantity-selector">
                  <span class="label">数量：</span>
                  <el-input-number v-model="quantity" :min="1" :max="material.stock" size="large" />
                  <span class="unit">{{ material.unit }}</span>
                </div>
                <div class="total-price">
                  <span class="label">总价：</span>
                  <span class="total-value">¥{{ totalPrice.toFixed(2) }}</span>
                  <span class="total-desc">（共 {{ quantity }} {{ material.unit }}）</span>
                </div>
                <div class="action-buttons">
                  <el-button type="primary" size="large" @click="handleAddCart">
                    <el-icon><ShoppingCart /></el-icon>
                    加入购物车
                  </el-button>
                  <el-button type="success" size="large" @click="showNoticeDialog = true">
                    <el-icon><Warning /></el-icon>
                    使用注意事项
                  </el-button>
                  <el-button type="danger" size="large" @click="toggleFavorite">
                    <el-icon>
                      <Star v-if="isFavorited" :fill="'#f56c6c'" />
                      <Star v-else />
                    </el-icon>
                    {{ isFavorited ? '已收藏' : '收藏' }}
                  </el-button>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <el-tabs v-model="activeTab" class="detail-tabs">
        <el-tab-pane label="原料详情" name="detail">
          <div class="tab-content card">
            <h3 class="subsection-title">产品描述</h3>
            <p class="description">{{ material.description }}</p>

            <h3 class="subsection-title">原料成分参数</h3>
            <div class="composition-visual">
              <div class="composition-chart">
                <div class="composition-pie">
                  <svg viewBox="0 0 200 200" class="pie-svg">
                    <circle
                      v-for="(item, index) in compositionData"
                      :key="item.name"
                      cx="100"
                      cy="100"
                      r="80"
                      fill="transparent"
                      :stroke="item.color"
                      stroke-width="40"
                      :stroke-dasharray="`${item.percentage * 5.02} 502`"
                      :stroke-dashoffset="-getStrokeOffset(index)"
                      class="pie-segment"
                    />
                  </svg>
                  <div class="pie-center">
                    <div class="pie-total">100%</div>
                    <div class="pie-label">成分总占比</div>
                  </div>
                </div>
                <div class="composition-legend">
                  <div
                    v-for="item in compositionData"
                    :key="item.name"
                    class="legend-item"
                  >
                    <span class="legend-color" :style="{ background: item.color }"></span>
                    <span class="legend-name">{{ item.name }}</span>
                    <span class="legend-value">{{ item.value }}</span>
                    <el-progress
                      :percentage="item.percentage"
                      :show-text="false"
                      :stroke-width="6"
                      :color="item.color"
                      class="legend-progress"
                    />
                  </div>
                </div>
              </div>
            </div>
            <el-table :data="parametersList" border style="width: 100%; margin-top: 20px">
              <el-table-column prop="name" label="成分名称" width="200" />
              <el-table-column prop="value" label="含量" />
            </el-table>

            <h3 class="subsection-title">烧制适配温度</h3>
            <div class="temp-info">
              <el-alert
                :title="`推荐烧制温度：${material.firingTemp.recommend}`"
                type="info"
                :closable="false"
                show-icon
              />
              <div class="temp-range">
                <div class="temp-item">
                  <span class="temp-label">最低温度</span>
                  <span class="temp-value">{{ material.firingTemp.min }}℃</span>
                </div>
                <el-icon class="temp-arrow"><Right /></el-icon>
                <div class="temp-item highlight">
                  <span class="temp-label">适用范围</span>
                  <span class="temp-value">{{ material.firingTemp.min }} - {{ material.firingTemp.max }}℃</span>
                </div>
                <el-icon class="temp-arrow"><Right /></el-icon>
                <div class="temp-item">
                  <span class="temp-label">最高温度</span>
                  <span class="temp-value">{{ material.firingTemp.max }}℃</span>
                </div>
              </div>
            </div>

            <h3 class="subsection-title">陶瓷创作适用风格</h3>
            <div class="styles">
              <div
                v-for="style in material.suitableStyles"
                :key="style"
                class="style-card"
              >
                <div class="style-icon">{{ getStyleIcon(style) }}</div>
                <div class="style-info">
                  <div class="style-name">{{ style }}</div>
                  <div class="style-desc">{{ getStyleDescription(style) }}</div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="供应商信息" name="supplier">
          <div class="tab-content card">
            <div class="supplier-detail">
              <el-avatar :size="80" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
              <div class="supplier-meta">
                <h3>{{ material.supplierName }}</h3>
                <div class="supplier-stats">
                  <el-rate v-model="supplierRating" :max="5" disabled />
                  <span>累计销量 {{ supplierSales }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    <EmptyState v-else description="原料不存在" />

    <el-dialog
      v-model="showNoticeDialog"
      title="原料使用注意事项"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="notice-content" v-if="material">
        <el-alert
          title="安全提示"
          type="warning"
          :closable="false"
          show-icon
          class="mb-16"
        />
        <div class="notice-section">
          <h4><el-icon><Warning /></el-icon> 储存注意</h4>
          <ul>
            <li>请置于阴凉干燥处，避免阳光直射</li>
            <li>密封保存，防止吸潮影响使用效果</li>
            <li>与食品、饲料隔离存放，避免误食</li>
            <li>建议储存温度：5℃ - 35℃</li>
          </ul>
        </div>
        <div class="notice-section">
          <h4><el-icon><Odometer /></el-icon> 烧制注意</h4>
          <ul>
            <li>严格按照推荐温度曲线进行烧制</li>
            <li>升温速率建议：≤ 150℃/小时</li>
            <li>保温时间：根据坯体厚度调整 30-60 分钟</li>
            <li>冷却阶段避免骤冷，防止开裂</li>
            <li>确保窑炉通风良好，防止有害气体积聚</li>
          </ul>
        </div>
        <div class="notice-section">
          <h4><el-icon><Operation /></el-icon> 使用操作</h4>
          <ul>
            <li>使用前请过筛，去除杂质结块</li>
            <li>调制时请佩戴手套、口罩等防护用品</li>
            <li>釉料使用前请充分搅拌均匀</li>
            <li>施釉厚度建议：0.3-0.5mm</li>
            <li>避免与其他不同批次原料混合使用</li>
          </ul>
        </div>
        <div class="notice-section">
          <h4><el-icon><FirstAidKit /></el-icon> 应急处理</h4>
          <ul>
            <li>皮肤接触：立即用大量清水冲洗</li>
            <li>眼睛接触：用清水冲洗至少 15 分钟，及时就医</li>
            <li>误食：立即漱口，携带包装就医</li>
            <li>如出现过敏反应，请停止使用并就医</li>
          </ul>
        </div>
        <div class="notice-section" v-if="material.firingTemp">
          <h4><el-icon><Temperature /></el-icon> 本产品烧制参数</h4>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="最低温度">
              {{ material.firingTemp.min }}℃
            </el-descriptions-item>
            <el-descriptions-item label="最高温度">
              {{ material.firingTemp.max }}℃
            </el-descriptions-item>
            <el-descriptions-item label="推荐温度" :span="2">
              {{ material.firingTemp.recommend }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="showNoticeDialog = false">
          我已了解
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getMaterialById } from '@/mock/materials'
import { useCartStore } from '@/store/cart'
import { useFavoritesStore } from '@/store/favorites'
import EmptyState from '@/components/EmptyState.vue'
import { mockUsers } from '@/mock/users'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const favoritesStore = useFavoritesStore()

const material = ref(null)
const quantity = ref(1)
const activeTab = ref('detail')
const showNoticeDialog = ref(false)

const colorPalette = [
  '#409eff', '#67c23a', '#e6a23c', '#f56c6c', 
  '#909399', '#8e44ad', '#16a085', '#d35400'
]

const isFavorited = computed(() => {
  if (!material.value) return false
  return favoritesStore.isFavorite(material.value.id)
})

const totalPrice = computed(() => {
  if (!material.value) return 0
  return material.value.price * quantity.value
})

const parametersList = computed(() => {
  if (!material.value) return []
  return Object.entries(material.value.parameters).map(([name, value]) => ({ name, value }))
})

const compositionData = computed(() => {
  if (!material.value) return []
  return Object.entries(material.value.parameters).map(([name, value], index) => {
    const percentage = parseFloat(value) || 0
    return {
      name,
      value,
      percentage,
      color: colorPalette[index % colorPalette.length]
    }
  })
})

const getStrokeOffset = (index) => {
  if (!compositionData.value || index === 0) return 0
  let offset = 0
  for (let i = 0; i < index; i++) {
    offset += compositionData.value[i].percentage * 5.02
  }
  return offset
}

const supplierRating = computed(() => {
  if (!material.value) return 0
  const supplier = mockUsers.find(u => u.id === material.value.supplierId)
  return supplier?.rating || 4.8
})

const supplierSales = computed(() => {
  if (!material.value) return 0
  const supplier = mockUsers.find(u => u.id === material.value.supplierId)
  return supplier?.totalSales || 0
})

const styleDescriptions = {
  '青花瓷': '适合绘制细腻的青花图案，发色稳定',
  '白瓷': '适合制作温润如玉的白瓷作品',
  '玲珑瓷': '适合制作透光效果极佳的玲珑瓷',
  '粉彩瓷': '适合绘制色彩丰富的粉彩图案',
  '釉下彩': '适合釉下彩绘，色彩经久不褪',
  '釉上彩': '适合釉上彩绘，色彩鲜艳亮丽',
  '陶艺': '适合手工陶艺创作，质感粗犷',
  '雕塑瓷': '适合陶瓷雕塑，可塑性强'
}

const styleIcons = {
  '青花瓷': '🏺',
  '白瓷': '⚪',
  '玲珑瓷': '✨',
  '粉彩瓷': '🎨',
  '釉下彩': '🖌️',
  '釉上彩': '🌈',
  '陶艺': '🏺',
  '雕塑瓷': '🗿'
}

const getStyleIcon = (style) => {
  return styleIcons[style] || '🎯'
}

const getStyleDescription = (style) => {
  return styleDescriptions[style] || '适用于多种陶瓷创作风格'
}

const goBack = () => {
  router.back()
}

const handleAddCart = () => {
  cartStore.addToCart(material.value, quantity.value)
  ElMessage.success('已加入购物车')
}

const toggleFavorite = () => {
  favoritesStore.toggleFavorite(material.value)
  ElMessage.success(isFavorited.value ? '已收藏' : '已取消收藏')
}

onMounted(() => {
  const id = route.params.id
  material.value = getMaterialById(id)
})
</script>

<style scoped>
.material-detail-page {
  padding-bottom: 40px;
}

.detail-header {
  padding: 30px;
  margin-bottom: 20px;
}

.main-image {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
}

.material-title {
  font-size: 26px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #303133;
}

.material-meta {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.sales, .rating {
  color: #909399;
  font-size: 14px;
}

.price-area {
  background: linear-gradient(135deg, #fff5f5, #ffe6e6);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.price-label {
  color: #606266;
  font-size: 14px;
}

.current-price {
  color: #f56c6c;
  font-size: 36px;
  font-weight: bold;
}

.price-unit {
  color: #909399;
  font-size: 14px;
}

.supplier-info, .stock-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  margin-bottom: 12px;
  font-size: 14px;
}

.features, .certifications {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.label {
  color: #909399;
  font-size: 14px;
  flex-shrink: 0;
}

.action-area {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.unit {
  color: #606266;
}

.total-price {
  background: linear-gradient(135deg, #f0f9ff, #e6f7ff);
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.total-price .label {
  color: #606266;
  font-size: 14px;
}

.total-value {
  color: #409eff;
  font-size: 28px;
  font-weight: bold;
}

.total-desc {
  color: #909399;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.detail-tabs {
  margin-top: 20px;
}

.tab-content {
  padding: 30px;
}

.subsection-title {
  font-size: 18px;
  font-weight: 600;
  margin: 24px 0 16px;
  padding-left: 12px;
  border-left: 4px solid #409eff;
}

.subsection-title:first-child {
  margin-top: 0;
}

.description {
  line-height: 1.8;
  color: #606266;
  font-size: 14px;
}

.composition-visual {
  background: #fafafa;
  border-radius: 8px;
  padding: 24px;
}

.composition-chart {
  display: flex;
  gap: 40px;
  align-items: center;
}

.composition-pie {
  position: relative;
  width: 200px;
  height: 200px;
  flex-shrink: 0;
}

.pie-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.pie-segment {
  transition: stroke-dasharray 0.3s ease;
}

.pie-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.pie-total {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.pie-label {
  font-size: 12px;
  color: #909399;
}

.composition-legend {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  flex-shrink: 0;
}

.legend-name {
  width: 100px;
  font-size: 14px;
  color: #303133;
  flex-shrink: 0;
}

.legend-value {
  width: 80px;
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  flex-shrink: 0;
}

.legend-progress {
  flex: 1;
  min-width: 150px;
}

.temp-info {
  margin-top: 16px;
}

.temp-range {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
  padding: 30px;
  background: #f5f7fa;
  border-radius: 8px;
  flex-wrap: wrap;
}

.temp-item {
  text-align: center;
  padding: 16px 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.temp-item.highlight {
  background: linear-gradient(135deg, #409eff, #66b1ff);
  color: #fff;
}

.temp-label {
  display: block;
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 4px;
}

.temp-value {
  font-size: 20px;
  font-weight: bold;
}

.temp-arrow {
  color: #c0c4cc;
  font-size: 20px;
}

.styles {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.style-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #fffbe6;
  border: 1px solid #e6e2af;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.style-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(230, 162, 60, 0.15);
}

.style-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.style-info {
  flex: 1;
}

.style-name {
  font-size: 16px;
  font-weight: 600;
  color: #b8860b;
  margin-bottom: 4px;
}

.style-desc {
  font-size: 13px;
  color: #909399;
  line-height: 1.4;
}

.supplier-detail {
  display: flex;
  align-items: center;
  gap: 20px;
}

.supplier-meta h3 {
  font-size: 20px;
  margin-bottom: 8px;
}

.supplier-stats {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #909399;
  font-size: 14px;
}

.notice-content {
  max-height: 60vh;
  overflow-y: auto;
}

.mb-16 {
  margin-bottom: 16px;
}

.notice-section {
  margin-bottom: 20px;
}

.notice-section h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: #303133;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.notice-section ul {
  padding-left: 24px;
  margin: 0;
}

.notice-section li {
  line-height: 2;
  color: #606266;
  font-size: 14px;
}
</style>
