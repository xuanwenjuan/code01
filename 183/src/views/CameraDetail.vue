<template>
  <div class="camera-detail-page container">
    <LoadingSpinner v-if="loading" />
    <EmptyState v-else-if="!camera" text="相机不存在或已下架" />
    
    <template v-else>
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ name: 'Home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ name: 'Cameras' }">相机选购</el-breadcrumb-item>
        <el-breadcrumb-item>{{ camera.name }}</el-breadcrumb-item>
      </el-breadcrumb>
      
      <div class="detail-content">
        <div class="gallery-section">
          <div class="main-image">
            <img :src="currentImage" :alt="camera.name" />
          </div>
          <div class="thumbnails" v-if="camera.images.length > 1">
            <div 
              v-for="(img, index) in camera.images" 
              :key="index"
              class="thumbnail"
              :class="{ active: currentImage === img }"
              @click="currentImage = img"
            >
              <img :src="img" alt="" />
            </div>
          </div>
        </div>
        
        <div class="info-section">
          <div class="camera-header">
            <span class="brand">{{ camera.brand }}</span>
            <h1 class="camera-name">{{ camera.name }}</h1>
            <div class="camera-tags">
              <el-tag v-if="camera.isHot" type="danger" effect="light">热门</el-tag>
              <el-tag :type="conditionTagType" effect="light">{{ conditionLabel }}</el-tag>
            </div>
          </div>
          
          <div class="price-box">
            <div class="price">
              <span class="currency">¥</span>
              <span class="amount" :key="totalPrice">{{ totalPrice.toLocaleString() }}</span>
            </div>
            <div class="original-price" v-if="originalTotalPrice > totalPrice">
              原价 ¥{{ originalTotalPrice.toLocaleString() }}
            </div>
            <div class="discount" v-if="originalTotalPrice > totalPrice">
              省 ¥{{ totalSave.toLocaleString() }}
            </div>
          </div>
          
          <div class="price-breakdown" v-if="selectedPackage.price > 0">
            <div class="breakdown-item">
              <span class="breakdown-label">机身价格</span>
              <span class="breakdown-value">¥{{ camera.price.toLocaleString() }}</span>
            </div>
            <div class="breakdown-item">
              <span class="breakdown-label">{{ selectedPackage.name }}</span>
              <span class="breakdown-value">+¥{{ selectedPackage.price.toLocaleString() }}</span>
            </div>
            <div class="breakdown-item total">
              <span class="breakdown-label">合计</span>
              <span class="breakdown-value">¥{{ totalPrice.toLocaleString() }}</span>
            </div>
          </div>
          
          <div class="info-row condition-row">
            <span class="label">成色等级</span>
            <div class="value">
              <div class="condition-display">
                <el-tag :type="conditionTagType" effect="light" size="large">{{ conditionLabel }}</el-tag>
                <span class="condition-desc">{{ conditionDesc }}</span>
              </div>
              <div class="condition-bar">
                <div 
                  v-for="opt in conditionOptions" 
                  :key="opt.value"
                  class="condition-bar-item"
                  :class="{ active: opt.value === camera.condition, passed: isConditionPassed(opt.value) }"
                >
                  <span class="bar-dot"></span>
                  <span class="bar-label">{{ opt.label }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="info-row">
            <span class="label">库存</span>
            <span class="value" :class="{ 'low-stock': camera.stock <= 3 }">
              {{ camera.stock }} 台
              <span v-if="camera.stock <= 3" class="stock-warning">库存紧张</span>
            </span>
          </div>
          
          <div class="info-row">
            <span class="label">销量</span>
            <span class="value">{{ camera.sales }} 件</span>
          </div>
          
          <div class="info-row">
            <span class="label">浏览</span>
            <span class="value">{{ camera.views }} 次</span>
          </div>
          
          <div class="info-row">
            <span class="label">卖家</span>
            <span class="value">{{ camera.merchantName }}</span>
          </div>
          
          <div class="package-section">
            <h3 class="section-label">选择套餐</h3>
            <div class="package-list">
              <div 
                v-for="pkg in camera.packages" 
                :key="pkg.id"
                class="package-item"
                :class="{ active: selectedPackage.id === pkg.id }"
                @click="selectedPackage = pkg"
              >
                <div class="package-header">
                  <span class="package-name">{{ pkg.name }}</span>
                  <span class="package-price" v-if="pkg.price > 0">+¥{{ pkg.price }}</span>
                  <span class="package-price free" v-else>免费</span>
                </div>
                <div class="package-items">
                  {{ pkg.items.join('、') }}
                </div>
              </div>
            </div>
          </div>
          
          <div class="action-buttons">
            <el-button 
              size="large" 
              :type="isFavorite ? 'warning' : 'default'"
              @click="handleFavorite"
              class="favorite-btn"
            >
              <el-icon><Star :fill="isFavorite ? '#e6a23c' : 'none'" /></el-icon>
              {{ isFavorite ? '已收藏' : '收藏' }}
            </el-button>
            <el-button 
              size="large" 
              type="primary" 
              :disabled="camera.stock === 0"
              @click="handleBuy"
              class="buy-btn"
            >
              立即购买
            </el-button>
          </div>
        </div>
      </div>
      
      <el-tabs v-model="activeTab" class="detail-tabs">
        <el-tab-pane label="商品详情" name="detail">
          <div class="tab-content">
            <h3 class="tab-title">相机介绍</h3>
            <p class="description">{{ camera.description }}</p>
            
            <h3 class="tab-title">成色说明</h3>
            <div class="condition-detail">
              <el-alert 
                :title="conditionLabel" 
                :description="conditionDesc" 
                :type="conditionTagType"
                show-icon
              />
            </div>
            
            <h3 class="tab-title">详细参数</h3>
            
            <div class="param-groups">
              <div class="param-group">
                <h4 class="group-title">
                  <el-icon><InfoFilled /></el-icon>
                  基本信息
                </h4>
                <el-descriptions :column="2" border size="small">
                  <el-descriptions-item label="品牌">{{ camera.brand }}</el-descriptions-item>
                  <el-descriptions-item label="型号">{{ camera.name }}</el-descriptions-item>
                  <el-descriptions-item label="相机类型">{{ camera.parameters.type }}</el-descriptions-item>
                  <el-descriptions-item label="生产年份">{{ camera.parameters.year }}</el-descriptions-item>
                </el-descriptions>
              </div>
              
              <div class="param-group">
                <h4 class="group-title">
                  <el-icon><CameraFilled /></el-icon>
                  技术规格
                </h4>
                <el-descriptions :column="2" border size="small">
                  <el-descriptions-item label="画幅">{{ camera.parameters.format }}</el-descriptions-item>
                  <el-descriptions-item v-if="camera.parameters.lensMount" label="镜头卡口">{{ camera.parameters.lensMount }}</el-descriptions-item>
                  <el-descriptions-item v-if="camera.parameters.lens" label="镜头">{{ camera.parameters.lens }}</el-descriptions-item>
                  <el-descriptions-item label="快门速度">{{ camera.parameters.shutterSpeed }}</el-descriptions-item>
                  <el-descriptions-item label="ISO范围">{{ camera.parameters.isoRange }}</el-descriptions-item>
                </el-descriptions>
              </div>
              
              <div class="param-group">
                <h4 class="group-title">
                  <el-icon><Box /></el-icon>
                  物理参数
                </h4>
                <el-descriptions :column="2" border size="small">
                  <el-descriptions-item label="重量">{{ camera.parameters.weight }}</el-descriptions-item>
                  <el-descriptions-item label="尺寸">{{ camera.parameters.dimensions }}</el-descriptions-item>
                </el-descriptions>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="套餐详情" name="package">
          <div class="tab-content">
            <h3 class="tab-title">套餐内容</h3>
            <el-table :data="camera.packages" border>
              <el-table-column prop="name" label="套餐名称" width="150" />
              <el-table-column prop="price" label="价格" width="120">
                <template #default="{ row }">
                  <span v-if="row.price > 0">+¥{{ row.price }}</span>
                  <span v-else class="text-success">免费</span>
                </template>
              </el-table-column>
              <el-table-column prop="items" label="包含内容">
                <template #default="{ row }">
                  <ul class="package-items-list">
                    <li v-for="(item, idx) in row.items" :key="idx">
                      <el-icon><Check /></el-icon>
                      {{ item }}
                    </li>
                  </ul>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="购买须知" name="notice">
          <div class="tab-content">
            <h3 class="tab-title">购买须知</h3>
            <el-steps direction="vertical" :active="4" finish-status="success">
              <el-step title="商品核验" description="所有二手相机均经过专业检测，确保功能完好" />
              <el-step title="包装发货" description="专业包装，顺丰/京东快递保价配送" />
              <el-step title="售后服务" description="7天无理由退换，180天质保服务" />
              <el-step title="终身维护" description="提供终身成本价维修保养服务" />
            </el-steps>
          </div>
        </el-tab-pane>
      </el-tabs>
    </template>
    
    <el-dialog v-model="orderDialogVisible" title="确认订单" width="600px">
      <el-form :model="orderForm" label-width="100px">
        <el-form-item label="商品信息">
          <span>{{ camera?.name }} - {{ selectedPackage.name }}</span>
        </el-form-item>
        <el-form-item label="订单金额">
          <span class="order-price">¥{{ totalPrice.toLocaleString() }}</span>
        </el-form-item>
        <el-form-item label="收货人">
          <el-input v-model="orderForm.contactName" placeholder="请输入收货人姓名" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="orderForm.contactPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="收货地址">
          <el-input 
            v-model="orderForm.address" 
            type="textarea" 
            :rows="2"
            placeholder="请输入详细收货地址"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input 
            v-model="orderForm.remark" 
            type="textarea" 
            :rows="2"
            placeholder="选填"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="orderDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitOrder" :loading="submitting">
          提交订单
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCameraStore } from '@/stores/camera'
import { useUserStore } from '@/stores/user'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import EmptyState from '@/components/EmptyState.vue'
import { conditionOptions } from '@/mock/data'
import { Star, Check, InfoFilled, CameraFilled, Box } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const cameraStore = useCameraStore()
const userStore = useUserStore()

