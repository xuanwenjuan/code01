<template>
  <div class="merchant-page">
    <div class="container">
      <div class="merchant-layout">
        <div class="sidebar">
          <div class="user-info-card">
            <el-avatar :size="64" class="user-avatar">
              {{ userStore.userInfo?.name?.charAt(0) }}
            </el-avatar>
            <h3 class="user-name">{{ userStore.userInfo?.name }}</h3>
            <p class="user-role">
              <el-tag type="success">书店商家</el-tag>
            </p>
            <p class="user-company">{{ userStore.userInfo?.company }}</p>
          </div>

          <el-menu
            :default-active="activeMenu"
            class="side-menu"
            @select="handleMenuSelect"
          >
            <el-menu-item index="dashboard">
              <el-icon><DataAnalysis /></el-icon>
              <span>数据概览</span>
            </el-menu-item>
            <el-menu-item index="orders">
              <el-icon><List /></el-icon>
              <span>订单管理</span>
            </el-menu-item>
            <el-menu-item index="books">
              <el-icon><Books /></el-icon>
              <span>图书管理</span>
            </el-menu-item>
            <el-menu-item index="profile">
              <el-icon><Setting /></el-icon>
              <span>账号设置</span>
            </el-menu-item>
          </el-menu>
        </div>

        <div class="main-content">
          <div v-show="activeMenu === 'dashboard'" class="content-panel">
            <h2 class="panel-title">数据概览</h2>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon icon-blue">
                  <el-icon><Money /></el-icon>
                </div>
                <div class="stat-info">
                  <p class="stat-label">本月销售额</p>
                  <p class="stat-value">¥268,560.00</p>
                  <p class="stat-change up">↑ 12.5%</p>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon icon-green">
                  <el-icon><ShoppingCart /></el-icon>
                </div>
                <div class="stat-info">
                  <p class="stat-label">本月订单数</p>
                  <p class="stat-value">156</p>
                  <p class="stat-change up">↑ 8.3%</p>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon icon-orange">
                  <el-icon><Collection /></el-icon>
                </div>
                <div class="stat-info">
                  <p class="stat-label">在售图书</p>
                  <p class="stat-value">1,256</p>
                  <p class="stat-change up">↑ 3.2%</p>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon icon-purple">
                  <el-icon><User /></el-icon>
                </div>
                <div class="stat-info">
                  <p class="stat-label">合作客户</p>
                  <p class="stat-value">89</p>
                  <p class="stat-change up">↑ 5.1%</p>
                </div>
              </div>
            </div>

            <div class="chart-section">
              <h3 class="section-title">销售趋势</h3>
              <div ref="chartRef" class="chart-container"></div>
            </div>
          </div>

          <div v-show="activeMenu === 'orders'" class="content-panel">
            <h2 class="panel-title">订单管理</h2>
            <div class="order-filters">
              <el-radio-group v-model="orderStatus" size="small">
                <el-radio-button value="all">全部</el-radio-button>
                <el-radio-button value="pending">待发货</el-radio-button>
                <el-radio-button value="shipping">配送中</el-radio-button>
                <el-radio-button value="completed">已完成</el-radio-button>
              </el-radio-group>
            </div>
            <el-table :data="filteredOrders" style="width: 100%">
              <el-table-column prop="orderNo" label="订单号" width="180" />
              <el-table-column label="采购图书">
                <template #default="{ row }">
                  <div v-for="book in row.books" :key="book.id" class="order-book">
                    {{ book.name }} × {{ book.quantity }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="金额" width="120">
                <template #default="{ row }">
                  <span class="price">¥{{ row.totalAmount.toFixed(2) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getStatusType(row.status)">
                    {{ getStatusText(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createTime" label="下单时间" width="180" />
              <el-table-column label="操作" width="150">
                <template #default="{ row }">
                  <el-button
                    v-if="row.status === 'pending'"
                    size="small"
                    type="primary"
                    link
                    @click="handleShip(row)"
                  >
                    发货
                  </el-button>
                  <el-button size="small" type="primary" link>
                    查看详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div v-show="activeMenu === 'books'" class="content-panel">
            <h2 class="panel-title">
              图书管理
              <el-button type="primary" size="small" style="margin-left: 20px;">
                <el-icon><Plus /></el-icon>
                添加图书
              </el-button>
            </h2>
            <el-table :data="bookStore.books" style="width: 100%">
              <el-table-column label="封面" width="80">
                <template #default="{ row }">
                  <img :src="row.cover" class="book-thumb" />
                </template>
              </el-table-column>
              <el-table-column prop="name" label="书名" min-width="200" />
              <el-table-column prop="author" label="作者" width="150" />
              <el-table-column prop="category" label="分类" width="120" />
              <el-table-column label="价格" width="120">
                <template #default="{ row }">
                  <span class="price">¥{{ row.price.toFixed(2) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="stock" label="库存" width="80" />
              <el-table-column prop="sales" label="销量" width="80" />
              <el-table-column label="操作" width="150">
                <template #default>
                  <el-button size="small" type="primary" link>编辑</el-button>
                  <el-button size="small" type="danger" link>下架</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div v-show="activeMenu === 'profile'" class="content-panel">
            <h2 class="panel-title">账号设置</h2>
            <el-descriptions :column="2" border class="profile-desc">
              <el-descriptions-item label="用户名">
                {{ userStore.userInfo?.username }}
              </el-descriptions-item>
              <el-descriptions-item label="真实姓名">
                {{ userStore.userInfo?.name }}
              </el-descriptions-item>
              <el-descriptions-item label="联系电话">
                {{ userStore.userInfo?.phone }}
              </el-descriptions-item>
              <el-descriptions-item label="出版社名称">
                {{ userStore.userInfo?.company }}
              </el-descriptions-item>
              <el-descriptions-item label="账号角色">
                <el-tag type="success">书店商家</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="入驻时间">
                2022-06-15
              </el-descriptions-item>
            </el-descriptions>

            <div class="profile-actions">
              <el-button type="primary" @click="handleLogout">
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import { useUserStore } from '@/stores/user'
import { useOrderStore } from '@/stores/order'
import { useBookStore } from '@/stores/book'

const router = useRouter()
const userStore = useUserStore()
const orderStore = useOrderStore()
const bookStore = useBookStore()

const activeMenu = ref('dashboard')
const orderStatus = ref('all')
const chartRef = ref(null)
let chartInstance = null

onMounted(async () => {
  if (bookStore.books.length === 0) {
    await bookStore.fetchBooks()
  }
  await nextTick()
  initChart()
})

const handleMenuSelect = (index) => {
  activeMenu.value = index
  if (index === 'dashboard') {
    nextTick(() => {
      initChart()
    })
  }
}

const filteredOrders = computed(() => {
  if (orderStatus.value === 'all') {
    return orderStore.orders
  }
  return orderStore.orders.filter(o => o.status === orderStatus.value)
})

const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    shipping: 'primary',
    completed: 'success'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    pending: '待发货',
    shipping: '配送中',
    completed: '已完成'
  }
  return texts[status] || status
}

const handleShip = (order) => {
  ElMessageBox.confirm('确认发货吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    order.status = 'shipping'
    orderStore.saveOrders()
    ElMessage.success('发货成功')
  }).catch(() => {})
}

const initChart = () => {
  if (!chartRef.value) return
  
  if (chartInstance) {
    chartInstance.dispose()
  }
  
  chartInstance = echarts.init(chartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['销售额', '订单数']
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: [
      {
        type: 'value',
        name: '销售额(元)',
        position: 'left'
      },
      {
        type: 'value',
        name: '订单数',
        position: 'right'
      }
    ],
    series: [
      {
        name: '销售额',
        type: 'bar',
        data: [156000, 189000, 215000, 245000, 238000, 268560],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 1, color: '#409eff' }
          ])
        }
      },
      {
        name: '订单数',
        type: 'line',
        yAxisIndex: 1,
        data: [89, 102, 118, 132, 144, 156],
        smooth: true,
        itemStyle: {
          color: '#67c23a'
        },
        lineStyle: {
          width: 3
        }
      }
    ]
  }
  
  chartInstance.setOption(option)
  
  window.addEventListener('resize', () => {
    chartInstance?.resize()
  })
}

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
    ElMessage.success('退出登录成功')
    router.push('/')
  }).catch(() => {})
}
</script>

