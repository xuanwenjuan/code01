<template>
  <div class="order-list">
    <SearchBar
      v-model="searchKeyword"
      placeholder="搜索订单号或商品名称"
      :filters="orderFilters"
      @search="handleSearch"
      @filterChange="handleFilterChange"
      @clear="handleClear"
    >
      <template #actions>
        <el-button size="default" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出订单
        </el-button>
      </template>
    </SearchBar>

    <div v-if="loading" class="loading-wrapper">
      <LoadingState type="spinner" />
    </div>

    <template v-else-if="filteredOrders.length > 0">
      <div class="order-stats">
        <div
          v-for="stat in orderStatistics"
          :key="stat.key"
          class="stat-card"
          :class="{ active: activeStat === stat.key }"
          @click="filterByStat(stat.key)"
        >
          <span class="stat-label">{{ stat.label }}</span>
          <span class="stat-value">{{ stat.value }}</span>
        </div>
      </div>

      <div class="orders">
        <div v-for="order in paginatedOrders" :key="order.id" class="order-card">
          <div class="order-header">
            <div class="order-info">
              <span class="order-id">订单号：{{ order.id }}</span>
              <span class="order-time">
                <el-icon size="12"><Clock /></el-icon>
                {{ order.createTime }}
              </span>
            </div>
            <StatusTag :type="order.status" :text="order.statusText" effect="dark" />
          </div>
          <div class="order-items">
            <div
              v-for="(item, index) in order.items"
              :key="index"
              class="order-item"
            >
              <img :src="item.image" :alt="item.name" class="item-image" />
              <div class="item-info">
                <h4 class="item-name">{{ item.name }}</h4>
                <p class="item-spec">规格：{{ item.spec }}</p>
              </div>
              <div class="item-price">
                <PriceDisplay :price="item.price" size="small" />
                <span class="quantity">×{{ item.quantity }}</span>
              </div>
            </div>
          </div>
          <div class="order-footer">
            <div class="order-total">
              共 <span class="item-count">{{ getTotalQuantity(order) }}</span> 件商品，
              <span class="total-amount">
                合计：
                <PriceDisplay :price="order.totalAmount" size="large" />
              </span>
            </div>
            <div class="order-actions">
              <el-button
                v-if="order.status === 'pending'"
                type="primary"
                size="small"
                @click="handlePay(order)"
              >
                立即付款
              </el-button>
              <el-button
                v-if="order.status === 'shipped'"
                type="success"
                size="small"
                @click="handleConfirm(order)"
              >
                确认收货
              </el-button>
              <el-button
                v-if="order.status === 'completed'"
                size="small"
                @click="handleBuyAgain(order)"
              >
                再次购买
              </el-button>
              <el-button size="small" @click="viewDetail(order)">
                查看详情
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20, 50]"
          :total="filteredOrders.length"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </template>

    <EmptyState
      v-else
      description="暂无订单"
      show-action
      action-text="去采购"
      @action="goShopping"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'
import { useUserStore } from '@/stores/user'
import { useProductStore } from '@/stores/product'
import { ElMessage, ElMessageBox } from 'element-plus'
import EmptyState from '@/components/EmptyState.vue'
import LoadingState from '@/components/LoadingState.vue'
import { SearchBar, PriceDisplay, StatusTag } from '@/components/common'

const props = defineProps({
  status: {
    type: String,
    default: null
  }
})

const router = useRouter()
const orderStore = useOrderStore()
const userStore = useUserStore()
const productStore = useProductStore()

const loading = ref(true)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const activeStat = ref('all')
const filterValues = ref({})

const orderFilters = [
  {
    key: 'dateRange',
    label: '时间范围',
    options: [
      { label: '全部时间', value: 'all' },
      { label: '近7天', value: '7days' },
      { label: '近30天', value: '30days' },
      { label: '近90天', value: '90days' }
    ]
  },
  {
    key: 'amountRange',
    label: '金额范围',
    options: [
      { label: '全部金额', value: 'all' },
      { label: '100元以下', value: '0-100' },
      { label: '100-500元', value: '100-500' },
      { label: '500元以上', value: '500+' }
    ]
  }
]

const allOrders = computed(() => {
  return orderStore.getUserOrders(userStore.currentUser?.id)
})

const orderStatistics = computed(() => {
  const stats = [
    { key: 'all', label: '全部订单', value: allOrders.value.length },
    { key: 'pending', label: '待付款', value: allOrders.value.filter(o => o.status === 'pending').length },
    { key: 'shipped', label: '待收货', value: allOrders.value.filter(o => o.status === 'shipped').length },
    { key: 'completed', label: '已完成', value: allOrders.value.filter(o => o.status === 'completed').length }
  ]
  return stats
})

const filteredOrders = computed(() => {
  let orders = [...allOrders.value]

  if (props.status) {
    orders = orders.filter(o => o.status === props.status)
  }

  if (activeStat.value !== 'all') {
    orders = orders.filter(o => o.status === activeStat.value)
  }

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    orders = orders.filter(o =>
      o.id.toLowerCase().includes(keyword) ||
      o.items.some(item => item.name.toLowerCase().includes(keyword))
    )
  }

  if (filterValues.value.dateRange && filterValues.value.dateRange !== 'all') {
    const days = parseInt(filterValues.value.dateRange)
    const now = new Date()
    const threshold = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    orders = orders.filter(o => new Date(o.createTime) >= threshold)
  }

  if (filterValues.value.amountRange && filterValues.value.amountRange !== 'all') {
    const range = filterValues.value.amountRange
    if (range === '0-100') {
      orders = orders.filter(o => o.totalAmount < 100)
    } else if (range === '100-500') {
      orders = orders.filter(o => o.totalAmount >= 100 && o.totalAmount <= 500)
    } else if (range === '500+') {
      orders = orders.filter(o => o.totalAmount > 500)
    }
  }

  return orders
})

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredOrders.value.slice(start, end)
})