const loading = ref(true)
const camera = ref(null)
const currentImage = ref('')
const activeTab = ref('detail')
const selectedPackage = ref({ id: 1, name: '标准版', price: 0, items: [] })
const orderDialogVisible = ref(false)
const submitting = ref(false)

const orderForm = reactive({
  contactName: '',
  contactPhone: '',
  address: '',
  remark: ''
})

const paramLabels = {
  type: '相机类型',
  format: '画幅',
  lensMount: '镜头卡口',
  shutterSpeed: '快门速度',
  isoRange: 'ISO范围',
  weight: '重量',
  dimensions: '尺寸',
  year: '生产年份',
  lens: '镜头'
}

const conditionLabel = computed(() => {
  if (!camera.value) return ''
  const option = conditionOptions.find(o => o.value === camera.value.condition)
  return option?.label || camera.value.condition
})

const conditionDesc = computed(() => {
  if (!camera.value) return ''
  const option = conditionOptions.find(o => o.value === camera.value.condition)
  return option?.description || ''
})

const conditionTagType = computed(() => {
  if (!camera.value) return 'info'
  const typeMap = {
    mint: 'success',
    excellent: 'primary',
    good: 'warning',
    fair: 'info'
  }
  return typeMap[camera.value.condition] || 'info'
})

