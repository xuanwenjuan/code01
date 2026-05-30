<template>
  <div class="orders-page">
    <div class="container">
      <div class="breadcrumb">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>个人中心</el-breadcrumb-item>
          <el-breadcrumb-item>采购订单</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <SearchFilter
        v-model:keyword="searchKeyword"
        v-model:dateRange="dateRange"
        v-model:activeTab="activeTab"
        :tabs="orderTabs"
        :showDateRange="true"
        searchPlaceholder="搜索订单号、商品名称..."
        @search="handleSearch"
        @filterChange="handleFilterChange"
        @reset="handleReset"
      >
        <template #extra>
          <el-button
            v-if="selectedOrders.length > 0"
            type="danger"
            @click="handleBatchCancel"
          >
            <el-icon><Delete /></el-icon>
            批量取消 ({{ selectedOrders.length }})
          </el-button>
        </template>
      </SearchFilter>

      <div v-if="loading" class="loading-wrapper">
        <AppLoading :loading="true" text="正在加载订单数据..." />
      </div>

      <template v-else>
        <div v-if="paginatedOrders.length > 0" class="order-list">
          <OrderCard
            v-for="order in paginatedOrders"
            :key="order.id"
            :order="order"
            :showCheckbox="showBatch"
            @pay="handlePay"
            @cancel="handleCancel"
            @confirm="handleConfirm"
            @buyAgain="handleBuyAgain"
            @viewDetail="handleViewDetail"
            @check="handleOrderCheck"
          />
        </div>

        <AppEmpty
          v-else
          description="暂无符合条件的订单记录"
          show-action
          action-text="去选购"
          @action="goToCategory"
        />

        <AppPagination
          v-if="filteredOrders.length > 0"
          v-model:currentPage="currentPage"
          v-model:pageSize="pageSize"
          :total="filteredOrders.length"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </template>
    </div>

    <el-dialog v-model="detailVisible" title="订单详情" width="600px">
      <el-descriptions v-if="currentOrder" :column="1" border>
        <el-descriptions-item label="订单号">
          {{ currentOrder.id }}
        </el-descriptions-item>
        <el-descriptions-item label="下单时间">
          {{ currentOrder.createTime }}
        </el-descriptions-item>
        <el-descriptions-item label="商品信息">
          <div class="order-product">
            <img :src="currentOrder.productImage" :alt="currentOrder.productName" />
            <span>{{ currentOrder.productName }}</span>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="单价">
          ¥{{ currentOrder.price.toLocaleString() }}
        </el-descriptions-item>
        <el-descriptions-item label="数量">
          {{ currentOrder.quantity }} 件
        </el-descriptions-item>
        <el-descriptions-item label="订单金额">
          <span class="price-highlight">¥{{ currentOrder.totalPrice.toLocaleString() }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <StatusTag :status="currentOrder.status" type="order" />
        </el-descriptions-item>
        <el-descriptions-item label="期望交货日期" v-if="currentOrder.deliveryDate">
          {{ formatDate(currentOrder.deliveryDate) }}
        </el-descriptions-item>
        <el-descriptions-item label="采购用途" v-if="currentOrder.usage">
          {{ getUsageText(currentOrder.usage) }}
        </el-descriptions-item>
        <el-descriptions-item label="联系人" v-if="currentOrder.contactName">
          {{ currentOrder.contactName }}
        </el-descriptions-item>
        <el-descriptions-item label="联系电话" v-if="currentOrder.contactPhone">
          {{ currentOrder.contactPhone }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import SearchFilter from '@/components/common/SearchFilter.vue'
import OrderCard from '@/components/common/OrderCard.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import AppPagination from '@/components/common/AppPagination.vue'
import AppLoading from '@/components/common/AppLoading.vue'
import AppEmpty from '@/components/common/AppEmpty.vue'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const searchKeyword = ref('')
const dateRange = ref([])
const activeTab = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)
const showBatch = ref(true)
const selectedOrders = ref([])
const detailVisible = ref(false)
const currentOrder = ref(null)

const orderTabs = computed(() => [
  { label: '全部订单', value: 'all', count: userStore.orders.length },
  { label: '待付款', value: 'pending', count: userStore.orders.filter(o => o.status === 'pending').length },
  { label: '已发货', value: 'shipped', count: userStore.orders.filter(o => o.status === 'shipped').length },
  { label: '已完成', value: 'completed', count: userStore.orders.filter(o => o.status === 'completed').length }
])

const filteredOrders = computed(() => {
  let result = [...userStore.orders]

  if (activeTab.value !== 'all') {
    result = result.filter(o => o.status === activeTab.value)
  }

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(o =>
      o.id.toLowerCase().includes(keyword) ||
      o.productName.toLowerCase().includes(keyword) ||
      (o.buyer && o.buyer.toLowerCase().includes(keyword))
    )
  }

  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    const startTime = new Date(start).getTime()
    const endTime = new Date(end).getTime() + 86400000
    result = result.filter(o => {
      const orderTime = new Date(o.createTime).getTime()
      return orderTime >= startTime && orderTime < endTime
    })
  }

  return result.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
})

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredOrders.value.slice(start, end)
})

