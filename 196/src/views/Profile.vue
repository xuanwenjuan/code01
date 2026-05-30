<template>
  <div class="profile-page">
    <div class="container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item @click="$router.push('/')">首页</el-breadcrumb-item>
        <el-breadcrumb-item>个人中心</el-breadcrumb-item>
      </el-breadcrumb>

      <el-alert
        v-if="maintenanceReminders.length > 0"
        :title="`您有 ${maintenanceReminders.length} 个设备需要近期维护`"
        type="warning"
        show-icon
        :closable="false"
        class="maintenance-alert"
      >
        <template #default>
          <div class="reminder-list">
            <div
              v-for="item in maintenanceReminders"
              :key="item.productId"
              class="reminder-item"
              @click="activeMenu = 'maintenance'"
            >
              <span>{{ item.productName }}</span>
              <span class="reminder-date">
                下次维护：{{ formatDate(item.nextMaintenance) }}
              </span>
            </div>
          </div>
        </template>
      </el-alert>

      <div class="profile-layout">
        <aside class="sidebar">
          <div class="user-card">
            <el-avatar :src="userStore.currentUser.avatar" :size="80" />
            <h3>{{ userStore.currentUser.name }}</h3>
            <el-tag :type="userStore.isBuyer ? 'success' : 'warning'" size="small">
              {{ userStore.isBuyer ? '养蜂场采购方' : '养蜂设备供货商' }}
            </el-tag>
          </div>

          <el-menu
            :default-active="activeMenu"
            class="side-menu"
            @select="handleMenuSelect"
          >
            <el-menu-item index="profile">
              <el-icon><User /></el-icon>
              <span>基本信息</span>
            </el-menu-item>
            <el-menu-item index="orders">
              <el-icon><Tickets /></el-icon>
              <span>我的订单</span>
            </el-menu-item>
            <el-menu-item index="favorites">
              <el-icon><StarFilled /></el-icon>
              <span>我的收藏</span>
            </el-menu-item>
            <el-menu-item index="equipment" v-if="userStore.isBuyer">
              <el-icon><Box /></el-icon>
              <span>设备管理</span>
            </el-menu-item>
            <el-menu-item index="maintenance" v-if="userStore.isBuyer">
              <el-icon><Tools /></el-icon>
              <span>维护记录</span>
              <el-badge
                :value="pendingMaintenanceCount"
                :hidden="pendingMaintenanceCount === 0"
                class="menu-badge"
              />
            </el-menu-item>
            <el-menu-item index="statistics" v-if="userStore.isBuyer">
              <el-icon><DataAnalysis /></el-icon>
              <span>损耗统计</span>
            </el-menu-item>
            <el-menu-item index="products" v-if="userStore.isSupplier">
              <el-icon><Goods /></el-icon>
              <span>商品管理</span>
            </el-menu-item>
            <el-menu-item index="supplierOrders" v-if="userStore.isSupplier">
              <el-icon><List /></el-icon>
              <span>订单管理</span>
            </el-menu-item>
          </el-menu>
        </aside>

        <main class="main-content">
          <StateWrapper :loading="loading">
            <div v-if="activeMenu === 'profile'" class="profile-content">
              <el-card>
                <template #header>
                  <span>基本信息</span>
                  <el-button type="primary" size="small" @click="editMode = !editMode">
                    {{ editMode ? '取消' : '编辑' }}
                  </el-button>
                </template>

                <el-form
                  :model="profileForm"
                  :rules="editMode ? rules : {}"
                  label-width="120px"
                  :disabled="!editMode"
                >
                  <el-form-item label="用户名">
                    <el-input v-model="profileForm.username" disabled />
                  </el-form-item>
                  <el-form-item :label="userStore.isBuyer ? '养蜂场名称' : '公司名称'" prop="name">
                    <el-input v-model="profileForm.name" />
                  </el-form-item>
                  <el-form-item label="手机号" prop="phone">
                    <el-input v-model="profileForm.phone" />
                  </el-form-item>
                  <el-form-item label="邮箱" prop="email">
                    <el-input v-model="profileForm.email" />
                  </el-form-item>
                  <el-form-item label="地址" prop="address">
                    <el-input v-model="profileForm.address" type="textarea" :rows="2" />
                  </el-form-item>
                  <el-form-item v-if="userStore.isBuyer" label="养蜂规模">
                    <el-input v-model="profileForm.farmScale" />
                  </el-form-item>
                  <el-form-item v-if="userStore.isSupplier" label="营业执照">
                    <el-input v-model="profileForm.businessLicense" />
                  </el-form-item>
                  <el-form-item label="注册时间">
                    <el-input v-model="formatDate(profileForm.createdAt)" disabled />
                  </el-form-item>
                  <el-form-item v-if="editMode">
                    <el-button type="primary" @click="saveProfile">保存</el-button>
                    <el-button @click="editMode = false">取消</el-button>
                  </el-form-item>
                </el-form>
              </el-card>
            </div>

            <div v-if="activeMenu === 'orders'" class="orders-content">
              <div class="section-header">
                <h2>我的订单</h2>
                <el-button type="primary" @click="$router.push('/orders')">
                  查看全部
                </el-button>
              </div>
              <OrderList :limit="5" />
            </div>

            <div v-if="activeMenu === 'favorites'" class="favorites-content">
              <div class="section-header">
                <h2>我的收藏</h2>
                <el-button type="primary" @click="$router.push('/favorites')">
                  查看全部
                </el-button>
              </div>
              <FavoriteList :limit="4" />
            </div>

            <div v-if="activeMenu === 'equipment'" class="equipment-content">
              <div class="section-header">
                <h2>我的设备</h2>
              </div>
              <StateWrapper :empty="userEquipment.length === 0" description="暂无设备">
                <div class="equipment-grid">
                  <el-card
                    v-for="item in userEquipment"
                    :key="item.productId"
                    class="equipment-card"
                  >
                    <div class="equipment-header">
                      <h3>{{ item.productName }}</h3>
                      <el-tag :type="item.wearLevel < 20 ? 'success' : item.wearLevel < 50 ? 'warning' : 'danger'">
                        损耗 {{ item.wearLevel }}%
                      </el-tag>
                    </div>
                    <div class="equipment-stats">
                      <div class="stat-item">
                        <span class="label">总数量</span>
                        <span class="value">{{ item.totalQuantity }}件</span>
                      </div>
                      <div class="stat-item">
                        <span class="label">使用中</span>
                        <span class="value">{{ item.inUse }}件</span>
                      </div>
                      <div class="stat-item">
                        <span class="label">可用</span>
                        <span class="value">{{ item.available }}件</span>
                      </div>
                    </div>
                    <div class="equipment-dates">
                      <div class="date-item">
                        <el-icon><Calendar /></el-icon>
                        <span>购入：{{ formatDate(item.purchaseDate) }}</span>
                      </div>
                      <div class="date-item">
                        <el-icon><Service /></el-icon>
                        <span>上次维护：{{ formatDate(item.lastMaintenance) }}</span>
                      </div>
                      <div class="date-item">
                        <el-icon><AlarmClock /></el-icon>
                        <span>下次维护：{{ formatDate(item.nextMaintenance) }}</span>
                      </div>
                    </div>
                    <div class="equipment-actions">
                      <el-button size="small" type="primary" @click="openMaintenanceDialog(item)">
                        <el-icon><Tools /></el-icon>
                        申请维护
                      </el-button>
                    </div>
                    <el-progress
                      :percentage="item.wearLevel"
                      :color="equipmentStore.getWearLevelColor(item.wearLevel)"
                      :stroke-width="8"
                    />
                  </el-card>
                </div>
              </StateWrapper>
            </div>

            <div v-if="activeMenu === 'maintenance'" class="maintenance-content">
              <div class="section-header">
                <h2>维护记录</h2>
              </div>
              <el-tabs v-model="maintenanceTab">
                <el-tab-pane label="待处理" name="pending">
                  <StateWrapper :empty="pendingMaintenance.length === 0" description="暂无待处理维护">
                    <div class="maintenance-list">
                      <el-card
                        v-for="record in pendingMaintenance"
                        :key="record.id"
                        class="maintenance-card"
                      >
                        <div class="maintenance-header">
                          <div class="maintenance-info">
                            <h4>{{ record.productName }}</h4>
                            <el-tag type="warning">待处理</el-tag>
                          </div>
                          <el-tag size="small">
                            {{ equipmentStore.getMaintenanceTypeLabel(record.type) }}
                          </el-tag>
                        </div>
                        <p class="maintenance-desc">{{ record.description }}</p>
                        <div class="maintenance-footer">
                          <span class="maintenance-date">
                            <el-icon><Calendar /></el-icon>
                            计划日期：{{ formatDate(record.date) }}
                          </span>
                          <span class="maintenance-cost" v-if="record.cost > 0">
                            预计费用：¥{{ record.cost }}
                          </span>
                          <el-button type="primary" size="small" @click="completeMaintenance(record.id)">
                            标记完成
                          </el-button>
                        </div>
                      </el-card>
                    </div>
                  </StateWrapper>
                </el-tab-pane>
                <el-tab-pane label="已完成" name="completed">
                  <StateWrapper :empty="completedMaintenance.length === 0" description="暂无已完成维护">
                    <div class="maintenance-list">
                      <el-card
                        v-for="record in completedMaintenance"
                        :key="record.id"
                        class="maintenance-card"
                      >
                        <div class="maintenance-header">
                          <div class="maintenance-info">
                            <h4>{{ record.productName }}</h4>
                            <el-tag type="success">已完成</el-tag>
                          </div>
                          <el-tag size="small">
                            {{ equipmentStore.getMaintenanceTypeLabel(record.type) }}
                          </el-tag>
                        </div>
                        <p class="maintenance-desc">{{ record.description }}</p>
                        <div class="maintenance-footer">
                          <span class="maintenance-date">
                            <el-icon><Calendar /></el-icon>
                            完成日期：{{ formatDate(record.completedAt || record.date) }}
                          </span>
                          <span class="maintenance-cost" v-if="record.cost > 0">
                            费用：¥{{ record.cost }}
                          </span>
                        </div>
                      </el-card>
                    </div>
                  </StateWrapper>
                </el-tab-pane>
              </el-tabs>
            </div>

            <div v-if="activeMenu === 'statistics'" class="statistics-content">
              <div class="section-header">
                <h2>设备使用损耗统计</h2>
              </div>
              <div class="statistics-summary">
                <el-row :gutter="20">
                  <el-col :span="6">
                    <el-card class="stat-card">
                      <div class="stat-card-icon" style="background: #ecf5ff; color: #409eff;">
                        <el-icon :size="32"><Box /></el-icon>
                      </div>
                      <div class="stat-card-info">
                        <p class="stat-card-value">{{ totalEquipmentCount }}</p>
                        <p class="stat-card-label">设备总数</p>
                      </div>
                    </el-card>
                  </el-col>
                  <el-col :span="6">
                    <el-card class="stat-card">
                      <div class="stat-card-icon" style="background: #f0f9eb; color: #67c23a;">
                        <el-icon :size="32"><CircleCheck /></el-icon>
                      </div>
                      <div class="stat-card-info">
                        <p class="stat-card-value">{{ inUseCount }}</p>
                        <p class="stat-card-label">使用中</p>
                      </div>
                    </el-card>
                  </el-col>
                  <el-col :span="6">
                    <el-card class="stat-card">
                      <div class="stat-card-icon" style="background: #fdf6ec; color: #e6a23c;">
                        <el-icon :size="32"><Warning /></el-icon>
                      </div>
                      <div class="stat-card-info">
                        <p class="stat-card-value">{{ highWearCount }}</p>
                        <p class="stat-card-label">高损耗设备</p>
                      </div>
                    </el-card>
                  </el-col>
                  <el-col :span="6">
                    <el-card class="stat-card">
                      <div class="stat-card-icon" style="background: #fef0f0; color: #f56c6c;">
                        <el-icon :size="32"><Tools /></el-icon>
                      </div>
                      <div class="stat-card-info">
                        <p class="stat-card-value">{{ totalMaintenanceCost }}</p>
                        <p class="stat-card-label">维护总费用(元)</p>
                      </div>
                    </el-card>
                  </el-col>
                </el-row>
              </div>
              <el-card class="statistics-detail">
                <template #header>
                  <span>设备损耗明细</span>
                </template>
                <table class="statistics-table">
                  <thead>
                    <tr>
                      <th>设备名称</th>
                      <th>总数量</th>
                      <th>使用中</th>
                      <th>可用</th>
                      <th>损耗率</th>
                      <th>上次维护</th>
                      <th>下次维护</th>
                      <th>状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in userEquipment" :key="item.productId">
                      <td>{{ item.productName }}</td>
                      <td>{{ item.totalQuantity }}件</td>
                      <td>{{ item.inUse }}件</td>
                      <td>{{ item.available }}件</td>
                      <td>
                        <el-progress
                          :percentage="item.wearLevel"
                          :color="equipmentStore.getWearLevelColor(item.wearLevel)"
                          :stroke-width="6"
                        />
                      </td>
                      <td>{{ formatDate(item.lastMaintenance) }}</td>
                      <td>{{ formatDate(item.nextMaintenance) }}</td>
                      <td>
                        <el-tag :type="item.wearLevel < 20 ? 'success' : item.wearLevel < 50 ? 'warning' : 'danger'">
                          {{ item.wearLevel < 20 ? '正常' : item.wearLevel < 50 ? '需关注' : '需更换' }}
                        </el-tag>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </el-card>
            </div>

            <div v-if="activeMenu === 'products'" class="products-content">
              <div class="section-header">
                <h2>商品管理</h2>
                <el-button type="primary">
                  <el-icon><Plus /></el-icon>
                  新增商品
                </el-button>
              </div>
              <el-alert
                title="供货商商品管理功能"
                type="info"
                :closable="false"
                show-icon
              >
                <p>作为供货商，您可以在这里管理您的商品信息，包括新增、编辑、下架商品等操作。</p>
              </el-alert>
              <div class="supplier-placeholder">
                <el-empty description="商品管理功能开发中..." />
              </div>
            </div>

            <div v-if="activeMenu === 'supplierOrders'" class="supplier-orders-content">
              <div class="section-header">
                <h2>订单管理</h2>
              </div>
              <el-alert
                title="供货商订单管理功能"
                type="info"
                :closable="false"
                show-icon
              >
                <p>作为供货商，您可以在这里查看和处理客户的订单，包括发货、物流跟踪等操作。</p>
              </el-alert>
              <div class="supplier-placeholder">
                <el-empty description="订单管理功能开发中..." />
              </div>
            </div>
          </StateWrapper>
        </main>
      </div>
    </div>

    <el-dialog
      v-model="maintenanceDialogVisible"
      title="申请设备维护"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="maintenanceForm" label-width="100px">
        <el-form-item label="设备名称">
          <el-input v-model="maintenanceForm.productName" disabled />
        </el-form-item>
        <el-form-item label="维护类型">
          <el-select v-model="maintenanceForm.type" placeholder="请选择维护类型">
            <el-option label="清洁保养" value="clean" />
            <el-option label="润滑保养" value="lubricate" />
            <el-option label="维修" value="repair" />
            <el-option label="检查" value="check" />
            <el-option label="防腐处理" value="anticorrosion" />
            <el-option label="更换配件" value="replace" />
          </el-select>
        </el-form-item>
        <el-form-item label="维护描述">
          <el-input
            v-model="maintenanceForm.description"
            type="textarea"
            :rows="3"
            placeholder="请描述维护内容..."
          />
        </el-form-item>
        <el-form-item label="计划日期">
          <el-date-picker
            v-model="maintenanceForm.date"
            type="date"
            placeholder="选择计划维护日期"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="预计费用">
          <el-input-number v-model="maintenanceForm.cost" :min="0" :precision="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="maintenanceDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitMaintenance">提交申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore, useEquipmentStore } from '@/stores'
