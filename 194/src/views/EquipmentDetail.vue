<template>
  <div class="detail-page">
    <div class="container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/category/all' }">器材列表</el-breadcrumb-item>
        <el-breadcrumb-item>{{ equipment?.name }}</el-breadcrumb-item>
      </el-breadcrumb>

      <LoadingWrapper :loading="loading">
        <div v-if="equipment" class="detail-content">
          <div class="detail-header">
            <div class="gallery-section">
              <div class="main-image">
                <img :src="equipment.image" :alt="equipment.name" />
              </div>
            </div>

            <div class="info-section">
              <div class="tag-row">
                <el-tag 
                  :class="equipment.subCategory === 'deepspace' ? 'tag-deepspace' : 'tag-planet'"
                  size="large"
                >
                  {{ equipment.subCategory === 'deepspace' ? '深空观测' : '行星观测' }}
                </el-tag>
                <el-tag size="large" effect="plain">销量 {{ equipment.sales }}</el-tag>
                <el-tag size="large" type="success" effect="plain">
                  <el-icon><CircleCheck /></el-icon>正品保障
                </el-tag>
              </div>

              <h1 class="equipment-title">{{ equipment.name }}</h1>
              <p class="equipment-desc">{{ equipment.description }}</p>

              <div class="price-box">
                <div class="price-main">
                  <span class="price-label">采购价</span>
                  <span class="price-current">¥{{ equipment.price.toLocaleString() }}</span>
                  <span class="price-original" v-if="equipment.originalPrice">
                    ¥{{ equipment.originalPrice.toLocaleString() }}
                  </span>
                </div>
                <div class="price-discount" v-if="equipment.originalPrice">
                  <el-tag type="danger" size="small">
                    省{{ (equipment.originalPrice - equipment.price).toLocaleString() }}元
                  </el-tag>
                </div>
              </div>

              <div class="spec-summary">
                <div class="spec-item" v-if="equipment.aperture">
                  <span class="spec-label">口径</span>
                  <span class="spec-value">{{ equipment.aperture }}mm</span>
                </div>
                <div class="spec-item" v-if="equipment.focalLength">
                  <span class="spec-label">焦距</span>
                  <span class="spec-value">{{ equipment.focalLength }}mm</span>
                </div>
                <div class="spec-item" v-if="equipment.magnifyMax">
                  <span class="spec-label">倍率</span>
                  <span class="spec-value">{{ equipment.magnifyMin }}-{{ equipment.magnifyMax }}x</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">库存</span>
                  <span class="spec-value">{{ equipment.stock }} 台</span>
                </div>
              </div>

              <div class="supplier-info">
                <el-icon color="#409eff"><OfficeBuilding /></el-icon>
                <span>供货商：{{ equipment.supplier }}</span>
              </div>

              <div class="purchase-section">
                <div class="purchase-row">
                  <span class="purchase-label">采购数量</span>
                  <div class="quantity-controls">
                    <el-input-number 
                      v-model="quantity" 
                      :min="1" 
                      :max="equipment.stock"
                      size="large"
                    />
                    <span class="stock-tip">库存 {{ equipment.stock }} 台</span>
                  </div>
                </div>

                <div class="purchase-row">
                  <span class="purchase-label">采购套餐</span>
                  <el-checkbox v-model="includeAccessories">
                    包含校准配件套装 (+¥{{ accessoryPrice.toLocaleString() }}）
                  </el-checkbox>
                </div>

                <div class="purchase-row" v-if="includeAccessories">
                  <span class="purchase-label">配件清单</span>
                  <div class="accessories-list">
                    <el-tag v-for="acc in accessories" :key="acc" size="small" type="info" effect="plain">
                      {{ acc }}
                    </el-tag>
                  </div>
                </div>

                <div class="total-price-box">
                  <span class="total-label">总价：</span>
                  <span class="total-amount">¥{{ totalPrice.toLocaleString() }}</span>
                  <span class="total-unit">（共 {{ quantity }} 台）</span>
                </div>
              </div>

              <div class="action-row">
                <div class="action-buttons">
                  <el-button 
                    size="large" 
                    :type="isFavorited ? 'danger' : 'default'"
                    @click="toggleFav"
                  >
                    <el-icon><StarFilled v-if="isFavorited" /><Star v-else /></el-icon>
                    {{ isFavorited ? '已收藏' : '收藏' }}
                  </el-button>
                  <el-button size="large" @click="openCalibration">
                    <el-icon><Tools /></el-icon>校准指引
                  </el-button>
                  <el-button type="primary" size="large" class="buy-btn" @click="handleBuy">
                    <el-icon><ShoppingCart /></el-icon>立即采购
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <el-tabs v-model="activeTab" class="detail-tabs">
            <el-tab-pane label="光学参数" name="params">
              <div class="params-section">
                <h3 class="section-title">
                  <el-icon color="#409eff"><Aim /></el-icon>光学系统参数
                </h3>
                <el-descriptions :column="2" border size="default" class="params-desc">
                  <el-descriptions-item
                    v-for="(value, key) in equipment.specifications"
                    :key="key"
                    :label="key"
                  >
                    {{ value }}
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </el-tab-pane>

            <el-tab-pane label="环境适配" name="environment">
              <div class="environment-section">
                <h3 class="section-title">
                  <el-icon color="#67c23a"><PartlyCloudy /></el-icon>环境适配范围
                </h3>
                
                <div class="env-cards">
                  <div class="env-card">
                    <div class="env-icon temp">
                      <el-icon :size="32" color="#fff"><Sunny /></el-icon>
                    </div>
                    <div class="env-content">
                      <h4>工作温度</h4>
                      <p>{{ equipment.envTemperature || '-20°C ~ 50°C' }}</p>
                    </div>
                  </div>
                  <div class="env-card">
                    <div class="env-icon humidity">
                      <el-icon :size="32" color="#fff"><Star /></el-icon>
                    </div>
                    <div class="env-content">
                      <h4>环境湿度</h4>
                      <p>{{ equipment.envHumidity || '5% ~ 95% (非冷凝)' }}</p>
                    </div>
                  </div>
                  <div class="env-card">
                    <div class="env-icon altitude">
                      <el-icon :size="32" color="#fff"><IceCream /></el-icon>
                    </div>
                    <div class="env-content">
                      <h4>海拔高度</h4>
                      <p>{{ equipment.envAltitude || '≤ 4000m' }}</p>
                    </div>
                  </div>
                  <div class="env-card">
                    <div class="env-icon protection">
                      <el-icon :size="32" color="#fff"><Lock /></el-icon>
                    </div>
                    <div class="env-content">
                      <h4>防护等级</h4>
                      <p>{{ equipment.antiInterference }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="观测目标" name="targets">
              <div class="targets-section">
                <h3 class="section-title">
                  <el-icon color="#f56c6c"><Moon /></el-icon>观测目标类型
                </h3>
                
                <div class="target-categories">
                  <div class="target-category">
                    <h4>深空天体</h4>
                    <div class="target-tags">
                      <el-tag
                        v-for="target in deepSkyTargets"
                        :key="target"
                        size="large"
                        type="primary"
                        effect="light"
                      >
                        {{ target }}
                      </el-tag>
                    </div>
                  </div>
                  <div class="target-category">
                    <h4>太阳系天体</h4>
                    <div class="target-tags">
                      <el-tag
                        v-for="target in solarTargets"
                        :key="target"
                        size="large"
                        type="success"
                        effect="light"
                      >
                        {{ target }}
                      </el-tag>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
        <EmptyState v-else type="equipment" text="器材不存在或已下架" />
      </LoadingWrapper>
    </div>

    <el-dialog
      v-model="calibrationDialogVisible"
      title="器材校准操作指引"
      width="700px"
      :close-on-click-modal="false"
    >
      <div class="calibration-content">
        <div class="calibration-steps">
          <el-steps :active="currentStep" finish-status="success" align-center>
            <el-step title="准备工作" />
            <el-step title="光学调校" />
            <el-step title="准直校准" />
            <el-step title="测试验证" />
            <el-step title="完成" />
          </el-steps>
        </div>

        <div class="step-content">
          <div v-show="currentStep === 0" class="step-panel">
            <h3>步骤 1：准备工作</h3>
            <p>在开始校准前，请确保以下准备工作：</p>
            <ul>
              <li>将设备放置在稳定的平台或赤道仪上</li>
              <li>确保设备与环境温度平衡（约30分钟）</li>
              <li>准备校准目镜、工具等配件</li>
              <li>选择一个明亮的恒星作为校准目标</li>
            </ul>
          </div>

          <div v-show="currentStep === 1" class="step-panel">
            <h3>步骤 2：光学调校</h3>
            <p>进行初步光学调校：</p>
            <ul>
              <li>使用低倍率目镜，对准明亮恒星</li>
              <li>调整焦距使星点在视场中心</li>
              <li>观察衍射环是否均匀对称</li>
              <li>微调镜筒固定螺丝松紧度</li>
            </ul>
          </div>

          <div v-show="currentStep === 2" class="step-panel">
            <h3>步骤 3：准直校准</h3>
            <p>进行精确光轴校准：</p>
            <ul>
              <li>使用校准目镜进行光轴校准</li>
              <li>调整副镜位置使十字线对准中心</li>
              <li>检查主镜、副镜对齐</li>
              <li>反复微调直至完美同心</li>
            </ul>
          </div>

          <div v-show="currentStep === 3" class="step-panel">
            <h3>步骤 4：测试验证</h3>
            <p>验证校准效果：</p>
            <ul>
              <li>使用高倍率目镜观测恒星衍射环</li>
              <li>检查衍射环是否均匀对称</li>
              <li>进行焦点内外测试</li>
              <li>确认星点成像质量</li>
            </ul>
          </div>

          <div v-show="currentStep === 4" class="step-panel">
            <h3>校准完成！</h3>
            <p>器材校准已完成，您可以：</p>
            <ul>
              <li>开始目标天体观测</li>
              <li>记录当前校准参数</li>
              <li>定期检查校准状态</li>
            </ul>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="calibrationDialogVisible = false">关闭</el-button>
        <el-button v-if="currentStep > 0" @click="currentStep--">上一步</el-button>
        <el-button v-if="currentStep < 4" type="primary" @click="currentStep++">下一步</el-button>
        <el-button v-else type="success" @click="calibrationDialogVisible = false">完成</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useEquipmentStore } from '@/store/equipment'
import { useOrderStore } from '@/store/order'
import LoadingWrapper from '@/components/LoadingWrapper.vue'
import EmptyState from '@/components/EmptyState.vue'

const route = useRoute()
const router = useRouter()
const equipmentStore = useEquipmentStore()
const orderStore = useOrderStore()

const loading = ref(true)
const activeTab = ref('params')
const quantity = ref(1)
const includeAccessories = ref(false)
const calibrationDialogVisible = ref(false)
const currentStep = ref(0)
const accessoryPrice = 2800

const accessories = [
  '专业目镜套装 (1.25英寸)',
  '巴洛镜 2x',
  '滤镜轮',
  '校准目镜',
  '便携收纳包',
  '清洁工具套装'
]

const deepSkyTargets = [
  '深空天体', '发射星云', '疏散星团', '球状星团',
  '河外星系', '行星状星云', '超新星遗迹', '暗星云'
]

const solarTargets = [
  '月球', '木星', '土星', '火星', '金星',
  '太阳（需配滤镜）', '木星卫星', '土星光环'
]

const equipment = computed(() => {
  return equipmentStore.getEquipmentById(route.params.id)
})

const isFavorited = computed(() => {
  return equipment.value ? equipmentStore.isFavorite(equipment.value.id) : false
})

const totalPrice = computed(() => {
  if (equipment.value) {
    const base = equipment.value.price * quantity.value
    const acc = includeAccessories.value ? accessoryPrice : 0
    return base + acc
  }
  return 0
})

function toggleFav() {
  if (equipment.value) {
    equipmentStore.toggleFavorite(equipment.value.id)
    ElMessage.success(isFavorited.value ? '已收藏' : '已取消收藏')
  }
}

function handleBuy() {
  if (equipment.value) {
    orderStore.createOrder(equipment.value, quantity.value)
    ElMessage.success('采购订单已创建，请到个人中心查看')
    router.push('/profile/orders')
  }
}

function openCalibration() {
  currentStep.value = 0
  calibrationDialogVisible.value = true
}

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 300)
})
</script>

