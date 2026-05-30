<template>
  <div class="orders-page">
    <div class="container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>我的订单</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">我的订单</h1>
          <el-tag v-if="exceptionCount > 0" type="danger" effect="dark" class="exception-badge">
            <el-icon><WarningFilled /></el-icon>
            {{ exceptionCount }} 个异常订单
          </el-tag>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出订单
          </el-button>
          <el-button @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>

      <div class="order-stats">
        <div
          v-for="(stat, index) in orderStats"
          :key="index"
          class="stat-item"
          :class="{ active: statusFilter === stat.key }"
          @click="statusFilter = stat.key"
        >
          <span class="stat-label">{{ stat.label }}</span>
          <span class="stat-value">{{ stat.count }}</span>
        </div>
      </div>

      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索订单号或商品名称"
          clearable
          style="width: 300px"
          :prefix-icon="Search"
        />
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 300px"
        />
      </div>

      <div v-if="loading" class="loading-wrapper">
        <LoadingState text="正在加载订单..." />
      </div>

      <div v-else-if="filteredOrders.length > 0" class="orders-list">
        <div
          v-for="order in filteredOrders"
          :key="order.id"
          class="order-card"
          :class="{ 'exception-card': order.isException }"
        >
          <div class="order-header">
            <div class="order-info">
              <span class="order-no">订单号：{{ order.id }}</span>
              <span class="order-time">{{ order.createTime }}</span>
              <el-tag v-if="order.isException" type="danger" size="small" class="exception-tag">
                <el-icon><WarningFilled /></el-icon>
                {{ order.exceptionType }}
              </el-tag>
            </div>
            <div class="order-status">
              <el-tag :type="orderStatusMap[order.status]?.type" size="large" effect="dark">
                {{ orderStatusMap[order.status]?.label }}
              </el-tag>
            </div>
          </div>

          <div v-if="order.isException" class="exception-warning">
            <el-icon color="#f56c6c"><WarningFilled /></el-icon>
            <div class="exception-info">
              <span class="exception-label">{{ order.exceptionType }}：</span>
              <span class="exception-reason">{{ order.exceptionReason }}</span>
              <span class="exception-time">{{ order.exceptionTime }}</span>
            </div>
            <el-button type="primary" size="small" @click="handleContact(order)">
              联系客服
            </el-button>
          </div>

          <div class="order-products">
            <div
              v-for="product in order.products"
              :key="product.productId"
              class="product-item"
              @click="$router.push(`/product/${product.productId}`)"
            >
              <div class="product-img">
                <img :src="getProductImage(product.productId)" :alt="product.name" />
              </div>
              <div class="product-info">
                <span class="product-name">{{ product.name }}</span>
                <span class="product-spec">x{{ product.quantity }}</span>
              </div>
              <span class="product-price">¥{{ product.price.toLocaleString() }}</span>
            </div>
          </div>

          <div v-if="order.status !== 'pending' && order.logistics" class="order-logistics">
            <div class="logistics-header">
              <el-icon color="#409eff"><Van /></el-icon>
              <span class="logistics-company">{{ order.logistics.company }}</span>
              <span class="logistics-no">{{ order.logistics.trackingNo }}</span>
              <span class="logistics-status">{{ order.logistics.status }}</span>
              <span class="estimated-delivery">预计送达：{{ order.logistics.estimatedDelivery }}</span>
            </div>
            <div class="logistics-progress">
              <el-steps
                :active="getLogisticsStep(order)"
                finish-status="success"
                size="small"
              >
                <el-step title="已下单" />
                <el-step title="已发货" />
                <el-step title="运输中" />
                <el-step title="派送中" />
                <el-step title="已签收" />
              </el-steps>
            </div>
          </div>

          <div class="order-footer">
            <div class="receiver-info">
              <el-icon color="#909399"><Location /></el-icon>
              <span>{{ order.receiver }} {{ order.phone }}</span>
              <span class="address">{{ order.address }}</span>
            </div>
            <div class="order-actions">
              <span class="total-amount">
                合计：<strong>¥{{ order.totalAmount.toLocaleString() }}</strong>
              </span>
              <template v-if="order.status === 'pending'">
                <el-button type="primary" size="small" @click="handlePay(order)">去付款</el-button>
                <el-button size="small" @click="handleCancel(order)">取消订单</el-button>
              </template>
              <template v-else-if="order.status === 'paid'">
                <el-button size="small" @click="handleTrack(order)">查看详情</el-button>
              </template>
              <template v-else-if="order.status === 'shipping' || order.status === 'exception'">
                <el-button size="small" @click="handleTrack(order)">查看物流</el-button>
                <el-button type="primary" size="small" @click="handleConfirm(order)">确认收货</el-button>
              </template>
              <template v-else-if="order.status === 'completed'">
                <el-button size="small" @click="handleReview(order)">评价</el-button>
                <el-button type="primary" size="small" @click="handleRepurchase(order)">再次采购</el-button>
              </template>
            </div>
          </div>
        </div>
      </div>

      <EmptyState
        v-else
        icon="ShoppingCart"
        text="暂无订单记录"
      >
        <template #action>
          <el-button type="primary" @click="$router.push('/')">去选购</el-button>
        </template>
      </EmptyState>
    </div>

    <el-dialog
      v-model="showLogisticsDialog"
      title="物流详情"
      width="600px"
    >
      <div v-if="currentOrder" class="logistics-detail">
        <div class="logistics-info">
          <div class="info-item">
            <span class="label">物流公司：</span>
            <span class="value">{{ currentOrder.logistics?.company }}</span>
          </div>
          <div class="info-item">
            <span class="label">运单号码：</span>
            <span class="value">{{ currentOrder.logistics?.trackingNo }}</span>
          </div>
          <div class="info-item">
            <span class="label">当前状态：</span>
            <span class="value" :class="currentOrder.logistics?.status">{{ currentOrder.logistics?.status }}</span>
          </div>
        </div>
        <el-timeline class="timeline">
          <el-timeline-item
            v-for="(item, index) in currentOrder.logistics?.progress"
            :key="index"
            :timestamp="item.time"
            :type="index === 0 ? 'primary' : ''"
            :icon="index === 0 ? 'CircleCheck' : ''"
          >
            <div class="timeline-content">
              <span class="status">{{ item.status }}</span>
              <span class="desc">{{ item.description }}</span>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
      <template #footer>
        <el-button @click="showLogisticsDialog = false">关闭</el-button>
        <el-button type="primary" @click="handleCopyTracking">复制单号</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Download, Refresh, Van, WarningFilled, CircleCheck } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { mockOrders, orderStatusMap, products } from '@/mock/data'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'