import StateWrapper from '@/components/StateWrapper.vue'
import OrderList from '@/components/OrderList.vue'
import FavoriteList from '@/components/FavoriteList.vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const equipmentStore = useEquipmentStore()

const loading = ref(false)
const editMode = ref(false)
const activeMenu = ref('profile')
const maintenanceTab = ref('pending')
const maintenanceDialogVisible = ref(false)
const currentEquipment = ref(null)

const profileForm = reactive({
  username: '',
  name: '',
  phone: '',
  email: '',
  address: '',
  farmScale: '',
  businessLicense: '',
  createdAt: ''
})

const maintenanceForm = reactive({
  productId: null,
  productName: '',
  type: '',
  description: '',
  date: '',
  cost: 0
})

const userEquipment = computed(() => {
  if (!userStore.currentUser) return []
  return equipmentStore.getEquipmentByUserId(userStore.currentUser.id)
})

const maintenanceRecords = computed(() => {
  if (!userStore.currentUser) return []
  return equipmentStore.getMaintenanceByUserId(userStore.currentUser.id)
})

const pendingMaintenance = computed(() => {
  if (!userStore.currentUser) return []
  return equipmentStore.getPendingMaintenance(userStore.currentUser.id)
})

const completedMaintenance = computed(() => {
  return maintenanceRecords.value.filter(m => m.status === 'completed')
})

