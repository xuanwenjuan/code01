<template>
  <div class="page-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="flex-between">
            <div>
              <p class="stat-label">总客房数</p>
              <p class="stat-value">{{ hotelStore.statistics.totalRooms }}</p>
              <p class="stat-desc">间客房</p>
            </div>
            <div class="stat-icon icon-primary">
              <el-icon><OfficeBuilding /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="flex-between">
            <div>
              <p class="stat-label">空闲客房</p>
              <p class="stat-value" style="color: #67c23a">{{ hotelStore.statistics.vacantRooms }}</p>
              <p class="stat-desc">可立即入住</p>
            </div>
            <div class="stat-icon icon-success">
              <el-icon><CircleCheck /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="flex-between">
            <div>
              <p class="stat-label">入住中</p>
              <p class="stat-value" style="color: #409eff">{{ hotelStore.statistics.occupiedRooms }}</p>
              <p class="stat-desc">在住客人</p>
            </div>
            <div class="stat-icon icon-info">
              <el-icon><User /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="flex-between">
            <div>
              <p class="stat-label">今日营收</p>
              <p class="stat-value" style="color: #f56c6c">¥{{ hotelStore.statistics.todayRevenue.toLocaleString() }}</p>
              <p class="stat-desc">预估营业额</p>
            </div>
            <div class="stat-icon icon-warning">
              <el-icon><Money /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="flex-between">
              <span style="font-weight: 600; font-size: 16px">房态分布</span>
            </div>
          </template>
          <div class="room-status-chart">
            <div class="status-item">
              <div class="status-bar vacant" :style="{ width: vacantPercent + '%' }"></div>
              <div class="status-info">
                <span class="status-dot" style="background: #67c23a"></span>
                <span>空闲：{{ hotelStore.statistics.vacantRooms }} 间 ({{ vacantPercent }}%)</span>
              </div>
            </div>
            <div class="status-item">
              <div class="status-bar occupied" :style="{ width: occupiedPercent + '%' }"></div>
              <div class="status-info">
                <span class="status-dot" style="background: #409eff"></span>
                <span>入住：{{ hotelStore.statistics.occupiedRooms }} 间 ({{ occupiedPercent }}%)</span>
              </div>
            </div>
            <div class="status-item">
              <div class="status-bar booked" :style="{ width: bookedPercent + '%' }"></div>
              <div class="status-info">
                <span class="status-dot" style="background: #e6a23c"></span>
                <span>预订：{{ hotelStore.statistics.bookedRooms }} 间 ({{ bookedPercent }}%)</span>
              </div>
            </div>
            <div class="status-item">
              <div class="status-bar cleaning" :style="{ width: cleaningPercent + '%' }"></div>
              <div class="status-info">
                <span class="status-dot" style="background: #909399"></span>
                <span>打扫：{{ hotelStore.statistics.cleaningRooms }} 间 ({{ cleaningPercent }}%)</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="flex-between">
              <span style="font-weight: 600; font-size: 16px">待处理事项</span>
            </div>
          </template>
          <div class="pending-list">
            <div class="pending-item" v-if="hotelStore.statistics.pendingCheckinCount > 0">
              <el-icon style="color: #e6a23c; font-size: 20px"><Clock /></el-icon>
              <div class="pending-content">
                <p class="pending-title">待入住订单</p>
                <p class="pending-desc">有 {{ hotelStore.statistics.pendingCheckinCount }} 个预订等待办理入住</p>
              </div>
              <el-button type="primary" size="small" @click="goToOrders">查看</el-button>
            </div>
            <div class="pending-item" v-if="hotelStore.statistics.overdueCount > 0">
              <el-icon style="color: #f56c6c; font-size: 20px"><Warning /></el-icon>
              <div class="pending-content">
                <p class="pending-title">超时退房预警</p>
                <p class="pending-desc">有 {{ hotelStore.statistics.overdueCount }} 个订单超时未退房</p>
              </div>
              <el-button type="danger" size="small" @click="goToOrders">处理</el-button>
            </div>
            <div class="pending-item" v-if="hotelStore.statistics.cleaningRooms > 0">
              <el-icon style="color: #909399; font-size: 20px"><Brush /></el-icon>
              <div class="pending-content">
                <p class="pending-title">待清洁房间</p>
                <p class="pending-desc">有 {{ hotelStore.statistics.cleaningRooms }} 间客房正在等待清洁</p>
              </div>
              <el-button type="info" size="small" @click="goToRooms">查看</el-button>
            </div>
            <div class="pending-item empty" v-if="
              hotelStore.statistics.pendingCheckinCount === 0 &&
              hotelStore.statistics.overdueCount === 0 &&
              hotelStore.statistics.cleaningRooms === 0
            ">
              <el-icon style="color: #67c23a; font-size: 20px"><CircleCheck /></el-icon>
              <div class="pending-content">
                <p class="pending-title">一切正常</p>
                <p class="pending-desc">当前没有待处理事项</p>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="flex-between">
              <span style="font-weight: 600; font-size: 16px">最近操作记录</span>
              <el-button type="primary" link size="small" @click="goToLogs">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentLogs" stripe style="width: 100%">
            <el-table-column prop="action" label="操作类型" width="120">
              <template #default="{ row }">
                <el-tag :type="getLogTagType(row.action)">{{ row.action }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="targetName" label="操作对象" width="200" />
            <el-table-column prop="details" label="详情" />
            <el-table-column prop="operator" label="操作人" width="120" />
            <el-table-column prop="timestamp" label="时间" width="180">
              <template #default="{ row }">
                {{ formatDateTime(row.timestamp) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { OperationAction } from '@/types'
import { formatDateTime } from '@/utils'
import { useHotelStore } from '@/stores/hotel'

const router = useRouter()
const hotelStore = useHotelStore()

onMounted(() => {
  hotelStore.checkOverdueOrders()
})

const vacantPercent = computed(() => {
  if (hotelStore.statistics.totalRooms === 0) return 0
  return Math.round((hotelStore.statistics.vacantRooms / hotelStore.statistics.totalRooms) * 100)
})

const occupiedPercent = computed(() => {
  if (hotelStore.statistics.totalRooms === 0) return 0
  return Math.round((hotelStore.statistics.occupiedRooms / hotelStore.statistics.totalRooms) * 100)
})

const bookedPercent = computed(() => {
  if (hotelStore.statistics.totalRooms === 0) return 0
  return Math.round((hotelStore.statistics.bookedRooms / hotelStore.statistics.totalRooms) * 100)
})

const cleaningPercent = computed(() => {
  if (hotelStore.statistics.totalRooms === 0) return 0
  return Math.round((hotelStore.statistics.cleaningRooms / hotelStore.statistics.totalRooms) * 100)
})

const recentLogs = computed(() => hotelStore.operationLogs.slice(0, 5))

const getLogTagType = (
  action: string
): 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    [OperationAction.CHECK_IN]: 'success',
    [OperationAction.CHECK_OUT]: 'info',
    [OperationAction.FORCE_CHECK_OUT]: 'danger',
    [OperationAction.CREATE_BOOKING]: 'success',
    [OperationAction.CANCEL_BOOKING]: 'warning',
    [OperationAction.ROOM_STATUS_CHANGE]: 'primary',
    [OperationAction.PRICE_ADJUST]: 'warning',
    [OperationAction.ROOM_TYPE_UPDATE]: 'warning',
    [OperationAction.ROOM_TYPE_DELETE]: 'danger',
    [OperationAction.ROOM_TYPE_ADD]: 'success',
    [OperationAction.GUEST_INFO_UPDATE]: 'primary'
  }
  return typeMap[action] || 'info'
}

const goToOrders = () => {
  router.push('/orders')
}

const goToRooms = () => {
  router.push('/rooms')
}

const goToLogs = () => {
  router.push('/operation-logs')
}
</script>

<style lang="scss" scoped>
.stat-card {
  :deep(.el-card__body) {
    padding: 24px;
  }

  .stat-label {
    font-size: 14px;
    color: #909399;
    margin-bottom: 8px;
  }

  .stat-value {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 4px;
    color: #303133;
  }

  .stat-desc {
    font-size: 12px;
    color: #c0c4cc;
  }
}

.room-status-chart {
  .status-item {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .status-bar {
    height: 12px;
    border-radius: 6px;
    margin-bottom: 8px;
    transition: width 0.5s ease;

    &.vacant {
      background: linear-gradient(90deg, #67c23a, #85ce61);
    }

    &.occupied {
      background: linear-gradient(90deg, #409eff, #79bbff);
    }

    &.booked {
      background: linear-gradient(90deg, #e6a23c, #ebb563);
    }

    &.cleaning {
      background: linear-gradient(90deg, #909399, #a6a9ad);
    }
  }

  .status-info {
    display: flex;
    align-items: center;
    gap: 8px;

    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    span {
      font-size: 14px;
      color: #606266;
    }
  }
}

.pending-list {
  .pending-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 8px;
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }

    &.empty {
      background: #f0f9eb;
      border: 1px solid #e1f3d8;
    }

    .pending-content {
      flex: 1;

      .pending-title {
        font-size: 15px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 4px;
      }

      .pending-desc {
        font-size: 13px;
        color: #909399;
      }
    }
  }
}
</style>
