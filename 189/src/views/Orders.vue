<template>
  <div class="orders-page">
    <div class="container page-wrapper">
      <h2 class="page-title">我的订单</h2>

      <AppSearchFilter
        :filter-tags="statusTags"
        search-placeholder="搜索订单号、商品名称"
        :default-filter="currentStatus"
        @search="handleSearch"
        @filter-change="handleFilterChange"
        @reset="handleReset"
        :show-extra-filters="true"
        :show-actions="true"
      >
        <template #extra>
          <div class="extra-filters">
            <el-form :inline="true" :model="filterForm">
              <el-form-item label="下单时间">
                <el-date-picker
                  v-model="filterForm.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="YYYY-MM-DD"
                  style="width: 280px"
                />
              </el-form-item>
              <el-form-item label="金额范围">
                <el-input-number
                  v-model="filterForm.minAmount"
                  :min="0"
                  placeholder="最小"
                  style="width: 120px"
                />
                <span style="margin: 0 8px">-</span>
                <el-input-number
                  v-model="filterForm.maxAmount"
                  :min="0"
                  placeholder="最大"
                  style="width: 120px"
                />
              </el-form-item>
            </el-form>
          </div>
        </template>
      </AppSearchFilter>

      <div class="order-stats card">
        <div class="stat-item" @click="currentStatus = ''">
          <span class="stat-num">{{ orderStore.orderStats.total }}</span>
          <span class="stat-label">全部订单</span>
        </div>
        <div class="stat-item" @click="currentStatus = 'unpaid'">
          <span class="stat-num">{{ orderStore.orderStats.unpaid }}</span>
          <span class="stat-label">待支付</span>
        </div>
        <div class="stat-item" @click="currentStatus = 'pending'">
          <span class="stat-num">{{ orderStore.orderStats.pending }}</span>
          <span class="stat-label">待发货</span>
        </div>
        <div class="stat-item" @click="currentStatus = 'shipping'">
          <span class="stat-num">{{ orderStore.orderStats.shipping }}</span>
          <span class="stat-label">运输中</span>
        </div>
        <div class="stat-item" @click="currentStatus = 'delivered'">
          <span class="stat-num">{{ orderStore.orderStats.delivered }}</span>
          <span class="stat-label">已完成</span>
        </div>
      </div>

      <AppListContainer
        :data="paginatedOrders"
        :loading="loading"
        :total="filteredOrders.length"
        :page-size="pageSize"
        empty-text="暂无符合条件的订单"
        @page-change="handlePageChange"
      >
        <div class="order-list">
          <div 
            v-for="order in paginatedOrders" 
            :key="order.id" 
            class="order-item card"
          >
            <div class="order-header">
              <div class="order-info">
                <span class="order-id">订单号：{{ order.id }}</span>
                <span class="order-time">{{ order.createTime }}</span>
                <span class="order-supplier">供货方：{{ order.supplierName }}</span>
              </div>
              <el-tag 
                :type="getStatusType(order.status)" 
                effect="light"
                size="large"
              >
                {{ order.statusText }}
              </el-tag>
            </div>

            <div class="order-products">
              <div 
                v-for="item in order.products" 
                :key="item.id" 
                class="product-item"
              >
                <div class="product-info">
                  <span class="product-name">{{ item.name }}</span>
                  <span class="product-price">¥{{ item.price }}/{{ item.unit }}</span>
                </div>
                <span class="product-qty">×{{ item.quantity }}</span>
                <span class="product-subtotal">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
              </div>
            </div>

            <div class="order-footer">
              <div class="order-total">
                共 {{ order.products.reduce((sum, p) => sum + p.quantity, 0) }} 件商品，
                合计：<span class="total-amount">¥{{ order.totalAmount.toFixed(2) }}</span>
              </div>
              <div class="order-actions">
                <el-button size="small" @click="showDetail(order)">订单详情</el-button>
                <el-button 
                  v-if="order.status === 'unpaid'" 
                  type="primary" 
                  size="small"
                  @click="handlePay(order)"
                >立即支付</el-button>
                <el-button 
                  v-if="order.status === 'shipping'" 
                  type="primary" 
                  size="small"
                  @click="handleReceive(order)"
                >确认收货</el-button>
                <el-button 
                  v-if="order.status === 'delivered'" 
                  type="success" 
                  size="small"
                  @click="handleReorder(order)"
                >再次采购</el-button>
              </div>
            </div>
          </div>
        </div>
      </AppListContainer>
    </div>

    <OrderDetailDialog
      v-model="detailVisible"
      :order="currentOrder"
    >
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <template v-if="currentOrder?.status === 'unpaid'">
          <el-button type="primary" @click="handlePay(currentOrder)">立即支付</el-button>
        </template>
        <template v-else-if="currentOrder?.status === 'shipping'">
          <el-button type="primary" @click="handleReceive(currentOrder)">确认收货</el-button>
        </template>
      </template>
    </OrderDetailDialog>

    <AppConfirmDialog
      v-model="confirmVisible"
      :title="confirmConfig.title"
      :message="confirmConfig.message"
      :type="confirmConfig.type"
      :confirm-text="confirmConfig.confirmText"
      confirm-type="primary"
      @confirm="handleConfirmAction"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useOrderStore } from '@/store/order'
import AppSearchFilter from '@/components/AppSearchFilter.vue'
import AppListContainer from '@/components/AppListContainer.vue'
import OrderDetailDialog from '@/components/OrderDetailDialog.vue'
import AppConfirmDialog from '@/components/AppConfirmDialog.vue'

const orderStore = useOrderStore()

