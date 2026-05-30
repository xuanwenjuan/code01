<template>
  <div class="supplier-orders-page container">
    <div class="page-header">
      <h2 class="section-title">订单管理</h2>
    </div>
    
    <div class="card">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="全部订单" name="all" />
        <el-tab-pane label="待发货" name="paid" />
        <el-tab-pane label="已发货" name="shipping" />
        <el-tab-pane label="已完成" name="completed" />
      </el-tabs>

      <el-table :data="filteredOrders" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="订单号" width="200" />
        <el-table-column label="商品" min-width="250">
          <template #default="{ row }">
            <div v-for="product in row.products" :key="product.id" class="product-item">
              <img :src="product.image" :alt="product.name" />
              <div>
                <p class="product-name text-ellipsis">{{ product.name }}</p>
                <p class="product-spec">规格: {{ product.spec }}</p>
                <p class="product-price">¥{{ product.price }} x {{ product.quantity }}</p>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="收货信息" min-width="200">
          <template #default="{ row }">
            <p>{{ row.address.name }} {{ row.address.phone }}</p>
            <p class="address-detail text-ellipsis">{{ row.address.detail }}</p>
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="金额" width="120">
          <template #default="{ row }">
            <span class="price">¥{{ row.totalAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="statusText" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ row.statusText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link>详情</el-button>
            <el-button
              v-if="row.status === 'paid'"
              size="small"
              type="success"
              link
            >
              发货
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          :total="filteredOrders.length"
          :page-size="10"
          layout="total, prev, pager, next"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const loading = ref(false)
const activeTab = ref('all')

const filteredOrders = computed(() => {
  if (activeTab.value === 'all') {
    return appStore.orders
  }
  return appStore.orders.filter(o => o.status === activeTab.value)
})

const getStatusType = (status) => {
  const map = {
    pending: 'warning',
    paid: 'primary',
    shipping: 'info',
    completed: 'success',
    cancelled: 'danger'
  }
  return map[status] || 'info'
}
</script>

<style scoped>
.supplier-orders-page {
  padding-top: 20px;
}

.product-item {
  display: flex;
  gap: 12px;
  padding: 8px 0;
}

.product-item img {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  object-fit: cover;
}

.product-name {
  font-size: 14px;
  margin: 0 0 4px;
}

.product-spec {
  font-size: 12px;
  color: #999;
  margin: 0 0 4px;
}

.product-price {
  font-size: 12px;
  color: #e74c3c;
  margin: 0;
}

.address-detail {
  color: #999;
  font-size: 12px;
}

.price {
  color: #e74c3c;
  font-weight: bold;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
