<template>
  <div class="orders-page container">
    <h1 class="page-title">我的订单</h1>
    
    <SearchFilter
      v-model="searchKeyword"
      placeholder="搜索订单号、商品名称"
      :filters="statusFilters"
      :active-filter="activeTab"
      @search="handleSearch"
      @filter="handleFilter"
    />
    
    <EmptyState v-if="paginatedOrders.length === 0 && !loading" text="暂无订单">
      <template #action>
        <el-button type="primary" @click="$router.push('/cameras')">去选购</el-button>
      </template>
    </EmptyState>
    
    <LoadingSpinner v-if="loading" />
    
    <div v-else-if="paginatedOrders.length > 0" class="order-list">
      <div v-for="order in paginatedOrders" :key="order.id" class="order-card card">
        <div class="order-header">
          <div class="order-info">
            <span class="order-no">订单号：{{ order.id }}</span>
            <span class="order-time">{{ formatDate(order.createdAt) }}</span>
          </div>
          <el-tag :type="orderStatusMap[order.status].type" effect="light">
            {{ orderStatusMap[order.status].label }}
          </el-tag>
        </div>
        
        <div class="order-content">
          <div class="order-item">
            <div class="item-info">
              <div class="item-name">{{ order.cameraName }}</div>
              <div class="item-package">套餐：{{ order.packageName }}</div>
            </div>
            <div class="item-price">
              <span class="price">¥{{ order.price.toLocaleString() }}</span>
              <span class="quantity">x{{ order.quantity }}</span>
            </div>
          </div>
        </div>
        
        <div class="order-footer">
          <div class="order-total">
            订单金额：<span class="total-price">¥{{ order.price.toLocaleString() }}</span>
          </div>
          <div class="order-actions">
            <el-button 
              v-if="order.status === 'pending'" 
              type="primary" 
              size="small"
              @click="handlePay(order)"
            >
              去付款
            </el-button>
            <el-button 
              v-if="order.status === 'pending'" 
              size="small"
              @click="handleCancel(order)"
            >
              取消订单
            </el-button>
            <el-button 
              v-if="order.status === 'shipped'" 
              type="primary" 
              size="small"
              @click="handleConfirm(order)"
            >
              确认收货
            </el-button>
            <el-button 
              v-if="order.status === 'completed'" 
              size="small"
              @click="handleViewDetail(order)"
            >
              查看详情
            </el-button>
          </div>
        </div>
        
        <el-collapse v-if="order.status !== 'pending'" class="order-detail">
          <el-collapse-item title="收货信息" name="address">
            <div class="detail-row">
              <span class="label">收货人：</span>
              <span>{{ order.contactName }}</span>
            </div>
            <div class="detail-row">
              <span class="label">联系电话：</span>
              <span>{{ order.contactPhone }}</span>
            </div>
            <div class="detail-row">
              <span class="label">收货地址：</span>
              <span>{{ order.address }}</span>
            </div>
            <div v-if="order.remark" class="detail-row">
              <span class="label">备注：</span>
              <span>{{ order.remark }}</span>
            </div>
          </el-collapse-item>
          <el-collapse-item title="订单时间线" name="timeline">
            <el-steps direction="vertical" :active="getStepActive(order)" finish-status="success">
              <el-step title="创建订单" :description="formatDate(order.createdAt)" />
              <el-step 
                title="支付成功" 
                :description="order.paidAt ? formatDate(order.paidAt) : '待支付'"
              />
              <el-step 
                title="商家发货" 
                :description="order.shippedAt ? formatDate(order.shippedAt) : '待发货'"
              />
              <el-step 
                title="交易完成" 
                :description="order.completedAt ? formatDate(order.completedAt) : '待收货'"
              />
            </el-steps>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
    
    <DataPagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="filteredOrders.length"
      @change="handlePageChange"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { orderStatusMap } from '@/mock/data'
import SearchFilter from '@/components/SearchFilter.vue'
import DataPagination from '@/components/DataPagination.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { formatDate } from '@/utils/validation'

