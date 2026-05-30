<template>
  <div class="favorites-page">
    <div class="section-card">
      <div class="card-header">
        <div class="card-title">我的收藏</div>
        <el-button v-if="userStore.favorites.length > 0" type="danger" text @click="handleClearAll">
          清空收藏
        </el-button>
      </div>

      <div v-if="userStore.favorites.length > 0" class="house-grid">
        <div v-for="house in userStore.favorites" :key="house.id" class="house-item">
          <HouseCard :house="house" />
          <div class="item-actions">
            <el-button type="danger" text @click="handleRemove(house)">
              <el-icon><Delete /></el-icon>
              取消收藏
            </el-button>
          </div>
        </div>
      </div>

      <EmptyState
        v-else
        description="您还没有收藏任何房源"
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
import { ElMessage, ElMessageBox } from 'element-plus'
import HouseCard from '@/components/HouseCard.vue'
import EmptyState from '@/components/EmptyState.vue'

const router = useRouter()
const userStore = useUserStore()

const goHouseList = () => {
  router.push('/house/list')
}

const handleRemove = (house) => {
  ElMessageBox.confirm('确定要取消收藏该房源吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.toggleFavorite(house)
    ElMessage.success('已取消收藏')
  }).catch(() => {})
}

const handleClearAll = () => {
  ElMessageBox.confirm('确定要清空所有收藏吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.favorites.forEach((house) => {
      userStore.toggleFavorite(house)
    })
    ElMessage.success('已清空收藏')
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.favorites-page {
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

      .item-actions {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 10;
      }
    }
  }
}
</style>
