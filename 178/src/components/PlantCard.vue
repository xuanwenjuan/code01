<template>
  <div class="plant-card" @click="goDetail">
    <div class="card-image">
      <img :src="plant.image" :alt="plant.name" loading="lazy" />
      <div class="card-badges">
        <span v-if="plant.isHot" class="badge hot">热销</span>
        <span v-if="plant.isNew" class="badge new">新品</span>
      </div>
      <div class="card-actions" @click.stop>
        <el-button
          :icon="isFavorited ? StarFilled : Star"
          :type="isFavorited ? 'warning' : 'default'"
          circle
          size="small"
          class="favorite-btn"
          @click="handleFavorite"
        />
      </div>
    </div>
    <div class="card-content">
      <h3 class="plant-name">{{ plant.name }}</h3>
      <p class="plant-category">{{ plant.categoryName }}</p>
      <p class="plant-desc">{{ plant.description }}</p>
      <div class="card-footer">
        <div class="price-section">
          <span class="current-price">¥{{ plant.price }}</span>
          <span class="original-price" v-if="plant.originalPrice">¥{{ plant.originalPrice }}</span>
        </div>
        <div class="sales-section">
          <span class="sales">已售 {{ plant.sales }}</span>
          <div class="rating">
            <el-rate v-model="plant.rating" disabled show-score text-color="#ff9900" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { Star, StarFilled } from '@element-plus/icons-vue'

const props = defineProps({
  plant: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const orderStore = useOrderStore()
const userStore = useUserStore()

const isFavorited = computed(() => orderStore.isFavorite(props.plant.id))

const goDetail = () => {
  router.push(`/plant/${props.plant.id}`)
}

const handleFavorite = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  if (isFavorited.value) {
    const favorite = orderStore.userFavorites.find(f => f.plantId === props.plant.id)
    if (favorite) {
      orderStore.removeFavorite(favorite.id)
      ElMessage.success('已取消收藏')
    }
  } else {
    orderStore.addFavorite(props.plant.id, {
      name: props.plant.name,
      image: props.plant.image,
      price: props.plant.price
    })
    ElMessage.success('收藏成功')
  }
}
</script>

<style scoped>
.plant-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
}

.plant-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.card-image {
  position: relative;
  width: 100%;
  padding-top: 100%;
  overflow: hidden;
}

.card-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.plant-card:hover .card-image img {
  transform: scale(1.05);
}

.card-badges {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  gap: 6px;
}

.badge {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  color: #fff;
}

.badge.hot {
  background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
}

.badge.new {
  background: linear-gradient(135deg, #4caf50, #45a049);
}

.card-actions {
  position: absolute;
  top: 10px;
  right: 10px;
}

.favorite-btn {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
}

.card-content {
  padding: 15px;
}

.plant-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 0 0 6px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.plant-category {
  font-size: 12px;
  color: #4caf50;
  margin: 0 0 8px 0;
}

.plant-desc {
  font-size: 13px;
  color: #666;
  margin: 0 0 12px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-section {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.current-price {
  font-size: 20px;
  font-weight: bold;
  color: #f56c6c;
}

.original-price {
  font-size: 13px;
  color: #999;
  text-decoration: line-through;
}

.sales-section {
  text-align: right;
}

.sales {
  display: block;
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.rating :deep(.el-rate) {
  font-size: 12px;
}
</style>
