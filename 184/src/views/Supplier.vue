<template>
  <div class="supplier-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">
          <el-icon color="#67c23a"><Management /></el-icon>
          供应商管理中心
        </h1>
        <div class="supplier-info">
          <el-avatar :size="40" :src="userStore.currentUser?.avatar" />
          <div>
            <p class="company-name">{{ userStore.currentUser?.company }}</p>
            <p class="license">营业执照：{{ userStore.currentUser?.license }}</p>
          </div>
        </div>
      </div>
      
      <div class="stats-row">
        <div class="stat-card card-shadow">
          <div class="stat-icon" style="background: #ecf5ff; color: #409eff;">
            <el-icon :size="28"><Goods /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-value">{{ productStore.productList.length }}</p>
            <p class="stat-label">在售商品</p>
          </div>
        </div>
        <div class="stat-card card-shadow">
          <div class="stat-icon" style="background: #fdf6ec; color: #e6a23c;">
            <el-icon :size="28"><List /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-value">{{ orderStore.orders.length }}</p>
            <p class="stat-label">待处理订单</p>
          </div>
        </div>
        <div class="stat-card card-shadow">
          <div class="stat-icon" style="background: #f0f9eb; color: #67c23a;">
            <el-icon :size="28"><Money /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-value">¥{{ totalSales.toFixed(2) }}</p>
            <p class="stat-label">本月销售额</p>
          </div>
        </div>
        <div class="stat-card card-shadow">
          <div class="stat-icon" style="background: #fef0f0; color: #f56c6c;">
            <el-icon :size="28"><User /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-value">1,234</p>
            <p class="stat-label">累计客户</p>
          </div>
        </div>
      </div>
      
      <div class="content-tabs card-shadow">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="商品管理" name="products">
            <div class="tab-content">
              <div class="toolbar">
                <el-button type="primary">
                  <el-icon><Plus /></el-icon>
                  新增商品
                </el-button>
                <el-input 
                  v-model="searchKeyword" 
                  placeholder="搜索商品..." 
                  style="width: 250px;"
                  clearable
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
              </div>
              
              <el-table :data="filteredProducts" stripe style="width: 100%">
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column label="商品图片" width="100">
                  <template #default="{ row }">
                    <el-image 
                      :src="row.image" 
                      style="width: 60px; height: 60px;"
                      fit="cover"
                      :preview-src-list="[row.image]"
                    />
                  </template>
                </el-table-column>
                <el-table-column prop="name" label="商品名称" min-width="200">
                  <template #default="{ row }">
                    <span class="product-name">{{ row.name }}</span>
                    <div class="product-tags">
                      <el-tag v-if="row.isHot" type="danger" size="small">热销</el-tag>
                      <el-tag v-if="row.isNew" type="success" size="small">新品</el-tag>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="分类" width="120">
                  <template #default="{ row }">
                    {{ getCategoryName(row.categoryId) }}
                  </template>
                </el-table-column>
                <el-table-column prop="price" label="价格" width="120">
                  <template #default="{ row }">
                    <span class="price">¥{{ row.price }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="sales" label="销量" width="100" />
                <el-table-column prop="rating" label="评分" width="100">
                  <template #default="{ row }">
                    <el-rate :model-value="row.rating" disabled size="small" />
                  </template>
                </el-table-column>
                <el-table-column label="库存" width="100">
                  <template #default="{ row }">
                    <span :class="{ 'low-stock': row.specs[0]?.stock < 50 }">
                      {{ row.specs[0]?.stock || 0 }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="180" fixed="right">
                  <template #default>
                    <el-button type="primary" size="small" link>编辑</el-button>
                    <el-button type="danger" size="small" link>下架</el-button>
                  </template>
                </el-table-column>
              </el-table>
              
              <div class="pagination-wrapper">
                <el-pagination
                  background
                  layout="total, prev, pager, next"
                  :total="filteredProducts.length"
                  :page-size="10"
                />
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="订单管理" name="orders">
            <div class="tab-content">
              <div class="toolbar">
                <el-radio-group v-model="orderStatus">
                  <el-radio-button value="">全部</el-radio-button>
                  <el-radio-button value="pending">待发货</el-radio-button>
                  <el-radio-button value="shipping">配送中</el-radio-button>
                  <el-radio-button value="delivered">已完成</el-radio-button>
                </el-radio-group>
              </div>
              
              <el-table :data="filteredOrders" stripe style="width: 100%">
                <el-table-column prop="id" label="订单号" min-width="180" />
                <el-table-column prop="createTime" label="下单时间" width="180" />
                <el-table-column label="商品信息" min-width="250">
                  <template #default="{ row }">
                    <div 
                      v-for="item in row.products" 
                      :key="`${item.productId}-${item.specId}`"
                      class="order-product"
                    >
                      <span>{{ item.name }}</span>
                      <span class="spec">（{{ item.specName }}）x{{ item.quantity }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="收货地址" min-width="200">
                  <template #default="{ row }">
                    {{ row.address }}
                  </template>
                </el-table-column>
                <el-table-column prop="totalAmount" label="金额" width="120">
                  <template #default="{ row }">
                    <span class="price">¥{{ row.totalAmount }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="getStatusType(row.status)" size="small">
                      {{ row.statusText }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="150" fixed="right">
                  <template #default="{ row }">
                    <el-button 
                      v-if="row.status === 'pending'"
                      type="primary" 
                      size="small"
                      @click="handleShip(row)"
                    >
                      发货
                    </el-button>
                    <el-button size="small" link>详情</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useProductStore } from '@/stores/product'
import { useOrderStore } from '@/stores/order'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const productStore = useProductStore()
const orderStore = useOrderStore()

const activeTab = ref('products')
const searchKeyword = ref('')
const orderStatus = ref('')
const loading = ref(true)

const filteredProducts = computed(() => {
  if (!searchKeyword.value) return productStore.productList
  const keyword = searchKeyword.value.toLowerCase()
  return productStore.productList.filter(p => 
    p.name.toLowerCase().includes(keyword)
  )
})

const filteredOrders = computed(() => {
  if (!orderStatus.value) return orderStore.orders
  return orderStore.orders.filter(o => o.status === orderStatus.value)
})

const totalSales = computed(() => {
  return orderStore.orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.totalAmount, 0)
})

function getCategoryName(categoryId) {
  const category = productStore.getCategoryById(categoryId)
  return category?.name || '未知分类'
}

function getStatusType(status) {
  const types = {
    pending: 'warning',
    shipping: 'primary',
    delivered: 'success'
  }
  return types[status] || 'info'
}

function handleShip(order) {
  orderStore.updateOrderStatus(order.id, 'shipping', '配送中')
  ElMessage.success('订单已发货')
}

onMounted(async () => {
  await Promise.all([
    productStore.simulateLoading(200),
    orderStore.simulateLoading(200)
  ])
  loading.value = false
})
</script>

<style scoped lang="scss">
.supplier-page {
  padding: 20px 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  .page-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 24px;
    font-weight: 600;
    color: #303133;
  }
  
  .supplier-info {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .company-name {
      font-weight: 600;
      color: #303133;
    }
    
    .license {
      font-size: 12px;
      color: #909399;
    }
  }
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  
  .stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .stat-info {
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #303133;
      margin-bottom: 4px;
    }
    
    .stat-label {
      font-size: 13px;
      color: #909399;
    }
  }
}

.content-tabs {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  
  :deep(.el-tabs__header) {
    margin-bottom: 20px;
  }
}

.tab-content {
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
}

.product-name {
  display: block;
  margin-bottom: 4px;
}

.product-tags {
  display: flex;
  gap: 4px;
}

.price {
  color: #f56c6c;
  font-weight: 600;
}

.low-stock {
  color: #f56c6c;
  font-weight: 500;
}

.order-product {
  margin-bottom: 4px;
  font-size: 13px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .spec {
    color: #909399;
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding-top: 20px;
}

@media (max-width: 1200px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
