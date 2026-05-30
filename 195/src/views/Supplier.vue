<template>
  <div class="supplier-page">
    <div class="container">
      <el-breadcrumb class="breadcrumb" separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>供货商中心</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="page-header">
        <h1>供货商中心</h1>
        <p>管理您的订单和商品信息</p>
      </div>

      <div class="stats-row">
        <div class="stat-card card">
          <div class="stat-icon blue">
            <el-icon><Goods /></el-icon>
          </div>
          <div class="stat-content">
            <span class="stat-label">在售商品</span>
            <span class="stat-value">{{ supplierTools.length }}</span>
          </div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon orange">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-content">
            <span class="stat-label">待发货</span>
            <span class="stat-value">{{ pendingOrders.length }}</span>
          </div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon green">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div class="stat-content">
            <span class="stat-label">已完成</span>
            <span class="stat-value">{{ completedOrders.length }}</span>
          </div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon purple">
            <el-icon><Money /></el-icon>
          </div>
          <div class="stat-content">
            <span class="stat-label">销售总额</span>
            <span class="stat-value">¥{{ totalSales.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <div class="content-grid">
        <div class="panel card">
          <div class="panel-header">
            <h3>待发货订单</h3>
            <el-button type="primary" size="small" @click="goOrders">查看全部</el-button>
          </div>
          <div class="panel-content">
            <div v-if="pendingOrders.length > 0" class="order-list">
              <div v-for="order in pendingOrders.slice(0, 5)" :key="order.id" class="order-item">
                <div class="order-info">
                  <span class="order-id">{{ order.id }}</span>
                  <span class="order-buyer">{{ order.buyer }}</span>
                </div>
                <div class="order-amount">¥{{ order.totalAmount }}</div>
                <el-button type="primary" size="small" @click="handleShip(order.id)">
                  发货
                </el-button>
              </div>
            </div>
            <div v-else class="empty-small">
              <el-icon><CircleCheck /></el-icon>
              <span>暂无待发货订单</span>
            </div>
          </div>
        </div>

        <div class="panel card">
          <div class="panel-header">
            <h3>在售商品</h3>
            <el-button type="primary" size="small">添加商品</el-button>
          </div>
          <div class="panel-content">
            <div v-if="supplierTools.length > 0" class="tool-list">
              <div v-for="tool in supplierTools" :key="tool.id" class="tool-item">
                <img :src="tool.image" :alt="tool.name" class="tool-thumb" />
                <div class="tool-info">
                  <span class="tool-name">{{ tool.name }}</span>
                  <span class="tool-sales">销量 {{ tool.sales }}</span>
                </div>
                <div class="tool-price">¥{{ tool.price }}</div>
                <div class="tool-stock" :class="{ low: tool.stock < 50 }">
                  库存 {{ tool.stock }}
                </div>
              </div>
            </div>
            <div v-else class="empty-small">
              <el-icon><Goods /></el-icon>
              <span>暂无在售商品</span>
            </div>
          </div>
        </div>
      </div>

      <div class="panel card">
        <div class="panel-header">
          <h3>最近销售记录</h3>
        </div>
        <div class="panel-content">
          <el-table :data="recentOrders" style="width: 100%">
            <el-table-column prop="id" label="订单号" width="180" />
            <el-table-column prop="buyer" label="采购方" width="160" />
            <el-table-column label="商品">
              <template #default="{ row }">
                <span v-for="(item, index) in row.items" :key="index">
                  {{ item.toolName }}{{ index < row.items.length - 1 ? '、' : '' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="totalAmount" label="金额" width="120">
              <template #default="{ row }">
                <span class="amount">¥{{ row.totalAmount }}</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="orderStore.getStatusInfo(row.status).type" size="small">
                  {{ orderStore.getStatusInfo(row.status).text }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="下单时间" width="180" />
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Goods, Clock, CircleCheck, Money } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useToolStore } from '@/stores/tool'
import { useOrderStore } from '@/stores/order'

const router = useRouter()
const userStore = useUserStore()
const toolStore = useToolStore()
const orderStore = useOrderStore()

const supplierTools = computed(() => {
  const supplierName = userStore.userInfo?.name
  if (!supplierName) return []
  return toolStore.toolList.filter(t => t.supplier === supplierName)
})

const supplierOrders = computed(() => {
  const supplierName = userStore.userInfo?.name
  if (!supplierName) return []
  return orderStore.getOrdersByUser(supplierName)
})

const pendingOrders = computed(() => supplierOrders.value.filter(o => o.status === 'pending'))
const completedOrders = computed(() => supplierOrders.value.filter(o => o.status === 'completed'))
const recentOrders = computed(() => supplierOrders.value.slice(0, 10))

const totalSales = computed(() => {
  return completedOrders.value.reduce((sum, o) => sum + o.totalAmount, 0)
})

const goOrders = () => {
  router.push('/orders')
}

const handleShip = (orderId) => {
  orderStore.updateOrderStatus(orderId, 'shipped')
  ElMessage.success('已确认发货')
}
</script>

<style lang="scss" scoped>
.supplier-page {
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

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  .stat-card {
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: #fff;

      &.blue { background: linear-gradient(135deg, #409eff, #66b1ff); }
      &.orange { background: linear-gradient(135deg, #e6a23c, #f0c070); }
      &.green { background: linear-gradient(135deg, #67c23a, #85ce61); }
      &.purple { background: linear-gradient(135deg, #a855f7, #c084fc); }
    }

    .stat-content {
      display: flex;
      flex-direction: column;
      gap: 4px;

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
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.panel {
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #eee;

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
  }

  .panel-content {
    padding: 16px 20px;
  }

  .order-list {
    .order-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .order-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;

        .order-id {
          font-weight: 500;
          color: #333;
        }

        .order-buyer {
          font-size: 12px;
          color: #999;
        }
      }

      .order-amount {
        font-weight: 600;
        color: #e6a23c;
      }
    }
  }

  .tool-list {
    .tool-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .tool-thumb {
        width: 48px;
        height: 48px;
        border-radius: 6px;
        object-fit: cover;
      }

      .tool-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;

        .tool-name {
          font-weight: 500;
          color: #333;
          font-size: 14px;
        }

        .tool-sales {
          font-size: 12px;
          color: #999;
        }
      }

      .tool-price {
        font-weight: 600;
        color: #e6a23c;
        width: 80px;
        text-align: right;
      }

      .tool-stock {
        font-size: 12px;
        color: #67c23a;
        width: 80px;
        text-align: right;

        &.low {
          color: #f56c6c;
        }
      }
    }
  }

  .empty-small {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
    color: #999;
    gap: 8px;

    .el-icon {
      font-size: 32px;
    }
  }
}

.amount {
  font-weight: 600;
  color: #e6a23c;
}
</style>