<style scoped>
.merchant-page {
  padding-top: 20px;
}

.merchant-layout {
  display: flex;
  gap: 20px;
}

.sidebar {
  width: 240px;
  flex-shrink: 0;
}

.user-info-card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  margin-bottom: 16px;
}

.user-avatar {
  background: linear-gradient(135deg, #67c23a, #409eff);
  margin-bottom: 12px;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #303133;
}

.user-role {
  margin: 0 0 8px 0;
}

.user-company {
  font-size: 13px;
  color: #909399;
  margin: 0;
}

.side-menu {
  border-right: none;
  border-radius: 8px;
  overflow: hidden;
}

.main-content {
  flex: 1;
}

.content-panel {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  min-height: 500px;
}

.panel-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: #303133;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
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
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 28px;
}

.icon-blue {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.icon-green {
  background: linear-gradient(135deg, #11998e, #38ef7d);
}

.icon-orange {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.icon-purple {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin: 0 0 4px 0;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 4px 0;
}

.stat-change {
  font-size: 12px;
  margin: 0;
}

.stat-change.up {
  color: #67c23a;
}

.chart-section {
  margin-top: 30px;
}

.chart-section .section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #303133;
}

.chart-container {
  width: 100%;
  height: 350px;
}

.order-filters {
  margin-bottom: 16px;
}

.order-book {
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
}

.book-thumb {
  width: 50px;
  height: 66px;
  object-fit: cover;
  border-radius: 4px;
}

.profile-desc {
  margin-bottom: 24px;
}

.profile-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
