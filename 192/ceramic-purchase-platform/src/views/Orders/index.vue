<template>
  <div class="orders-page">
    <div class="container">
      <el-page-header @back="goBack" class="mb-20">
        <template #content>
          <span>我的订单</span>
        </template>
      </el-page-header>

      <div class="card statistics-card">
        <el-row :gutter="24">
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-icon primary">
                <el-icon><ShoppingCart /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ totalOrders }}</div>
                <div class="stat-label">总订单数</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-icon success">
                <el-icon><Wallet /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">¥{{ totalSpent.toFixed(2) }}</div>
                <div class="stat-label">累计采购金额</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-icon warning">
                <el-icon><Box /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ totalItems }}</div>
                <div class="stat-label">采购商品总数</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-icon danger">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ pendingOrders }}</div>
                <div class="stat-label">待处理订单</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <div class="card">
        <div class="order-header-actions">
          <div class="search-area">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索订单号或商品名称"
              clearable
              style="width: 300px"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 280px"
            />
          </div>
          <div class="action-area">
            <el-button type="primary" @click="handleExport">
              <el-icon><Download /></el-icon>
              导出采购记录
            </el-button>
          </div>
        </div>

        <el-tabs v-model="activeTab" class="order-tabs">
          <el-tab-pane label="全部订单" name="all">
            <OrderList
              :orders="filteredOrders"
              @view-detail="handleViewDetail"
              @verify="handleVerify"
            />
          </el-tab-pane>
          <el-tab-pane label="待付款" name="pending">
            <OrderList
              :orders="filteredOrders"
              @view-detail="handleViewDetail"
              @verify="handleVerify"
            />
          </el-tab-pane>
          <el-tab-pane label="已付款" name="paid">
            <OrderList
              :orders="filteredOrders"
              @view-detail="handleViewDetail"
              @verify="handleVerify"
            />
          </el-tab-pane>
          <el-tab-pane label="已发货" name="shipped">
            <OrderList
              :orders="filteredOrders"
              @view-detail="handleViewDetail"
              @verify="handleVerify"
            />
          </el-tab-pane>
          <el-tab-pane label="已完成" name="completed">
            <OrderList
              :orders="filteredOrders"
              @view-detail="handleViewDetail"
              @verify="handleVerify"
            />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <el-dialog
      v-model="showDetailDialog"
      title="订单明细"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="currentOrder" class="order-detail">
        <el-descriptions :column="2" border class="mb-20">
          <el-descriptions-item label="订单号">
            {{ currentOrder.orderNo }}
          </el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="orderStatusMap[currentOrder.status].color">
              {{ orderStatusMap[currentOrder.status].label }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="下单时间">
            {{ currentOrder.createdAt }}
          </el-descriptions-item>
          <el-descriptions-item label="支付时间">
            {{ currentOrder.paidAt || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="发货时间">
            {{ currentOrder.shippedAt || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="完成时间">
            {{ currentOrder.completedAt || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="收货人" :span="2">
            {{ currentOrder.contact }}
          </el-descriptions-item>
          <el-descriptions-item label="收货地址" :span="2">
            {{ currentOrder.address }}
          </el-descriptions-item>
        </el-descriptions>

        <h4 class="detail-title">商品明细</h4>
        <el-table :data="currentOrder.items" border>
          <el-table-column prop="name" label="商品名称" min-width="200" />
          <el-table-column prop="price" label="单价" width="120">
            <template #default="{ row }">¥{{ row.price }}</template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="100" />
          <el-table-column label="小计" width="120">
            <template #default="{ row }">¥{{ (row.price * row.quantity).toFixed(2) }}</template>
          </el-table-column>
        </el-table>

        <div class="amount-summary">
          <div class="amount-row">
            <span>商品总金额：</span>
            <span>¥{{ currentOrder.totalAmount.toFixed(2) }}</span>
          </div>
          <div class="amount-row">
            <span>运费：</span>
            <span>¥0.00</span>
          </div>
          <div class="amount-row total">
            <span>实付金额：</span>
            <span class="total-price">¥{{ currentOrder.totalAmount.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog
      v-model="showVerifyDialog"
      title="订单金额核对"
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-if="currentOrder" class="verify-content">
        <el-alert
          title="请仔细核对以下订单信息，确保金额准确无误"
          type="info"
          :closable="false"
          show-icon
          class="mb-20"
        />
        <div class="verify-table">
          <div class="verify-row header">
            <span>商品名称</span>
            <span>单价</span>
            <span>数量</span>
            <span>小计</span>
          </div>
          <div v-for="item in currentOrder.items" :key="item.materialId" class="verify-row">
            <span>{{ item.name }}</span>
            <span>¥{{ item.price }}</span>
            <span>{{ item.quantity }}</span>
            <span>¥{{ (item.price * item.quantity).toFixed(2) }}</span>
          </div>
          <div class="verify-row total">
            <span colspan="3">商品总金额</span>
            <span>¥{{ currentOrder.totalAmount.toFixed(2) }}</span>
          </div>
          <div class="verify-row">
            <span colspan="3">运费</span>
            <span>¥0.00</span>
          </div>
          <div class="verify-row final">
            <span colspan="3">应付金额</span>
            <span class="final-price">¥{{ currentOrder.totalAmount.toFixed(2) }}</span>
          </div>
        </div>
        <div class="verify-actions">
          <el-checkbox v-model="verifyAgreed">
            我已核对以上信息，确认金额无误
          </el-checkbox>
        </div>
      </div>
      <template #footer>
        <el-button @click="showVerifyDialog = false">取消</el-button>
        <el-button type="primary" :disabled="!verifyAgreed" @click="handleConfirmVerify">
          确认核对
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useOrdersStore } from '@/store/orders'
import { orderStatusMap } from '@/mock/orders'
import OrderList from './components/OrderList.vue'

const router = useRouter()
const ordersStore = useOrdersStore()

const activeTab = ref('all')
const searchKeyword = ref('')
const dateRange = ref([])
const showDetailDialog = ref(false)
const showVerifyDialog = ref(false)
const currentOrder = ref(null)
const verifyAgreed = ref(false)

const filteredOrders = computed(() => {
  let orders = ordersStore.userOrders
  
  if (activeTab.value !== 'all') {
    orders = orders.filter(o => o.status === activeTab.value)
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    orders = orders.filter(o => 
      o.orderNo.toLowerCase().includes(keyword) ||
      o.items.some(item => item.name.toLowerCase().includes(keyword))
    )
  }
  
  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    orders = orders.filter(o => {
      const orderDate = new Date(o.createdAt)
      return orderDate >= new Date(start) && orderDate <= new Date(end)
    })
  }
  
  return orders
})

const totalOrders = computed(() => ordersStore.userOrders.length)
const totalSpent = computed(() => {
  return ordersStore.userOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0)
})
const totalItems = computed(() => {
  return ordersStore.userOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0)
})
const pendingOrders = computed(() => {
  return ordersStore.userOrders.filter(o => o.status === 'pending' || o.status === 'paid').length
})

const goBack = () => {
  router.back()
}

const handleViewDetail = (order) => {
  currentOrder.value = order
  showDetailDialog.value = true
}

const handleVerify = (order) => {
  currentOrder.value = order
  verifyAgreed.value = false
  showVerifyDialog.value = true
}

const handleConfirmVerify = () => {
  ElMessage.success('订单金额核对完成')
  showVerifyDialog.value = false
}

const handleExport = () => {
  const orders = filteredOrders.value
  if (orders.length === 0) {
    ElMessage.warning('暂无可导出的订单')
    return
  }
  
  let csvContent = '订单号,下单时间,订单状态,商品名称,单价,数量,小计,总金额,收货人,地址\n'
  
  orders.forEach(order => {
    order.items.forEach((item, index) => {
      csvContent += `${order.orderNo},${order.createdAt},${orderStatusMap[order.status].label},${item.name},${item.price},${item.quantity},${(item.price * item.quantity).toFixed(2)},${index === 0 ? order.totalAmount : ''},${index === 0 ? order.contact : ''},${index === 0 ? order.address : ''}\n`
    })
  })
  
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `采购记录_${new Date().toLocaleDateString()}.csv`
  link.click()
  
  ElMessage.success('采购记录导出成功')
}
</script>

<style scoped>
.orders-page {
  padding-bottom: 40px;
}

.statistics-card {
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #fff;
}

.stat-icon.primary {
  background: linear-gradient(135deg, #409eff, #66b1ff);
}

.stat-icon.success {
  background: linear-gradient(135deg, #67c23a, #85ce61);
}

.stat-icon.warning {
  background: linear-gradient(135deg, #e6a23c, #ebb563);
}

.stat-icon.danger {
  background: linear-gradient(135deg, #f56c6c, #f78989);
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #909399;
}

.order-header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.search-area {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.order-tabs {
  min-height: 400px;
}

.mb-20 {
  margin-bottom: 20px;
}

.detail-title {
  font-size: 16px;
  font-weight: 600;
  margin: 20px 0 12px;
  color: #303133;
}

.amount-summary {
  margin-top: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.amount-row {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.amount-row.total {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px dashed #dcdfe6;
}

.total-price {
  color: #f56c6c;
  font-size: 24px;
  font-weight: bold;
}

.verify-content {
  padding: 10px 0;
}

.verify-table {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
}

.verify-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  padding: 12px 16px;
  border-bottom: 1px solid #f2f6fc;
  font-size: 14px;
}

.verify-row:last-child {
  border-bottom: none;
}

.verify-row.header {
  background: #f5f7fa;
  font-weight: 600;
  color: #303133;
}

.verify-row.total {
  background: #fafafa;
  font-weight: 500;
}

.verify-row.final {
  background: #fff5f5;
  font-weight: bold;
}

.final-price {
  color: #f56c6c;
  font-size: 18px;
}

.verify-actions {
  margin-top: 20px;
  text-align: center;
}
</style>