const userStore = useUserStore()
const loading = ref(true)
const statusFilter = ref('all')
const searchKeyword = ref('')
const dateRange = ref([])
const showLogisticsDialog = ref(false)
const currentOrder = ref(null)

const allOrders = computed(() => {
  return [...mockOrders, ...userStore.orders]
})

const exceptionCount = computed(() => {
  return allOrders.value.filter(o => o.isException).length
})

const orderStats = computed(() => [
  { key: 'all', label: '全部订单', count: allOrders.value.length },
  { key: 'pending', label: '待付款', count: allOrders.value.filter(o => o.status === 'pending').length },
  { key: 'paid', label: '已付款', count: allOrders.value.filter(o => o.status === 'paid').length },
  { key: 'shipping', label: '配送中', count: allOrders.value.filter(o => o.status === 'shipping').length },
  { key: 'completed', label: '已完成', count: allOrders.value.filter(o => o.status === 'completed').length },
  { key: 'exception', label: '异常订单', count: exceptionCount.value }
])

const filteredOrders = computed(() => {
  let result = allOrders.value
  
  if (statusFilter.value !== 'all') {
    if (statusFilter.value === 'exception') {
      result = result.filter(o => o.isException)
    } else {
      result = result.filter(o => o.status === statusFilter.value)
    }
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(o => 
      o.id.toLowerCase().includes(keyword) ||
      o.products.some(p => p.name.toLowerCase().includes(keyword))
    )
  }
  
  if (dateRange.value && dateRange.value.length === 2) {
    const start = new Date(dateRange.value[0]).getTime()
    const end = new Date(dateRange.value[1]).getTime() + 86400000
    result = result.filter(o => {
      const orderTime = new Date(o.createTime).getTime()
      return orderTime >= start && orderTime < end
    })
  }
  
  return result.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
})