<style lang="scss" scoped>
.detail-page {
  padding: 40px 0;
}

.breadcrumb {
  margin-bottom: 24px;
}

.detail-content {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.detail-header {
  display: grid;
  grid-template-columns: 480px 1fr;
  gap: 40px;
  margin-bottom: 32px;
}

.gallery-section .main-image {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f7fa;
}

.gallery-section .main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-section {
  display: flex;
  flex-direction: column;
}

.tag-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.equipment-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2d3d;
  margin-bottom: 12px;
}

.equipment-desc {
  font-size: 15px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 24px;
}

.price-box {
  background: linear-gradient(90deg, #fff5f5 0%, #ffeaea 100%);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.price-main {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 8px;
}

.price-label {
  font-size: 14px;
  color: #606266;
}

.price-current {
  font-size: 36px;
  font-weight: 700;
  color: #f56c6c;
}

.price-original {
  font-size: 16px;
  color: #909399;
  text-decoration: line-through;
}

.spec-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.spec-item {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
}

.spec-label {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.spec-value {
  font-size: 16px;
  font-weight: 600;
  color: #1f2d3d;
}

.supplier-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
  margin-bottom: 24px;
}

.purchase-section {
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.purchase-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.purchase-row:last-child {
  margin-bottom: 0;
}

.purchase-label {
  width: 100px;
  font-size: 14px;
  color: #606266;
  flex-shrink: 0;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stock-tip {
  font-size: 12px;
  color: #909399;
}

.accessories-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.total-price-box {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding-top: 16px;
  margin-top: 16px;
  border-top: 1px dashed #e4e7ed;
}

.total-label {
  font-size: 16px;
  color: #606266;
}

.total-amount {
  font-size: 28px;
  font-weight: 700;
  color: #f56c6c;
}

.total-unit {
  font-size: 13px;
  color: #909399;
}

.action-row {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-top: auto;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.buy-btn {
  min-width: 160px;
}

.detail-tabs {
  border-top: 1px solid #f0f0f0;
  padding-top: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2d3d;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.params-section {
  padding: 20px 0;
}

.environment-section {
  padding: 20px 0;
}

.env-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.env-card {
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s;
}

.env-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.env-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
}

.env-icon.temp {
  background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
}

.env-icon.humidity {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
}

.env-icon.altitude {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
}

.env-icon.protection {
  background: linear-gradient(135deg, #e6a23c 0%, #f3d19e 100%);
}

.env-content h4 {
  font-size: 15px;
  font-weight: 600;
  color: #1f2d3d;
  margin-bottom: 4px;
}

.env-content p {
  font-size: 13px;
  color: #606266;
}

.targets-section {
  padding: 20px 0;
}

.target-categories {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.target-category {
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
}

.target-category h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2d3d;
  margin-bottom: 12px;
}

.target-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.target-tags .el-tag {
  padding: 6px 16px;
  font-size: 13px;
}

.calibration-content {
  padding: 20px 0;
}

.calibration-steps {
  margin-bottom: 32px;
}

.step-content {
  min-height: 200px;
}

.step-panel h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2d3d;
  margin-bottom: 16px;
}

.step-panel p {
  font-size: 15px;
  color: #606266;
  margin-bottom: 12px;
}

.step-panel ul {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.step-panel li {
  font-size: 14px;
  color: #606266;
  padding-left: 20px;
  position: relative;
}

.step-panel li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #409eff;
  font-weight: bold;
}
</style>