const userStore = useUserStore()
const activeTab = ref('all')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(5)
const loading = ref(false)

const statusFilters = [
  { value: 'all', label: '全部订单' },
  { value: 'pending', label: '待付款' },
  { value: 'paid', label: '待发货' },
  { value: 'shipped', label: '待收货' },
  { value: 'completed', label: '已完成' }
]

const orders = computed(() => userStore.getUserOrders())

const filteredOrders = computed(() => {
  let result = orders.value
  
  if (activeTab.value !== 'all') {
    result = result.filter(o => o.status === activeTab.value)
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(o => 
      String(o.id).includes(keyword) || 
      o.cameraName.toLowerCase().includes(keyword)
    )
  }
  
  return result
})

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredOrders.value.slice(start, end)
})

const handleSearch = (keyword) => {
  currentPage.value = 1
}

const handleFilter = (value) => {
  activeTab.value = value
  currentPage.value = 1
}

const handlePageChange = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 100)
}

const getStepActive = (order) => {
  switch (order.status) {
    case 'pending': return 0
    case 'paid': return 1
    case 'shipped': return 2
    case 'completed': return 4
    default: return 0
  }
}

const handlePay = async (order) => {
  try {
    await ElMessageBox.confirm(
      `确认支付订单 ${order.id}，金额 ¥${order.price.toLocaleString()} 吗？`,
      '确认支付',
      { type: 'warning' }
    )
    order.status = 'paid'
    order.paidAt = new Date().toISOString()
    ElMessage.success('支付成功')
  } catch {
    // 用户取消
  }
}

const handleCancel = async (order) => {
  try {
    await ElMessageBox.confirm(
      '确定要取消这个订单吗？',
      '取消订单',
      { type: 'warning' }
    )
    order.status = 'cancelled'
    ElMessage.success('订单已取消')
  } catch {
    // 用户取消
  }
}

const handleConfirm = async (order) => {
  try {
    await ElMessageBox.confirm(
      '确认已收到商品吗？',
      '确认收货',
      { type: 'warning' }
    )
    order.status = 'completed'
    order.completedAt = new Date().toISOString()
    ElMessage.success('收货成功')
  } catch {
    // 用户取消
  }
}

const handleViewDetail = (order) => {
  ElMessage.info('订单详情功能开发中')
}
</script>

<style lang="scss" scoped>
.orders-page {
  padding-top: 20px;
}

.order-tabs {
  margin-bottom: 20px;
  background: #fff;
  border-radius: 12px;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(93, 78, 55, 0.06);
}

.order-card {
  margin-bottom: 16px;
  padding: 0;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #faf8f3;
  border-bottom: 1px solid #f0ebe0;
}

.order-info {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: #666;
}

.order-no {
  font-weight: 500;
  color: #333;
}

.order-content {
  padding: 20px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}

.item-package {
  font-size: 13px;
  color: #888;
}

.item-price {
  text-align: right;
  
  .price {
    font-size: 18px;
    font-weight: bold;
    color: #c45c00;
    display: block;
  }
  
  .quantity {
    font-size: 13px;
    color: #888;
  }
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-top: 1px solid #f0ebe0;
  background: #faf8f3;
}

.order-total {
  font-size: 14px;
  color: #666;
  
  .total-price {
    font-size: 20px;
    font-weight: bold;
    color: #c45c00;
    margin-left: 8px;
  }
}

.order-actions {
  display: flex;
  gap: 10px;
}

.order-detail {
  border-top: 1px solid #f0ebe0;
  margin: 0 20px;
  
  :deep(.el-collapse-item__header) {
    font-weight: 500;
  }
}

.detail-row {
  padding: 6px 0;
  font-size: 14px;
  color: #555;
  
  .label {
    color: #888;
    margin-right: 10px;
  }
}

:deep(.el-steps--vertical) {
  padding: 10px 0;
}
</style>