const getProductImage = (productId) => {
  const product = products.find(p => p.id === productId)
  return product?.image || ''
}

const getLogisticsStep = (order) => {
  const status = order.logistics?.status
  if (status === '已签收') return 5
  if (status === '派送中') return 4
  if (status === '已到达') return 3
  if (status === '运输中') return 2
  if (status === '已发货') return 1
  if (order.status === '已发货') return 1
  if (order.status === 'paid') return 1
  return 0
}

const handlePay = (order) => {
  ElMessageBox.confirm(`确认支付订单 ${order.id}，金额 ¥${order.totalAmount.toLocaleString()}？`, '支付确认', {
    confirmButtonText: '确认支付',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    ElMessage.success(`订单 ${order.id} 支付成功`)
    order.status = 'paid'
    order.payTime = new Date().toLocaleString()
  }).catch(() => {})
}

const handleCancel = (order) => {
  ElMessageBox.confirm(`确定要取消订单 ${order.id} 吗？`, '取消订单', {
    confirmButtonText: '确定取消',
    cancelButtonText: '再想想',
    type: 'warning'
  }).then(() => {
    ElMessage.info(`订单 ${order.id} 已取消`)
    order.status = 'cancelled'
  }).catch(() => {})
}

const handleTrack = (order) => {
  currentOrder.value = order
  showLogisticsDialog.value = true
}

const handleConfirm = (order) => {
  ElMessageBox.confirm(`确认已收到订单 ${order.id} 的商品？`, '确认收货', {
    confirmButtonText: '确认收货',
    cancelButtonText: '再等等',
    type: 'warning'
  }).then(() => {
    ElMessage.success(`订单 ${order.id} 已确认收货`)
    order.status = 'completed'
    order.completeTime = new Date().toLocaleString()
    if (order.logistics) {
      order.logistics.status = '已签收'
    }
  }).catch(() => {})
}

const handleReview = (order) => {
  ElMessage.info('评价功能开发中...')
}

const handleRepurchase = (order) => {
  ElMessage.success('已添加到采购清单')
}

const handleContact = (order) => {
  ElMessage.info('正在联系客服...')
}

const handleExport = () => {
  const ordersToExport = filteredOrders.value
  if (ordersToExport.length === 0) {
    ElMessage.warning('没有可导出的订单')
    return
  }
  
  let csvContent = '订单号,下单时间,状态,商品,数量,金额,收货人,电话,地址\n'
  ordersToExport.forEach(order => {
    const productNames = order.products.map(p => p.name).join(';')
    const totalQty = order.products.reduce((sum, p) => sum + p.quantity, 0)
    csvContent += `${order.id},${order.createTime},${orderStatusMap[order.status]?.label},${productNames},${totalQty},${order.totalAmount},${order.receiver},${order.phone},"${order.address}"\n`
  })
  
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `订单导出_${new Date().toLocaleDateString()}.csv`
  link.click()
  URL.revokeObjectURL(url)
  
  ElMessage.success(`已导出 ${ordersToExport.length} 条订单记录`)
}

const handleRefresh = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('刷新成功')
  }, 500)
}

const handleCopyTracking = () => {
  if (currentOrder.value?.logistics?.trackingNo) {
    navigator.clipboard.writeText(currentOrder.value.logistics.trackingNo)
    ElMessage.success('运单号已复制')
  }
}

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 500)
})
</script>

