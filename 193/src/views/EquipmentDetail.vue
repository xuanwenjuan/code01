<template>
  <div class="equipment-detail" v-if="equipment">
    <div class="container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: `/category/${equipment.categoryId}` }">
          {{ categoryName }}
        </el-breadcrumb-item>
        <el-breadcrumb-item>{{ equipment.name }}</el-breadcrumb-item>
      </el-breadcrumb>

      <el-row :gutter="40" class="detail-main">
        <el-col :span="10">
          <div class="image-gallery">
            <div class="main-image">
              <img :src="equipment.image" :alt="equipment.name" />
            </div>
            <div class="quick-info">
              <div class="info-item">
                <el-icon :size="20" color="#409eff"><Clock /></el-icon>
                <span>使用寿命：{{ equipment.serviceLife }}</span>
              </div>
            </div>
          </div>
        </el-col>

        <el-col :span="14">
          <div class="detail-info">
            <div class="tags">
              <el-tag v-for="tag in equipment.tags" :key="tag" :type="getTagType(tag)">
                {{ tag }}
              </el-tag>
            </div>
            <h1 class="title">{{ equipment.name }}</h1>
            <p class="description">{{ equipment.description }}</p>
            
            <div class="price-section">
              <span class="price">¥{{ equipment.price }}</span>
              <span class="original-price">¥{{ equipment.originalPrice }}</span>
              <span class="discount">
                省¥{{ equipment.originalPrice - equipment.price }}
              </span>
            </div>

            <div class="stats">
              <span><el-rate v-model="equipment.rating" disabled :size="16" /></span>
              <span>销量 {{ equipment.sales }}</span>
              <span>库存 {{ equipment.stock }}</span>
              <span>供货商：{{ equipment.supplier }}</span>
            </div>

            <div class="specimen-types">
              <span class="label">标本适配类型：</span>
              <div class="type-tags">
                <el-tag 
                  v-for="type in equipment.specimenTypes" 
                  :key="type" 
                  size="small" 
                  type="info"
                  effect="plain"
                >
                  {{ type }}
                </el-tag>
              </div>
            </div>

            <div class="action-section">
              <div class="quantity">
                <span class="label">数量：</span>
                <el-input-number 
                  v-model="quantity" 
                  :min="1" 
                  :max="equipment.stock"
                  @change="calculateTotal"
                />
              </div>
              <div class="buttons">
                <el-button type="primary" size="large" @click="handleBuy">
                  <el-icon><ShoppingCart /></el-icon>
                  立即采购
                </el-button>
                <el-button size="large" @click="handleFavorite">
                  <el-icon>
                    <StarFilled v-if="isFavorited" />
                    <Star v-else />
                  </el-icon>
                  {{ isFavorited ? '已收藏' : '收藏' }}
                </el-button>
                <el-button size="large" @click="showGuide = true">
                  <el-icon><Guide /></el-icon>
                  操作指引
                </el-button>
              </div>
            </div>

            <div class="package-section" v-if="relatedEquipmentList.length > 0">
              <h3 class="package-title">
                <el-icon :size="20" color="#e6a23c"><Present /></el-icon>
                成套器材推荐（可搭配采购）
              </h3>
              <div class="package-list">
                <div 
                  v-for="item in relatedEquipmentList" 
                  :key="item.id"
                  class="package-item"
                  :class="{ active: selectedRelated.includes(item.id) }"
                  @click="toggleRelated(item.id)"
                >
                  <el-checkbox :model-value="selectedRelated.includes(item.id)" />
                  <img :src="item.image" :alt="item.name" />
                  <div class="item-info">
                    <p class="item-name">{{ item.name }}</p>
                    <p class="item-price">¥{{ item.price }}</p>
                  </div>
                </div>
              </div>
              <div class="package-total">
                <span>当前器材：¥{{ equipment.price }} × {{ quantity }}</span>
                <span v-if="selectedRelated.length > 0"> + 配套器材：¥{{ relatedTotal }}</span>
                <span class="total-price"> = 合计：¥{{ totalWithRelated }}</span>
                <el-button 
                  type="warning" 
                  size="small" 
                  :disabled="selectedRelated.length === 0"
                  @click="handlePackageBuy"
                >
                  成套采购
                </el-button>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>

      <el-tabs v-model="activeTab" class="detail-tabs">
        <el-tab-pane label="规格参数" name="specs">
          <el-card>
            <table class="specs-table">
              <tbody>
                <tr v-for="(value, key) in equipment.specifications" :key="key">
                  <th>{{ key }}</th>
                  <td>{{ value }}</td>
                </tr>
              </tbody>
            </table>
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="材质参数" name="material">
          <el-card>
            <div class="material-content">
              <h3>详细材质参数</h3>
              <table class="specs-table">
                <tbody>
                  <tr v-for="(value, key) in equipment.materialParams" :key="key">
                    <th>{{ key }}</th>
                    <td>{{ value }}</td>
                  </tr>
                </tbody>
              </table>
              <div class="service-life-info">
                <el-icon :size="24" color="#67c23a"><CircleCheck /></el-icon>
                <span>使用寿命：{{ equipment.serviceLife }}</span>
              </div>
            </div>
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="防腐性能说明" name="performance">
          <el-card>
            <div class="performance-content">
              <h3>性能指标</h3>
              <div class="performance-list">
                <div v-for="(item, index) in performanceList" :key="index" class="performance-item">
                  <span class="label">{{ item.label }}</span>
                  <div class="stars">
                    <el-rate v-model="item.value" disabled :max="5" :size="20" />
                  </div>
                </div>
              </div>
              <div class="performance-desc">
                <h3>详细说明</h3>
                <p>
                  本产品经过严格的质量检测，符合国家相关标准。采用环保材料制造，
                  对人体无害，对环境友好。适用于各类植物标本的制作与保存，
                  能够有效延长标本的使用寿命，保持标本的原始形态和色泽。
                </p>
                <p>
                  建议在干燥、通风、避光的环境下使用和保存。使用前请仔细阅读产品说明书，
                  按照操作规程进行操作。如有任何问题，请及时联系我们的客服人员。
                </p>
              </div>
            </div>
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="适用场景" name="scenarios">
          <el-card>
            <div class="scenarios-content">
              <h3>适用场景</h3>
              <div class="scenarios-grid">
                <div v-for="scenario in equipment.scenarios" :key="scenario" class="scenario-item">
                  <el-icon :size="32" color="#409eff"><CircleCheck /></el-icon>
                  <span>{{ scenario }}</span>
                </div>
              </div>
              <div class="scenarios-tips">
                <h3>使用建议</h3>
                <ul>
                  <li>根据标本类型选择合适的器材规格</li>
                  <li>使用前请确保器材清洁干燥</li>
                  <li>按照操作规程正确使用器材</li>
                  <li>使用后及时清洁保养，延长使用寿命</li>
                  <li>定期检查器材状态，及时更换老化部件</li>
                </ul>
              </div>
            </div>
          </el-card>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog v-model="orderDialogVisible" title="确认采购订单" width="600px">
      <el-form :model="orderForm" :rules="orderRules" ref="orderFormRef" label-width="100px">
        <el-form-item label="器材清单">
          <div class="order-items-list">
            <div class="order-item-row" v-for="item in orderItems" :key="item.id">
              <img :src="item.image" :alt="item.name" />
              <div class="order-item-info">
                <p class="order-item-name">{{ item.name }}</p>
                <p class="order-item-price">¥{{ item.price }} × {{ item.quantity }}</p>
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="总金额">
          <span class="price-large">¥{{ totalWithRelated }}</span>
        </el-form-item>
        <el-form-item label="采购单位" prop="institution">
          <el-input v-model="orderForm.institution" placeholder="请输入单位名称" />
        </el-form-item>
        <el-form-item label="联系人" prop="contact">
          <el-input v-model="orderForm.contact" placeholder="请输入联系人姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="orderForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="收货地址" prop="address">
          <el-input v-model="orderForm.address" type="textarea" :rows="2" placeholder="请输入详细地址" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="orderDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitOrder">提交订单</el-button>
      </template>
    </el-dialog>

    <el-dialog 
      v-model="showGuide" 
      title="器材使用操作指引" 
      width="700px"
      class="guide-dialog"
    >
      <div class="guide-content">
        <div class="guide-section">
          <h3>
            <el-icon :size="20" color="#409eff"><Operation /></el-icon>
            操作步骤
          </h3>
          <div class="steps-list">
            <div 
              v-for="(step, index) in equipment.operationGuide?.steps || []" 
              :key="index"
              class="step-item"
            >
              <div class="step-number">{{ index + 1 }}</div>
              <div class="step-content">{{ step }}</div>
            </div>
          </div>
        </div>
        <div class="guide-section tips-section">
          <h3>
            <el-icon :size="20" color="#e6a23c"><Warning /></el-icon>
            注意事项
          </h3>
          <ul class="tips-list">
            <li v-for="(tip, index) in equipment.operationGuide?.tips || []" :key="index">
              <el-icon :size="14" color="#e6a23c"><Star /></el-icon>
              {{ tip }}
            </li>
          </ul>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="showGuide = false">我知道了</el-button>
      </template>
    </el-dialog>
  </div>

  <EmptyState v-else text="器材不存在" type="product" />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useEquipmentStore } from '@/stores/equipment'
