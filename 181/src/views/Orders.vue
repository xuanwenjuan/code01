<template>
  <div class="orders-page">
    <div class="container">
      <PageHeader title="我的订单" />
      
      <div class="order-toolbar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索订单号或商品名称"
          style="width: 300px"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      
      <el-tabs v-model="activeTab" class="order-tabs">
        <el-tab-pane label="全部订单" name="all" />
        <el-tab-pane label="待付款" name="pending" />
        <el-tab-pane label="已发货" name="shipping" />
        <el-tab-pane label="已完成" name="completed" />
        <el-tab-pane label="已取消" name="cancelled" />
      </el-tabs>
      
      <LoadingState v-if="loading" />
      
      <template v-else>
        <div v-if="filteredOrders.length > 0" class="order-list">
          <OrderCard
            v-for="order in filteredOrders"
            :key="order.id"
            :order="order"
            @go-product="goProduct"
            @cancel="cancelOrder"
            @confirm="confirmOrder"
          />
        </div>
        
        <EmptyState
          v-else
          :text="activeTab === 'all' ? '暂无订单' : '该状态下暂无订单'"
          action-text="去逛逛"
          @action="goHome"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeader from '@/components/PageHeader.vue'
import OrderCard from '@/components/OrderCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import LoadingState from '@/components/LoadingState.vue'
import { useDebounce } from '@/composables/useDebounce'

const router = useRouter()
const orderStore = useOrderStore()
const userStore = useUserStore()

const activeTab = ref('all')
const searchKeyword = ref('')
const loading = ref(false)

const debouncedKeyword = useDebounce(searchKeyword, 300)

const orders = computed(() => 
  orderStore.getOrdersByUser(userStore.userInfo?.id || 0)
)

const filteredOrders = computed(() => {
  let result = orders.value
  
  if (activeTab.value !== 'all') {
    result = result.filter(o => o.status === activeTab.value)
  }
  
  if (debouncedKeyword.value) {
    const keyword = debouncedKeyword.value.toLowerCase()
    result = result.filter(o => 
      o.id.toLowerCase().includes(keyword) ||
      o.items.some(item => item.name.toLowerCase().includes(keyword))
    )
  }
  
  return result
})

const goProduct = (id) => router.push(`/product/${id}`)
const goHome = () => router.push('/')

const cancelOrder = async (orderId) => {
  try {
    await ElMessageBox.confirm('确定要取消这个订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    loading.value = true
    await orderStore.cancelOrder(orderId)
    ElMessage.success('订单已取消')
  } catch (err) {
  } finally {
    loading.value = false
  }
}

const confirmOrder = async (orderId) => {
  try {
    await ElMessageBox.confirm('确认已收到商品？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    loading.value = true
    await orderStore.confirmOrder(orderId)
    ElMessage.success('确认收货成功')
  } catch (err) {
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
})
</script>

<style lang="scss" scoped>
.orders-page {
  padding: 40px 0;
}

.order-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.order-tabs {
  background: #fff;
  border-radius: 12px;
  padding: 0 24px;
  margin-bottom: 24px;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
