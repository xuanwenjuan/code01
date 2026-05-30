<template>
  <div class="user-center-page">
    <div class="container">
      <div class="page-layout">
        <div class="sidebar">
          <div class="user-info-card">
            <el-avatar :size="80" :src="userStore.user?.avatar" />
            <h3 class="user-name">{{ userStore.user?.name }}</h3>
            <p class="user-org">{{ userStore.user?.organization }}</p>
            <el-tag :type="userStore.isSupplier ? 'warning' : 'success'" size="large">
              {{ userStore.isSupplier ? '勘探器材供货商' : '考古单位采购方' }}
            </el-tag>
          </div>

          <el-menu
            :default-active="activeMenu"
            class="side-menu"
            @select="handleMenuSelect"
          >
            <el-menu-item index="profile">
              <el-icon><User /></el-icon>
              <span>个人信息</span>
            </el-menu-item>
            <el-menu-item index="orders">
              <el-icon><List /></el-icon>
              <span>我的订单</span>
              <el-tag v-if="exceptionCount > 0" type="danger" effect="dark" size="small" class="menu-badge">{{ exceptionCount }}</el-tag>
            </el-menu-item>
            <el-menu-item index="favorites">
              <el-icon><Star /></el-icon>
              <span>我的收藏</span>
            </el-menu-item>
            <el-menu-item index="statistics">
              <el-icon><DataLine /></el-icon>
              <span>采购统计</span>
            </el-menu-item>
            <el-menu-item v-if="userStore.isSupplier" index="supplier">
              <el-icon><OfficeBuilding /></el-icon>
              <span>供货商中心</span>
            </el-menu-item>
            <el-menu-item index="logout" @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>
              <span>退出登录</span>
            </el-menu-item>
          </el-menu>
        </div>

        <div class="main-content">
          <div v-if="activeMenu === 'profile'" class="profile-section">
            <h2 class="section-title">个人信息</h2>
            <el-card class="info-card">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="账号">
                  {{ userStore.user?.username }}
                </el-descriptions-item>
                <el-descriptions-item label="角色">
                  <el-tag :type="userStore.isSupplier ? 'warning' : 'success'">
                    {{ userStore.isSupplier ? '供货商' : '采购方' }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="姓名">
                  {{ userStore.user?.name }}
                </el-descriptions-item>
                <el-descriptions-item label="单位">
                  {{ userStore.user?.organization }}
                </el-descriptions-item>
                <el-descriptions-item label="手机号">
                  {{ userStore.user?.phone }}
                </el-descriptions-item>
                <el-descriptions-item label="邮箱">
                  {{ userStore.user?.email }}
                </el-descriptions-item>
              </el-descriptions>
            </el-card>

            <h2 class="section-title">账户统计</h2>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, #667eea, #764ba2)">
                  <el-icon :size="32" color="#fff"><ShoppingCart /></el-icon>
                </div>
                <div class="stat-info">
                  <span class="stat-value">{{ userStore.orders.length + 6 }}</span>
                  <span class="stat-label">采购订单</span>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb, #f5576c)">
                  <el-icon :size="32" color="#fff"><Star /></el-icon>
                </div>
                <div class="stat-info">
                  <span class="stat-value">{{ userStore.favorites.length }}</span>
                  <span class="stat-label">收藏商品</span>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe, #00f2fe)">
                  <el-icon :size="32" color="#fff"><Wallet /></el-icon>
                </div>
                <div class="stat-info">
                  <span class="stat-value">¥{{ totalSpent.toLocaleString() }}</span>
                  <span class="stat-label">累计消费</span>
                </div>
              </div>
              <div class="stat-card" v-if="exceptionCount > 0">
                <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a, #fee140)">
                  <el-icon :size="32" color="#fff"><WarningFilled /></el-icon>
                </div>
                <div class="stat-info">
                  <span class="stat-value" style="color: #f56c6c">{{ exceptionCount }}</span>
                  <span class="stat-label">异常订单</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeMenu === 'orders'" class="orders-section">
            <h2 class="section-title">我的订单</h2>
            <OrdersList />
          </div>

          <div v-if="activeMenu === 'favorites'" class="favorites-section">
            <h2 class="section-title">我的收藏</h2>
            <FavoritesList />
          </div>

          <div v-if="activeMenu === 'statistics'" class="statistics-section">
            <h2 class="section-title">采购统计</h2>
            
            <div class="stats-overview">
              <div class="overview-card highlight">
                <div class="overview-icon" style="background: linear-gradient(135deg, #667eea, #764ba2)">
                  <el-icon :size="40" color="#fff"><Money /></el-icon>
                </div>
                <div class="overview-info">
                  <span class="overview-label">累计采购金额</span>
                  <span class="overview-value">¥{{ purchaseStatistics.totalAmount.toLocaleString() }}</span>
                </div>
              </div>
              <div class="overview-card">
                <div class="overview-icon" style="background: linear-gradient(135deg, #f093fb, #f5576c)">
                  <el-icon :size="40" color="#fff"><ShoppingCart /></el-icon>
                </div>
                <div class="overview-info">
                  <span class="overview-label">采购订单数</span>
                  <span class="overview-value">{{ purchaseStatistics.totalOrders }}</span>
                </div>
              </div>
              <div class="overview-card">
                <div class="overview-icon" style="background: linear-gradient(135deg, #4facfe, #00f2fe)">
                  <el-icon :size="40" color="#fff"><Goods /></el-icon>
                </div>
                <div class="overview-info">
                  <span class="overview-label">采购商品数</span>
                  <span class="overview-value">{{ purchaseStatistics.totalProducts }}</span>
                </div>
              </div>
            </div>

            <div class="charts-row">
              <el-card class="chart-card">
                <template #header>
                  <span class="card-header">
                    <el-icon color="#d4af37"><DataLine /></el-icon>
                    月度采购趋势
                  </span>
                </template>
                <div class="monthly-chart">
                  <div
                    v-for="(item, index) in purchaseStatistics.monthlyStats"
                    :key="index"
                    class="chart-bar-item"
                  >
                    <span class="bar-label">{{ item.month }}</span>
                    <div class="bar-container">
                      <div
                        class="bar-fill" :style="{ height: getBarHeight(item.amount) }">
                        <span class="bar-value">¥{{ item.amount.toLocaleString() }}</span>
                      </div>
                    </div>
                    <span class="bar-count">{{ item.orders }} 单</span>
                  </div>
                </div>
              </el-card>

              <el-card class="chart-card">
                <template #header>
                  <span class="card-header">
                    <el-icon color="#d4af37"><PieChart /></el-icon>
                    分类采购占比
                  </span>
                </template>
                <div class="category-chart">
                  <div
                    v-for="(item, index) in purchaseStatistics.categoryStats"
                    :key="index"
                    class="category-item"
                  >
                    <div class="category-header">
                      <span class="category-name">{{ item.name }}</span>
                      <span class="category-amount">¥{{ item.amount.toLocaleString() }}</span>
                    </div>
                    <el-progress
                      :percentage="getCategoryPercentage(item.amount)"
                      :stroke-width="8"
                      :color="['#d4af37', '#67c23a', '#409eff', '#e6a23c', '#909399', '#f56c6c'][index]"
                      show-text="false"
                    />
                    <div class="category-meta">
                      <span>{{ item.count }} 件商品</span>
                      <span>{{ getCategoryPercentage(item.amount) }}%</span>
                    </div>
                  </div>
                </div>
              </el-card>
            </div>

            <el-card class="recent-orders-card">
              <template #header>
                <span class="card-header">
                  <el-icon color="#d4af37"><List /></el-icon>
                  近期订单
                </span>
                <el-button type="primary" link @click="$router.push('/orders')">查看全部</el-button>
              </template>
              <el-table :data="recentOrders" style="width: 100%">
                <el-table-column prop="id" label="订单号" width="180" />
                <el-table-column label="商品">
                  <template #default="{ row }">
                    <span>{{ row.products.map(p => p.name).join('、') }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="totalAmount" label="金额" width="120">
                  <template #default="{ row }">
                    <span style="color: #e74c3c; font-weight: 600;">¥{{ row.totalAmount.toLocaleString() }}</span>
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
              </el-table>
            </el-card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Money, Goods, DataLine, PieChart, WarningFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { mockOrders, orderStatusMap, purchaseStatistics } from '@/mock/data'
import OrdersList from './Orders.vue'
import FavoritesList from './Favorites.vue'

const router = useRouter()
const userStore = useUserStore()

const activeMenu = ref('profile')

const totalSpent = computed(() => {
  const mockTotal = mockOrders.reduce((sum, order) => sum + order.totalAmount, 0)
  const userTotal = userStore.orders.reduce((sum, order) => sum + order.totalAmount, 0)
  return mockTotal + userTotal
})

const exceptionCount = computed(() => {
  return mockOrders.filter(o => o.isException).length
})

const recentOrders = computed(() => {
  return [...mockOrders, ...userStore.orders]
    .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
    .slice(0, 5)
})

const maxAmount = computed(() => {
  return Math.max(...purchaseStatistics.categoryStats.map(s => s.amount), 1)
})

const getBarHeight = (amount) => {
  const max = Math.max(...purchaseStatistics.monthlyStats.map(s => s.amount), 1)
  return `${(amount / max) * 200 + 40}px`
}

const getCategoryPercentage = (amount) => {
  return Math.round((amount / purchaseStatistics.totalAmount) * 100)
}

const handleMenuSelect = (index) => {
  if (index === 'logout') {
    return
  }
  if (index === 'supplier') {
    router.push('/supplier')
    return
  }
  if (index === 'orders') {
    router.push('/orders')
    return
  }
  if (index === 'favorites') {
    router.push('/favorites')
    return
  }
  activeMenu.value = index
}

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/')
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.user-center-page {
  .page-layout {
    display: flex;
    gap: 24px;
  }

  .sidebar {
    width: 260px;
    flex-shrink: 0;
  }

  .user-info-card {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border-radius: 12px;
    padding: 30px 20px;
    text-align: center;
    margin-bottom: 16px;

    .user-name {
      font-size: 18px;
      color: #fff;
      margin: 16px 0 4px 0;
      font-weight: 600;
    }

    .user-org {
      font-size: 13px;
      color: #909399;
      margin: 0 0 12px 0;
    }
  }

  .side-menu {
    background: #fff;
    border-radius: 12px;
    border: none;
    position: relative;

    :deep(.el-menu-item) {
      height: 50px;
      line-height: 50px;
      margin: 4px 0;
      border-radius: 8px;
      position: relative;

      &.is-active {
        background: linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(212, 175, 55, 0.05));
        color: #d4af37;
      }

      &:hover {
        background: #f5f7fa;
      }

      .menu-badge {
        position: absolute;
        right: 16px;
        top: 50%;
        transform: translateY(-50%);
      }
    }
  }

  .main-content {
    flex: 1;
    min-width: 0;
  }

  .section-title {
    font-size: 20px;
    color: #333;
    margin: 0 0 20px 0;
    font-weight: 600;
  }

  .info-card {
    margin-bottom: 30px;
  }

  .stats-grid {
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

  .stats-overview {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 24px;

    .overview-card {
      background: #fff;
      border-radius: 12px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 20px;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      }

      &.highlight {
        background: linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05));
      }

      .overview-icon {
        width: 80px;
        height: 80px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .overview-info {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .overview-label {
          font-size: 14px;
          color: #666;
        }

        .overview-value {
          font-size: 28px;
          font-weight: 700;
          color: #333;
        }
      }
    }
  }

  .charts-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-bottom: 24px;

    .chart-card {
      .card-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }

      .monthly-chart {
        display: flex;
        align-items: flex-end;
        justify-content: space-around;
        height: 280px;
        padding: 20px 0;

        .chart-bar-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          flex: 1;

          .bar-label {
            font-size: 13px;
            color: #666;
          }

          .bar-container {
            width: 40px;
            height: 200px;
            background: #f5f7fa;
            border-radius: 4px;
            position: relative;
            display: flex;
            align-items: flex-end;
          }

          .bar-fill {
            width: 100%;
            background: linear-gradient(180deg, #d4af37, #f3d78d);
            border-radius: 4px 4px 0 0;
            position: relative;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding-top: 4px;
            min-height: 20px;

            .bar-value {
              font-size: 11px;
              color: #fff;
              font-weight: 600;
            }
          }

          .bar-count {
            font-size: 12px;
            color: #909399;
          }
        }
      }

      .category-chart {
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding: 10px 0;

        .category-item {
          .category-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;

            .category-name {
              font-size: 14px;
              color: #333;
            }

            .category-amount {
              font-size: 14px;
              font-weight: 600;
              color: #e74c3c;
            }
          }

          .category-meta {
            display: flex;
            justify-content: space-between;
            margin-top: 4px;
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }
  }

  .recent-orders-card {
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;

      .title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }
    }
  }
}
</style>