const totalPrice = computed(() => {
  if (!camera.value) return 0
  return camera.value.price + (selectedPackage.value?.price || 0)
})

const originalTotalPrice = computed(() => {
  if (!camera.value) return 0
  return camera.value.originalPrice + (selectedPackage.value?.price || 0)
})

const totalSave = computed(() => {
  if (!camera.value) return 0
  return (camera.value.originalPrice - camera.value.price)
})

const conditionOrder = ['mint', 'excellent', 'good', 'fair']

const isConditionPassed = (conditionValue) => {
  if (!camera.value) return false
  const currentIndex = conditionOrder.indexOf(camera.value.condition)
  const targetIndex = conditionOrder.indexOf(conditionValue)
  return targetIndex <= currentIndex
}

const isFavorite = computed(() => userStore.isFavorite(camera.value?.id))

const handleFavorite = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  userStore.toggleFavorite(camera.value.id)
  ElMessage.success(isFavorite.value ? '已取消收藏' : '已加入收藏')
}

const handleBuy = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  if (camera.value.stock === 0) {
    ElMessage.warning('库存不足')
    return
  }
  
  orderForm.contactName = userStore.userInfo?.nickname || ''
  orderForm.contactPhone = userStore.userInfo?.phone || ''
  orderForm.address = userStore.userInfo?.address || ''
  orderDialogVisible.value = true
}

