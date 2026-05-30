<template>
  <div class="supplier-orders-page">
    <h2 class="page-title">订单管理</h2>
    
    <el-tabs v-model="activeTab" class="order-tabs">
      <el-tab-pane label="全部订单" name="all" />
      <el-tab-pane label="待发货" name="paid" />
      <el-tab-pane label="已发货" name="shipped" />
      <el-tab-pane label="已完成" name="completed" />
    </el-tabs>

    <div class="orders-list" v-loading="loading">
      <EmptyState
        v-if="!loading && filteredOrders.length === 0"
        description="暂无订单"
      />
      <div v-else>
        <div
          v-for="order in filteredOrders"
          :key="order.id"
          class="order-item"
        >
          <div class="order-header">
            <div class="order-info">
              <span class="order-id">订单号：{{ order.id }}</span>
              <span class="order-time">{{ order.createTime }}</span>
            </div>
            <div class="order-status">
              <el-tag :type="getStatusType(order.status)">{{ order.statusText }}</el-tag>
            </div>
          </div>
          <div class="order-items">
            <div
              v-for="item in order.items"
              :key="item.productId"
              class="order-item-detail"
            >
              <img :src="item.image" :alt="item.productName" />
              <div class="item-info">
                <h4 class="item-name text-ellipsis">{{ item.productName }}</h4>
                <p class="item-spec">{{ item.spec }}</p>
              </div>
              <div class="item-price">
                <span class="price">{{ item.price }}</span>
                <span class="item-quantity">x{{ item.quantity }}</span>
              </div>
            </div>
          </div>
          <div class="order-footer">
            <div class="order-address">
              <el-icon><Location /></el-icon>
              <span>{{ order.address.name }} {{ order.address.phone }} {{ order.address.address }}</span>
            </div>
            <div class="order-total">
              共{{ order.items.length }}件商品，订单金额：<span class="total-price">¥{{ order.totalAmount }}</span>
            </div>
            <div class="order-actions">
              <template v-if="order.status === 'paid'">
                <el-button type="primary" size="small" @click="handleShip(order)">
                  发货
                </el-button>
              </template>
              <template v-else-if="order.status === 'shipped'">
                <el-button size="small" @click="viewTracking(order)">
                  查看物流
                </el-button>
              </template>
              <el-button size="small" @click="viewDetail(order)">
                订单详情
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Location } from '@element-plus/icons-vue'
import { getOrdersApi } from '@/api/order'
import EmptyState from '@/components/common/EmptyState.vue'

const loading = ref(true)
const orders = ref([])
const activeTab = ref('all')

const filteredOrders = computed(() => {
  if (activeTab.value === 'all') {
    return orders.value
  }
  return orders.value.filter(o => o.status === activeTab.value)
})

onMounted(async () => {
  await loadOrders()
  loading.value = false
})

const loadOrders = async () => {
  const res = await getOrdersApi()
  if (res.code === 200) {
    orders.value = res.data.list
  }
}

const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    paid: 'primary',
    shipped: 'info',
    completed: 'success',
    cancelled: 'info'
  }
  return types[status] || 'info'
}

const handleShip = (order) => {
  ElMessage.success(`订单 ${order.id} 已发货`)
  order.status = 'shipped'
  order.statusText = '已发货'
  order.tracking = {
    company: '顺丰速运',
    number: 'SF' + Date.now()
  }
}

const viewTracking = (order) => {
  if (order.tracking) {
    ElMessage.info(`物流公司：${order.tracking.company}，物流单号：${order.tracking.number}`)
  }
}

const viewDetail = (order) => {
  ElMessage.info(`查看订单 ${order.id} 详情`)
}
</script>

<style lang="scss" scoped>
.supplier-orders-page {
  .page-title {
    font-size: 20px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 20px;
  }

  .order-tabs {
    margin-bottom: 20px;
  }

  .orders-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .order-item {
    border: 1px solid #ebeef5;
    border-radius: 8px;
    overflow: hidden;

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      background: #f5f7fa;
      border-bottom: 1px solid #ebeef5;

      .order-info {
        display: flex;
        gap: 20px;

        .order-id {
          font-size: 13px;
          color: #606266;
        }

        .order-time {
          font-size: 13px;
          color: #909399;
        }
      }
    }

    .order-items {
      padding: 16px 20px;

      .order-item-detail {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 12px 0;
        border-bottom: 1px solid #f5f7fa;

        &:last-child {
          border-bottom: none;
        }

        img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 4px;
        }

        .item-info {
          flex: 1;

          .item-name {
            font-size: 14px;
            color: #303133;
            margin-bottom: 8px;
          }

          .item-spec {
            font-size: 12px;
            color: #909399;
          }
        }

        .item-price {
          text-align: right;

          .price {
            font-size: 16px;
            font-weight: 600;
            color: #f56c6c;
            display: block;
            margin-bottom: 4px;
          }

          .item-quantity {
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }

    .order-footer {
      padding: 16px 20px;
      background: #fafafa;

      .order-address {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        font-size: 13px;
        color: #606266;
      }

      .order-total {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        font-size: 14px;
        color: #606266;

        .total-price {
          font-size: 18px;
          font-weight: 600;
          color: #f56c6c;
        }
      }

      .order-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
    }
  }
}
</style>
