<template>
  <div class="orders-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">
          <el-icon color="#409eff"><List /></el-icon>
          我的订单
        </h1>
      </div>
      
      <div class="order-toolbar card-shadow">
        <div class="toolbar-left">
          <SearchBar 
            v-model="searchKeyword"
            placeholder="搜索订单号或商品名称"
            :show-button="false"
            @search="handleSearch"
          />
        </div>
        <div class="toolbar-right">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            size="default"
            class="date-picker"
            @change="handleDateFilter"
          />
          <el-button @click="resetFilters">重置筛选</el-button>
        </div>
      </div>
      
      <div class="order-tabs card-shadow">
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <el-tab-pane 
            label="全部订单" 
            name=""
          >
            <span class="tab-count">{{ orderStore.orders.length }}</span>
          </el-tab-pane>
          <el-tab-pane 
            label="待发货" 
            name="pending"
          >
            <span class="tab-count">{{ getStatusCount('pending') }}</span>
          </el-tab-pane>
          <el-tab-pane 
            label="配送中" 
            name="shipping"
          >
            <span class="tab-count">{{ getStatusCount('shipping') }}</span>
          </el-tab-pane>
          <el-tab-pane 
            label="已完成" 
            name="delivered"
          >
            <span class="tab-count">{{ getStatusCount('delivered') }}</span>
          </el-tab-pane>
          <el-tab-pane 
            label="已取消" 
            name="cancelled"
          >
            <span class="tab-count">{{ getStatusCount('cancelled') }}</span>
          </el-tab-pane>
        </el-tabs>
      </div>
      
      <div v-if="orderStore.loading" class="loading-wrapper">
        <LoadingState text="订单加载中..." />
      </div>
      <div v-else-if="filteredOrders.length === 0" class="empty-wrapper">
        <EmptyState 
          description="暂无符合条件的订单" 
          show-action
          action-text="去购物"
          @action="router.push('/products')"
        />
      </div>
      <div v-else class="order-list">
        <OrderCard 
          v-for="order in paginatedOrders" 
          :key="order.id"
          :order="order"
          @product-click="goProductDetail"
          @cancel="handleCancelOrder"
          @confirm="handleConfirmReceive"
          @rebuy="handleRebuy"
          @detail="handleViewDetail"
        />
        
        <div class="pagination-wrapper" v-if="totalPages > 1">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="filteredOrders.length"
            layout="prev, pager, next, jumper, total"
            background
          />
        </div>
      </div>
    </div>
    
    <OrderDetailDialog 
      v-model="showDetailDialog"
      :order="currentOrder"
      @cancel="handleCancelOrder"
      @confirm="handleConfirmReceive"
      @closed="currentOrder = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'
import { ElMessage, ElMessageBox } from 'element-plus'
import OrderCard from '@/components/OrderCard.vue'
import OrderDetailDialog from '@/components/OrderDetailDialog.vue'
import SearchBar from '@/components/SearchBar.vue'
import EmptyState from '@/components/EmptyState.vue'
import LoadingState from '@/components/LoadingState.vue'

const router = useRouter()
const orderStore = useOrderStore()

const activeTab = ref('')
const searchKeyword = ref('')
const dateRange = ref([])
const currentPage = ref(1)
const pageSize = 5
const showDetailDialog = ref(false)
const currentOrder = ref(null)

const filteredOrders = computed(() => {
  let orders = orderStore.orders
  
  if (activeTab.value) {
    orders = orders.filter(o => o.status === activeTab.value)
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    orders = orders.filter(o => 
      o.id.toLowerCase().includes(keyword) ||
      o.products.some(p => p.name.toLowerCase().includes(keyword))
    )
  }
  
  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    orders = orders.filter(o => {
      const orderDate = new Date(o.createTime)
      return orderDate >= start && orderDate <= new Date(end.getTime() + 86400000)
    })
  }
  
  return orders
})

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredOrders.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredOrders.value.length / pageSize)
})

function getStatusCount(status) {
  return orderStore.orders.filter(o => o.status === status).length
}

function handleTabChange() {
  currentPage.value = 1
}

function handleSearch() {
  currentPage.value = 1
}

function handleDateFilter() {
  currentPage.value = 1
}

function resetFilters() {
  searchKeyword.value = ''
  dateRange.value = []
  activeTab.value = ''
  currentPage.value = 1
}

function goProductDetail(productId) {
  router.push(`/product/${productId}`)
}

function handleViewDetail(order) {
  currentOrder.value = order
  showDetailDialog.value = true
}

function handleCancelOrder(order) {
  ElMessageBox.confirm('确定要取消该订单吗？取消后无法恢复。', '取消订单', {
    confirmButtonText: '确定取消',
    cancelButtonText: '再想想',
    type: 'warning'
  }).then(() => {
    orderStore.updateOrderStatus(order.id, 'cancelled', '已取消')
    ElMessage.success('订单已取消')
    showDetailDialog.value = false
  }).catch(() => {})
}

function handleConfirmReceive(order) {
  ElMessageBox.confirm('确认已收到商品吗？', '确认收货', {
    confirmButtonText: '确认收货',
    cancelButtonText: '取消',
    type: 'success'
  }).then(() => {
    orderStore.updateOrderStatus(order.id, 'delivered', '已完成')
    ElMessage.success('已确认收货')
    showDetailDialog.value = false
  }).catch(() => {})
}

function handleRebuy(order) {
  ElMessage.info('正在为您跳转到商品页面...')
  if (order.products.length > 0) {
    goProductDetail(order.products[0].productId)
  }
}

watch(filteredOrders, () => {
  if (currentPage.value > totalPages.value && totalPages.value > 0) {
    currentPage.value = totalPages.value
  }
})

onMounted(async () => {
  await orderStore.simulateLoading(300)
})
</script>

<style scoped lang="scss">
.orders-page {
  padding: 20px 0;
}

.page-header {
  margin-bottom: 20px;
  
  .page-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 24px;
    font-weight: 600;
    color: #303133;
  }
}

.order-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 20px;
  
  .toolbar-left {
    flex: 1;
  }
  
  .toolbar-right {
    display: flex;
    gap: 12px;
    align-items: center;
  }
  
  .date-picker {
    width: 280px;
  }
}

.order-tabs {
  background: #fff;
  border-radius: 12px;
  padding: 0 20px;
  margin-bottom: 20px;
  
  :deep(.el-tabs__header) {
    margin-bottom: 0;
  }
  
  :deep(.el-tabs__item) {
    position: relative;
    padding-right: 4px;
    
    .tab-count {
      display: inline-block;
      margin-left: 4px;
      padding: 0 6px;
      background: #f0f2f5;
      color: #909399;
      font-size: 12px;
      border-radius: 10px;
      line-height: 18px;
    }
    
    &.is-active .tab-count {
      background: #409eff;
      color: #fff;
    }
  }
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.loading-wrapper, .empty-wrapper {
  background: #fff;
  border-radius: 12px;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .order-toolbar {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
    
    .toolbar-right {
      flex-wrap: wrap;
      
      .date-picker {
        flex: 1;
        min-width: 200px;
      }
    }
  }
}
</style>
