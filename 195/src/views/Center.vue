<template>
  <div class="center-page">
    <div class="container">
      <el-breadcrumb class="breadcrumb" separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>个人中心</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="center-container">
        <div class="sidebar card">
          <div class="user-info-card">
            <el-avatar :size="80" :src="userStore.userInfo?.avatar" />
            <h3 class="user-name">{{ userStore.userInfo?.name }}</h3>
            <el-tag :type="userStore.isSupplier ? 'success' : 'primary'" size="small">
              {{ userStore.isSupplier ? '供货商' : '采购方' }}
            </el-tag>
            <div class="unread-badge" v-if="unreadReminders.length > 0">
              <el-badge :value="unreadReminders.length" class="reminder-badge">
                <el-button type="warning" size="small" @click="showReminders = true">
                  <el-icon><Bell /></el-icon> 保养提醒
                </el-button>
              </el-badge>
            </div>
          </div>

          <el-menu
            :default-active="activeMenu"
            class="sidebar-menu"
            @select="handleMenuSelect"
          >
            <el-menu-item index="profile">
              <el-icon><User /></el-icon>
              <span>账号信息</span>
            </el-menu-item>
            <el-menu-item index="orders">
              <el-icon><List /></el-icon>
              <span>订单管理</span>
            </el-menu-item>
            <el-menu-item index="favorites">
              <el-icon><Star /></el-icon>
              <span>我的收藏</span>
            </el-menu-item>
            <el-menu-item index="statistics">
              <el-icon><DataAnalysis /></el-icon>
              <span>使用统计</span>
            </el-menu-item>
            <el-menu-item index="reminders">
              <el-icon><Bell /></el-icon>
              <span>保养提醒</span>
              <el-badge :value="unreadReminders.length" v-if="unreadReminders.length > 0" class="menu-badge" />
            </el-menu-item>
            <el-menu-item v-if="userStore.isSupplier" index="supplier">
              <el-icon><OfficeBuilding /></el-icon>
              <span>供货商中心</span>
            </el-menu-item>
          </el-menu>
        </div>

        <div class="main-content card">
          <template v-if="activeMenu === 'profile'">
            <h2 class="section-title">账号信息</h2>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="账号">
                {{ userStore.userInfo?.username }}
              </el-descriptions-item>
              <el-descriptions-item label="角色">
                {{ userStore.isSupplier ? '供货商' : '采购方' }}
              </el-descriptions-item>
              <el-descriptions-item label="名称">
                {{ userStore.userInfo?.name }}
              </el-descriptions-item>
              <el-descriptions-item label="联系电话">
                {{ userStore.userInfo?.phone }}
              </el-descriptions-item>
              <el-descriptions-item label="邮箱">
                {{ userStore.userInfo?.email }}
              </el-descriptions-item>
              <el-descriptions-item label="地址">
                {{ userStore.userInfo?.address }}
              </el-descriptions-item>
            </el-descriptions>

            <div class="quick-actions">
              <h3 class="sub-title">快捷操作</h3>
              <div class="action-grid">
                <div class="action-item card" @click="goOrders">
                  <el-icon><List /></el-icon>
                  <span>查看订单</span>
                </div>
                <div class="action-item card" @click="goFavorites">
                  <el-icon><Star /></el-icon>
                  <span>我的收藏</span>
                </div>
                <div class="action-item card" @click="goHome">
                  <el-icon><HomeFilled /></el-icon>
                  <span>继续采购</span>
                </div>
                <div class="action-item card" @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  <span>退出登录</span>
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="activeMenu === 'statistics'">
            <h2 class="section-title">工具使用频次统计</h2>

            <div class="stats-overview">
              <div class="stat-card">
                <div class="stat-icon blue"><el-icon><DataLine /></el-icon></div>
                <div class="stat-content">
                  <span class="stat-label">总使用次数</span>
                  <span class="stat-value">{{ totalUsageCount }}</span>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon green"><el-icon><SetUp /></el-icon></div>
                <div class="stat-content">
                  <span class="stat-label">常用工具数</span>
                  <span class="stat-value">{{ usedToolsCount }}</span>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon orange"><el-icon><TrendCharts /></el-icon></div>
                <div class="stat-content">
                  <span class="stat-label">最常用工具</span>
                  <span class="stat-value">{{ mostUsedToolName }}</span>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon purple"><el-icon><Timer /></el-icon></div>
                <div class="stat-content">
                  <span class="stat-label">最近使用</span>
                  <span class="stat-value">{{ lastUsedToolName }}</span>
                </div>
              </div>
            </div>

            <h3 class="sub-title">使用频次排行</h3>
            <div class="usage-list">
              <div
                v-for="(tool, index) in usageStatistics"
                :key="tool.id"
                class="usage-item"
                v-if="tool.usageCount > 0"
              >
                <div class="usage-rank" :class="getRankClass(index)">
                  {{ index + 1 }}
                </div>
                <img :src="tool.image" :alt="tool.name" class="usage-image" />
                <div class="usage-info">
                  <h4>{{ tool.name }}</h4>
                  <p>{{ tool.description }}</p>
                </div>
                <div class="usage-count">
                  <span class="count-label">使用次数</span>
                  <span class="count-value">{{ tool.usageCount }}</span>
                </div>
                <div class="usage-bar">
                  <div
                    class="usage-fill"
                    :style="{ width: getUsagePercent(tool.usageCount) + '%' }"
                  ></div>
                </div>
                <el-button size="small" type="primary" @click="goToolDetail(tool.id)">
                  查看
                </el-button>
              </div>
              <div v-if="totalUsageCount === 0" class="empty-wrapper">
                <el-icon><Timer /></el-icon>
                <p>暂无使用记录，快去使用工具吧！</p>
              </div>
            </div>
          </template>

          <template v-else-if="activeMenu === 'reminders'">
            <h2 class="section-title">工具保养提醒</h2>

            <div class="reminder-actions">
              <el-button type="primary" @click="markAllAsRead" :disabled="unreadReminders.length === 0">
                全部标为已读
              </el-button>
              <el-button @click="addTestReminder">
                添加测试提醒
              </el-button>
            </div>

            <div class="reminder-list">
              <div
                v-for="reminder in allReminders"
                :key="reminder.id"
                class="reminder-item"
                :class="{ unread: !reminder.read }"
              >
                <div class="reminder-icon" :class="getReminderIconClass(reminder.type)">
                  <el-icon><Tools /></el-icon>
                </div>
                <div class="reminder-content">
                  <h4>{{ reminder.toolName }}</h4>
                  <p>{{ reminder.message }}</p>
                  <span class="reminder-time">{{ formatTime(reminder.time) }}</span>
                </div>
                <div class="reminder-actions">
                  <el-button
                    v-if="!reminder.read"
                    size="small"
                    type="primary"
                    @click="markAsRead(reminder.id)"
                  >
                    标为已读
                  </el-button>
                  <el-button size="small" @click="goToolDetail(reminder.toolId)">
                    查看工具
                  </el-button>
                </div>
              </div>
              <div v-if="allReminders.length === 0" class="empty-wrapper">
                <el-icon><Bell /></el-icon>
                <p>暂无保养提醒</p>
              </div>
            </div>
          </template>

          <template v-else-if="activeMenu === 'supplier' && userStore.isSupplier">
            <h2 class="section-title">供货商专属操作</h2>

            <div class="supplier-actions">
              <div class="supplier-action-card card" @click="goSupplierCenter">
                <el-icon><Goods /></el-icon>
                <h4>商品管理</h4>
                <p>管理在售商品信息</p>
              </div>
              <div class="supplier-action-card card" @click="goOrders">
                <el-icon><List /></el-icon>
                <h4>订单处理</h4>
                <p>处理客户订单发货</p>
              </div>
              <div class="supplier-action-card card">
                <el-icon><DataAnalysis /></el-icon>
                <h4>销售统计</h4>
                <p>查看销售数据报表</p>
              </div>
              <div class="supplier-action-card card">
                <el-icon><PriceTag /></el-icon>
                <h4>价格管理</h4>
                <p>设置商品价格策略</p>
              </div>
            </div>

            <div class="supplier-panel card">
              <h3 class="sub-title">快速发货</h3>
              <el-table :data="pendingOrders" size="small">
                <el-table-column prop="id" label="订单号" width="180" />
                <el-table-column prop="buyer" label="采购方" width="140" />
                <el-table-column label="商品">
                  <template #default="{ row }">
                    {{ row.items.map(i => i.toolName).join('、') }}
                  </template>
                </el-table-column>
                <el-table-column prop="totalAmount" label="金额" width="100">
                  <template #default="{ row }">¥{{ row.totalAmount }}</template>
                </el-table-column>
                <el-table-column label="操作" width="100">
                  <template #default="{ row }">
                    <el-button type="primary" size="small" @click="handleShip(row.id)">
                      发货
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </div>
      </div>
    </div>

    <el-drawer
      v-model="showReminders"
      title="保养提醒"
      size="400px"
    >
      <div class="drawer-content">
        <div
          v-for="reminder in unreadReminders"
          :key="reminder.id"
          class="reminder-item unread"
        >
          <div class="reminder-icon">
            <el-icon><Tools /></el-icon>
          </div>
          <div class="reminder-content">
            <h4>{{ reminder.toolName }}</h4>
            <p>{{ reminder.message }}</p>
            <span class="reminder-time">{{ formatTime(reminder.time) }}</span>
          </div>
        </div>
        <div v-if="unreadReminders.length === 0" class="empty-wrapper">
          <el-icon><Bell /></el-icon>
          <p>暂无未读提醒</p>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  User,
  List,
  Star,
  OfficeBuilding,
  HomeFilled,
  SwitchButton,
  DataAnalysis,
  Bell,
  DataLine,
  SetUp,
  TrendCharts,
  Timer,
  Tools,
  Goods,
  PriceTag
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useToolStore } from '@/stores/tool'
import { useOrderStore } from '@/stores/order'

