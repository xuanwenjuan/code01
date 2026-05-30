<template>
  <div class="orders-page">
    <div class="page-header flex items-center justify-between">
      <h3 class="section-title">我的订单</h3>
      <el-button type="primary" @click="showReconciliation = true">
        <el-icon><DataAnalysis /></el-icon>
        对账统计
      </el-button>
    </div>

    <div class="stats-cards">
      <div class="stat-card" v-for="stat in orderStats" :key="stat.status">
        <div class="stat-icon" :class="stat.type">
          <el-icon :size="24"><component :is="stat.icon" /></el-icon>
        </div>
        <div class="stat-info">
          <p class="stat-label">{{ stat.label }}</p>
          <p class="stat-value">{{ stat.count }}</p>
        </div>
        <div class="stat-amount" v-if="stat.amount > 0">
          ¥{{ stat.amount.toLocaleString() }}
        </div>
      </div>
    </div>

    <div class="order-filter">
      <div class="filter-left">
        <el-radio-group v-model="statusFilter" size="small">
          <el-radio-button 
            v-for="opt in filterOptions" 
            :key="opt.value" 
            :label="opt.value"
          >
            {{ opt.label }}
          </el-radio-button>
        </el-radio-group>
      </div>
      <div class="filter-right">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          size="small"
          style="width: 240px"
          value-format="YYYY-MM-DD"
        />
        <el-input 
          v-model="searchKeyword" 
          placeholder="搜索订单号或商品名称" 
          size="small" 
          style="width: 200px"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" size="small" @click="exportOrders">
          <el-icon><Download /></el-icon>
          导出订单
        </el-button>
      </div>
    </div>

    <LoadingState v-if="orderStore.loading" />

    <div v-else-if="filteredOrders.length" class="order-list">
      <div class="order-card" v-for="order in filteredOrders" :key="order.id">
        <div class="order-header flex items-center justify-between">
          <div class="order-info">
            <span class="order-id">订单号：{{ order.id }}</span>
            <span class="order-time">
              <el-icon><Clock /></el-icon>
              {{ order.createTime }}
            </span>
            <span class="order-payment" v-if="order.paymentMethod">
              <el-icon><Wallet /></el-icon>
              {{ order.paymentMethod }}
            </span>
          </div>
          <el-tag :type="getStatusType(order.status)" effect="dark">
            {{ order.status }}
          </el-tag>
        </div>
        <div class="order-items">
          <div class="order-item flex items-center" v-for="item in order.items" :key="item.productId">
            <el-image :src="item.image" fit="cover" class="item-thumb" />
            <div class="item-info flex-1">
              <p class="item-name">{{ item.productName }}</p>
              <p class="item-spec">数量：{{ item.quantity }}</p>
            </div>
            <div class="item-price">¥{{ item.price.toLocaleString() }}</div>
          </div>
        </div>
        <div class="order-footer flex items-center justify-between">
          <div class="order-contact">
            <el-icon><Location /></el-icon>
            {{ order.address }}
            <span class="contact">（{{ order.contact }}）</span>
          </div>
          <div class="order-amount flex items-center">
            <div class="order-summary">
              共 <span class="item-count">{{ order.items.reduce((sum, i) => sum + i.quantity, 0) }}</span> 件商品
            </div>
            <span class="amount-label">实付：</span>
            <span class="amount-value">¥{{ order.totalAmount.toLocaleString() }}</span>
            <el-button 
              v-if="order.status === '待付款'" 
              type="primary" 
              size="small"
              style="margin-left: 15px"
              @click="payOrder(order)"
            >
              立即付款
            </el-button>
            <el-button 
              v-if="order.status === '待付款'" 
              size="small"
              style="margin-left: 8px"
              @click="cancelOrder(order)"
            >
              取消订单
            </el-button>
            <el-button 
              v-if="order.status === '待发货'" 
              size="small"
              style="margin-left: 8px"
            >
              提醒发货
            </el-button>
            <el-button 
              v-if="order.status === '已发货'" 
              type="success" 
              size="small"
              style="margin-left: 15px"
              @click="confirmReceive(order)"
            >
              确认收货
            </el-button>
            <el-button 
              v-if="order.status === '已完成'" 
              type="warning" 
              size="small"
              style="margin-left: 8px"
            >
              申请售后
            </el-button>
            <el-button 
              size="small"
              style="margin-left: 8px"
              @click="viewDetail(order)"
            >
              查看详情
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <EmptyState v-else type="order" text="暂无订单记录">
      <template #extra>
        <el-button type="primary" @click="$router.push('/')">
          去逛逛
        </el-button>
      </template>
    </EmptyState>

    <el-dialog 
      v-model="showReconciliation" 
      title="订单对账统计" 
      width="800px"
      :close-on-click-modal="false"
    >
      <div class="reconciliation-content">
        <div class="reconciliation-summary">
          <div class="summary-card">
            <p class="summary-label">订单总数</p>
            <p class="summary-value">{{ reconciliationData.totalOrders }}</p>
          </div>
          <div class="summary-card primary">
            <p class="summary-label">总金额</p>
            <p class="summary-value">¥{{ reconciliationData.totalAmount.toLocaleString() }}</p>
          </div>
          <div class="summary-card success">
            <p class="summary-label">已完成金额</p>
            <p class="summary-value">¥{{ reconciliationData.completedAmount.toLocaleString() }}</p>
          </div>
          <div class="summary-card warning">
            <p class="summary-label">待付款金额</p>
            <p class="summary-value">¥{{ reconciliationData.pendingAmount.toLocaleString() }}</p>
          </div>
        </div>

        <div class="reconciliation-chart">
          <h4>各状态订单统计</h4>
          <div class="chart-bars">
            <div 
              v-for="item in reconciliationData.statusStats" 
              :key="item.status"
              class="chart-bar-item"
            >
              <div class="bar-label">{{ item.label }}</div>
              <div class="bar-wrapper">
                <div 
                  class="bar-fill" 
                  :class="item.type"
                  :style="{ width: `${item.percent}%` }"
                ></div>
              </div>
              <div class="bar-value">{{ item.count }} 单 (¥{{ item.amount.toLocaleString() }})</div>
            </div>
          </div>
        </div>

        <div class="reconciliation-table">
          <h4>订单明细</h4>
          <el-table :data="reconciliationData.details" border style="width: 100%">
            <el-table-column prop="id" label="订单号" width="160" />
            <el-table-column prop="createTime" label="下单时间" width="160" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="商品" min-width="200">
              <template #default="{ row }">
                {{ row.items.map(i => i.productName).join('、') }}
              </template>
            </el-table-column>
            <el-table-column prop="totalAmount" label="金额" width="120" align="right">
              <template #default="{ row }">
                ¥{{ row.totalAmount.toLocaleString() }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <template #footer>
        <el-button @click="showReconciliation = false">关闭</el-button>
        <el-button type="primary" @click="exportReconciliation">
          <el-icon><Download /></el-icon>
          导出对账单
        </el-button>
      </template>
    </el-dialog>

    <StatusTip
      v-model:show="showStatusTip"
      :type="statusTipType"
      :title="statusTipTitle"
      :message="statusTipMessage"
      @close="handleStatusTipClose"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useOrderStore } from '@/stores/order'
