<template>
  <div class="orders-page">
    <h2 class="page-title">我的订单</h2>

    <div v-if="userStore.orders.length > 0" class="order-list">
      <div v-for="order in userStore.orders" :key="order.id" class="order-card">
        <div class="order-header">
          <div class="order-info">
            <span class="order-no">订单号：{{ order.orderNo }}</span>
            <span class="order-time">{{ formatDate(order.createTime) }}</span>
          </div>
          <el-tag :type="getStatusType(order.status)">
            {{ getStatusText(order.status) }}
          </el-tag>
        </div>
        <div class="order-items">
          <div
            v-for="item in order.items"
            :key="item.id"
            class="order-item"
            @click="goDetail(item.id)"
          >
            <div class="item-image">
              <el-image :src="item.image" fit="cover" />
            </div>
            <div class="item-info">
              <h3 class="item-name">{{ item.name }}</h3>
              <div class="item-specs">
                <span v-for="(val, key) in item.specs" :key="key" class="spec-tag">
                  {{ key }}: {{ val }}
                </span>
              </div>
            </div>
            <div class="item-price">{{ formatPrice(item.price) }}</div>
            <div class="item-quantity">x{{ item.quantity || 1 }}</div>
          </div>
        </div>
        <div class="order-footer">
          <div class="order-address">
            <el-icon><Location /></el-icon>
            {{ order.address.name }} {{ order.address.phone }} - {{ order.address.address }}
          </div>
          <div class="order-total">
            共 {{ order.items.length }} 件商品，合计：
            <span class="text-price">{{ formatPrice(order.total) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-wrapper">
      <el-empty description="暂无订单">
        <el-button type="primary" @click="goHome">去购物</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { Location } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { formatPrice, formatDate, getStatusText, getStatusType } from '@/utils'

const router = useRouter()
const userStore = useUserStore()

const goDetail = (id) => {
  router.push(`/detail/${id}`)
}

const goHome = () => {
  router.push('/')
}
</script>

<style lang="scss" scoped>
.orders-page {
  .order-card {
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    margin-bottom: 20px;
    overflow: hidden;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background-color: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;

    .order-info {
      display: flex;
      gap: 24px;
      font-size: 14px;
      color: #666;

      .order-no {
        color: #333;
        font-weight: 500;
      }
    }
  }

  .order-items {
    padding: 16px 20px;
  }

  .order-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f2f5;
    cursor: pointer;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      .item-name {
        color: #409eff;
      }
    }

    .item-image {
      width: 80px;
      height: 80px;
      border-radius: 4px;
      overflow: hidden;
      flex-shrink: 0;

      :deep(.el-image) {
        width: 100%;
        height: 100%;
      }
    }

    .item-info {
      flex: 1;
      padding: 0 16px;

      .item-name {
        font-size: 14px;
        color: #333;
        margin: 0 0 8px 0;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        transition: color 0.3s;
      }

      .item-specs {
        .spec-tag {
          display: inline-block;
          background-color: #f5f7fa;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          color: #666;
          margin-right: 8px;
        }
      }
    }

    .item-price {
      width: 100px;
      text-align: center;
      font-size: 14px;
      color: #333;
    }

    .item-quantity {
      width: 80px;
      text-align: center;
      font-size: 14px;
      color: #666;
    }
  }

  .order-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background-color: #fafafa;
    border-top: 1px solid #e4e7ed;

    .order-address {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #666;
    }

    .order-total {
      font-size: 14px;
      color: #666;

      .text-price {
        font-size: 18px;
        font-weight: 700;
      }
    }
  }
}

@media (max-width: 768px) {
  .order-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start !important;
  }

  .order-footer {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start !important;
  }
}
</style>
