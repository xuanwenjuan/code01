<template>
  <div class="orders-page">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">订单管理</h2>
        <el-tabs v-model="activeTab" class="order-tabs">
          <el-tab-pane label="全部订单" name="all" />
          <el-tab-pane label="待验收" name="delivered" />
          <el-tab-pane label="待发货" name="pending" />
          <el-tab-pane label="已完成" name="completed" />
        </el-tabs>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="exportSelectedOrders" :disabled="selectedOrders.length === 0">
          <el-icon><Download /></el-icon>
          批量导出
        </el-button>
      </div>
    </div>

    <div class="orders-list">
      <LoadingWrapper :loading="loading">
        <div v-if="filteredOrders.length > 0">
          <div
            v-for="order in filteredOrders"
            :key="order.id"
            class="order-card"
          >
            <div class="order-header">
              <div class="order-info-left">
                <el-checkbox v-model="selectedOrders" :label="order.id" />
                <span class="order-no">订单号：{{ order.orderNo }}</span>
                <span class="order-time">{{ order.createTime }}</span>
              </div>
              <div class="order-info-right">
                <el-tag :type="getStatusType(order.status)" size="large">
                  {{ getStatusText(order.status) }}
                </el-tag>
                <el-tag v-if="needsCalibration(order)" type="warning" size="small" effect="dark">
                  <el-icon><AlarmClock /></el-icon>
                  校准提醒
                </el-tag>
              </div>
            </div>

            <div class="order-content">
              <div class="equipment-info" @click="goDetail(order.equipmentId)">
                <img :src="order.equipmentImage" :alt="order.equipmentName" />
                <div class="equipment-detail">
                  <h4>{{ order.equipmentName }}</h4>
                  <p>供货商：{{ order.supplier }}</p>
                  <div class="usage-info" v-if="order.status === 'completed'">
                    <span class="usage-hours">
                      <el-icon><Timer /></el-icon>
                      累计使用 {{ order.usageHours || 0 }} 小时
                    </span>
                    <span v-if="order.lastCalibration" class="calibration-info">
                      上次校准：{{ order.lastCalibration }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="order-price">
                <p class="price">¥{{ order.price.toLocaleString() }}</p>
                <p class="quantity">x {{ order.quantity }}</p>
                <p class="total">合计：<span class="total-price">¥{{ order.totalPrice.toLocaleString() }}</span></p>
              </div>

              <div class="order-actions">
                <template v-if="order.status === 'delivered'">
                  <el-button type="primary" @click="openAcceptDialog(order)">
                    订单验收
                  </el-button>
                  <el-button @click="viewLogistics(order)" v-if="order.logistics">
                    查看物流
                  </el-button>
                  <el-button @click="exportOrder(order)">
                    <el-icon><Download /></el-icon>
                    导出明细
                  </el-button>
                </template>
                <template v-else-if="order.status === 'shipping'">
                  <el-button @click="viewLogistics(order)" v-if="order.logistics">
                    查看物流
                  </el-button>
                  <el-button @click="exportOrder(order)">
                    <el-icon><Download /></el-icon>
                    导出明细
                  </el-button>
                </template>
                <template v-else-if="order.status === 'completed'">
                  <el-button @click="viewDetail(order)">
                    查看详情
                  </el-button>
                  <el-button @click="viewUsageRecords(order)">
                    <el-icon><DataAnalysis /></el-icon>
                    使用记录
                  </el-button>
                  <el-button @click="exportOrder(order)">
                    <el-icon><Download /></el-icon>
                    导出明细
                  </el-button>
                  <el-button type="primary" @click="buyAgain(order)">
                    再次采购
                  </el-button>
                </template>
                <template v-else>
                  <el-button @click="cancelOrder(order)">
                    取消订单
                  </el-button>
                  <el-button @click="exportOrder(order)">
                    <el-icon><Download /></el-icon>
                    导出明细
                  </el-button>
                </template>
              </div>
            </div>

            <div v-if="order.acceptanceRemark" class="acceptance-info">
              <el-icon color="#67c23a"><CircleCheck /></el-icon>
              <span>验收时间：{{ order.acceptanceTime }}</span>
              <span class="remark">验收备注：{{ order.acceptanceRemark }}</span>
            </div>
          </div>
        </div>
        <EmptyState v-else type="order" text="暂无订单" />
      </LoadingWrapper>
    </div>

    <el-dialog
      v-model="acceptDialogVisible"
      title="订单验收"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-alert
        title="请认真核对器材参数并确认质量后再进行验收"
        type="warning"
        :closable="false"
        show-icon
        style="margin-bottom: 20px"
      />

      <el-tabs v-model="acceptStep" class="accept-tabs">
        <el-tab-pane label="参数核对" name="params">
          <div class="params-check">
            <h4>器材参数核对</h4>
            <p class="check-tip">请对照实物核对以下参数是否与订单一致：</p>
            <el-descriptions :column="2" border size="default" class="params-desc">
              <el-descriptions-item
                v-for="(value, key) in currentOrder?.specifications"
                :key="key"
                :label="key"
              >
                <el-checkbox v-model="paramChecks[key]">核对一致</el-checkbox>
                <span class="param-value">{{ value }}</span>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-tab-pane>

        <el-tab-pane label="质量确认" name="quality">
          <div class="quality-check">
            <h4>质量检查确认</h4>
            <p class="check-tip">请检查以下项目并确认质量状态：</p>
            <el-form :model="qualityForm" label-width="120px">
              <el-form-item label="外观检查">
                <el-radio-group v-model="qualityForm.appearance">
                  <el-radio label="完好">完好</el-radio>
                  <el-radio label="轻微划痕">轻微划痕</el-radio>
                  <el-radio label="有损坏">有损坏</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="光学系统">
                <el-radio-group v-model="qualityForm.optics">
                  <el-radio label="合格">合格</el-radio>
                  <el-radio label="有瑕疵">有瑕疵</el-radio>
                  <el-radio label="不合格">不合格</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="配件齐全">
                <el-radio-group v-model="qualityForm.accessories">
                  <el-radio label="齐全">齐全</el-radio>
                  <el-radio label="部分缺失">部分缺失</el-radio>
                  <el-radio label="严重缺失">严重缺失</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="包装情况">
                <el-radio-group v-model="qualityForm.packaging">
                  <el-radio label="完好">完好</el-radio>
                  <el-radio label="轻微破损">轻微破损</el-radio>
                  <el-radio label="严重破损">严重破损</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <el-tab-pane label="验收结果" name="result">
          <div class="accept-result">
            <el-form :model="acceptForm" :rules="acceptRules" ref="acceptFormRef">
              <el-form-item label="验收结果" prop="result">
                <el-radio-group v-model="acceptForm.result">
                  <el-radio label="accept">验收通过</el-radio>
                  <el-radio label="reject">验收不通过</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="验收备注" prop="remark">
                <el-input
                  v-model="acceptForm.remark"
                  type="textarea"
                  :rows="4"
                  placeholder="请填写验收备注，说明质量情况或存在的问题..."
                />
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <el-button @click="acceptDialogVisible = false">取消</el-button>
        <el-button v-if="acceptStep !== 'params'" @click="prevStep">上一步</el-button>
        <el-button v-if="acceptStep !== 'result'" type="primary" @click="nextStep">下一步</el-button>
        <el-button v-else type="primary" @click="submitAcceptance" :loading="submitting">
          确认验收
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="logisticsDialogVisible"
      title="物流信息"
      width="500px"
    >
      <div v-if="currentOrder?.logistics" class="logistics-info">
        <div class="logistics-company">
          <el-icon><Van /></el-icon>
          <span>物流公司：{{ currentOrder.logistics.company }}</span>
        </div>
        <div class="logistics-no">
          <el-icon><Tickets /></el-icon>
          <span>运单号：{{ currentOrder.logistics.trackingNo }}</span>
        </div>
        <el-timeline class="timeline">
          <el-timeline-item
            v-for="(item, index) in mockLogistics"
            :key="index"
            :timestamp="item.time"
            :type="index === 0 ? 'primary' : ''"
          >
            {{ item.content }}
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-dialog>

    <el-dialog
      v-model="usageDialogVisible"
      title="器材使用记录"
      width="800px"
    >
      <div class="usage-header">
        <h4>{{ currentOrder?.equipmentName }}</h4>
        <div class="usage-stats">
          <el-tag type="primary" size="large">
            累计使用 {{ currentOrder?.usageHours || 0 }} 小时
          </el-tag>
          <el-button type="primary" size="small" @click="showAddUsage = true">
            <el-icon><Plus /></el-icon>
            添加记录
          </el-button>
        </div>
      </div>

      <div v-if="showAddUsage" class="add-usage-form">
        <el-form :model="usageForm" label-width="100px" inline>
          <el-form-item label="使用日期">
            <el-date-picker v-model="usageForm.date" type="date" placeholder="选择日期" />
          </el-form-item>
          <el-form-item label="使用时长">
            <el-input-number v-model="usageForm.duration" :min="0.5" :step="0.5" />
            <span style="margin-left: 8px">小时</span>
          </el-form-item>
          <el-form-item label="观测目标">
            <el-input v-model="usageForm.target" placeholder="如：M42猎户座大星云" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="addUsageRecord">保存</el-button>
            <el-button @click="showAddUsage = false">取消</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="usage-records">
        <el-table :data="currentUsageRecords" border>
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="duration" label="时长(小时)" width="120" />
          <el-table-column prop="target" label="观测目标" />
          <el-table-column prop="location" label="地点" width="140" />
          <el-table-column prop="weather" label="天气" width="100" />
          <el-table-column prop="notes" label="备注" min-width="200" />
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useOrderStore } from '@/store/order'
import { useEquipmentStore } from '@/store/equipment'
import LoadingWrapper from '@/components/LoadingWrapper.vue'
import EmptyState from '@/components/EmptyState.vue'