const submitOrder = async () => {
  if (!orderForm.contactName.trim()) {
    ElMessage.warning('请输入收货人姓名')
    return
  }
  if (!/^1[3-9]\d{9}$/.test(orderForm.contactPhone)) {
    ElMessage.warning('请输入正确的手机号码')
    return
  }
  if (!orderForm.address.trim()) {
    ElMessage.warning('请输入收货地址')
    return
  }
  
  submitting.value = true
  
  try {
    const order = userStore.createOrder({
      cameraId: camera.value.id,
      cameraName: camera.value.name,
      packageName: selectedPackage.value.name,
      price: totalPrice.value,
      quantity: 1,
      ...orderForm
    })
    
    ElMessage.success('订单提交成功')
    orderDialogVisible.value = false
    router.push('/orders')
  } catch (error) {
    ElMessage.error('订单提交失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  const id = route.params.id
  setTimeout(() => {
    camera.value = cameraStore.getCameraById(id)
    if (camera.value) {
      currentImage.value = camera.value.images[0]
      selectedPackage.value = camera.value.packages[0] || selectedPackage.value
      cameraStore.incrementViews(camera.value.id)
    }
    loading.value = false
  }, 300)
})
</script>

<style lang="scss" scoped>
.camera-detail-page {
  padding-top: 20px;
}

.breadcrumb {
  margin-bottom: 20px;
}

.detail-content {
  display: flex;
  gap: 40px;
  background: #fff;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 12px rgba(93, 78, 55, 0.08);
}

.gallery-section {
  width: 480px;
  flex-shrink: 0;
}

.main-image {
  width: 100%;
  padding-top: 75%;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: #f5f1e8;
  margin-bottom: 16px;
  
  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.thumbnails {
  display: flex;
  gap: 12px;
}

.thumbnail {
  width: 80px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
  
  &:hover, &.active {
    border-color: #8b6914;
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.info-section {
  flex: 1;
  min-width: 0;
}

.camera-header {
  margin-bottom: 20px;
}

.brand {
  display: inline-block;
  font-size: 14px;
  color: #8b6914;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.camera-name {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

.camera-tags {
  display: flex;
  gap: 8px;
}

.price-box {
  background: linear-gradient(135deg, #f5e6c8 0%, #f0e0c0 100%);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
}

.price {
  display: flex;
  align-items: baseline;
  
  .currency {
    font-size: 18px;
    color: #c45c00;
    font-weight: 600;
  }
  
  .amount {
    font-size: 36px;
    font-weight: bold;
    color: #c45c00;
  }
}

.original-price {
  font-size: 16px;
  color: #999;
  text-decoration: line-through;
}

.discount {
  background: #f56c6c;
  color: #fff;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 13px;
}

.price-breakdown {
  background: #faf8f3;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  border: 1px solid #e8e0d0;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
  
  &.total {
    border-top: 1px dashed #d4c8b0;
    margin-top: 8px;
    padding-top: 12px;
    font-weight: 600;
    
    .breakdown-value {
      font-size: 18px;
      color: #c45c00;
    }
  }
}

.breakdown-label {
  color: #666;
}

.breakdown-value {
  color: #333;
  font-weight: 500;
}

.info-row {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0ebe0;
  
  &:last-of-type {
    border-bottom: none;
  }
}

.label {
  width: 80px;
  color: #666;
  font-size: 14px;
}

.value {
  flex: 1;
  color: #333;
  font-size: 14px;
  
  &.low-stock {
    color: #f56c6c;
  }
}

.stock-warning {
  margin-left: 8px;
  font-size: 12px;
  background: rgba(245, 108, 108, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
}

.condition-row {
  align-items: flex-start;
  padding-top: 16px;
  padding-bottom: 16px;
}

.condition-display {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.condition-desc {
  color: #666;
  font-size: 13px;
}

.condition-bar {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 12px 0;
}

.condition-bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 8px;
    left: -50%;
    width: 100%;
    height: 3px;
    background: #e0e0e0;
    z-index: 0;
  }
  
  &:first-child::before {
    display: none;
  }
  
  &.passed::before {
    background: #8b6914;
  }
}

.bar-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #e0e0e0;
  border: 3px solid #fff;
  box-shadow: 0 0 0 2px #e0e0e0;
  z-index: 1;
  margin-bottom: 6px;
  transition: all 0.3s;
  
  .passed & {
    background: #8b6914;
    box-shadow: 0 0 0 2px #8b6914;
  }
  
  .active & {
    background: #8b6914;
    box-shadow: 0 0 0 2px #8b6914, 0 0 10px rgba(139, 105, 20, 0.5);
    transform: scale(1.2);
  }
}

.bar-label {
  font-size: 12px;
  color: #999;
  
  .passed &, .active & {
    color: #8b6914;
    font-weight: 600;
  }
}

.package-section {
  margin: 24px 0;
}

.section-label {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.package-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.package-item {
  border: 2px solid #e8e0d0;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #c4b088;
  }
  
  &.active {
    border-color: #8b6914;
    background: rgba(139, 105, 20, 0.05);
  }
}

.package-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.package-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.package-price {
  font-size: 14px;
  color: #c45c00;
  font-weight: 600;
  
  &.free {
    color: #67c23a;
  }
}

.package-items {
  font-size: 13px;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 16px;
  margin-top: 30px;
}

.favorite-btn {
  flex: 1;
}

.buy-btn {
  flex: 2;
  background: #8b6914;
  border-color: #8b6914;
  
  &:hover {
    background: #a67c00;
    border-color: #a67c00;
  }
}

.detail-tabs {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(93, 78, 55, 0.08);
}

.tab-content {
  padding: 20px 0;
}

.tab-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 24px 0 16px;
  
  &:first-child {
    margin-top: 0;
  }
}

.description {
  font-size: 15px;
  line-height: 1.8;
  color: #555;
  margin-bottom: 20px;
}

.condition-detail {
  margin-bottom: 24px;
}

.package-items-list {
  li {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 0;
    
    .el-icon {
      color: #67c23a;
    }
  }
}

.order-price {
  font-size: 20px;
  font-weight: bold;
  color: #c45c00;
}

.text-success {
  color: #67c23a;
}

.param-groups {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.param-group {
  background: #faf8f3;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e8e0d0;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
  
  .el-icon {
    color: #8b6914;
    font-size: 18px;
  }
}

.amount {
  transition: all 0.3s ease;
}

@keyframes priceChange {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); color: #f56c6c; }
  100% { transform: scale(1); }
}

.amount {
  animation: priceChange 0.5s ease;
}

@media (max-width: 1024px) {
  .detail-content {
    flex-direction: column;
  }
  
  .gallery-section {
    width: 100%;
  }
}
</style>