import { ElMessage, ElMessageBox } from 'element-plus'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'
import StatusTip from '@/components/StatusTip.vue'

const orderStore = useOrderStore()
const statusFilter = ref('all')
const searchKeyword = ref('')
const dateRange = ref([])
const showReconciliation = ref(false)

const showStatusTip = ref(false)
const statusTipType = ref('success')
const statusTipTitle = ref('')
const statusTipMessage = ref('')

const filterOptions = [
  { label: '全部', value: 'all' },
  { label: '待付款', value: '待付款' },
  { label: '待发货', value: '待发货' },
  { label: '已发货', value: '已发货' },
  { label: '已完成', value: '已完成' }
]

const orderStats = computed(() => {
  const orders = orderStore.orderList
  return [
    { 
      status: 'all', 
      label: '全部订单', 
      count: orders.length, 
      icon: 'Tickets',
      type: 'info',
      amount: orders.reduce((sum, o) => sum + o.totalAmount, 0)
    },
    { 
      status: '待付款', 
      label: '待付款', 
      count: orders.filter(o => o.status === '待付款').length,
      icon: 'Warning',
      type: 'warning',
      amount: orders.filter(o => o.status === '待付款').reduce((sum, o) => sum + o.totalAmount, 0)
    },
    { 
      status: '待发货', 
      label: '待发货', 
      count: orders.filter(o => o.status === '待发货').length,
      icon: 'Clock',
      type: 'primary',
      amount: orders.filter(o => o.status === '待发货').reduce((sum, o) => sum + o.totalAmount, 0)
    },
    { 
      status: '已发货', 
      label: '已发货', 
      count: orders.filter(o => o.status === '已发货').length,
      icon: 'Van',
      type: 'info',
      amount: orders.filter(o => o.status === '已发货').reduce((sum, o) => sum + o.totalAmount, 0)
    },
    { 
      status: '已完成', 
      label: '已完成', 
      count: orders.filter(o => o.status === '已完成').length,
      icon: 'CircleCheck',
      type: 'success',
      amount: orders.filter(o => o.status === '已完成').reduce((sum, o) => sum + o.totalAmount, 0)
    }
  ]
})

