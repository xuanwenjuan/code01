<template>
  <div class="after-sales-page">
    <div class="container">
      <h2 class="page-title">售后申请</h2>
      
      <div class="content-layout">
        <div class="left-section">
          <div class="card vintage-border">
            <div class="card-header">
              <h3>申请售后</h3>
            </div>
            
            <el-form 
              ref="afterSaleFormRef"
              :model="afterSaleForm" 
              :rules="afterSaleRules" 
              class="after-sale-form"
              label-width="100px"
            >
              <el-form-item label="选择订单" prop="orderId">
                <el-select 
                  v-model="afterSaleForm.orderId" 
                  placeholder="请选择订单" 
                  style="width: 100%"
                  @change="handleOrderChange"
                >
                  <el-option 
                    v-for="order in eligibleOrders" 
                    :key="order.id" 
                    :label="`${order.orderNo} - ${order.items[0].name}`" 
                    :value="order.id"
                  />
                </el-select>
              </el-form-item>
              
              <el-form-item label="商品信息">
                <div v-if="selectedOrder" class="selected-order-info">
                  <img :src="selectedOrder.items[0].image" alt="" class="order-img" />
                  <div class="order-detail">
                    <p class="order-name">{{ selectedOrder.items[0].name }}</p>
                    <p class="order-price">¥{{ selectedOrder.totalPrice.toFixed(2) }}</p>
                  </div>
                </div>
                <span v-else class="text-muted">请先选择订单</span>
              </el-form-item>
              
              <el-form-item label="售后类型" prop="type">
                <el-radio-group v-model="afterSaleForm.type">
                  <el-radio value="return">退货退款</el-radio>
                  <el-radio value="exchange">换货</el-radio>
                  <el-radio value="repair">维修</el-radio>
                </el-radio-group>
              </el-form-item>
              
              <el-form-item label="申请原因" prop="reason">
                <el-select v-model="afterSaleForm.reason" placeholder="请选择原因" style="width: 100%">
                  <el-option 
                    v-for="(label, value) in afterSaleReasonMap" 
                    :key="value" 
                    :label="label" 
                    :value="value"
                  />
                </el-select>
              </el-form-item>
              
              <el-form-item label="问题描述" prop="description">
                <el-input 
                  v-model="afterSaleForm.description" 
                  type="textarea" 
                  :rows="4" 
                  placeholder="请详细描述您遇到的问题，以便我们更好地为您处理（至少10个字符）"
                  maxlength="500"
                  show-word-limit
                />
              </el-form-item>
              
              <el-form-item label="上传凭证">
                <el-upload 
                  action="#" 
                  list-type="picture-card"
                  :auto-upload="false"
                  :limit="3"
                  @change="handleUploadChange"
                >
                  <el-icon><Plus /></el-icon>
                </el-upload>
                <p class="upload-tip">最多上传3张图片，支持JPG、PNG格式，单张不超过5MB</p>
              </el-form-item>
              
              <el-form-item label="联系方式" prop="contact">
                <el-input 
                  v-model="afterSaleForm.contact" 
                  placeholder="请输入手机号，方便我们联系您"
                />
              </el-form-item>
              
              <el-form-item>
                <el-button 
                  type="primary" 
                  @click="submitAfterSale"
                  :disabled="!afterSaleForm.orderId"
                >提交申请</el-button>
                <el-button @click="resetForm">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
        
        <div class="right-section">
          <div class="card vintage-border">
            <div class="card-header">
              <h3>售后记录</h3>
              <span class="record-count">共 {{ userAfterSales.length }} 条</span>
            </div>
            
            <div v-if="userAfterSales.length === 0" class="empty-list">
              <EmptyState text="暂无售后记录" />
            </div>
            
            <div v-else class="after-sale-list">
              <div 
                v-for="item in userAfterSales" 
                :key="item.id" 
                class="after-sale-item"
              >
                <div class="item-header">
                  <span class="item-order">{{ item.orderNo }}</span>
                  <el-tag :type="getStatusType(item.status)" size="small">
                    {{ getStatusText(item.status) }}
                  </el-tag>
                </div>
                <div class="item-body">
                  <p class="item-product">{{ item.productName }}</p>
                  <p class="item-type">
                    {{ getTypeText(item.type) }} - {{ afterSaleReasonMap[item.reason] || item.reason }}
                  </p>
                  <p class="item-desc">{{ item.description }}</p>
                  <p class="item-time">申请时间：{{ formatDate(item.createdAt) }}</p>
                  <p v-if="item.result" class="item-result">处理结果：{{ item.result }}</p>
                  <div v-if="item.status === 'pending'" class="item-actions">
                    <el-button size="small" type="danger" text @click="handleCancel(item)">
                      取消申请
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="card vintage-border notice-card">
            <div class="card-header">
              <h3>售后须知</h3>
            </div>
            <div class="notice-content">
              <div class="notice-item">
                <el-icon><CircleCheck /></el-icon>
                <span>7天无理由退换货（不影响二次销售）</span>
              </div>
              <div class="notice-item">
                <el-icon><CircleCheck /></el-icon>
                <span>质量问题免费退换，运费我们承担</span>
              </div>
              <div class="notice-item">
                <el-icon><CircleCheck /></el-icon>
                <span>收到货后请及时检查，如有问题请在24小时内联系</span>
              </div>
              <div class="notice-item">
                <el-icon><CircleCheck /></el-icon>
                <span>定制商品不支持无理由退换货</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, CircleCheck } from '@element-plus/icons-vue'
