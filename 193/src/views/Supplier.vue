<template>
  <div class="supplier-page">
    <div class="container">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>供货商管理中心</span>
            <el-tag type="success">供货商</el-tag>
          </div>
        </template>

        <el-row :gutter="20" class="stats-row">
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon orders">
                <el-icon :size="32"><List /></el-icon>
              </div>
              <div class="stat-info">
                <p class="stat-value">{{ allOrders.length }}</p>
                <p class="stat-label">总订单数</p>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon pending">
                <el-icon :size="32"><Clock /></el-icon>
              </div>
              <div class="stat-info">
                <p class="stat-value">{{ pendingOrders.length }}</p>
                <p class="stat-label">待处理订单</p>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon completed">
                <el-icon :size="32"><CircleCheck /></el-icon>
              </div>
              <div class="stat-info">
                <p class="stat-value">{{ completedOrders.length }}</p>
                <p class="stat-label">已完成订单</p>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon revenue">
                <el-icon :size="32"><Money /></el-icon>
              </div>
              <div class="stat-info">
                <p class="stat-value">¥{{ totalRevenue.toLocaleString() }}</p>
                <p class="stat-label">总营收</p>
              </div>
            </div>
          </el-col>
        </el-row>

        <el-tabs v-model="activeTab" class="supplier-tabs">
          <el-tab-pane label="订单管理" name="orders">
            <div class="order-management">
              <div class="filter-bar">
                <el-radio-group v-model="orderStatusFilter" size="small">
                  <el-radio-button value="all">全部订单</el-radio-button>
                  <el-radio-button value="pending">待确认</el-radio-button>
                  <el-radio-button value="completed">已完成</el-radio-button>
                  <el-radio-button value="cancelled">已取消</el-radio-button>
                </el-radio-group>
              </div>

              <el-table :data="filteredOrders" style="width: 100%" v-loading="loading">
                <el-table-column prop="orderNo" label="订单号" width="200" />
                <el-table-column label="采购方" width="200">
                  <template #default="{ row }">
                    <p class="buyer-name">{{ row.buyerName }}</p>
                    <p class="buyer-institution">{{ row.buyerInstitution }}</p>
                  </template>
                </el-table-column>
                <el-table-column label="商品">
                  <template #default="{ row }">
                    <div v-for="item in row.items" :key="item.equipmentId" class="order-item">
                      {{ item.name }} x{{ item.quantity }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="totalAmount" label="金额" width="120">
                  <template #default="{ row }">
                    <span class="price">¥{{ row.totalAmount }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="getStatusType(row.status)">
                      {{ getStatusText(row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="createdAt" label="下单时间" width="180">
                  <template #default="{ row }">
                    {{ formatDate(row.createdAt) }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120">
                  <template #default="{ row }">
                    <el-button 
                      v-if="row.status === 'pending'" 
                      type="primary" 
                      size="small"
                      @click="shipOrder(row)"
                    >
                      发货
                    </el-button>
                    <el-button 
                      size="small"
                      @click="viewOrderDetail(row)"
                    >
                      详情
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>

              <EmptyState v-if="filteredOrders.length === 0" text="暂无订单" type="order" />
            </div>
          </el-tab-pane>

          <el-tab-pane label="商品管理" name="products">
            <div class="product-management">
              <div class="action-bar">
                <el-button type="primary" @click="addProduct">
                  <el-icon><Plus /></el-icon>
                  新增商品
                </el-button>
              </div>
              <el-table :data="supplierProducts" style="width: 100%">
                <el-table-column label="商品图片" width="100">
                  <template #default="{ row }">
                    <img :src="row.image" :alt="row.name" class="product-thumb" />
                  </template>
                </el-table-column>
                <el-table-column prop="name" label="商品名称" />
                <el-table-column prop="price" label="价格" width="120">
                  <template #default="{ row }">
                    <span class="price">¥{{ row.price }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="stock" label="库存" width="100" />
                <el-table-column prop="sales" label="销量" width="100" />
                <el-table-column label="操作" width="150">
                  <template #default="{ row }">
                    <el-button size="small" @click="editProduct(row)">编辑</el-button>
                    <el-button size="small" type="danger" @click="deleteProduct(row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useOrderStore } from '@/stores/order'
import { useEquipmentStore } from '@/stores/equipment'
import EmptyState from '@/components/EmptyState.vue'
import {
  List, Clock, CircleCheck, Money, Plus
} from '@element-plus/icons-vue'

const orderStore = useOrderStore()
const equipmentStore = useEquipmentStore()

const activeTab = ref('orders')
const orderStatusFilter = ref('all')
const loading = ref(false)

const allOrders = computed(() => orderStore.orders)
const pendingOrders = computed(() => orderStore.pendingOrders)
const completedOrders = computed(() => orderStore.completedOrders)
const totalRevenue = computed(() => 
  completedOrders.value.reduce((sum, order) => sum + order.totalAmount, 0)
)

const filteredOrders = computed(() => {
  if (orderStatusFilter.value === 'all') {
    return orderStore.orders
  }
  return orderStore.orders.filter(order => order.status === orderStatusFilter.value)
})

const supplierProducts = computed(() => 
  equipmentStore.equipmentList.filter(item => 
    item.supplier === '华茂科教仪器有限公司' || 
    item.supplier === '科仪实验设备厂'
  )
)

function getStatusType(status) {
  const typeMap = {
    pending: 'warning',
    completed: 'success',
    cancelled: 'info'
  }
  return typeMap[status] || 'info'
}

function getStatusText(status) {
  const textMap = {
    pending: '待确认',
    completed: '已完成',
    cancelled: '已取消'
  }
  return textMap[status] || status
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN')
}

function shipOrder(order) {
  ElMessage.success(`订单 ${order.orderNo} 已发货`)
}

function viewOrderDetail(order) {
  ElMessage.info('查看订单详情: ' + order.orderNo)
}

function addProduct() {
  ElMessage.info('新增商品功能开发中')
}

function editProduct(product) {
  ElMessage.info('编辑商品: ' + product.name)
}

function deleteProduct(product) {
  ElMessage.info('删除商品: ' + product.name)
}
</script>

<style scoped>
.supplier-page {
  padding: 20px 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-icon.orders {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.pending {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.completed {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.revenue {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin: 0 0 4px 0;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.filter-bar {
  margin-bottom: 16px;
}

.action-bar {
  margin-bottom: 16px;
}

.buyer-name {
  font-size: 14px;
  color: #303133;
  margin: 0 0 4px 0;
}

.buyer-institution {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.order-item {
  font-size: 12px;
  color: #606266;
  line-height: 1.5;
}

.price {
  color: #f56c6c;
  font-weight: bold;
}

.product-thumb {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}
</style>
