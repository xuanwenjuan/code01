<template>
  <div class="orders-page">
    <div class="page-header">
      <h2 class="page-title">我的订单</h2>
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索订单号或商品名称"
          clearable
          style="width: 300px;"
          @input="handleSearch"
        />
      </div>
    </div>
    
    <el-tabs v-model="activeTab" class="order-tabs" @tab-change="handleTabChange">
      <el-tab-pane label="全部订单" name="all" />
      <el-tab-pane label="待付款" name="pending" />
      <el-tab-pane label="待发货" name="paid" />
      <el-tab-pane label="待收货" name="shipped" />
      <el-tab-pane label="已完成" name="completed" />
    </el-tabs>

    <div class="order-list" v-loading="loading">
      <EmptyState
        v-if="!loading && paginatedOrders.length === 0"
        :description="searchKeyword ? '未找到相关订单' : '暂无订单'"
        show-action
        action-text="去采购"
        @action="goShopping"
      />
      <div v-else>
        <TransitionGroup name="list">
          <OrderCard
            v-for="order in paginatedOrders"
            :key="order.id"
            :order="order"
            class="order-item"
            @pay="payOrder"
            @cancel="cancelOrder"
            @confirm="confirmOrder"
          />
        </TransitionGroup>
        
        <Pagination
          :total="filteredOrders.length"
          v-model:page="currentPage"
          v-model:page-size="pageSize"
          @change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getOrdersApi, payOrderApi, cancelOrderApi, confirmOrderApi } from '@/api/order'
import EmptyState from '@/components/common/EmptyState.vue'
import Pagination from '@/components/common/Pagination.vue'
import OrderCard from '@/components/business/OrderCard.vue'

const router = useRouter()

const loading = ref(true)
const orders = ref([])
const activeTab = ref('all')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(5)

const filteredOrders = computed(() => {
  let result = [...orders.value]
  
  if (activeTab.value !== 'all') {
    result = result.filter(o => o.status === activeTab.value)
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(o => 
      o.id.toLowerCase().includes(keyword) ||
      o.items.some(item => item.productName.toLowerCase().includes(keyword))
    )
  }
  
  return result
})

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredOrders.value.slice(start, end)
})

onMounted(async () => {
  await loadOrders()
  loading.value = false
})

watch(activeTab, () => {
  currentPage.value = 1
})

const loadOrders = async () => {
  const res = await getOrdersApi()
  if (res.code === 200) {
    orders.value = res.data.list
  }
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleTabChange = () => {
  currentPage.value = 1
}

const handlePageChange = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const payOrder = async (order) => {
  const res = await payOrderApi(order.id)
  if (res.code === 200) {
    ElMessage.success('支付成功')
    loadOrders()
  }
}

const cancelOrder = async (order) => {
  const res = await cancelOrderApi(order.id)
  if (res.code === 200) {
    ElMessage.success('订单已取消')
    loadOrders()
  }
}

const confirmOrder = async (order) => {
  const res = await confirmOrderApi(order.id)
  if (res.code === 200) {
    ElMessage.success('已确认收货')
    loadOrders()
  }
}

const goShopping = () => {
  router.push({ name: 'Home' })
}
</script>

<style lang="scss" scoped>
.orders-page {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .page-title {
      font-size: 20px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }
  }

  .order-tabs {
    margin-bottom: 20px;
  }

  .order-list {
    .order-item {
      margin-bottom: 16px;
    }
  }
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
