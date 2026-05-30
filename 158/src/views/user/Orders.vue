<template>
  <div class="orders-page">
    <h2 class="page-title">订单记录</h2>
    <div class="order-tabs">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="全部订单" name="all" />
        <el-tab-pane label="待付款" name="pending" />
        <el-tab-pane label="待收货" name="shipped" />
        <el-tab-pane label="已完成" name="completed" />
        <el-tab-pane label="已取消" name="cancelled" />
      </el-tabs>
    </div>
    <div class="order-list">
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="order-item"
      >
        <div class="order-header">
          <div class="order-info">
            <span class="order-time">{{ order.createTime }}</span>
            <span class="order-no">订单号：{{ order.id }}</span>
          </div>
          <div class="order-status" :class="order.status">
            {{ order.statusText }}
          </div>
        </div>
        <div class="order-items">
          <div
            v-for="item in order.items"
            :key="item.id"
            class="order-goods"
            @click="goToDetail(item.productId)"
          >
            <img :src="item.image" :alt="item.name" class="goods-image" />
            <div class="goods-info">
              <h4 class="goods-name text-ellipsis-2">{{ item.name }}</h4>
              <div class="goods-specs">
                <el-tag size="small" v-for="(value, key) in item.specs" :key="key">
                  {{ key }}: {{ value }}
                </el-tag>
              </div>
            </div>
            <div class="goods-price">¥{{ item.price }}</div>
            <div class="goods-quantity">x{{ item.quantity }}</div>
          </div>
        </div>
        <div class="order-footer">
          <div class="order-total">
            共{{ order.items.reduce((sum, item) => sum + item.quantity, 0) }}件商品，
            实付：<span class="total-price">¥{{ order.payPrice }}</span>
          </div>
          <div class="order-actions">
            <el-button
              v-if="order.status === 'pending'"
              type="primary"
              size="small"
            >
              立即付款
            </el-button>
            <el-button
              v-if="order.status === 'pending'"
              size="small"
              @click="cancelOrder(order.id)"
            >
              取消订单
            </el-button>
            <el-button
              v-if="order.status === 'shipped'"
              type="primary"
              size="small"
              @click="confirmReceive(order.id)"
            >
              确认收货
            </el-button>
            <el-button
              v-if="order.status === 'shipped'"
              size="small"
            >
              查看物流
            </el-button>
            <el-button
              v-if="order.status === 'completed'"
              size="small"
            >
              评价商品
            </el-button>
            <el-button size="small">
              查看详情
            </el-button>
          </div>
        </div>
      </div>
      <div v-if="filteredOrders.length === 0" class="empty-orders">
        <el-empty description="暂无订单" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('all')

const filteredOrders = computed(() => {
  if (activeTab.value === 'all') {
    return userStore.orders
  }
  return userStore.orders.filter(order => order.status === activeTab.value)
})

const goToDetail = (productId) => {
  router.push(`/product/${productId}`)
}

const cancelOrder = async (orderId) => {
  ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const result = await userStore.cancelOrder(orderId)
    if (result.success) {
      ElMessage.success('订单已取消')
    }
  }).catch(() => {})
}

const confirmReceive = async (orderId) => {
  ElMessageBox.confirm('确认已收到商品？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const result = await userStore.confirmReceive(orderId)
    if (result.success) {
      ElMessage.success('确认收货成功')
    }
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.orders-page {
  .page-title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 16px;
  }

  .order-tabs {
    margin-bottom: 20px;
  }

  .order-list {
    .order-item {
      border: 1px solid $border-light;
      border-radius: $border-radius;
      margin-bottom: 16px;
      overflow: hidden;

      .order-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 20px;
        background: #f8f8f8;
        border-bottom: 1px solid $border-light;

        .order-info {
          display: flex;
          gap: 20px;
          color: $text-secondary;
          font-size: 13px;
        }

        .order-status {
          font-weight: 600;

          &.pending {
            color: $warning-color;
          }

          &.shipped {
            color: $primary-color;
          }

          &.completed {
            color: $success-color;
          }

          &.cancelled {
            color: $text-secondary;
          }
        }
      }

      .order-items {
        padding: 16px 20px;

        .order-goods {
          display: grid;
          grid-template-columns: 80px 1fr 100px 80px;
          align-items: center;
          gap: 16px;
          padding: 12px 0;
          border-bottom: 1px solid $border-light;
          cursor: pointer;
          transition: background 0.2s;

          &:last-child {
            border-bottom: none;
          }

          &:hover {
            background: #fafafa;
          }

          .goods-image {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: $border-radius;
          }

          .goods-info {
            .goods-name {
              font-size: 14px;
              margin-bottom: 8px;
            }

            .goods-specs {
              display: flex;
              gap: 6px;
              flex-wrap: wrap;
            }
          }

          .goods-price {
            color: $primary-color;
            font-weight: 600;
            text-align: center;
          }

          .goods-quantity {
            text-align: center;
            color: $text-secondary;
          }
        }
      }

      .order-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        background: #fafafa;
        border-top: 1px solid $border-light;

        .order-total {
          color: $text-regular;

          .total-price {
            font-size: 20px;
            font-weight: bold;
            color: $primary-color;
            margin-left: 8px;
          }
        }

        .order-actions {
          display: flex;
          gap: 8px;
        }
      }
    }
  }

  .empty-orders {
    padding: 60px 0;
  }
}

@media (max-width: 1200px) {
  .orders-page {
    .order-list {
      .order-item {
        .order-items .order-goods {
          grid-template-columns: 80px 1fr;
          grid-template-areas:
            "image info"
            "image price"
            "image quantity";
          gap: 8px;

          .goods-image {
            grid-area: image;
          }

          .goods-info {
            grid-area: info;
          }

          .goods-price {
            grid-area: price;
            text-align: left;
          }

          .goods-quantity {
            grid-area: quantity;
            text-align: left;
          }
        }

        .order-footer {
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }
      }
    }
  }
}
</style>