const filteredOrders = computed(() => {
  let orders = [...orderStore.orderList]
  
  if (statusFilter.value !== 'all') {
    orders = orders.filter(o => o.status === statusFilter.value)
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    orders = orders.filter(o => 
      o.id.toLowerCase().includes(keyword) ||
      o.items.some(item => item.productName.toLowerCase().includes(keyword))
    )
  }
  
  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    orders = orders.filter(o => {
      const orderDate = o.createTime.split(' ')[0]
      return orderDate >= start && orderDate <= end
    })
  }
  
  return orders
})

const reconciliationData = computed(() => {
  const orders = orderStore.orderList
  const totalOrders = orders.length
  const totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0)
  const completedAmount = orders.filter(o => o.status === '已完成').reduce((sum, o) => sum + o.totalAmount, 0)
  const pendingAmount = orders.filter(o => o.status === '待付款').reduce((sum, o) => sum + o.totalAmount, 0)
  
  const maxCount = Math.max(...orderStats.value.map(s => s.count), 1)
  
  const statusStats = orderStats.value.filter(s => s.status !== 'all').map(s => ({
    ...s,
    percent: (s.count / maxCount) * 100
  }))
  
  return {
    totalOrders,
    totalAmount,
    completedAmount,
    pendingAmount,
    statusStats,
    details: orders
  }
})

function getStatusType(status) {
  const typeMap = {
    '待付款': 'warning',
    '待发货': 'primary',
    '已发货': 'info',
    '已完成': 'success',
    '已取消': 'danger'
  }
  return typeMap[status] || 'info'
}

function showTip(type, title, message) {
  statusTipType.value = type
  statusTipTitle.value = title
  statusTipMessage.value = message
  showStatusTip.value = true
}

function payOrder(order) {
  ElMessageBox.confirm(`确定支付订单 ${order.id}，金额 ¥${order.totalAmount.toLocaleString()} 吗？`, '确认支付', {
    confirmButtonText: '确认支付',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    order.status = '待发货'
    showTip('success', '支付成功', '订单已支付成功，等待商家发货')
  }).catch(() => {})
}

function cancelOrder(order) {
  ElMessageBox.confirm('确定要取消该订单吗？', '取消订单', {
    confirmButtonText: '确定取消',
    cancelButtonText: '再想想',
    type: 'warning'
  }).then(() => {
    order.status = '已取消'
    showTip('info', '订单已取消', '订单已成功取消')
  }).catch(() => {})
}