import { useUserStore } from '@/stores/user'
import { useFavoriteStore } from '@/stores/favorite'
import { useOrderStore } from '@/stores/order'
import EmptyState from '@/components/EmptyState.vue'
import {
  ShoppingCart, Star, StarFilled, CircleCheck, Clock,
  Present, Guide, Operation, Warning
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const equipmentStore = useEquipmentStore()
const userStore = useUserStore()
const favoriteStore = useFavoriteStore()
const orderStore = useOrderStore()

const equipment = computed(() => equipmentStore.getEquipmentById(route.params.id))
const category = computed(() => equipmentStore.getCategoryById(equipment.value?.categoryId))
const categoryName = computed(() => category.value?.name || '')
const isFavorited = computed(() => favoriteStore.isFavorite(route.params.id))

const activeTab = ref('specs')
const quantity = ref(1)
const orderDialogVisible = ref(false)
const showGuide = ref(false)
const orderFormRef = ref(null)
const selectedRelated = ref([])

const relatedEquipmentList = computed(() => {
  if (!equipment.value?.relatedEquipments) return []
  return equipment.value.relatedEquipments
    .map(id => equipmentStore.getEquipmentById(id))
    .filter(item => item)
})

const relatedTotal = computed(() => {
  return selectedRelated.value.reduce((sum, id) => {
    const item = equipmentStore.getEquipmentById(id)
    return sum + (item?.price || 0)
  }, 0)
})

const totalAmount = computed(() => (equipment.value?.price || 0) * quantity.value)
const totalWithRelated = computed(() => totalAmount.value + relatedTotal.value)

const orderItems = computed(() => {
  const items = [{
    id: equipment.value?.id,
    name: equipment.value?.name,
    price: equipment.value?.price,
    quantity: quantity.value,
    image: equipment.value?.image
  }]
  selectedRelated.value.forEach(id => {
    const item = equipmentStore.getEquipmentById(id)
    if (item) {
      items.push({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        image: item.image
      })
    }
  })
  return items
})

const orderForm = ref({
  institution: '',
  contact: '',
  phone: '',
  address: ''
})

const orderRules = {
  institution: [{ required: true, message: '请输入单位名称', trigger: 'blur' }],
  contact: [{ required: true, message: '请输入联系人姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  address: [{ required: true, message: '请输入收货地址', trigger: 'blur' }]
}

const performanceList = computed(() => {
  if (!equipment.value?.performance) return []
  return equipment.value.performance.split('\n').map(line => {
    const [label, stars] = line.split('：')
    const value = (stars?.match(/★/g) || []).length
    return { label, value }
  })
})

onMounted(() => {
  if (userStore.isLoggedIn) {
    orderForm.value.institution = userStore.user?.institution || userStore.user?.company || ''
    orderForm.value.contact = userStore.user?.name || ''
    orderForm.value.phone = userStore.user?.phone || ''
  }
  selectedRelated.value = []
})

watch(() => route.params.id, () => {
  selectedRelated.value = []
  quantity.value = 1
})

function getTagType(tag) {
  const typeMap = {
    '热销': 'danger',
    '新品': 'primary',
    '精选': 'success',
    '脱水压制': 'warning',
    '防腐保存': 'info'
  }
  return typeMap[tag] || 'info'
}

function calculateTotal() {
}

function toggleRelated(id) {
  const index = selectedRelated.value.indexOf(id)
  if (index > -1) {
    selectedRelated.value.splice(index, 1)
  } else {
    selectedRelated.value.push(id)
  }
}

function handleBuy() {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  orderDialogVisible.value = true
}

function handlePackageBuy() {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  if (selectedRelated.value.length === 0) {
    ElMessage.warning('请选择配套器材')
    return
  }
  orderDialogVisible.value = true
}

function handleFavorite() {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  favoriteStore.toggleFavorite(equipment.value)
  ElMessage.success(isFavorited.value ? '已收藏' : '已取消收藏')
}

async function submitOrder() {
  if (!orderFormRef.value) return
  
  try {
    await orderFormRef.value.validate()
    
    const newOrder = {
      items: orderItems.value.map(item => ({
        equipmentId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      totalAmount: totalWithRelated.value,
      buyerName: orderForm.value.contact,
      buyerInstitution: orderForm.value.institution,
      shippingAddress: orderForm.value.address
    }
    
    orderStore.createOrder(newOrder)
    orderDialogVisible.value = false
    ElMessage.success('订单提交成功')
    router.push('/orders')
  } catch (e) {
    console.log('表单验证失败')
  }
}
</script>

<style scoped>
.equipment-detail {
  padding: 20px 0;
}

.breadcrumb {
  margin-bottom: 20px;
}

.detail-main {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 20px;
}

.image-gallery {
  position: sticky;
  top: 100px;
}

.main-image {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
}

.main-image img {
  width: 100%;
  height: 400px;
  object-fit: cover;
}

.quick-info {
  margin-top: 16px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}

.detail-info .tags {
  margin-bottom: 16px;
}

.detail-info .tags :deep(.el-tag) {
  margin-right: 8px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 12px 0;
  color: #303133;
}

.description {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin: 0 0 20px 0;
}

.price-section {
  background: #fef0f0;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: baseline;
  gap: 16px;
}

.price {
  font-size: 32px;
  color: #f56c6c;
  font-weight: bold;
}

.price-large {
  font-size: 28px;
  color: #f56c6c;
  font-weight: bold;
}

.original-price {
  font-size: 16px;
  color: #909399;
  text-decoration: line-through;
}

.discount {
  background: #f56c6c;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.stats {
  display: flex;
  gap: 24px;
  padding: 16px 0;
  border-top: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 20px;
  font-size: 14px;
  color: #606266;
}

.specimen-types {
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.specimen-types .label {
  font-size: 14px;
  color: #606266;
  flex-shrink: 0;
  padding-top: 2px;
}

.type-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.action-section {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
}

.quantity {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quantity .label {
  font-size: 14px;
  color: #606266;
}

.buttons {
  display: flex;
  gap: 12px;
}

.package-section {
  background: #fff7e6;
  border: 1px solid #faecd8;
  border-radius: 8px;
  padding: 20px;
}

.package-title {
  font-size: 16px;
  margin: 0 0 16px 0;
  color: #e6a23c;
  display: flex;
  align-items: center;
  gap: 8px;
}

.package-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.package-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border: 2px solid #ebeef5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.package-item:hover {
  border-color: #409eff;
}

.package-item.active {
  border-color: #e6a23c;
  background: #fffef5;
}

.package-item img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 14px;
  color: #303133;
  margin: 0 0 4px 0;
}

.item-price {
  font-size: 14px;
  color: #f56c6c;
  font-weight: bold;
  margin: 0;
}

.package-total {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px dashed #faecd8;
  font-size: 14px;
  color: #606266;
}

.package-total .total-price {
  font-size: 18px;
  color: #f56c6c;
  font-weight: bold;
}

.package-total .el-button {
  margin-left: auto;
}

.detail-tabs {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
}

.specs-table {
  width: 100%;
  border-collapse: collapse;
}

.specs-table th,
.specs-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #ebeef5;
}

.specs-table th {
  width: 150px;
  background: #f5f7fa;
  color: #606266;
  font-weight: normal;
}

.specs-table td {
  color: #303133;
}

.specs-table tr:last-child th,
.specs-table tr:last-child td {
  border-bottom: none;
}

.material-content h3 {
  font-size: 16px;
  margin: 0 0 16px 0;
  color: #303133;
}

.service-life-info {
  margin-top: 20px;
  padding: 16px;
  background: #f0f9eb;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #67c23a;
  font-weight: 500;
}

.performance-content h3 {
  font-size: 16px;
  margin: 0 0 16px 0;
  color: #303133;
}

.performance-list {
  margin-bottom: 24px;
}

.performance-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
}

.performance-item .label {
  width: 120px;
  font-size: 14px;
  color: #606266;
}

.performance-desc p {
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
  margin: 0 0 12px 0;
}

.scenarios-content h3 {
  font-size: 16px;
  margin: 0 0 16px 0;
  color: #303133;
}

.scenarios-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.scenario-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  font-size: 14px;
  color: #303133;
}

.scenarios-tips ul {
  padding-left: 20px;
}

.scenarios-tips li {
  font-size: 14px;
  color: #606266;
  line-height: 2;
}

.order-items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-item-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.order-item-row img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.order-item-info {
  flex: 1;
}

.order-item-name {
  font-size: 14px;
  color: #303133;
  margin: 0 0 4px 0;
}

.order-item-price {
  font-size: 14px;
  color: #f56c6c;
  font-weight: bold;
  margin: 0;
}

.guide-dialog :deep(.el-dialog__body) {
  padding: 0 20px 20px;
}

.guide-content {
  max-height: 500px;
  overflow-y: auto;
}

.guide-section {
  margin-bottom: 24px;
}

.guide-section h3 {
  font-size: 16px;
  margin: 0 0 16px 0;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.step-number {
  width: 28px;
  height: 28px;
  background: #409eff;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 6px;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.tips-section {
  background: #fff7e6;
  padding: 16px;
  border-radius: 8px;
}

.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tips-list li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}
</style>