<style lang="scss" scoped>
.orders-page {
  .breadcrumb {
    margin-bottom: 20px;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .page-title {
      font-size: 24px;
      color: #333;
      margin: 0;
      font-weight: 600;
    }

    .exception-badge {
      animation: pulse 2s infinite;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  .order-stats {
    display: flex;
    background: #fff;
    border-radius: 12px;
    padding: 8px;
    margin-bottom: 20px;
    gap: 8px;

    .stat-item {
      flex: 1;
      padding: 16px 24px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;

      &:hover,
      &.active {
        background: linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(212, 175, 55, 0.05));
      }

      &.active {
        .stat-label {
          color: #d4af37;
        }

        .stat-value {
          color: #d4af37;
        }
      }

      .stat-label {
        font-size: 14px;
        color: #666;
      }

      .stat-value {
        font-size: 24px;
        font-weight: 700;
        color: #333;
      }
    }
  }

  .search-bar {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;
  }

  .orders-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .order-card {
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
    border: 2px solid transparent;
    transition: all 0.3s;

    &.exception-card {
      border-color: #f56c6c;
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      background: #fafafa;
      border-bottom: 1px solid #ebeef5;

      .order-info {
        display: flex;
        align-items: center;
        gap: 24px;

        .order-no {
          font-size: 14px;
          color: #666;
        }

        .order-time {
          font-size: 14px;
          color: #909399;
        }

        .exception-tag {
          animation: pulse 1.5s infinite;
        }
      }
    }

    .exception-warning {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 24px;
      background: #fef2f2;
      border-bottom: 1px solid #fecaca;

      .exception-info {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;

        .exception-label {
          color: #f56c6c;
          font-weight: 600;
        }

        .exception-reason {
          color: #666;
        }

        .exception-time {
          margin-left: auto;
          color: #909399;
          font-size: 13px;
        }
      }
    }

    .order-products {
      padding: 16px 24px;

      .product-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #f5f7fa;
        cursor: pointer;
        transition: background 0.2s;

        &:last-child {
          border-bottom: none;
        }

        &:hover {
          background: #fafafa;
        }

        .product-img {
          width: 60px;
          height: 60px;
          border-radius: 6px;
          overflow: hidden;
          background: #f5f7fa;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .product-info {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 16px;
          margin-left: 16px;

          .product-name {
            font-size: 14px;
            color: #333;
          }

          .product-spec {
            font-size: 13px;
            color: #909399;
          }
        }

        .product-price {
          font-size: 15px;
          color: #e74c3c;
          font-weight: 600;
        }
      }
    }

    .order-logistics {
      padding: 16px 24px;
      background: #f5f7fa;
      border-top: 1px solid #ebeef5;

      .logistics-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
        font-size: 14px;

        .logistics-company {
          color: #333;
          font-weight: 500;
        }

        .logistics-no {
          color: #666;
          font-family: monospace;
        }

        .logistics-status {
          color: #409eff;
          font-weight: 500;
        }

        .estimated-delivery {
          margin-left: auto;
          color: #909399;
          font-size: 13px;
        }
      }

      .logistics-progress {
        padding: 0 20px;
      }
    }

    .order-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-top: 1px solid #ebeef5;

      .receiver-info {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #666;

        .address {
          color: #909399;
        }
      }

      .order-actions {
        display: flex;
        align-items: center;
        gap: 12px;

        .total-amount {
          font-size: 14px;
          color: #666;
          margin-right: 16px;

          strong {
            font-size: 20px;
            color: #e74c3c;
          }
        }
      }
    }
  }
}

.logistics-detail {
  .logistics-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 20px;
    background: #f5f7fa;
    border-radius: 8px;
    margin-bottom: 20px;

    .info-item {
      display: flex;
      font-size: 14px;

      .label {
        width: 80px;
        color: #909399;
      }

      .value {
        color: #333;

        &.异常 {
          color: #f56c6c;
        }

        &.运输中 {
          color: #409eff;
        }

        &.已签收 {
          color: #67c23a;
        }
      }
    }
  }

  .timeline {
    .timeline-content {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .status {
        font-size: 14px;
        color: #333;
        font-weight: 500;
      }

      .desc {
        font-size: 13px;
        color: #909399;
      }
    }
  }
}
</style>