const router = useRouter()
const orderStore = useOrderStore()
const equipmentStore = useEquipmentStore()

const loading = ref(false)
const activeTab = ref('all')
const acceptDialogVisible = ref(false)
const logisticsDialogVisible = ref(false)
const usageDialogVisible = ref(false)
const submitting = ref(false)
const currentOrder = ref(null)
const acceptFormRef = ref(null)
const acceptStep = ref('params')
const selectedOrders = ref([])
const showAddUsage = ref(false)

const acceptForm = reactive({
  result: 'accept',
  remark: ''
})

const acceptRules = {
  remark: [
    { required: true, message: '请填写验收备注', trigger: 'blur' },
    { min: 5, message: '备注至少5个字符', trigger: 'blur' }
  ]
}

const qualityForm = reactive({
  appearance: '完好',
  optics: '合格',
  accessories: '齐全',
  packaging: '完好'
})

const paramChecks = reactive({})

const usageForm = reactive({
  date: '',
  duration: 1,
  target: '',
  location: '',
  weather: '',
  notes: ''
})

const mockLogistics = [
  { time: '2024-02-06 14:30', content: '快件已送达，签收人：本人签收' },
  { time: '2024-02-06 08:00', content: '快件正在派送中' },
  { time: '2024-02-05 22:00', content: '快件已到达目的地城市' },
  { time: '2024-02-04 10:00', content: '快件已发出' },
  { time: '2024-02-03 16:00', content: '商家已发货' }
]