function confirmReceive(order) {
  ElMessageBox.confirm('确定已收到商品吗？', '确认收货', {
    confirmButtonText: '确认收货',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    order.status = '已完成'
    showTip('success', '收货成功', '已确认收货，交易完成')
  }).catch(() => {})
}

function viewDetail(order) {
  showTip('info', '订单详情', `订单号：${order.id}`)
}

function exportOrders() {
  showTip('success', '导出成功', '订单数据已导出')
}

function exportReconciliation() {
  showTip('success', '导出成功', '对账单已导出')
}

function handleStatusTipClose() {
}

onMounted(() => {
  orderStore.getOrders()
})
</script>

<style scoped>
.orders-page {
  padding: 0;
}

.page-header {
  margin-bottom: 20px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  border: 1px solid #ebeef5;
  transition: all 0.3s;
}

.stat-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.stat-icon.info {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.warning {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
}

.stat-icon.primary {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.success {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin: 0 0 5px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin: 0;
}

.stat-amount {
  font-size: 12px;
  color: #67c23a;
  background: #f0f9eb;
  padding: 4px 8px;
  border-radius: 4px;
}

.order-filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 20px;
  gap: 15px;
}

.filter-right {
  display: flex;
  gap: 10px;
  align-items: center;
}

.order-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  margin-bottom: 20px;
  overflow: hidden;
  transition: all 0.3s;
}

.order-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.order-header {
  background: #f5f7fa;
  padding: 12px 20px;
}

.order-info {
  display: flex;
  gap: 25px;
  align-items: center;
}

.order-id {
  color: #303133;
  font-weight: 500;
}

.order-time,
.order-payment {
  color: #909399;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.order-items {
  padding: 20px;
}

.order-item {
  padding: 10px 0;
  border-bottom: 1px dashed #ebeef5;
  gap: 15px;
}

.order-item:last-child {
  border-bottom: none;
}

.item-thumb {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.item-name {
  font-size: 14px;
  color: #303133;
  margin: 0 0 5px;
}

.item-spec {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.item-price {
  color: #f56c6c;
  font-weight: 500;
}

.order-footer {
  padding: 15px 20px;
  background: #fafafa;
}

.order-contact {
  font-size: 13px;
  color: #606266;
  display: flex;
  align-items: center;
  gap: 5px;
  max-width: 50%;
}

.contact {
  color: #909399;
}

.order-amount {
  gap: 10px;
  align-items: center;
}

.order-summary {
  font-size: 13px;
  color: #606266;
  margin-right: 15px;
}

.item-count {
  color: #409eff;
  font-weight: 500;
}

.amount-label {
  font-size: 14px;
  color: #606266;
}

.amount-value {
  font-size: 20px;
  font-weight: bold;
  color: #f56c6c;
}

.reconciliation-content {
  padding: 10px 0;
}

.reconciliation-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 30px;
}

.summary-card {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.summary-card.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.summary-card.success {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: #fff;
}

.summary-card.warning {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  color: #fff;
}

.summary-label {
  font-size: 13px;
  margin: 0 0 8px;
  opacity: 0.8;
}

.summary-value {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.reconciliation-chart {
  margin-bottom: 30px;
}

.reconciliation-chart h4,
.reconciliation-table h4 {
  font-size: 16px;
  margin: 0 0 15px;
  color: #303133;
}

.chart-bars {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.chart-bar-item {
  display: grid;
  grid-template-columns: 80px 1fr 200px;
  gap: 15px;
  align-items: center;
}

.bar-label {
  font-size: 13px;
  color: #606266;
}

.bar-wrapper {
  height: 24px;
  background: #f0f2f5;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.bar-fill.success {
  background: linear-gradient(90deg, #67c23a, #85ce61);
}

.bar-fill.primary {
  background: linear-gradient(90deg, #409eff, #66b1ff);
}

.bar-fill.info {
  background: linear-gradient(90deg, #909399, #a6a9ad);
}

.bar-fill.warning {
  background: linear-gradient(90deg, #e6a23c, #f0c78a);
}

.bar-value {
  font-size: 13px;
  color: #303133;
  text-align: right;
}
</style>
