<template>
  <div class="supplier-page container">
    <el-breadcrumb class="breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>供货商管理</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="page-header flex items-center justify-between">
      <div>
        <h1 class="page-title">供货商管理中心</h1>
        <p class="page-desc">管理您的商品、订单和店铺信息</p>
      </div>
      <el-button type="primary" size="large">
        <el-icon><Plus /></el-icon>
        发布新商品
      </el-button>
    </div>

    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content flex items-center justify-between">
            <div>
              <p class="stat-label">在售商品</p>
              <p class="stat-value">12</p>
            </div>
            <div class="stat-icon primary">
              <el-icon :size="32"><Goods /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content flex items-center justify-between">
            <div>
              <p class="stat-label">待处理订单</p>
              <p class="stat-value">5</p>
            </div>
            <div class="stat-icon warning">
              <el-icon :size="32"><Tickets /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content flex items-center justify-between">
            <div>
              <p class="stat-label">本月销售额</p>
              <p class="stat-value">¥128,500</p>
            </div>
            <div class="stat-icon success">
              <el-icon :size="32"><Money /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content flex items-center justify-between">
            <div>
              <p class="stat-label">店铺评分</p>
              <p class="stat-value">4.8</p>
            </div>
            <div class="stat-icon danger">
              <el-icon :size="32"><Star /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-tabs v-model="activeTab" class="supplier-tabs">
      <el-tab-pane label="商品管理" name="products">
        <div class="toolbar flex items-center justify-between">
          <el-input 
            v-model="searchKeyword" 
            placeholder="搜索商品" 
            style="width: 300px"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <div>
            <el-button>批量下架</el-button>
            <el-button type="primary">导出商品</el-button>
          </div>
        </div>
        <el-table :data="supplierProducts" border style="width: 100%; margin-top: 20px">
          <el-table-column prop="id" label="商品ID" width="100" />
          <el-table-column label="商品信息" min-width="300">
            <template #default="{ row }">
              <div class="product-cell flex items-center">
                <el-image :src="row.image" fit="cover" class="product-thumb" />
                <span class="product-name">{{ row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="categoryName" label="分类" width="150" />
          <el-table-column prop="price" label="价格" width="120">
            <template #default="{ row }">
              <span class="price">¥{{ row.price }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="stock" label="库存" width="100" />
          <el-table-column prop="sales" label="销量" width="100" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === '上架' ? 'success' : 'info'">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button type="primary" text>编辑</el-button>
              <el-button type="warning" text>{{ row.status === '上架' ? '下架' : '上架' }}</el-button>
              <el-button type="danger" text>删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination 
          class="pagination"
          background
          layout="prev, pager, next"
          :total="50"
        />
      </el-tab-pane>

      <el-tab-pane label="订单管理" name="orders">
        <div class="order-filter">
          <el-radio-group v-model="orderStatus" size="small">
            <el-radio-button label="all">全部订单</el-radio-button>
            <el-radio-button label="待发货">待发货</el-radio-button>
            <el-radio-button label="已发货">已发货</el-radio-button>
            <el-radio-button label="已完成">已完成</el-radio-button>
          </el-radio-group>
        </div>
        <el-table :data="supplierOrders" border style="width: 100%; margin-top: 20px">
          <el-table-column prop="id" label="订单号" width="180" />
          <el-table-column prop="createTime" label="下单时间" width="180" />
          <el-table-column label="商品信息" min-width="250">
            <template #default="{ row }">
              <div v-for="item in row.items" :key="item.productId">
                {{ item.productName }} × {{ item.quantity }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="totalAmount" label="金额" width="120">
            <template #default="{ row }">
              <span class="price">¥{{ row.totalAmount }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="contact" label="联系人" width="200" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getOrderStatusType(row.status)">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button v-if="row.status === '待发货'" type="primary" text size="small">
                发货
              </el-button>
              <el-button type="info" text size="small">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="店铺信息" name="shop">
        <el-form :model="shopForm" label-width="120px" style="max-width: 600px">
          <el-form-item label="店铺名称">
            <el-input v-model="shopForm.name" />
          </el-form-item>
          <el-form-item label="店铺简介">
            <el-input v-model="shopForm.intro" type="textarea" :rows="4" />
          </el-form-item>
          <el-form-item label="联系电话">
            <el-input v-model="shopForm.phone" />
          </el-form-item>
          <el-form-item label="店铺地址">
            <el-input v-model="shopForm.address" />
          </el-form-item>
          <el-form-item label="主营产品">
            <el-input v-model="shopForm.products" type="textarea" :rows="3" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary">保存信息</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { products, orders } from '@/mock'

const activeTab = ref('products')
const searchKeyword = ref('')
const orderStatus = ref('all')

const supplierProducts = ref(products.slice(0, 6).map(p => ({ ...p, status: '上架' })))

const supplierOrders = ref(orders)

const shopForm = reactive({
  name: 'XX养殖设备有限公司',
  intro: '专业生产销售各类养殖设备，品质保证，价格优惠。',
  phone: '400-123-4567',
  address: '山东省济南市XX区XX路456号',
  products: '恒温养殖设备、防疫消毒设备、饲料加工设备'
})

function getOrderStatusType(status) {
  const map = {
    '待付款': 'warning',
    '待发货': 'primary',
    '已发货': 'info',
    '已完成': 'success'
  }
  return map[status] || 'info'
}
</script>

<style scoped>
.supplier-page {
  padding: 20px 0 40px;
}

.breadcrumb {
  margin-bottom: 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-title {
  font-size: 28px;
  margin: 0 0 5px;
}

.page-desc {
  color: #606266;
  margin: 0;
}

.stats-row {
  margin-bottom: 30px;
}

.stat-card {
  border-radius: 8px;
}

.stat-content {
  padding: 10px 0;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin: 0 0 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin: 0;
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

.stat-icon.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.warning {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.success {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.stat-icon.danger {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
}

.supplier-tabs :deep(.el-tabs__header) {
  margin: 0 0 20px;
}

.toolbar {
  margin-bottom: 15px;
}

.product-cell {
  gap: 10px;
}

.product-thumb {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  overflow: hidden;
}

.product-name {
  font-size: 14px;
  color: #303133;
}

.price {
  color: #f56c6c;
  font-weight: 500;
}

.pagination {
  margin-top: 20px;
  justify-content: flex-end;
}

.order-filter {
  margin-bottom: 15px;
}
</style>