import { useOrderStore } from '@/stores/order'
import { useUserStore } from '@/stores/user'
import EmptyState from '@/components/EmptyState.vue'
import { formatDate, afterSaleStatusMap, afterSaleTypeMap, afterSaleReasonMap, validators } from '@/utils/validators'

const router = useRouter()
const route = useRoute()
const orderStore = useOrderStore()
const userStore = useUserStore()

const afterSaleFormRef = ref(null)
const uploadedFiles = ref([])

const afterSaleForm = reactive({
  orderId: null,
  orderNo: '',
  productName: '',
  type: 'return',
  reason: '',
  description: '',
  contact: ''
})

const eligibleOrders = computed(() => {
  return orderStore.userOrders.filter(o => 
    o.status === 'shipped' || o.status === 'completed'
  )
})

const selectedOrder = computed(() => {
  if (!afterSaleForm.orderId) return null
  return orderStore.getOrderById(afterSaleForm.orderId)
})

const userAfterSales = computed(() => {
  return orderStore.userAfterSales
})

const validateContact = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入联系方式'))
  } else if (!validators.phone.pattern.test(value)) {
    callback(new Error('请输入有效的手机号'))
  } else {
    callback()
  }
}

const afterSaleRules = {
  orderId: [{ required: true, message: '请选择订单', trigger: 'change' }],
  type: [{ required: true, message: '请选择售后类型', trigger: 'change' }],
  reason: [{ required: true, message: '请选择申请原因', trigger: 'change' }],
  description: [
    { required: true, message: '请输入问题描述', trigger: 'blur' },
    { min: 10, message: '描述至少10个字符', trigger: 'blur' },
    { max: 500, message: '描述不能超过500个字符', trigger: 'blur' }
  ],
  contact: [{ validator: validateContact, trigger: 'blur' }]
}

onMounted(() => {
  const orderId = route.query.orderId
  if (orderId) {
    afterSaleForm.orderId = Number(orderId)
    handleOrderChange()
  }
})

watch(() => route.query.orderId, (newVal) => {
  if (newVal) {
    afterSaleForm.orderId = Number(newVal)
    handleOrderChange()
  }
})

const handleOrderChange = () => {
  if (selectedOrder.value) {
    afterSaleForm.orderNo = selectedOrder.value.orderNo
    afterSaleForm.productName = selectedOrder.value.items[0].name
  }
}

const getTypeText = (type) => {
  return afterSaleTypeMap[type] || type
}

const getStatusText = (status) => {
  return afterSaleStatusMap[status]?.text || status
}

const getStatusType = (status) => {
  return afterSaleStatusMap[status]?.type || 'info'
}

