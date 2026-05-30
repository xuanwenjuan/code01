<template>
  <div class="supplier-center-page">
    <div class="container">
      <el-breadcrumb class="breadcrumb" separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>供货商中心</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="page-header">
        <h1>供货商专属操作中心</h1>
        <p>欢迎回来，{{ userStore.userInfo?.name }}！高效管理您的业务</p>
      </div>

      <div class="stats-overview">
        <div class="stat-card">
          <div class="stat-icon primary"><el-icon><Money /></el-icon></div>
          <div class="stat-content">
            <span class="stat-label">今日销售额</span>
            <span class="stat-value">¥{{ todaySales }}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon success"><el-icon><List /></el-icon></div>
          <div class="stat-content">
            <span class="stat-label">待处理订单</span>
            <span class="stat-value">{{ pendingOrdersCount }}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon warning"><el-icon><Goods /></el-icon></div>
          <div class="stat-content">
            <span class="stat-label">在售商品</span>
            <span class="stat-value">{{ productCount }}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon danger"><el-icon><User /></el-icon></div>
          <div class="stat-content">
            <span class="stat-label">合作客户</span>
            <span class="stat-value">{{ customerCount }}</span>
          </div>
        </div>
      </div>

      <div class="content-grid">
        <div class="card order-management">
          <div class="card-header">
            <h3><el-icon><List /></el-icon> 订单管理</h3>
            <el-button type="primary" size="small" @click="goOrders">查看全部</el-button>
          </div>
          <div class="order-tabs">
            <div
              v-for="tab in orderTabs"
              :key="tab.key"
              class="order-tab"
              :class="{ active: activeOrderTab === tab.key }"
              @click="activeOrderTab = tab.key"
            >
              {{ tab.name }}
              <el-tag size="small" type="info">{{ getTabCount(tab.key) }}</el-tag>
            </div>
          </div>
          <el-table :data="displayOrders" size="small" v-loading="loading">
            <el-table-column prop="id" label="订单号" width="180" />
            <el-table-column prop="buyer" label="采购方" width="120" />
            <el-table-column label="商品">
              <template #default="{ row }">
                <span v-for="(item, idx) in row.items" :key="idx">
                  {{ item.toolName }}{{ idx < row.items.length - 1 ? '、' : '' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="totalAmount" label="金额" width="100">
              <template #default="{ row }">¥{{ row.totalAmount }}</template>
            </el-table-column>
            <el-table-column prop="createTime" label="下单时间" width="160" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
              <template #default="{ row }">
                <template v-if="row.status === 'pending'">
                  <el-button type="primary" size="small" @click="handleShip(row.id)">
                    发货
                  </el-button>
                  <el-button size="small" @click="handleDetail(row)">详情</el-button>
                </template>
                <template v-else-if="row.status === 'shipped'">
                  <el-button type="success" size="small" @click="handleComplete(row.id)">
                    完成
                  </el-button>
                  <el-button size="small" @click="handleDetail(row)">详情</el-button>
                </template>
                <template v-else>
                  <el-button size="small" @click="handleDetail(row)">详情</el-button>
                </template>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="card product-management">
          <div class="card-header">
            <h3><el-icon><Goods /></el-icon> 商品管理</h3>
            <el-button type="primary" size="small">
              <el-icon><Plus /></el-icon> 新增商品
            </el-button>
          </div>
          <div class="product-list">
            <div v-for="product in myProducts" :key="product.id" class="product-item">
              <img :src="product.image" :alt="product.name" />
              <div class="product-info">
                <h4>{{ product.name }}</h4>
                <p class="product-price">¥{{ product.price }}</p>
                <p class="product-stock">库存：{{ product.stock }}件</p>
              </div>
              <div class="product-actions">
                <el-button size="small" type="primary">编辑</el-button>
                <el-button size="small">上下架</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card sales-chart">
        <div class="card-header">
          <h3><el-icon><TrendCharts /></el-icon> 销售统计</h3>
          <el-radio-group v-model="chartPeriod" size="small">
            <el-radio-button label="week">本周</el-radio-button>
            <el-radio-button label="month">本月</el-radio-button>
            <el-radio-button label="year">本年</el-radio-button>
          </el-radio-group>
        </div>
        <div class="chart-container">
          <div class="chart-bars">
            <div v-for="(item, index) in chartData" :key="index" class="chart-bar">
              <div class="bar-label">{{ item.label }}</div>
              <div class="bar-wrapper">
                <div class="bar-fill" :style="{ height: item.percent + '%' }">
                  <span class="bar-value">¥{{ item.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="orderDetailVisible"
      title="订单详情"
      width="600px"
    >
      <div v-if="currentOrder" class="order-detail">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="订单号">
            {{ currentOrder.id }}
          </el-descriptions-item>
          <el-descriptions-item label="下单时间">
            {{ currentOrder.createTime }}
          </el-descriptions-item>
          <el-descriptions-item label="采购方">
            {{ currentOrder.buyer }}
          </el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusType(currentOrder.status)" size="small">
              {{ getStatusText(currentOrder.status) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <h4 class="detail-title">商品明细</h4>
        <el-table :data="currentOrder.items" size="small">
          <el-table-column prop="toolName" label="商品名称" />
          <el-table-column prop="spec" label="规格" width="120" />
          <el-table-column prop="price" label="单价" width="100">
            <template #default="{ row }">¥{{ row.price }}</template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="80" />
          <el-table-column prop="subtotal" label="小计" width="100">
            <template #default="{ row }">¥{{ row.subtotal }}</template>
          </el-table-column>
        </el-table>

        <div class="order-total">
          <span>总金额：</span>
          <span class="total-price">¥{{ currentOrder.totalAmount }}</span>
        </div>

        <div class="check-status" v-if="currentOrder.checked || currentOrder.confirmed">
          <el-tag v-if="currentOrder.checked" type="success" size="small">
            已核对 · {{ currentOrder.checkTime }}
          </el-tag>
          <el-tag v-if="currentOrder.confirmed" type="warning" size="small">
            已确认 · {{ currentOrder.confirmTime }}
          </el-tag>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Money,
  List,
  Goods,
  User,
  Plus,
  TrendCharts
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useOrderStore } from '@/stores/order'
import { useToolStore } from '@/stores/tool'

const router = useRouter()
const userStore = useUserStore()
const orderStore = useOrderStore()
const toolStore = useToolStore()

const loading = ref(false)
const activeOrderTab = ref('pending')
const orderDetailVisible = ref(false)
const currentOrder = ref(null)
const chartPeriod = ref('week')

const orderTabs = [
  { key: 'pending', name: '待发货' },
  { key: 'shipped', name: '待收货' },
  { key: 'completed', name: '已完成' }
]

const myOrders = computed(() => {
  if (!userStore.userInfo) return []
  return orderStore.getOrdersBySupplier(userStore.userInfo.name)
})

const displayOrders = computed(() => {
  return myOrders.value.filter(o => o.status === activeOrderTab.value).slice(0, 5)
})

const pendingOrdersCount = computed(() => {
  return myOrders.value.filter(o => o.status === 'pending').length
})

const todaySales = computed(() => {
  const today = new Date().toLocaleDateString('zh-CN')
  return myOrders.value
    .filter(o => o.createTime.includes(today) && o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0)
    .toFixed(2)
})

const productCount = computed(() => myProducts.value.length)

const customerCount = computed(() => {
  const buyers = new Set(myOrders.value.map(o => o.buyer))
  return buyers.size
})

const myProducts = computed(() => toolStore.toolList.slice(0, 4))

const chartData = computed(() => {
  if (chartPeriod.value === 'week') {
    return [
      { label: '周一', value: 1280, percent: 64 },
      { label: '周二', value: 2350, percent: 85 },
      { label: '周三', value: 1890, percent: 72 },
      { label: '周四', value: 3120, percent: 100 },
      { label: '周五', value: 2680, percent: 88 },
      { label: '周六', value: 1950, percent: 75 },
      { label: '周日', value: 1450, percent: 58 }
    ]
  } else if (chartPeriod.value === 'month') {
    return [
      { label: '第1周', value: 12500, percent: 70 },
      { label: '第2周', value: 15800, percent: 85 },
      { label: '第3周', value: 18200, percent: 95 },
      { label: '第4周', value: 19500, percent: 100 }
    ]
  } else {
    return [
      { label: 'Q1', value: 52000, percent: 65 },
      { label: 'Q2', value: 68000, percent: 80 },
      { label: 'Q3', value: 75000, percent: 90 },
      { label: 'Q4', value: 85000, percent: 100 }
    ]
  }
})

const getTabCount = (tab) => {
  return myOrders.value.filter(o => o.status === tab).length
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

const goOrders = () => {
  router.push('/orders')
}

const handleShip = (orderId) => {
  orderStore.updateOrderStatus(orderId, 'shipped')
  ElMessage.success('已确认发货')
}

const handleComplete = (orderId) => {
  orderStore.updateOrderStatus(orderId, 'completed')
  ElMessage.success('订单已完成')
}

const handleDetail = (order) => {
  currentOrder.value = order
  orderDetailVisible.value = true
}

onMounted(() => {
  if (!userStore.isSupplier) {
    ElMessage.warning('您不是供货商，无法访问此页面')
    router.push('/')
  }
})
</script>

<style lang="scss" scoped>
.supplier-center-page {
  padding: 40px 0;
}

.breadcrumb {
  margin-bottom: 24px;
}

.page-header {
  margin-bottom: 24px;

  h1 {
    font-size: 24px;
    margin-bottom: 8px;
    color: #333;
  }

  p {
    font-size: 14px;
    color: #666;
  }
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  .stat-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 24px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      color: #fff;

      &.primary { background: linear-gradient(135deg, #409eff, #66b1ff); }
      &.success { background: linear-gradient(135deg, #67c23a, #85ce61); }
      &.warning { background: linear-gradient(135deg, #e6a23c, #f0c070); }
      &.danger { background: linear-gradient(135deg, #f56c6c, #f78989); }
    }

    .stat-content {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .stat-label {
        font-size: 13px;
        color: #666;
      }

      .stat-value {
        font-size: 24px;
        font-weight: 700;
        color: #333;
      }
    }
  }
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 24px;

  .card {
    padding: 24px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      h3 {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        margin: 0;
        color: #333;

        .el-icon {
          color: #8b4513;
        }
      }
    }
  }

  .order-management {
    .order-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;

      .order-tab {
        padding: 8px 16px;
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
  }

  .product-management {
    .product-list {
      .product-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: #fafafa;
        border-radius: 8px;
        margin-bottom: 12px;

        img {
          width: 60px;
          height: 60px;
          border-radius: 6px;
          object-fit: cover;
        }

        .product-info {
          flex: 1;

          h4 {
            font-size: 14px;
            margin-bottom: 4px;
            color: #333;
          }

          .product-price {
            font-size: 16px;
            font-weight: 600;
            color: #e6a23c;
            margin-bottom: 2px;
          }

          .product-stock {
            font-size: 12px;
            color: #999;
            margin: 0;
          }
        }

        .product-actions {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
      }
    }
  }
}

.sales-chart {
  padding: 24px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      margin: 0;
      color: #333;

      .el-icon {
        color: #8b4513;
      }
    }
  }

  .chart-container {
    height: 250px;
    padding: 20px 0;

    .chart-bars {
      display: flex;
      justify-content: space-around;
      align-items: flex-end;
      height: 100%;

      .chart-bar {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        flex: 1;

        .bar-label {
          font-size: 12px;
          color: #666;
          order: 2;
        }

        .bar-wrapper {
          width: 40px;
          height: 180px;
          background: #f0f0f0;
          border-radius: 6px 6px 0 0;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
          order: 1;

          .bar-fill {
            width: 100%;
            background: linear-gradient(180deg, #8b4513, #a0522d);
            border-radius: 6px 6px 0 0;
            transition: height 0.5s ease;
            position: relative;

            .bar-value {
              position: absolute;
              top: -24px;
              left: 50%;
              transform: translateX(-50%);
              font-size: 11px;
              color: #666;
              white-space: nowrap;
            }
          }
        }
      }
    }
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
    text-align: right;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #eee;
    font-size: 16px;

    .total-price {
      font-size: 24px;
      font-weight: 700;
      color: #e6a23c;
    }
  }

  .check-status {
    display: flex;
    gap: 8px;
    margin-top: 12px;
  }
}
</style>
