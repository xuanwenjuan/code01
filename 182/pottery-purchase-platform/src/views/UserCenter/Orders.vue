<template>
  <div class="orders-page container">
    <div class="page-header">
      <h2 class="section-title">我的订单</h2>
    </div>
    
    <div class="card">
      <SearchFilter
        v-model="searchKeyword"
        placeholder="搜索订单号或商品名称"
        :filters="orderFilters"
        @search="handleSearch"
        @filter-change="handleFilterChange"
      >
        <template #tabs>
          <el-tabs v-model="activeTab" @tab-change="handleTabChange">
            <el-tab-pane label="全部订单" name="all" />
            <el-tab-pane label="待付款" name="pending" />
            <el-tab-pane label="待发货" name="paid" />
            <el-tab-pane label="待收货" name="shipping" />
            <el-tab-pane label="已完成" name="completed" />
          </el-tabs>
        </template>
      </SearchFilter>

      <LoadingState v-if="loading" />
      <EmptyState
        v-else-if="paginatedOrders.length === 0"
        description="暂无相关订单"
        icon="📦"
        show-action
        action-text="去购物"
        @action="router.push('/')"
      />
      <template v-else>
        <div class="order-list">
          <OrderCard
            v-for="order in paginatedOrders"
            :key="order.id"
            :order="order"
            @product-click="goToProduct"
            @pay="handlePay"
            @cancel="handleCancel"
            @confirm="handleConfirm"
            @logistics="handleLogistics"
            @rebuy="handleRebuy"
            @review="handleReview"
            @detail="handleDetail"
          />
        </div>
        <Pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="filteredOrders.length"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { ElMessage, ElMessageBox } from 'element-plus'
import OrderCard from '@/components/common/OrderCard.vue'
import SearchFilter from '@/components/common/SearchFilter.vue'
import Pagination from '@/components/common/Pagination.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const router = useRouter()
const appStore = useAppStore()

const loading = ref(true)
const searchKeyword = ref('')
const activeTab = ref('all')
const currentPage = ref(1)
const pageSize = ref(5)

const filterValues = reactive({
  dateRange: ''
})

const orderFilters = [
  {
    key: 'dateRange',
    placeholder: '下单时间',
    defaultValue: '',
    options: [
      { label: '全部时间', value: '' },
      { label: '近一个月', value: 'month' },
      { label: '近三个月', value: 'quarter' },
      { label: '近半年', value: 'half' }
    ]
  }
]

const filteredOrders = computed(() => {
  let orders = [...appStore.orders]
  
  if (activeTab.value !== 'all') {
    orders = orders.filter(o => o.status === activeTab.value)
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    orders = orders.filter(o => {
      const matchId = o.id.toLowerCase().includes(keyword)
      const matchProduct = o.products.some(p => 
        p.name.toLowerCase().includes(keyword)
      )
      return matchId || matchProduct
    })
  }
  
  return orders
})

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredOrders.value.slice(start, end)
})

const handleSearch = () => {
  currentPage.value = 1
}

const handleFilterChange = (filters) => {
  Object.assign(filterValues, filters)
  currentPage.value = 1
}

const handleTabChange = () => {
  currentPage.value = 1
}

const handlePageChange = () => {}

const handleSizeChange = () => {
  currentPage.value = 1
}

const goToProduct = (productId) => {
  router.push(`/product/${productId}`)
}

const handlePay = (orderId) => {
  ElMessageBox.confirm('确定要支付该订单吗？', '支付确认', {
    confirmButtonText: '确定支付',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    appStore.updateOrderStatus(orderId, 'paid')
    ElMessage.success('支付成功')
  }).catch(() => {})
}

const handleCancel = (orderId) => {
  ElMessageBox.confirm('确定要取消该订单吗？', '取消订单', {
    confirmButtonText: '确定取消',
    cancelButtonText: '再想想',
    type: 'warning'
  }).then(() => {
    appStore.updateOrderStatus(orderId, 'cancelled')
    ElMessage.success('订单已取消')
  }).catch(() => {})
}

const handleConfirm = (orderId) => {
  ElMessageBox.confirm('确认已收到商品？', '确认收货', {
    confirmButtonText: '确认收货',
    cancelButtonText: '取消',
    type: 'success'
  }).then(() => {
    appStore.updateOrderStatus(orderId, 'completed')
    ElMessage.success('收货成功')
  }).catch(() => {})
}

const handleLogistics = (orderId) => {
  const order = appStore.getOrderById(orderId)
  ElMessage.info(`物流单号: ${order?.trackingNo || '暂无物流信息'}`)
}

const handleRebuy = (orderId) => {
  ElMessage.success('已添加到购物车')
}

const handleReview = (orderId) => {
  ElMessage.info('评价功能开发中...')
}

const handleDetail = (orderId) => {
  ElMessage.info(`订单详情: ${orderId}`)
}

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 300)
})

watch([activeTab, searchKeyword], () => {
  currentPage.value = 1
})
</script>

<style scoped>
.orders-page {
  padding-top: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.order-list {
  margin-bottom: 10px;
}

:deep(.el-tabs__header) {
  margin-bottom: 0;
}
</style>
