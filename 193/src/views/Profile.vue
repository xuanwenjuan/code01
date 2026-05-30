<template>
  <div class="profile-page">
    <div class="container">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="profile-card">
            <div class="user-info">
              <el-avatar :size="80" :src="userStore.user?.avatar" />
              <h3>{{ userStore.user?.name }}</h3>
              <el-tag :type="userStore.isSupplier ? 'success' : 'primary'">
                {{ userStore.isSupplier ? '供货商' : '采购方' }}
              </el-tag>
              <p v-if="userStore.isBuyer" class="institution">
                {{ userStore.user?.institution }}
              </p>
              <p v-else class="institution">
                {{ userStore.user?.company }}
              </p>
            </div>
            <el-menu :default-active="activeMenu" class="profile-menu" @select="handleMenuSelect">
              <el-menu-item index="info">
                <el-icon><User /></el-icon>
                <span>个人信息</span>
              </el-menu-item>
              <el-menu-item index="orders">
                <el-icon><List /></el-icon>
                <span>我的订单</span>
              </el-menu-item>
              <el-menu-item index="favorites">
                <el-icon><StarFilled /></el-icon>
                <span>我的收藏</span>
              </el-menu-item>
              <el-menu-item index="statistics">
                <el-icon><DataAnalysis /></el-icon>
                <span>使用统计</span>
              </el-menu-item>
              <el-menu-item v-if="userStore.isSupplier" index="supplier">
                <el-icon><Management /></el-icon>
                <span>供货商管理</span>
              </el-menu-item>
              <el-menu-item v-if="userStore.isBuyer" index="alerts">
                <el-icon><Bell /></el-icon>
                <span>补货提醒</span>
                <el-badge :value="statisticsStore.activeLowStockAlerts.length" class="menu-badge" />
              </el-menu-item>
            </el-menu>
          </el-card>
        </el-col>

        <el-col :span="18">
          <el-card v-show="activeMenu === 'info'">
            <template #header>
              <div class="card-header">
                <span>个人信息</span>
              </div>
            </template>
            <el-form :model="profileForm" label-width="100px">
              <el-form-item label="姓名">
                <el-input v-model="profileForm.name" />
              </el-form-item>
              <el-form-item label="手机号">
                <el-input v-model="profileForm.phone" />
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input v-model="profileForm.email" />
              </el-form-item>
              <el-form-item v-if="userStore.isBuyer" label="单位">
                <el-input v-model="profileForm.institution" />
              </el-form-item>
              <el-form-item v-else label="公司">
                <el-input v-model="profileForm.company" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveProfile">保存修改</el-button>
              </el-form-item>
            </el-form>
          </el-card>

          <el-card v-show="activeMenu === 'orders'">
            <template #header>
              <div class="card-header">
                <span>我的订单</span>
                <el-button type="primary" size="small" @click="goOrders">查看全部</el-button>
              </div>
            </template>
            <div v-if="recentOrders.length > 0">
              <el-table :data="recentOrders" style="width: 100%">
                <el-table-column prop="orderNo" label="订单号" width="200" />
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
                <el-table-column prop="status" label="状态" width="120">
                  <template #default="{ row }">
                    <el-tag :type="getStatusType(row.status)">
                      {{ getStatusText(row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="createdAt" label="下单时间" width="200">
                  <template #default="{ row }">
                    {{ formatDate(row.createdAt) }}
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <EmptyState v-else text="暂无订单" type="order" />
          </el-card>

          <el-card v-show="activeMenu === 'favorites'">
            <template #header>
              <div class="card-header">
                <span>我的收藏</span>
                <el-button type="primary" size="small" @click="goFavorites">查看全部</el-button>
              </div>
            </template>
            <div v-if="favoriteStore.favorites.length > 0">
              <el-row :gutter="20">
                <el-col :span="8" v-for="item in favoriteStore.favorites.slice(0, 3)" :key="item.id">
                  <EquipmentCard :equipment="getEquipment(item.id)" />
                </el-col>
              </el-row>
            </div>
            <EmptyState v-else text="暂无收藏" type="favorite" />
          </el-card>

          <el-card v-show="activeMenu === 'statistics'">
            <template #header>
              <div class="card-header">
                <span>器材使用频次统计</span>
              </div>
            </template>
            <div class="statistics-content">
              <el-row :gutter="20" class="stats-cards">
                <el-col :span="8">
                  <div class="stat-card total">
                    <el-icon :size="32"><TrendCharts /></el-icon>
                    <div class="stat-info">
                      <p class="stat-value">{{ statisticsStore.totalUsageCount }}</p>
                      <p class="stat-label">总使用次数</p>
                    </div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="stat-card types">
                    <el-icon :size="32"><Box /></el-icon>
                    <div class="stat-info">
                      <p class="stat-value">{{ statisticsStore.usageStatistics.length }}</p>
                      <p class="stat-label">器材种类</p>
                    </div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="stat-card favorite">
                    <el-icon :size="32"><Star /></el-icon>
                    <div class="stat-info">
                      <p class="stat-value">{{ favoriteStore.favorites.length }}</p>
                      <p class="stat-label">收藏器材</p>
                    </div>
                  </div>
                </el-col>
              </el-row>

              <h3 class="section-title">使用频次排行</h3>
              <div v-if="statisticsStore.topUsedEquipments.length > 0">
                <el-table :data="statisticsStore.topUsedEquipments" style="width: 100%">
                  <el-table-column prop="name" label="器材名称" />
                  <el-table-column prop="count" label="使用次数" width="120" align="center">
                    <template #default="{ row }">
                      <el-tag type="primary">{{ row.count }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="lastUsed" label="最近使用" width="200">
                    <template #default="{ row }">
                      {{ formatDate(row.lastUsed) }}
                    </template>
                  </el-table-column>
                  <el-table-column label="使用占比" width="200">
                    <template #default="{ row }">
                      <el-progress 
                        :percentage="Math.round((row.count / statisticsStore.totalUsageCount) * 100)" 
                        :stroke-width="12"
                      />
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <EmptyState v-else text="暂无使用记录" type="product" />
            </div>
          </el-card>

          <el-card v-show="activeMenu === 'alerts'">
            <template #header>
              <div class="card-header">
                <span>补货提醒</span>
                <el-button type="primary" size="small" @click="addAlert">
                  <el-icon><Plus /></el-icon>
                  添加提醒
                </el-button>
              </div>
            </template>
            <div v-if="statisticsStore.activeLowStockAlerts.length > 0">
              <el-table :data="statisticsStore.activeLowStockAlerts" style="width: 100%">
                <el-table-column prop="equipmentName" label="器材名称" />
                <el-table-column label="库存状态" width="200">
                  <template #default="{ row }">
                    <div class="stock-status">
                      <span class="current">当前库存: <b>{{ row.currentStock }}</b></span>
                      <span class="threshold">阈值: {{ row.threshold }}</span>
                    </div>
                    <el-progress 
                      :percentage="Math.round((row.currentStock / row.threshold) * 100)" 
                      :color="getStockColor(row.currentStock, row.threshold)"
                      :stroke-width="10"
                    />
                  </template>
                </el-table-column>
                <el-table-column prop="createdAt" label="创建时间" width="200">
                  <template #default="{ row }">
                    {{ formatDate(row.createdAt) }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="150" fixed="right">
                  <template #default="{ row }">
                    <el-button size="small" type="success" @click="resolveAlert(row.id)">
                      已补货
                    </el-button>
                    <el-button size="small" type="danger" @click="removeAlert(row.id)">
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <EmptyState v-else text="暂无补货提醒" type="product">
              <template #action>
                <el-button type="primary" @click="addAlert">添加提醒</el-button>
              </template>
            </EmptyState>
          </el-card>

          <el-card v-show="activeMenu === 'supplier' && userStore.isSupplier">
            <template #header>
              <div class="card-header">
                <span>供货商专属功能</span>
              </div>
            </template>
            <div class="supplier-features">
              <el-row :gutter="20">
                <el-col :span="8" v-for="feature in supplierFeatures" :key="feature.id">
                  <div class="feature-card card-hover" @click="handleFeatureClick(feature.id)">
                    <el-icon :size="40" :color="feature.color">
                      <component :is="feature.icon" />
                    </el-icon>
                    <h4>{{ feature.name }}</h4>
                    <p>{{ feature.desc }}</p>
                  </div>
                </el-col>
              </el-row>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-dialog v-model="showAddAlert" title="添加补货提醒" width="500px">
      <el-form :model="alertForm" :rules="alertRules" ref="alertFormRef" label-width="100px">
        <el-form-item label="选择器材" prop="equipmentId">
          <el-select v-model="alertForm.equipmentId" placeholder="请选择器材" style="width: 100%">
            <el-option 
              v-for="item in equipmentStore.equipmentList" 
              :key="item.id" 
              :label="item.name" 
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="当前库存" prop="currentStock">
          <el-input-number v-model="alertForm.currentStock" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="提醒阈值" prop="threshold">
          <el-input-number v-model="alertForm.threshold" :min="1" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddAlert = false">取消</el-button>
        <el-button type="primary" @click="submitAlert">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useOrderStore } from '@/stores/order'
import { useFavoriteStore } from '@/stores/favorite'
import { useEquipmentStore } from '@/stores/equipment'
import { useStatisticsStore } from '@/stores/statistics'
import EmptyState from '@/components/EmptyState.vue'
import EquipmentCard from '@/components/EquipmentCard.vue'
import {
  User, List, StarFilled, Management, DataAnalysis, Bell,
  TrendCharts, Box, Star, Plus, Goods, Files, Setting
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const orderStore = useOrderStore()
const favoriteStore = useFavoriteStore()
const equipmentStore = useEquipmentStore()
const statisticsStore = useStatisticsStore()

const activeMenu = ref('info')
const showAddAlert = ref(false)
const alertFormRef = ref(null)

const profileForm = ref({
  name: '',
  phone: '',
  email: '',
  institution: '',
  company: ''
})

const alertForm = ref({
  equipmentId: null,
  currentStock: 0,
  threshold: 10
})

const alertRules = {
  equipmentId: [{ required: true, message: '请选择器材', trigger: 'change' }],
  currentStock: [{ required: true, message: '请输入当前库存', trigger: 'blur' }],
  threshold: [{ required: true, message: '请输入提醒阈值', trigger: 'blur' }]
}

const supplierFeatures = [
  { id: 'products', name: '商品管理', desc: '管理上架的器材商品', icon: markRaw(Goods), color: '#409eff' },
  { id: 'orders', name: '订单处理', desc: '处理采购订单', icon: markRaw(Files), color: '#67c23a' },
  { id: 'settings', name: '店铺设置', desc: '设置店铺信息', icon: markRaw(Setting), color: '#e6a23c' }
]

const recentOrders = computed(() => orderStore.orders.slice(0, 5))

onMounted(() => {
  if (userStore.user) {
    profileForm.value = {
      name: userStore.user.name || '',
      phone: userStore.user.phone || '',
      email: userStore.user.email || '',
      institution: userStore.user.institution || '',
      company: userStore.user.company || ''
    }
  }
})

function handleMenuSelect(index) {
  activeMenu.value = index
}

function goOrders() {
  router.push('/orders')
}

function goFavorites() {
  router.push('/favorites')
}

function getEquipment(id) {
  return equipmentStore.getEquipmentById(id) || {}
}

function getStatusType(status) {
  const typeMap = {
    pending: 'warning',
    completed: 'success',
    cancelled: 'info',
    verified: 'success'
  }
  return typeMap[status] || 'info'
}

function getStatusText(status) {
  const textMap = {
    pending: '待确认',
    completed: '已完成',
    cancelled: '已取消',
    verified: '已核销'
  }
  return textMap[status] || status
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN')
}

function saveProfile() {
  ElMessage.success('个人信息已保存')
}

function getStockColor(current, threshold) {
  const ratio = current / threshold
  if (ratio <= 0.3) return '#f56c6c'
  if (ratio <= 0.6) return '#e6a23c'
  return '#67c23a'
}

function addAlert() {
  alertForm.value = {
    equipmentId: null,
    currentStock: 0,
    threshold: 10
  }
  showAddAlert.value = true
}

async function submitAlert() {
  if (!alertFormRef.value) return
  
  try {
    await alertFormRef.value.validate()
    
    const equipment = equipmentStore.getEquipmentById(alertForm.value.equipmentId)
    if (equipment) {
      statisticsStore.addLowStockAlert(
        alertForm.value.equipmentId,
        equipment.name,
        alertForm.value.currentStock,
        alertForm.value.threshold
      )
      ElMessage.success('补货提醒已添加')
      showAddAlert.value = false
    }
  } catch (e) {
    console.log('表单验证失败')
  }
}

function resolveAlert(alertId) {
  statisticsStore.resolveLowStockAlert(alertId)
  ElMessage.success('已标记为已补货')
}

function removeAlert(alertId) {
  statisticsStore.removeLowStockAlert(alertId)
  ElMessage.success('已删除提醒')
}

function handleFeatureClick(featureId) {
  if (featureId === 'products') {
    router.push('/supplier')
  } else if (featureId === 'orders') {
    router.push('/supplier')
  } else {
    ElMessage.info('功能开发中')
  }
}
</script>

<style scoped>
.profile-page {
  padding: 20px 0;
}

.profile-card {
  position: sticky;
  top: 100px;
}

.user-info {
  text-align: center;
  padding: 20px 0;
  border-bottom: 1px solid #ebeef5;
}

.user-info h3 {
  margin: 12px 0 8px 0;
  color: #303133;
}

.institution {
  font-size: 12px;
  color: #909399;
  margin: 8px 0 0 0;
}

.profile-menu {
  border-right: none;
}

.menu-badge {
  margin-left: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
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

.statistics-content {
  padding: 10px 0;
}

.stats-cards {
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  border-radius: 12px;
  color: #fff;
}

.stat-card.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card.types {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-card.favorite {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-info .stat-value {
  font-size: 32px;
  font-weight: bold;
  margin: 0;
}

.stat-info .stat-label {
  font-size: 14px;
  opacity: 0.9;
  margin: 4px 0 0 0;
}

.section-title {
  font-size: 16px;
  margin: 0 0 16px 0;
  color: #303133;
}

.stock-status {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
}

.stock-status .current {
  color: #f56c6c;
}

.stock-status .threshold {
  color: #909399;
}

.supplier-features {
  padding: 20px 0;
}

.feature-card {
  text-align: center;
  padding: 40px 20px;
  background: #f5f7fa;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.feature-card h4 {
  font-size: 16px;
  margin: 16px 0 8px 0;
  color: #303133;
}

.feature-card p {
  font-size: 12px;
  color: #909399;
  margin: 0;
}
</style>