const pendingMaintenanceCount = computed(() => pendingMaintenance.value.length)

const maintenanceReminders = computed(() => {
  if (!userStore.currentUser) return []
  return equipmentStore.getMaintenanceReminders(userStore.currentUser.id)
})

const totalEquipmentCount = computed(() => {
  return userEquipment.value.reduce((sum, item) => sum + item.totalQuantity, 0)
})

const inUseCount = computed(() => {
  return userEquipment.value.reduce((sum, item) => sum + item.inUse, 0)
})

const highWearCount = computed(() => {
  return userEquipment.value.filter(item => item.wearLevel >= 30).length
})

const totalMaintenanceCost = computed(() => {
  return maintenanceRecords.value
    .filter(m => m.status === 'completed')
    .reduce((sum, m) => sum + m.cost, 0)
})

const rules = {
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的11位手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入地址', trigger: 'blur' }
  ]
}

function handleMenuSelect(index) {
  activeMenu.value = index
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

function saveProfile() {
  const data = { ...profileForm }
  delete data.username
  delete data.createdAt

  const success = userStore.updateProfile(data)
  if (success) {
    ElMessage.success('保存成功')
    editMode.value = false
  } else {
    ElMessage.error('保存失败')
  }
}

function loadProfile() {
  if (userStore.currentUser) {
    Object.assign(profileForm, userStore.currentUser)
  }
}

function openMaintenanceDialog(equipment) {
  currentEquipment.value = equipment
  maintenanceForm.productId = equipment.productId
  maintenanceForm.productName = equipment.productName
  maintenanceForm.type = ''
  maintenanceForm.description = ''
  maintenanceForm.date = ''
  maintenanceForm.cost = 0
  maintenanceDialogVisible.value = true
}

function submitMaintenance() {
  if (!maintenanceForm.type || !maintenanceForm.description || !maintenanceForm.date) {
    ElMessage.warning('请填写完整的维护信息')
    return
  }
  
  equipmentStore.addMaintenanceRecord({
    userId: userStore.currentUser.id,
    productId: maintenanceForm.productId,
    productName: maintenanceForm.productName,
    type: maintenanceForm.type,
    description: maintenanceForm.description,
    date: maintenanceForm.date,
    cost: maintenanceForm.cost
  })
  
  ElMessage.success('维护申请已提交')
  maintenanceDialogVisible.value = false
}

function completeMaintenance(recordId) {
  equipmentStore.completeMaintenance(recordId)
  ElMessage.success('维护已标记为完成')
}

onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  loadProfile()
})

