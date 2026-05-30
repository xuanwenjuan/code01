<template>
  <div class="supplier-page">
    <div class="container">
      <el-page-header @back="goBack" class="mb-20">
        <template #content>
          <span>供货商中心</span>
        </template>
      </el-page-header>

      <el-row :gutter="20">
        <el-col :span="24">
          <div class="supplier-stats card">
            <el-row :gutter="20">
              <el-col :span="6">
                <div class="stat-card">
                  <el-icon :size="40" color="#409eff"><Money /></el-icon>
                  <div class="stat-info">
                    <div class="stat-value">¥{{ totalRevenue.toLocaleString() }}</div>
                    <div class="stat-label">总营收</div>
                  </div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-card">
                  <el-icon :size="40" color="#67c23a"><ShoppingCart /></el-icon>
                  <div class="stat-info">
                    <div class="stat-value">{{ totalOrders }}</div>
                    <div class="stat-label">总订单数</div>
                  </div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-card">
                  <el-icon :size="40" color="#e6a23c"><Goods /></el-icon>
                  <div class="stat-info">
                    <div class="stat-value">{{ supplierMaterials.length }}</div>
                    <div class="stat-label">在售商品</div>
                  </div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-card">
                  <el-icon :size="40" color="#f56c6c"><Star /></el-icon>
                  <div class="stat-info">
                    <div class="stat-value">{{ userStore.userInfo?.rating || 4.8 }}</div>
                    <div class="stat-label">店铺评分</div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-col>

        <el-col :span="24">
          <div class="card">
            <div class="section-header">
              <h3 class="section-title">我的商品</h3>
              <el-button type="primary" @click="handleAddProduct">
                <el-icon><Plus /></el-icon> 上架新商品
              </el-button>
            </div>
            <el-table :data="supplierMaterials" border style="width: 100%">
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column label="商品图片" width="100">
                <template #default="{ row }">
                  <el-image :src="row.image" style="width: 60px; height: 60px;" fit="cover" />
                </template>
              </el-table-column>
              <el-table-column prop="name" label="商品名称" min-width="200" />
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
              <el-table-column prop="stock" label="库存" width="100" />
              <el-table-column prop="sales" label="销量" width="100" />
              <el-table-column label="操作" width="180" fixed="right">
                <template #default="{ row }">
                  <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
                  <el-button size="small" type="danger" @click="handleDelete(row)">下架</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-col>

        <el-col :span="24">
          <div class="card">
            <div class="section-header">
              <h3 class="section-title">订单管理</h3>
              <el-select v-model="orderFilter" size="default" style="width: 150px;">
                <el-option label="全部订单" value="all" />
                <el-option label="待发货" value="paid" />
                <el-option label="已发货" value="shipped" />
                <el-option label="已完成" value="completed" />
              </el-select>
            </div>
            <el-table :data="filteredSupplierOrders" border style="width: 100%">
              <el-table-column prop="orderNo" label="订单号" min-width="180" />
              <el-table-column label="商品" min-width="200">
                <template #default="{ row }">
                  <div v-for="item in row.items" :key="item.materialId" class="order-product">
                    {{ item.name }} x{{ item.quantity }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="totalAmount" label="金额" width="120">
                <template #default="{ row }">
                  <span class="price">¥{{ row.totalAmount }}</span>
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="orderStatusMap[row.status].color" size="small">
                    {{ orderStatusMap[row.status].label }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="contact" label="收货人" width="180" />
              <el-table-column prop="address" label="收货地址" min-width="200" show-overflow-tooltip />
              <el-table-column prop="createdAt" label="下单时间" width="180" />
              <el-table-column label="操作" width="150" fixed="right">
                <template #default="{ row }">
                  <el-button v-if="row.status === 'paid'" size="small" type="primary" @click="handleShip(row)">
                    发货
                  </el-button>
                  <el-button v-else size="small" @click="handleViewOrder(row)">查看</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/user'
import { useOrdersStore } from '@/store/orders'
import { mockMaterials } from '@/mock/materials'
import { mockCategories } from '@/mock/categories'
import { orderStatusMap } from '@/mock/orders'

const router = useRouter()
const userStore = useUserStore()
const ordersStore = useOrdersStore()

const orderFilter = ref('all')

const supplierMaterials = computed(() => {
  return mockMaterials.filter(m => m.supplierId === userStore.userInfo?.id)
})

const supplierOrders = computed(() => {
  return ordersStore.orders.filter(order => {
    return order.items.some(item => {
      const material = mockMaterials.find(m => m.id === item.materialId)
      return material?.supplierId === userStore.userInfo?.id
    })
  })
})

const filteredSupplierOrders = computed(() => {
  if (orderFilter.value === 'all') {
    return supplierOrders.value
  }
  return supplierOrders.value.filter(o => o.status === orderFilter.value)
})

const totalRevenue = computed(() => {
  return supplierOrders.value
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.totalAmount, 0)
})

const totalOrders = computed(() => {
  return supplierOrders.value.length
})

const getCategoryName = (categoryId) => {
  const category = mockCategories.find(c => c.id === categoryId)
  return category?.name || '未知'
}

const goBack = () => {
  router.back()
}

const handleAddProduct = () => {
  ElMessage.info('上架新商品功能开发中')
}

const handleEdit = (row) => {
  ElMessage.info(`编辑商品：${row.name}`)
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要下架商品「${row.name}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('已下架')
  }).catch(() => {})
}

const handleShip = (row) => {
  ElMessageBox.confirm(`确定要对订单「${row.orderNo}」进行发货操作吗？`, '确认发货', {
    confirmButtonText: '确认发货',
    cancelButtonText: '取消',
    type: 'success'
  }).then(() => {
    ordersStore.updateOrderStatus(row.id, 'shipped')
    ElMessage.success('发货成功')
  }).catch(() => {})
}

const handleViewOrder = (row) => {
  ElMessage.info(`查看订单：${row.orderNo}`)
}
</script>

<style scoped>
.supplier-page {
  padding-bottom: 40px;
}

.supplier-stats {
  padding: 30px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.stat-info {
  flex: 1;
}

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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.price {
  color: #f56c6c;
  font-weight: bold;
}

.order-product {
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
}
</style>