const handleUploadChange = (uploadFile, uploadFiles) => {
  uploadedFiles.value = uploadFiles
}

const submitAfterSale = async () => {
  if (!afterSaleFormRef.value) return
  
  try {
    await afterSaleFormRef.value.validate()
    
    if (!userStore.userInfo) {
      ElMessage.error('请先登录')
      router.push('/login')
      return
    }
    
    orderStore.addAfterSale({
      userId: userStore.userInfo.id,
      orderId: afterSaleForm.orderId,
      orderNo: afterSaleForm.orderNo,
      productName: afterSaleForm.productName,
      type: afterSaleForm.type,
      reason: afterSaleForm.reason,
      description: afterSaleForm.description,
      contact: afterSaleForm.contact,
      images: uploadedFiles.value.map(f => f.url || '')
    })
    
    ElMessage.success('售后申请提交成功！我们会尽快处理')
    resetForm()
  } catch (error) {
    console.error('Validation failed:', error)
  }
}

const resetForm = () => {
  if (afterSaleFormRef.value) {
    afterSaleFormRef.value.resetFields()
  }
  afterSaleForm.orderId = null
  afterSaleForm.orderNo = ''
  afterSaleForm.productName = ''
  afterSaleForm.type = 'return'
  afterSaleForm.reason = ''
  afterSaleForm.description = ''
  afterSaleForm.contact = ''
  uploadedFiles.value = []
}

const handleCancel = (item) => {
  ElMessageBox.confirm('确定要取消该售后申请吗？', '提示', {
    confirmButtonText: '确定取消',
    cancelButtonText: '再想想',
    type: 'warning'
  }).then(() => {
    orderStore.updateAfterSaleStatus(item.id, 'cancelled', '用户取消申请')
    ElMessage.success('申请已取消')
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.after-sales-page {
  padding: 40px 0;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #2c1810;
  margin-bottom: 24px;
}

.content-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.left-section {
  flex: 1;
}

.right-section {
  width: 420px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card {
  background: #fff;
  padding: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #2c1810;
    margin: 0;
  }
  
  .record-count {
    font-size: 13px;
    color: #999;
  }
}

.selected-order-info {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px;
  background: #faf8f5;
  border-radius: 6px;
  
  .order-img {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 4px;
  }
  
  .order-detail {
    .order-name {
      font-size: 14px;
      color: #333;
      margin-bottom: 4px;
    }
    
    .order-price {
      font-size: 16px;
      font-weight: 600;
      color: #c0392b;
    }
  }
}

.text-muted {
  color: #999;
  font-size: 13px;
}

.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.empty-list {
  padding: 40px 0;
}

.after-sale-list {
  max-height: 450px;
  overflow-y: auto;
}

.after-sale-item {
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  .item-order {
    font-size: 13px;
    color: #666;
  }
}

.item-body {
  .item-product {
    font-size: 15px;
    font-weight: 500;
    color: #333;
    margin-bottom: 6px;
  }
  
  .item-type {
    font-size: 13px;
    color: #8b6914;
    margin-bottom: 6px;
  }
  
  .item-desc {
    font-size: 13px;
    color: #666;
    margin-bottom: 6px;
    line-height: 1.5;
  }
  
  .item-time, .item-result {
    font-size: 12px;
    color: #999;
    margin-bottom: 4px;
  }
  
  .item-result {
    color: #52c41a;
  }
  
  .item-actions {
    margin-top: 8px;
  }
}

.notice-card {
  .notice-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .notice-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 13px;
    color: #666;
    
    .el-icon {
      color: #52c41a;
      flex-shrink: 0;
      margin-top: 2px;
    }
  }
}

.after-sale-form {
  :deep(.el-button--primary) {
    background: linear-gradient(135deg, #d4af37, #b8960c);
    border: none;
    
    &:hover {
      background: linear-gradient(135deg, #e5c158, #c9a71d);
    }
  }
}

@media (max-width: 1024px) {
  .content-layout {
    flex-direction: column;
  }
  
  .right-section {
    width: 100%;
  }
}
</style>