const router = useRouter()
const userStore = useUserStore()
const toolStore = useToolStore()
const orderStore = useOrderStore()

const activeMenu = ref('profile')
const showReminders = ref(false)

const unreadReminders = computed(() => toolStore.getUnreadReminders())
const allReminders = computed(() => {
  return [...toolStore.maintenanceReminders].sort((a, b) => new Date(b.time) - new Date(a.time))
})

const usageStatistics = computed(() => toolStore.getUsageStatistics())

const totalUsageCount = computed(() => {
  return usageStatistics.value.reduce((sum, t) => sum + t.usageCount, 0)
})

const usedToolsCount = computed(() => {
  return usageStatistics.value.filter(t => t.usageCount > 0).length
})

const mostUsedToolName = computed(() => {
  const mostUsed = usageStatistics.value[0]
  return mostUsed?.usageCount > 0 ? mostUsed.name : '暂无'
})

const lastUsedToolName = computed(() => {
  const used = usageStatistics.value.filter(t => t.lastUsed)
  if (used.length === 0) return '暂无'
  const latest = used.sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed))[0]
  return latest.name
})

const pendingOrders = computed(() => {
  if (!userStore.userInfo) return []
  return orderStore.getOrdersByUser(userStore.userInfo.name)
    .filter(o => o.status === 'pending')
    .slice(0, 5)
})

