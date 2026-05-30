<template>
  <div class="favorites-list">
    <div class="favorites-grid" v-loading="orderStore.loading">
      <div
        v-for="item in orderStore.userFavorites"
        :key="item.id"
        class="favorite-item"
      >
        <div class="favorite-card" @click="goDetail(item.plantId)">
          <img :src="item.plantInfo.image" :alt="item.plantInfo.name" class="favorite-img" />
          <div class="favorite-info">
            <h4 class="favorite-name">{{ item.plantInfo.name }}</h4>
            <p class="favorite-price">¥{{ item.plantInfo.price }}</p>
            <div class="favorite-time">
              <el-icon><Clock /></el-icon>
              {{ formatDate(item.createdAt) }}
            </div>
          </div>
        </div>
        <div class="favorite-actions">
          <el-button type="primary" size="small" @click="goDetail(item.plantId)">
            查看详情
          </el-button>
          <el-button size="small" @click="handleRemove(item.id)">
            取消收藏
          </el-button>
        </div>
      </div>
    </div>

    <EmptyState
      v-if="!orderStore.loading && orderStore.userFavorites.length === 0"
      description="暂无收藏"
      show-action
      action-text="去收藏"
      @action="$router.push('/')"
    />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDate } from '@/utils/validate'
import EmptyState from '@/components/EmptyState.vue'

const router = useRouter()
const orderStore = useOrderStore()

const goDetail = (plantId) => {
  router.push(`/plant/${plantId}`)
}

const handleRemove = (id) => {
  ElMessageBox.confirm('确认取消收藏吗？', '确认提示', {
    confirmButtonText: '确定',
    cancelButtonText: '再想想',
    type: 'warning'
  }).then(() => {
    const result = orderStore.removeFavorite(id)
    if (result.success) {
      ElMessage.success(result.message)
    }
  }).catch(() => {})
}

onMounted(() => {
  orderStore.fetchFavorites()
})
</script>

<style scoped>
.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.favorite-item {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.favorite-card {
  cursor: pointer;
}

.favorite-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.favorite-info {
  padding: 15px;
}

.favorite-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.favorite-price {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: bold;
  color: #f56c6c;
}

.favorite-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #999;
}

.favorite-actions {
  display: flex;
  gap: 10px;
  padding: 10px 15px 15px;
}

.favorite-actions .el-button {
  flex: 1;
}
</style>
