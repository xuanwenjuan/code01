<template>
  <div class="merchant-page">
    <div class="container">
      <h2 class="page-title">商家中心</h2>
      
      <div class="stats-row">
        <div class="stat-card vintage-border">
          <div class="stat-icon sales">
            <el-icon :size="32"><TrendCharts /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-value">¥12,580</p>
            <p class="stat-label">今日销售额</p>
          </div>
        </div>
        
        <div class="stat-card vintage-border">
          <div class="stat-icon orders">
            <el-icon :size="32"><ShoppingBag /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-value">128</p>
            <p class="stat-label">今日订单</p>
          </div>
        </div>
        
        <div class="stat-card vintage-border">
          <div class="stat-icon products">
            <el-icon :size="32"><Goods /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-value">36</p>
            <p class="stat-label">在售商品</p>
          </div>
        </div>
        
        <div class="stat-card vintage-border">
          <div class="stat-icon users">
            <el-icon :size="32"><User /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-value">2,456</p>
            <p class="stat-label">粉丝数</p>
          </div>
        </div>
      </div>
      
      <div class="content-layout">
        <div class="left-section">
          <div class="card vintage-border">
            <div class="card-header">
              <h3>商品管理</h3>
              <el-button type="primary" size="small">
                <el-icon><Plus /></el-icon>
                新增商品
              </el-button>
            </div>
            
            <el-table :data="merchantProducts" style="width: 100%">
              <el-table-column prop="name" label="商品名称" />
              <el-table-column prop="category" label="分类" width="100" />
              <el-table-column prop="price" label="价格" width="100">
                <template #default="{ row }">
                  <span class="price">¥{{ row.price }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="stock" label="库存" width="80" />
              <el-table-column prop="sales" label="销量" width="80" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'on' ? 'success' : 'info'" size="small">
                    {{ row.status === 'on' ? '上架中' : '已下架' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template #default="{ row }">
                  <el-button size="small">编辑</el-button>
                  <el-button size="small" :type="row.status === 'on' ? 'info' : 'success'">
                    {{ row.status === 'on' ? '下架' : '上架' }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
        
        <div class="right-section">
          <div class="card vintage-border">
            <div class="card-header">
              <h3>最新订单</h3>
              <el-button text type="primary" @click="router.push('/orders')">查看全部</el-button>
            </div>
            
            <div class="order-list">
              <div v-for="order in recentOrders" :key="order.id" class="order-item">
                <div class="order-info">
                  <span class="order-no">{{ order.orderNo }}</span>
                  <el-tag size="small" :type="order.status === 'pending' ? 'warning' : 'success'">
                    {{ order.status === 'pending' ? '待发货' : '已完成' }}
                  </el-tag>
                </div>
                <p class="order-product">{{ order.product }}</p>
                <p class="order-price">¥{{ order.price }}</p>
              </div>
            </div>
          </div>
          
          <div class="card vintage-border" style="margin-top: 20px;">
            <div class="card-header">
              <h3>店铺信息</h3>
            </div>
            <div class="shop-info">
              <div class="shop-avatar">
                <el-avatar :size="80" :src="userStore.userInfo?.avatar" />
              </div>
              <div class="shop-details">
                <h4>{{ userStore.userInfo?.shopName }}</h4>
                <p>{{ userStore.userInfo?.shopDescription || '暂无店铺描述' }}</p>
                <div class="shop-stats">
                  <span>评分：4.9分</span>
                  <span>已售：12580件</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, TrendCharts, ShoppingBag, Goods, User } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useProductStore } from '@/stores/product'

const router = useRouter()
const userStore = useUserStore()
const productStore = useProductStore()

const merchantProducts = ref([])
const recentOrders = ref([])

onMounted(() => {
  loadMerchantData()
})

const loadMerchantData = () => {
  const merchantName = userStore.userInfo?.shopName || '古韵堂'
  merchantProducts.value = productStore.products
    .filter(p => p.merchant === merchantName)
    .map(p => ({
      id: p.id,
      name: p.name,
      category: productStore.categories.find(c => c.id === p.categoryId)?.name || '',
      price: p.price,
      stock: p.stock,
      sales: p.sales,
      status: 'on'
    }))
  
  recentOrders.value = [
    { id: 1, orderNo: 'ORD202403200001', product: '维多利亚复古珍珠项链', price: 299, status: 'pending' },
    { id: 2, orderNo: 'ORD202403190002', product: '中世纪复古手链', price: 259, status: 'completed' },
    { id: 3, orderNo: 'ORD202403190003', product: '复古浮雕耳环', price: 159, status: 'completed' }
  ]
}
</script>

<style lang="scss" scoped>
.merchant-page {
  padding: 40px 0;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #2c1810;
  margin-bottom: 24px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  
  &.sales {
    background: linear-gradient(135deg, #d4af37, #b8960c);
  }
  
  &.orders {
    background: linear-gradient(135deg, #667eea, #764ba2);
  }
  
  &.products {
    background: linear-gradient(135deg, #f093fb, #f5576c);
  }
  
  &.users {
    background: linear-gradient(135deg, #4facfe, #00f2fe);
  }
}

.stat-info {
  .stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #2c1810;
    margin-bottom: 4px;
  }
  
  .stat-label {
    font-size: 13px;
    color: #999;
  }
}

.content-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.left-section {
  flex: 1;
}

.right-section {
  width: 360px;
  flex-shrink: 0;
}

.card {
  background: #fff;
  padding: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #2c1810;
    margin: 0;
  }
  
  .el-button--primary {
    background: linear-gradient(135deg, #d4af37, #b8960c);
    border: none;
    
    &:hover {
      background: linear-gradient(135deg, #e5c158, #c9a71d);
    }
  }
}

.order-list {
  .order-item {
    padding: 16px 0;
    border-bottom: 1px solid #f5f5f5;
    
    &:last-child {
      border-bottom: none;
    }
  }
}

.order-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  .order-no {
    font-size: 13px;
    color: #666;
  }
}

.order-product {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.order-price {
  font-size: 16px;
  font-weight: 600;
  color: #c0392b;
}

.shop-info {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.shop-details {
  flex: 1;
  
  h4 {
    font-size: 16px;
    font-weight: 600;
    color: #2c1810;
    margin-bottom: 8px;
  }
  
  p {
    font-size: 13px;
    color: #666;
    margin-bottom: 12px;
    line-height: 1.6;
  }
}

.shop-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
}

.price {
  color: #c0392b;
  font-weight: 500;
}

@media (max-width: 1024px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .content-layout {
    flex-direction: column;
  }
  
  .right-section {
    width: 100%;
  }
}
</style>