const getRankClass = (index) => {
  if (index === 0) return 'rank-1'
  if (index === 1) return 'rank-2'
  if (index === 2) return 'rank-3'
  return ''
}

const getUsagePercent = (count) => {
  const max = Math.max(...usageStatistics.value.map(t => t.usageCount), 1)
  return Math.min(100, (count / max) * 100)
}

const getReminderIconClass = (type) => {
  if (type === 'usage') return 'usage'
  return 'normal'
}

const formatTime = (time) => {
  return new Date(time).toLocaleString('zh-CN')
}

const handleMenuSelect = (index) => {
  activeMenu.value = index
  switch (index) {
    case 'orders':
      router.push('/orders')
      break
    case 'favorites':
      router.push('/favorites')
      break
    case 'supplier':
      router.push('/supplier')
      break
  }
}

const goOrders = () => {
  router.push('/orders')
}

const goFavorites = () => {
  router.push('/favorites')
}

const goHome = () => {
  router.push('/')
}

const goSupplierCenter = () => {
  router.push('/supplier')
}

const goToolDetail = (toolId) => {
  router.push(`/tool/${toolId}`)
}

const handleLogout = () => {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}

const markAsRead = (reminderId) => {
  toolStore.markReminderAsRead(reminderId)
  ElMessage.success('已标为已读')
}

const markAllAsRead = () => {
  toolStore.markAllRemindersAsRead()
  ElMessage.success('全部标为已读')
}

const addTestReminder = () => {
  const tools = toolStore.toolList
  const randomTool = tools[Math.floor(Math.random() * tools.length)]
  toolStore.addMaintenanceReminder(
    randomTool.id,
    'manual',
    `您的「${randomTool.name}」需要进行保养维护`
  )
  ElMessage.success('已添加测试提醒')
}

const handleShip = (orderId) => {
  orderStore.updateOrderStatus(orderId, 'shipped')
  ElMessage.success('已确认发货')
}

onMounted(() => {
  toolStore.loadFavorites()
})
</script>

<style lang="scss" scoped>
.center-page {
  padding: 40px 0;
}

.breadcrumb {
  margin-bottom: 24px;
}

.center-container {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 24px;
}