const usageMap = {
  production: '生产制造',
  research: '研发实验',
  maintenance: '设备维修',
  stock: '库存备货',
  other: '其他'
}

const getUsageText = (usage) => usageMap[usage] || usage

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleFilterChange = ({ type }) => {
  if (type === 'tab') {
    currentPage.value = 1
    selectedOrders.value = []
  }
}

const handleReset = () => {
  searchKeyword.value = ''
  dateRange.value = []
  activeTab.value = 'all'
  currentPage.value = 1
  selectedOrders.value = []
}

const handlePageChange = () => {
  selectedOrders.value = []
}

const handleSizeChange = () => {
  currentPage.value = 1
  selectedOrders.value = []
}

const handleOrderCheck = ({ order, checked }) => {
  if (checked) {
    if (!selectedOrders.value.includes(order.id)) {
      selectedOrders.value.push(order.id)
    }
  } else {
    const index = selectedOrders.value.indexOf(order.id)
    if (index > -1) {
      selectedOrders.value.splice(index, 1)
    }
  }
}

const handlePay = (order) => {
  order.status = 'shipped'
  ElMessage.success('支付成功，商家已安排发货')
}

const handleCancel = (order) => {
  order.status = 'cancelled'
  ElMessage.success('订单已取消')
}

const handleConfirm = (order) => {
  order.status = 'completed'
  ElMessage.success('已确认收货')
}

const handleBuyAgain = (order) => {
  router.push(`/product/${order.productId}`)
}

const handleViewDetail = (order) => {
  currentOrder.value = order
  detailVisible.value = true
}

const handleBatchCancel = () => {
  if (selectedOrders.value.length === 0) {
    ElMessage.warning('请先选择要取消的订单')
    return
  }

  ElMessageBox.confirm(
    `确定要取消选中的 ${selectedOrders.value.length} 个订单吗？`,
    '批量取消订单',
    {
      confirmButtonText: '确定取消',
      cancelButtonText: '再想想',
      type: 'warning'
    }
  ).then(() => {
    selectedOrders.value.forEach(orderId => {
      const order = userStore.orders.find(o => o.id === orderId)
      if (order && order.status === 'pending') {
        order.status = 'cancelled'
      }
    })
    selectedOrders.value = []
    ElMessage.success('批量取消成功')
  }).catch(() => {})
}

const goToCategory = () => {
  router.push('/category')
}

watch(activeTab, () => {
  currentPage.value = 1
})
</script>

<style scoped>
.orders-page {
  padding: 24px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.breadcrumb {
  margin-bottom: 16px;
}

.loading-wrapper {
  padding: 60px 0;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-product {
  display: flex;
  align-items: center;
  gap: 12px;
}

.order-product img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.price-highlight {
  color: #f56c6c;
  font-size: 18px;
  font-weight: 600;
}
</style>