const currentUsageRecords = computed(() => {
  if (!currentOrder.value) return []
  return orderStore.getUsageRecordsByOrder(currentOrder.value.id)
})

const filteredOrders = computed(() => {
  return orderStore.getOrdersByStatus(activeTab.value)
})

const getStatusType = (status) => {
  const types = {
    pending: 'info',
    shipping: 'warning',
    delivered: 'warning',
    completed: 'success'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    pending: '待发货',
    shipping: '运输中',
    delivered: '待验收',
    completed: '已完成'
  }
  return texts[status] || '未知'
}

const needsCalibration = (order) => {
  if (order.status !== 'completed' || !order.nextCalibration) return false
  const today = new Date().toISOString().split('T')[0]
  const nextDate = new Date(order.nextCalibration)
  const todayDate = new Date(today)
  const diffDays = Math.ceil((nextDate - todayDate) / (1000 * 60 * 60 * 24))
  return diffDays <= 30 && diffDays >= 0
}

const goDetail = (id) => {
  router.push(`/equipment/${id}`)
}

const openAcceptDialog = (order) => {
  currentOrder.value = order
  acceptForm.result = 'accept'
  acceptForm.remark = ''
  acceptStep.value = 'params'
  qualityForm.appearance = '完好'
  qualityForm.optics = '合格'
  qualityForm.accessories = '齐全'
  qualityForm.packaging = '完好'
  Object.keys(paramChecks).forEach(key => delete paramChecks[key])
  acceptDialogVisible.value = true
}

const nextStep = () => {
  if (acceptStep.value === 'params') {
    const allChecked = Object.values(paramChecks).every(v => v)
    if (!allChecked) {
      ElMessage.warning('请确认所有参数核对一致后再继续')
      return
    }
    acceptStep.value = 'quality'
  } else if (acceptStep.value === 'quality') {
    acceptStep.value = 'result'
  }
}

const prevStep = () => {
  if (acceptStep.value === 'quality') {
    acceptStep.value = 'params'
  } else if (acceptStep.value === 'result') {
    acceptStep.value = 'quality'
  }
}

