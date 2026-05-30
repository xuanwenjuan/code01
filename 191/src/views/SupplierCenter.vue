<template>
  <div class="supplier-center-page">
    <div class="container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>供货商中心</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="page-header">
        <h1 class="page-title">供货商中心</h1>
        <p class="page-desc">管理您的商品和订单</p>
      </div>

      <div class="stats-overview">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #667eea, #764ba2)">
            <el-icon :size="32" color="#fff"><Goods /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ products.length }}</span>
            <span class="stat-label">在售商品</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb, #f5576c)">
            <el-icon :size="32" color="#fff"><ShoppingCart /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">156</span>
            <span class="stat-label">本月订单</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe, #00f2fe)">
            <el-icon :size="32" color="#fff"><Wallet /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">¥286,500</span>
            <span class="stat-label">本月销售额</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b, #38f9d7)">
            <el-icon :size="32" color="#fff"><User /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">89</span>
            <span class="stat-label">合作客户</span>
          </div>
        </div>
      </div>

      <div class="content-section">
        <h2 class="section-title">商品管理</h2>
        <div class="toolbar">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索商品名称"
            style="width: 300px"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary">
            <el-icon><Plus /></el-icon>
            新增商品
          </el-button>
        </div>

        <el-table :data="filteredProducts" style="width: 100%" class="products-table">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column label="商品信息" min-width="300">
            <template #default="{ row }">
              <div class="product-cell">
                <img :src="row.image" :alt="row.name" class="product-thumb" />
                <div class="product-info">
                  <span class="product-name">{{ row.name }}</span>
                  <span class="product-category">{{ row.categoryName }}</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="price" label="价格" width="120">
            <template #default="{ row }">
              <span class="price">¥{{ row.price.toLocaleString() }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="stock" label="库存" width="100" />
          <el-table-column prop="sales" label="销量" width="100" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.stock > 0 ? 'success' : 'danger'" size="small">
                {{ row.stock > 0 ? '在售' : '缺货' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180">
            <template #default>
              <el-button type="primary" link size="small">编辑</el-button>
              <el-button type="danger" link size="small">下架</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="content-section">
        <h2 class="section-title">最新订单</h2>
        <el-table :data="recentOrders" style="width: 100%">
          <el-table-column prop="id" label="订单号" width="180" />
          <el-table-column prop="productName" label="商品" min-width="200" />
          <el-table-column prop="buyer" label="采购方" width="180" />
          <el-table-column prop="amount" label="金额" width="140">
            <template #default="{ row }">
              <span class="price">¥{{ row.amount.toLocaleString() }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="下单时间" width="180" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="orderStatusMap[row.status]?.type" size="small">
                {{ orderStatusMap[row.status]?.label }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180">
            <template #default="{ row }">
              <el-button v-if="row.status === 'pending'" type="primary" link size="small">确认订单</el-button>
              <el-button v-if="row.status === 'paid'" type="primary" link size="small">发货</el-button>
              <el-button link size="small">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { products, orderStatusMap } from '@/mock/data'

const searchKeyword = ref('')

const filteredProducts = computed(() => {
  if (!searchKeyword.value) return products.slice(0, 8)
  return products.filter(p => 
    p.name.includes(searchKeyword.value)
  )
})

const recentOrders = [
  {
    id: 'ORD20240120001',
    productName: '高精度地下金属探测器 x2',
    buyer: '某省考古研究院',
    amount: 25600,
    createTime: '2024-01-20 10:30:00',
    status: 'pending'
  },
  {
    id: 'ORD20240119002',
    productName: '考古专业手铲套装 x10',
    buyer: '某市博物馆',
    amount: 5800,
    createTime: '2024-01-19 14:20:00',
    status: 'paid'
  },
  {
    id: 'ORD20240118003',
    productName: '地质雷达探测系统 x1',
    buyer: '某大学考古系',
    amount: 158000,
    createTime: '2024-01-18 09:15:00',
    status: 'shipping'
  },
  {
    id: 'ORD20240117004',
    productName: '超声波文物清洁机 x1',
    buyer: '某文物保护中心',
    amount: 15800,
    createTime: '2024-01-17 16:45:00',
    status: 'completed'
  }
]
</script>

<style lang="scss" scoped>
.supplier-center-page {
  .breadcrumb {
    margin-bottom: 20px;
  }

  .page-header {
    margin-bottom: 24px;

    .page-title {
      font-size: 24px;
      color: #333;
      margin: 0 0 4px 0;
      font-weight: 600;
    }

    .page-desc {
      font-size: 14px;
      color: #909399;
      margin: 0;
    }
  }

  .stats-overview {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 30px;
  }

  .stat-card {
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 16px;

    .stat-icon {
      width: 64px;
      height: 64px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-info {
      display: flex;
      flex-direction: column;

      .stat-value {
        font-size: 24px;
        font-weight: 700;
        color: #333;
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
      }
    }
  }

  .content-section {
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;

    .section-title {
      font-size: 18px;
      color: #333;
      margin: 0 0 20px 0;
      font-weight: 600;
    }

    .toolbar {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
    }
  }

  .product-cell {
    display: flex;
    align-items: center;
    gap: 12px;

    .product-thumb {
      width: 60px;
      height: 60px;
      border-radius: 6px;
      object-fit: cover;
    }

    .product-info {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .product-name {
        font-size: 14px;
        color: #333;
        font-weight: 500;
      }

      .product-category {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .price {
    color: #e74c3c;
    font-weight: 600;
  }
}
</style>