watch([searchKeyword, filterValues], () => {
  currentPage.value = 1
})

watch(() => props.status, () => {
  activeStat.value = props.status || 'all'
  currentPage.value = 1
})

const getTotalQuantity = (order) => {
  return order.items.reduce((sum, item) => sum + item.quantity, 0)
}

const handleSearch = (keyword) => {
  currentPage.value = 1
}

const handleFilterChange = (filters) => {
  filterValues.value = filters
  currentPage.value = 1
}

const handleClear = () => {
  filterValues.value = {}
  currentPage.value = 1
}

const filterByStat = (key) => {
  activeStat.value = key
  currentPage.value = 1
}

const handlePay = async (order) => {
  try {
    await ElMessageBox.confirm(
      `确认支付订单 ${order.id}，金额 ¥${order.totalAmount} 吗？`,
      '确认支付',
      { confirmButtonText: '确认支付', cancelButtonText: '取消', type: 'warning' }
    )
    orderStore.updateOrderStatus(order.id, 'shipped', '已发货')
    ElMessage.success('支付成功')
  } catch {
    // User cancelled
  }
}

const handleConfirm = async (order) => {
  try {
    await ElMessageBox.confirm(
      `确认已收到订单 ${order.id} 的商品吗？`,
      '确认收货',
      { confirmButtonText: '确认收货', cancelButtonText: '取消', type: 'warning' }
    )
    orderStore.updateOrderStatus(order.id, 'completed', '已完成')
    ElMessage.success('确认收货成功')
  } catch {
    // User cancelled
  }
}

const handleBuyAgain = (order) => {
  const productIds = [...new Set(order.items.map(item => item.productId))]
  if (productIds.length === 1) {
    router.push(`/product/${productIds[0]}`)
  } else {
    ElMessage.info('包含多个商品，请前往购物车查看')
  }
}

const viewDetail = (order) => {
  ElMessage.info(`查看订单 ${order.id} 详情`)
}

const handleExport = () => {
  ElMessage.success(`已导出 ${filteredOrders.value.length} 条订单记录`)
}

const goShopping = () => {
  router.push('/')
}

onMounted(() => {
  if (props.status) {
    activeStat.value = props.status
  }
  setTimeout(() => {
    loading.value = false
  }, 300)
})
</script>

<style lang="scss" scoped>
.order-list {
  .loading-wrapper {
    padding: 60px 0;
    display: flex;
    justify-content: center;
  }

  .order-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
    margin-bottom: 20px;

    .stat-card {
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
      border: 2px solid transparent;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      &.active {
        border-color: #409eff;
        background: #ecf5ff;

        .stat-label {
          color: #409eff;
        }

        .stat-value {
          color: #409eff;
        }
      }

      .stat-label {
        display: block;
        font-size: 14px;
        color: #606266;
        margin-bottom: 8px;
      }

      .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: #303133;
      }
    }
  }

  .orders {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .order-card {
    border: 1px solid #ebeef5;
    border-radius: 8px;
    overflow: hidden;
    background: #fff;
    transition: all 0.3s;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      background: #fafafa;
      border-bottom: 1px solid #ebeef5;

      .order-info {
        display: flex;
        gap: 20px;
        font-size: 14px;
        align-items: center;

        .order-id {
          color: #303133;
          font-weight: 500;
        }

        .order-time {
          color: #909399;
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }

    .order-items {
      padding: 15px 20px;

      .order-item {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 10px 0;

        &:not(:last-child) {
          border-bottom: 1px solid #f0f0f0;
        }

        .item-image {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 4px;
          background: #f8f9fa;
        }

        .item-info {
          flex: 1;

          .item-name {
            font-size: 14px;
            color: #303133;
            margin-bottom: 5px;
          }

          .item-spec {
            font-size: 13px;
            color: #909399;
          }
        }

        .item-price {
          text-align: right;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 5px;

          .quantity {
            color: #909399;
            font-size: 13px;
          }
        }
      }
    }

    .order-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      background: #fafafa;
      border-top: 1px solid #ebeef5;

      .order-total {
        font-size: 14px;
        color: #606266;
        display: flex;
        align-items: baseline;
        gap: 5px;

        .item-count {
          color: #409eff;
          font-weight: 600;
        }

        .total-amount {
          display: flex;
          align-items: baseline;
          gap: 5px;
        }
      }

      .order-actions {
        display: flex;
        gap: 10px;
      }
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 30px;
  }
}

@media (max-width: 768px) {
  .order-list {
    .order-stats {
      grid-template-columns: repeat(2, 1fr);
    }

    .order-card {
      .order-header {
        flex-direction: column;
        gap: 10px;
        align-items: flex-start;
      }

      .order-footer {
        flex-direction: column;
        gap: 15px;
        align-items: flex-start;
      }
    }
  }
}
</style>