.sidebar {
  padding: 24px 0;
  height: fit-content;

  .user-info-card {
    text-align: center;
    padding: 0 24px 24px;
    border-bottom: 1px solid #eee;

    .user-name {
      font-size: 16px;
      margin: 12px 0 8px;
      color: #333;
    }

    .unread-badge {
      margin-top: 16px;
    }
  }

  .sidebar-menu {
    border-right: none;
  }

  .menu-badge {
    margin-left: 8px;
  }
}

.main-content {
  padding: 32px;
  min-height: 500px;

  .section-title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 24px;
    color: #333;
  }

  .sub-title {
    font-size: 16px;
    margin: 32px 0 16px;
    color: #333;
  }

  .quick-actions {
    margin-top: 32px;
  }

  .action-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;

    .action-item {
      padding: 24px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-2px);

        .el-icon {
          transform: scale(1.1);
        }
      }

      .el-icon {
        font-size: 32px;
        color: #8b4513;
        margin-bottom: 12px;
        transition: transform 0.3s;
      }

      span {
        display: block;
        font-size: 14px;
        color: #333;
      }
    }
  }
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  .stat-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: #fff;

      &.blue { background: linear-gradient(135deg, #409eff, #66b1ff); }
      &.green { background: linear-gradient(135deg, #67c23a, #85ce61); }
      &.orange { background: linear-gradient(135deg, #e6a23c, #f0c070); }
      &.purple { background: linear-gradient(135deg, #a855f7, #c084fc); }
    }

    .stat-content {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .stat-label {
        font-size: 13px;
        color: #666;
      }

      .stat-value {
        font-size: 20px;
        font-weight: 700;
        color: #333;
      }
    }
  }
}

.usage-list {
  .usage-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: #fff;
    border-radius: 8px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

    .usage-rank {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: #999;

      &.rank-1 { background: linear-gradient(135deg, #f56c6c, #e6a23c); color: #fff; }
      &.rank-2 { background: linear-gradient(135deg, #909399, #a6a9ad); color: #fff; }
      &.rank-3 { background: linear-gradient(135deg, #cd853f, #daa520); color: #fff; }
    }

    .usage-image {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      object-fit: cover;
    }

    .usage-info {
      flex: 1;

      h4 {
        font-size: 14px;
        margin-bottom: 4px;
        color: #333;
      }

      p {
        font-size: 12px;
        color: #999;
        margin: 0;
      }
    }

    .usage-count {
      text-align: center;
      min-width: 80px;

      .count-label {
        display: block;
        font-size: 12px;
        color: #999;
      }

      .count-value {
        font-size: 20px;
        font-weight: 700;
        color: #e6a23c;
      }
    }

    .usage-bar {
      width: 120px;
      height: 8px;
      background: #f0f0f0;
      border-radius: 4px;
      overflow: hidden;

      .usage-fill {
        height: 100%;
        background: linear-gradient(90deg, #409eff, #66b1ff);
        border-radius: 4px;
        transition: width 0.3s;
      }
    }
  }
}

.reminder-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.reminder-list {
  .reminder-item {
    display: flex;
    gap: 16px;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transition: all 0.3s;

    &.unread {
      background: #f0f9ff;
      border-left: 4px solid #409eff;
    }

    .reminder-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: #fff;
      background: linear-gradient(135deg, #e6a23c, #f0c070);

      &.usage {
        background: linear-gradient(135deg, #f56c6c, #e6a23c);
      }
    }

    .reminder-content {
      flex: 1;

      h4 {
        font-size: 15px;
        margin-bottom: 4px;
        color: #333;
      }

      p {
        font-size: 13px;
        color: #666;
        margin-bottom: 4px;
      }

      .reminder-time {
        font-size: 12px;
        color: #999;
      }
    }

    .reminder-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }
  }
}

.supplier-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  .supplier-action-card {
    padding: 24px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
    }

    .el-icon {
      font-size: 36px;
      color: #8b4513;
      margin-bottom: 12px;
    }

    h4 {
      font-size: 15px;
      margin-bottom: 4px;
      color: #333;
    }

    p {
      font-size: 12px;
      color: #999;
      margin: 0;
    }
  }
}

.supplier-panel {
  padding: 24px;
}

.drawer-content {
  .reminder-item {
    display: flex;
    gap: 12px;
    padding: 16px;
    background: #f0f9ff;
    border-radius: 8px;
    margin-bottom: 12px;

    .reminder-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #e6a23c, #f0c070);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }

    .reminder-content {
      flex: 1;

      h4 {
        font-size: 14px;
        margin-bottom: 4px;
        color: #333;
      }

      p {
        font-size: 12px;
        color: #666;
        margin-bottom: 4px;
      }

      .reminder-time {
        font-size: 11px;
        color: #999;
      }
    }
  }
}
</style>
