<template>
  <div class="orders-page">
    <div class="container">
      <el-breadcrumb class="breadcrumb" separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="page-header">
        <h1>采购订单管理</h1>
        <div class="action-group">
          <el-button type="primary" :icon="Download" @click="showExportDialog = true">
            导出订单
          </el-button>
          <el-button type="success" :icon="Check" @click="handleBatchCheck" :disabled="selectedOrders.length === 0">
            批量核对
          </el-button>
          <el-button type="warning" :icon="CircleCheck" @click="handleBatchConfirm" :disabled="selectedOrders.length === 0">
            批量确认
          </el-button>
        </div>
      </div>

      <div class="card">
        <div class="order-tabs">
          <div
            v-for="tab in orderTabs"
            :key="tab.key"
            class="order-tab"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            {{ tab.name }}
            <el-tag size="small" type="info">{{ getTabCount(tab.key) }}</el-tag>
          </div>
        </div>

        <el-table
          :data="displayOrders"
          v-loading="loading"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="50" />
          <el-table-column prop="id" label="订单号" width="180" />
          <el-table-column prop="createTime" label="下单时间" width="160" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="buyer" label="采购方" width="120" v-if="userStore.isSupplier" />
          <el-table-column prop="supplier" label="供货商" width="120" v-else />
          <el-table-column label="商品明细">
            <template #default="{ row }">
              <span v-for="(item, idx) in row.items" :key="idx">
                {{ item.toolName }}({{ item.spec }})x{{ item.quantity }}
                {{ idx < row.items.length - 1 ? '、' : '' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="totalAmount" label="总金额" width="100">
            <template #default="{ row }">¥{{ row.totalAmount }}</template>
          </el-table-column>
          <el-table-column label="对账状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.checked ? 'success' : 'info'" size="small">
                {{ row.checked ? '已核对' : '未核对' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="确认状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.confirmed ? 'success' : 'info'" size="small">
                {{ row.confirmed ? '已确认' : '未确认' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="280">
            <template #default="{ row }">
              <div class="order-actions">
                <div class="left-actions">
                  <el-button type="primary" size="small" :icon="View" @click="showDetail(row)">
                    查看详情
                  </el-button>
                  <el-button
                    v-if="!row.checked"
                    type="success"
                    size="small"
                    :icon="Check"
                    @click="handleCheck(row.id)"
                  >
                    明细核对
                  </el-button>
                  <el-button
                    v-if="row.checked && !row.confirmed"
                    type="warning"
                    size="small"
                    :icon="CircleCheck"
                    @click="handleConfirm(row.id)"
                  >
                    金额确认
                  </el-button>
                </div>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <div v-if="displayOrders.length === 0 && !loading" class="empty-wrapper">
          <el-icon><List /></el-icon>
          <p>暂无订单数据</p>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="detailVisible"
      title="订单详情"
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-if="currentOrder" class="order-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">
            {{ currentOrder.id }}
          </el-descriptions-item>
          <el-descriptions-item label="下单时间">
            {{ currentOrder.createTime }}
          </el-descriptions-item>
          <el-descriptions-item label="采购方">
            {{ currentOrder.buyer }}
          </el-descriptions-item>
          <el-descriptions-item label="供货商">
            {{ currentOrder.supplier }}
          </el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusType(currentOrder.status)" size="small">
              {{ getStatusText(currentOrder.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="对账状态">
            <el-tag :type="currentOrder.checked ? 'success' : 'info'" size="small">
              {{ currentOrder.checked ? '已核对' : '未核对' }}
              <span v-if="currentOrder.checkTime">· {{ currentOrder.checkTime }}</span>
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <h4 class="detail-title">商品明细</h4>
        <el-table :data="currentOrder.items" size="small">
          <el-table-column prop="toolName" label="商品名称" />
          <el-table-column prop="spec" label="规格" width="100" />
          <el-table-column prop="price" label="单价" width="100">
            <template #default="{ row }">¥{{ row.price }}</template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="80" />
          <el-table-column prop="subtotal" label="小计" width="100">
            <template #default="{ row }">¥{{ row.subtotal }}</template>
          </el-table-column>
        </el-table>

        <div class="order-total">
          <div class="amount-row">
            <span>商品合计：</span>
            <span>¥{{ currentOrder.totalAmount }}</span>
          </div>
          <div class="amount-row">
            <span>运费：</span>
            <span>¥0.00</span>
          </div>
          <div class="amount-row total">
            <span>实付款：</span>
            <span class="total-price">¥{{ currentOrder.totalAmount }}</span>
          </div>
        </div>

        <div class="detail-actions" v-if="!currentOrder.checked || !currentOrder.confirmed">
          <el-button
            v-if="!currentOrder.checked"
            type="success"
            :icon="Check"
            @click="handleCheck(currentOrder.id)"
          >
            核对明细
          </el-button>
          <el-button
            v-if="currentOrder.checked && !currentOrder.confirmed"
            type="warning"
            :icon="CircleCheck"
            @click="handleConfirm(currentOrder.id)"
          >
            确认金额
          </el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog
      v-model="showExportDialog"
      title="导出订单"
      width="500px"
    >
      <el-form label-width="100px">
        <el-form-item label="导出范围">
          <el-radio-group v-model="exportScope">
            <el-radio label="all">全部订单</el-radio>
            <el-radio label="selected" :disabled="selectedOrders.length === 0">
              选中订单 ({{ selectedOrders.length }})
            </el-radio>
            <el-radio label="current">当前筛选</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="导出格式">
          <el-radio-group v-model="exportFormat">
            <el-radio label="csv">CSV 格式</el-radio>
            <el-radio label="json">JSON 格式</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showExportDialog = false">取消</el-button>
        <el-button type="primary" @click="handleExport">确认导出</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Check, CircleCheck, View, List } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useOrderStore } from '@/stores/order'

const router = useRouter()
const userStore = useUserStore()
const orderStore = useOrderStore()

const loading = ref(false)
const activeTab = ref('all')
const detailVisible = ref(false)
const showExportDialog = ref(false)
const currentOrder = ref(null)
const selectedOrders = ref([])
const exportScope = ref('all')
const exportFormat = ref('csv')

const orderTabs = [
  { key: 'all', name: '全部订单' },
  { key: 'pending', name: '待发货' },
  { key: 'shipped', name: '待收货' },
  { key: 'completed', name: '已完成' }
]

const allOrders = computed(() => {
  if (!userStore.userInfo) return []
  if (userStore.isSupplier) {
    return orderStore.getOrdersBySupplier(userStore.userInfo.name)
  }
  return orderStore.getOrdersByUser(userStore.userInfo.name)
})

const displayOrders = computed(() => {
  if (activeTab.value === 'all') {
    return allOrders.value
  }
  return allOrders.value.filter(o => o.status === activeTab.value)
})

const getTabCount = (tab) => {
  if (tab === 'all') return allOrders.value.length
  return allOrders.value.filter(o => o.status === tab).length
}

const getStatusType = (status) => {
  const map = {
    pending: 'warning',
    shipped: 'primary',
    completed: 'success',
    cancelled: 'info'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    pending: '待发货',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || '未知'
}

const handleSelectionChange = (selection) => {
  selectedOrders.value = selection
}

const showDetail = (order) => {
  currentOrder.value = { ...order }
  detailVisible.value = true
}

const handleCheck = (orderId) => {
  const success = orderStore.checkOrder(orderId)
  if (success) {
    ElMessage.success('订单明细已核对')
    if (currentOrder.value?.id === orderId) {
      currentOrder.value = orderStore.getOrderById(orderId)
    }
  }
}

const handleConfirm = (orderId) => {
  const order = orderStore.getOrderById(orderId)
  ElMessageBox.confirm(`确认订单金额为 ¥${order?.totalAmount} 吗？`, '金额确认', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const success = orderStore.confirmOrder(orderId)
    if (success) {
      ElMessage.success('订单金额已确认')
      if (currentOrder.value?.id === orderId) {
        currentOrder.value = orderStore.getOrderById(orderId)
      }
    }
  }).catch(() => {})
}

const handleBatchCheck = () => {
  const uncheckOrders = selectedOrders.value.filter(o => !o.checked)
  if (uncheckOrders.length === 0) {
    ElMessage.warning('选中的订单都已核对')
    return
  }
  ElMessageBox.confirm(`确定要核对选中的 ${uncheckOrders.length} 个订单吗？`, '批量核对', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    uncheckOrders.forEach(o => orderStore.checkOrder(o.id))
    ElMessage.success(`已批量核对 ${uncheckOrders.length} 个订单`)
  }).catch(() => {})
}

const handleBatchConfirm = () => {
  const confirmableOrders = selectedOrders.value.filter(o => o.checked && !o.confirmed)
  if (confirmableOrders.length === 0) {
    ElMessage.warning('没有可确认的订单（需先核对）')
    return
  }
  ElMessageBox.confirm(`确定要确认选中的 ${confirmableOrders.length} 个订单的金额吗？`, '批量确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    confirmableOrders.forEach(o => orderStore.confirmOrder(o.id))
    ElMessage.success(`已批量确认 ${confirmableOrders.length} 个订单`)
  }).catch(() => {})
}

const handleExport = () => {
  let ordersToExport = []
  switch (exportScope.value) {
    case 'all':
      ordersToExport = allOrders.value
      break
    case 'selected':
      ordersToExport = selectedOrders.value
      break
    case 'current':
      ordersToExport = displayOrders.value
      break
  }

  if (ordersToExport.length === 0) {
    ElMessage.warning('没有可导出的订单')
    return
  }

  if (exportFormat.value === 'csv') {
    orderStore.exportToCSV(ordersToExport)
  } else {
    orderStore.exportToJSON(ordersToExport)
  }

  ElMessage.success(`已导出 ${ordersToExport.length} 个订单`)
  showExportDialog.value = false
}

onMounted(() => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
  }
})
</script>

<style lang="scss" scoped>
.orders-page {
  padding: 40px 0;
}

.breadcrumb {
  margin-bottom: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;

  h1 {
    font-size: 24px;
    color: #333;
    margin: 0;
  }

  .action-group {
    display: flex;
    gap: 12px;
  }
}

.order-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;

  .order-tab {
    padding: 8px 20px;
    background: #f5f7fa;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    color: #666;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s;

    &:hover {
      background: #e8ecef;
    }

    &.active {
      background: #409eff;
      color: #fff;

      .el-tag {
        background: rgba(255, 255, 255, 0.2) !important;
        color: #fff !important;
        border: none !important;
      }
    }
  }
}

.order-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .left-actions {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
}

.order-detail {
  .detail-title {
    font-size: 14px;
    font-weight: 600;
    margin: 20px 0 12px;
    color: #333;
  }

  .order-total {
    margin-top: 20px;
    padding: 16px;
    background: #fafafa;
    border-radius: 8px;

    .amount-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
      color: #666;

      &:last-child {
        margin-bottom: 0;
      }

      &.total {
        padding-top: 12px;
        margin-top: 12px;
        border-top: 1px solid #eee;
        font-size: 16px;
        font-weight: 600;
        color: #333;

        .total-price {
          font-size: 24px;
          color: #e6a23c;
        }
      }
    }
  }

  .detail-actions {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid #eee;
  }
}
</style>