const loading = ref(true)
const currentStatus = ref('')
const pageSize = ref(5)
const currentPage = ref(1)
const detailVisible = ref(false)
const currentOrder = ref(null)
const confirmVisible = ref(false)
const confirmConfig = reactive({
  title: '',
  message: '',
  type: 'warning',
  confirmText: '确定',
  action: null
})

const searchKeyword = ref('')
const filterForm = reactive({
  dateRange: [],
  minAmount: null,
  maxAmount: null
})

const statusTags = computed(() => [
  { label: '全部', value: '', count: orderStore.orderStats.total },
  { label: '待支付', value: 'unpaid', count: orderStore.orderStats.unpaid },
  { label: '待发货', value: 'pending', count: orderStore.orderStats.pending },
  { label: '运输中', value: 'shipping', count: orderStore.orderStats.shipping },
  { label: '已完成', value: 'delivered', count: orderStore.orderStats.delivered }
])

const filteredOrders = computed(() => {
  let result = [...orderStore.myOrders]

  if (currentStatus.value) {
    result = result.filter(o => o.status === currentStatus.value)
  }

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(o => 
      o.id.toLowerCase().includes(keyword) ||
      o.products.some(p => p.name.toLowerCase().includes(keyword))
    )
  }

  if (filterForm.dateRange?.length === 2) {
    const [start, end] = filterForm.dateRange
    result = result.filter(o => {
      const orderDate = o.createTime.split(' ')[0]
      return orderDate >= start && orderDate <= end
    })
  }

  if (filterForm.minAmount !== null) {
    result = result.filter(o => o.totalAmount >= filterForm.minAmount)
  }
  if (filterForm.maxAmount !== null) {
    result = result.filter(o => o.totalAmount <= filterForm.maxAmount)
  }

  return result
})

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredOrders.value.slice(start, end)
})

function getStatusType(status) {
  const types = {
    unpaid: 'warning',
    pending: 'primary',
    shipping: 'info',
    delivered: 'success'
  }
  return types[status] || 'info'
}

function handleSearch({ keyword, filter }) {
  searchKeyword.value = keyword
  currentStatus.value = filter
  currentPage.value = 1
}

function handleFilterChange(status) {
  currentStatus.value = status
  currentPage.value = 1
}

function handleReset() {
  searchKeyword.value = ''
  currentStatus.value = ''
  filterForm.dateRange = []
  filterForm.minAmount = null
  filterForm.maxAmount = null
  currentPage.value = 1
}

function handlePageChange({ page }) {
  currentPage.value = page
}

function showDetail(order) {
  currentOrder.value = order
  detailVisible.value = true
}

function handlePay(order) {
  confirmConfig.title = '确认支付'
  confirmConfig.message = `确定要支付订单 ${order.id} 吗？`
  confirmConfig.type = 'warning'
  confirmConfig.confirmText = '确认支付'
  confirmConfig.action = () => {
    orderStore.updateOrderStatus(order.id, 'pending', '待发货')
    ElMessage.success('支付成功')
    detailVisible.value = false
  }
  confirmVisible.value = true
}

function handleReceive(order) {
  confirmConfig.title = '确认收货'
  confirmConfig.message = `确定已收到订单 ${order.id} 的商品吗？`
  confirmConfig.type = 'warning'
  confirmConfig.confirmText = '确认收货'
  confirmConfig.action = () => {
    orderStore.updateOrderStatus(order.id, 'delivered', '已完成')
    ElMessage.success('已确认收货')
    detailVisible.value = false
  }
  confirmVisible.value = true
}

function handleReorder(order) {
  ElMessage.success('已将商品加入采购清单')
}

function handleConfirmAction() {
  if (confirmConfig.action) {
    confirmConfig.action()
  }
}

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 300)
})
</script>

<style lang="scss" scoped>
.orders-page {
  .page-title {
    font-size: 24px;
    font-weight: 600;
    color: $text-color;
    margin-bottom: 20px;
  }

  .extra-filters {
    .el-form-item {
      margin-bottom: 0;
      margin-right: 24px;
    }
  }

  .order-stats {
    display: flex;
    padding: 24px;
    margin-bottom: 20px;

    .stat-item {
      flex: 1;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        .stat-num {
          color: $primary-color;
        }
      }

      .stat-num {
        display: block;
        font-size: 28px;
        font-weight: 700;
        color: $text-color;
        margin-bottom: 4px;
        transition: color 0.2s ease;
      }

      .stat-label {
        font-size: 13px;
        color: $text-light;
      }
    }
  }

  .order-list {
    .order-item {
      margin-bottom: 16px;

      .order-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid $border-color;

        .order-info {
          display: flex;
          gap: 20px;
          font-size: 13px;
          color: $text-light;
          flex-wrap: wrap;

          .order-id {
            font-weight: 500;
            color: $text-color;
            font-family: monospace;
          }

          .order-supplier {
            color: $primary-color;
          }
        }
      }

      .order-products {
        padding: 16px 20px;

        .product-item {
          display: flex;
          align-items: center;
          padding: 8px 0;

          .product-info {
            flex: 1;

            .product-name {
              font-size: 14px;
              color: $text-color;
              margin-right: 16px;
            }

            .product-price {
              font-size: 13px;
              color: $text-light;
            }
          }

          .product-qty {
            width: 80px;
            text-align: center;
            color: $text-light;
          }

          .product-subtotal {
            width: 120px;
            text-align: right;
            color: $danger-color;
            font-weight: 600;
          }
        }
      }

      .order-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        background: #fafafa;
        border-radius: 0 0 8px 8px;

        .order-total {
          font-size: 14px;
          color: $text-light;

          .total-amount {
            font-size: 20px;
            font-weight: 700;
            color: $danger-color;
            margin-left: 8px;
          }
        }
      }
    }
  }
}
</style>