async function submitAcceptance() {
  if (!acceptFormRef.value) return
  
  const valid = await acceptFormRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  setTimeout(() => {
    const status = acceptForm.result === 'accept' ? 'completed' : 'delivered'
    orderStore.updateOrderStatus(currentOrder.value.id, status, acceptForm.remark, { ...qualityForm })
    submitting.value = false
    acceptDialogVisible.value = false
    ElMessage.success(acceptForm.result === 'accept' ? '验收成功' : '已提交验收意见')
  }, 800)
}

function viewLogistics(order) {
  currentOrder.value = order
  logisticsDialogVisible.value = true
}

function viewDetail(order) {
  goDetail(order.equipmentId)
}

function viewUsageRecords(order) {
  currentOrder.value = order
  showAddUsage.value = false
  usageForm.date = ''
  usageForm.duration = 1
  usageForm.target = ''
  usageForm.location = ''
  usageForm.weather = ''
  usageForm.notes = ''
  usageDialogVisible.value = true
}

function addUsageRecord() {
  if (!usageForm.date || !usageForm.duration || !usageForm.target) {
    ElMessage.warning('请填写日期、时长和观测目标')
    return
  }
  
  orderStore.addUsageRecord({
    equipmentId: currentOrder.value.equipmentId,
    orderId: currentOrder.value.id,
    date: usageForm.date,
    duration: usageForm.duration,
    target: usageForm.target,
    location: usageForm.location || '-',
    weather: usageForm.weather || '-',
    notes: usageForm.notes || ''
  })
  
  showAddUsage.value = false
  ElMessage.success('使用记录已添加')
}

function exportOrder(order) {
  orderStore.exportOrderToCSV(order.id)
  ElMessage.success('订单明细已导出')
}

function exportSelectedOrders() {
  selectedOrders.value.forEach(id => {
    orderStore.exportOrderToCSV(id)
  })
  ElMessage.success(`已导出 ${selectedOrders.value.length} 个订单明细`)
  selectedOrders.value = []
}

function buyAgain(order) {
  router.push(`/equipment/${order.equipmentId}`)
}

function cancelOrder(order) {
  ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    orderStore.orders = orderStore.orders.filter(o => o.id !== order.id)
    ElMessage.success('订单已取消')
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.orders-page {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2d3d;
  margin-bottom: 16px;
}

.order-tabs {
  margin-bottom: 0;
}

.order-card {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #f0f0f0;
}

.order-info-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.order-info-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.order-no {
  font-weight: 500;
  color: #1f2d3d;
  font-size: 14px;
}

.order-time {
  font-size: 14px;
  color: #909399;
}

.order-content {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 24px;
  padding: 20px;
  align-items: center;
}

.equipment-info {
  display: flex;
  gap: 16px;
  cursor: pointer;
}

.equipment-info img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
}

.equipment-detail h4 {
  font-size: 15px;
  font-weight: 600;
  color: #1f2d3d;
  margin-bottom: 4px;
}

.equipment-detail p {
  font-size: 13px;
  color: #909399;
  margin-bottom: 8px;
}

.usage-info {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #606266;
}

.usage-hours,
.calibration-info {
  display: flex;
  align-items: center;
  gap: 4px;
}

.order-price {
  text-align: right;
}

.order-price .price {
  font-size: 16px;
  color: #606266;
}

.order-price .quantity {
  font-size: 13px;
  color: #909399;
}

.order-price .total {
  font-size: 14px;
  color: #606266;
  margin-top: 4px;
}

.total-price {
  font-size: 18px;
  font-weight: 700;
  color: #f56c6c;
}

.order-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.acceptance-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: #f0f9eb;
  border-top: 1px solid #e1f3d8;
  font-size: 13px;
  color: #67c23a;
}

.acceptance-info .remark {
  color: #606266;
}

.accept-tabs {
  margin-bottom: 20px;
}

.check-tip {
  font-size: 13px;
  color: #909399;
  margin-bottom: 16px;
}

.params-desc {
  margin-bottom: 16px;
}

.params-desc .el-descriptions-item__content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.param-value {
  color: #606266;
}

.quality-check {
  padding: 10px 0;
}

.usage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.usage-header h4 {
  margin: 0;
  font-size: 16px;
  color: #1f2d3d;
}

.usage-stats {
  display: flex;
  align-items: center;
  gap: 12px;
}

.add-usage-form {
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 16px;
}

.usage-records {
  margin-top: 16px;
}

.logistics-info {
  padding: 10px 0;
}

.logistics-company,
.logistics-no {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #606266;
}

.timeline {
  margin-top: 24px;
}
</style>
