<template>
  <div class="appointments-page">
    <div class="section-card">
      <div class="card-header">
        <div class="card-title">预约记录</div>
        <div class="filter-tabs">
          <span
            class="tab-item"
            :class="{ active: activeTab === 'all' }"
            @click="activeTab = 'all'"
          >全部</span>
          <span
            class="tab-item"
            :class="{ active: activeTab === 'pending' }"
            @click="activeTab = 'pending'"
          >待处理</span>
          <span
            class="tab-item"
            :class="{ active: activeTab === 'confirmed' }"
            @click="activeTab = 'confirmed'"
          >已确认</span>
          <span
            class="tab-item"
            :class="{ active: activeTab === 'cancelled' }"
            @click="activeTab = 'cancelled'"
          >已取消</span>
        </div>
      </div>

      <div v-if="filteredAppointments.length > 0" class="appointment-list">
        <div v-for="item in filteredAppointments" :key="item.id" class="appointment-item">
          <div class="item-left">
            <img :src="item.houseImage" :alt="item.houseTitle" />
          </div>
          <div class="item-center">
            <h3 class="item-title text-ellipsis">{{ item.houseTitle }}</h3>
            <div class="item-info">
              <span class="price">
                <span class="price-value">{{ item.price }}</span>
                <span class="price-unit">元/月</span>
              </span>
            </div>
            <div class="appointment-info">
              <div class="info-row">
                <el-icon><User /></el-icon>
                <span>联系人：{{ item.name }}</span>
              </div>
              <div class="info-row">
                <el-icon><Phone /></el-icon>
                <span>联系电话：{{ item.phone }}</span>
              </div>
              <div class="info-row">
                <el-icon><Calendar /></el-icon>
                <span>预约日期：{{ formatDate(item.date) }}</span>
              </div>
              <div class="info-row">
                <el-icon><Clock /></el-icon>
                <span>预约时间：{{ formatTime(item.time) }}</span>
              </div>
              <div v-if="item.remark" class="info-row">
                <el-icon><Edit /></el-icon>
                <span>备注：{{ item.remark }}</span>
              </div>
            </div>
          </div>
          <div class="item-right">
            <el-tag
              :type="getStatusType(item.status)"
              size="large"
              effect="light"
            >{{ getStatusText(item.status) }}</el-tag>
            <div class="item-actions" v-if="item.status === 'pending'">
              <el-button type="danger" text @click="handleCancel(item)">取消预约</el-button>
            </div>
            <div class="create-time">
              提交时间：{{ formatDateTime(item.createTime) }}
            </div>
          </div>
        </div>
      </div>

      <EmptyState
        v-else
        description="暂无预约记录"
        show-action
        action-text="去预约看房"
        @action="goHouseList"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { formatDate, formatDateTime } from '@/utils/format'
import { ElMessage, ElMessageBox } from 'element-plus'
import EmptyState from '@/components/EmptyState.vue'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('all')

const filteredAppointments = computed(() => {
  if (activeTab.value === 'all') {
    return userStore.appointments
  }
  return userStore.appointments.filter((item) => item.status === activeTab.value)
})

const getStatusType = (status) => {
  switch (status) {
    case 'pending':
      return 'warning'
    case 'confirmed':
      return 'success'
    case 'cancelled':
      return 'info'
    default:
      return 'info'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'pending':
      return '待处理'
    case 'confirmed':
      return '已确认'
    case 'cancelled':
      return '已取消'
    default:
      return status
  }
}

const formatTime = (time) => {
  const timeMap = {
    morning: '上午 9:00-12:00',
    afternoon: '下午 14:00-18:00',
    evening: '晚上 19:00-21:00'
  }
  return timeMap[time] || time
}

const goHouseList = () => {
  router.push('/house/list')
}

const handleCancel = (item) => {
  ElMessageBox.confirm('确定要取消该预约吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.cancelAppointment(item.id)
    ElMessage.success('已取消预约')
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.appointments-page {
  .section-card {
    background: #fff;
    border-radius: 8px;
    padding: 24px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid #f5f7fa;

      .card-title {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
        margin: 0;
      }

      .filter-tabs {
        display: flex;
        gap: 20px;

        .tab-item {
          font-size: 14px;
          color: #606266;
          cursor: pointer;
          transition: color 0.2s;
          position: relative;

          &:hover,
          &.active {
            color: #409eff;
          }

          &.active::after {
            content: '';
            position: absolute;
            bottom: -8px;
            left: 0;
            right: 0;
            height: 2px;
            background: #409eff;
            border-radius: 2px;
          }
        }
      }
    }

    .appointment-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .appointment-item {
      display: flex;
      gap: 16px;
      padding: 16px;
      border: 1px solid #f0f0f0;
      border-radius: 8px;
      transition: all 0.2s;

      &:hover {
        border-color: #dcdfe6;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      }

      .item-left {
        width: 160px;
        height: 120px;
        flex-shrink: 0;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 6px;
        }
      }

      .item-center {
        flex: 1;
        min-width: 0;

        .item-title {
          font-size: 16px;
          font-weight: 500;
          color: #303133;
          margin: 0 0 8px 0;
        }

        .item-info {
          margin-bottom: 12px;

          .price {
            .price-value {
              font-size: 20px;
              font-weight: 600;
              color: #f56c6c;
            }

            .price-unit {
              font-size: 13px;
              color: #909399;
            }
          }
        }

        .appointment-info {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;

          .info-row {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            color: #606266;

            .el-icon {
              color: #909399;
            }
          }
        }
      }

      .item-right {
        width: 140px;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        border-left: 1px solid #f0f0f0;
        padding-left: 16px;

        .create-time {
          font-size: 12px;
          color: #c0c4cc;
        }
      }
    }
  }
}
</style>
