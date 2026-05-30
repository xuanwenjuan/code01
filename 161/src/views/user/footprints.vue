<template>
  <div class="footprints-page">
    <div class="section-card">
      <div class="card-header">
        <div class="card-title">浏览足迹</div>
        <el-button v-if="userStore.footprints.length > 0" type="danger" text @click="handleClearAll">
          清空足迹
        </el-button>
      </div>

      <div v-if="userStore.footprints.length > 0" class="house-grid">
        <div v-for="house in userStore.footprints" :key="house.id" class="house-item">
          <HouseCard :house="house" />
          <div class="view-time">
            <el-icon><Clock /></el-icon>
            {{ formatRelativeTime(house.viewTime) }}
          </div>
        </div>
      </div>

      <EmptyState
        v-else
        description="暂无浏览记录"
        show-action
        action-text="去看看房源"
        @action="goHouseList"
      />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { formatRelativeTime } from '@/utils/format'
import { ElMessage, ElMessageBox } from 'element-plus'
import HouseCard from '@/components/HouseCard.vue'
import EmptyState from '@/components/EmptyState.vue'

const router = useRouter()
const userStore = useUserStore()

const goHouseList = () => {
  router.push('/house/list')
}

const handleClearAll = () => {
  ElMessageBox.confirm('确定要清空所有浏览足迹吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.clearFootprints()
    ElMessage.success('已清空足迹')
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.footprints-page {
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
    }

    .house-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .house-item {
      position: relative;

      .view-time {
        position: absolute;
        bottom: 10px;
        right: 10px;
        padding: 4px 8px;
        background: rgba(0, 0, 0, 0.6);
        border-radius: 4px;
        color: #fff;
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }
}
</style>