watch(() => userStore.currentUser, () => {
  loadProfile()
}, { deep: true })
</script>

<style lang="scss" scoped>
.profile-page {
  padding: 20px 0;

  .breadcrumb {
    margin-bottom: 20px;
  }

  .maintenance-alert {
    margin-bottom: 20px;

    .reminder-list {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 8px;

      .reminder-item {
        background: rgba(230, 162, 60, 0.1);
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 12px;
        transition: all 0.3s;

        &:hover {
          background: rgba(230, 162, 60, 0.2);
        }

        .reminder-date {
          font-size: 12px;
          color: var(--text-secondary);
        }
      }
    }
  }

  .profile-layout {
    display: flex;
    gap: 24px;
  }

  .sidebar {
    width: 240px;
    flex-shrink: 0;

    .user-card {
      background: #fff;
      border-radius: 8px;
      padding: 24px;
      text-align: center;
      margin-bottom: 16px;

      h3 {
        margin: 12px 0 8px;
      }
    }

    .side-menu {
      border-right: none;

      :deep(.el-menu-item) {
        position: relative;

        .menu-badge {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
        }
      }
    }
  }

  .main-content {
    flex: 1;
    min-width: 0;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      h2 {
        margin: 0;
        font-size: 20px;
      }
    }
  }

  .equipment-content {
    .equipment-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;

      .equipment-card {
        .equipment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;

          h3 {
            margin: 0;
            font-size: 16px;
          }
        }

        .equipment-stats {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;

          .stat-item {
            text-align: center;

            .label {
              display: block;
              font-size: 12px;
              color: var(--text-secondary);
              margin-bottom: 4px;
            }

            .value {
              font-size: 18px;
              font-weight: 600;
              color: var(--primary-color);
            }
          }
        }

        .equipment-dates {
          margin-bottom: 16px;

          .date-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: var(--text-secondary);
            margin-bottom: 6px;

            &:last-child {
              margin-bottom: 0;
            }
          }
        }

        .equipment-actions {
          margin-bottom: 16px;
        }
      }
    }
  }

  .maintenance-content {
    .maintenance-list {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .maintenance-card {
        .maintenance-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;

          .maintenance-info {
            display: flex;
            align-items: center;
            gap: 12px;

            h4 {
              margin: 0;
              font-size: 15px;
            }
          }
        }

        .maintenance-desc {
          color: var(--text-regular);
          margin-bottom: 12px;
          line-height: 1.6;
        }

        .maintenance-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .maintenance-date {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            color: var(--text-secondary);
          }

          .maintenance-cost {
            color: var(--primary-color);
            font-weight: 500;
          }
        }
      }
    }
  }

  .statistics-content {
    .statistics-summary {
      margin-bottom: 24px;

      .stat-card {
        display: flex;
        align-items: center;
        gap: 16px;

        .stat-card-icon {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-card-info {
          .stat-card-value {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            color: var(--text-primary);
          }

          .stat-card-label {
            margin: 4px 0 0;
            font-size: 13px;
            color: var(--text-secondary);
          }
        }
      }
    }

    .statistics-detail {
      .statistics-table {
        width: 100%;
        border-collapse: collapse;

        th,
        td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid #f0f0f0;
        }

        th {
          background: #f8f9fa;
          font-weight: 500;
          color: var(--text-regular);
        }

        tr:last-child td {
          border-bottom: none;
        }
      }
    }
  }

  .supplier-placeholder {
    padding: 40px 0;
  }
}
</style>
