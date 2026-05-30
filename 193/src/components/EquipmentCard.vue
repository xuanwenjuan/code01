<template>
  <el-card class="equipment-card card-hover" @click="goDetail">
    <div class="card-image">
      <img :src="equipment.image" :alt="equipment.name" />
      <div class="card-tags">
        <span v-for="tag in displayTags" :key="tag" :class="getTagClass(tag)">
          {{ tag }}
        </span>
      </div>
      <div class="favorite-btn" @click.stop="toggleFavorite">
        <el-icon :size="20" :color="isFavorited ? '#f56c6c' : '#c0c4cc'">
          <StarFilled v-if="isFavorited" />
          <Star v-else />
        </el-icon>
      </div>
    </div>
    <div class="card-content">
      <h3 class="card-title">{{ equipment.name }}</h3>
      <p class="card-desc">{{ equipment.description }}</p>
      <div class="card-info">
        <div class="price-section">
          <span class="price">¥{{ equipment.price }}</span>
          <span class="original-price">¥{{ equipment.originalPrice }}</span>
        </div>
        <div class="sales-info">
          <el-rate v-model="equipment.rating" disabled :size="12" />
          <span class="sales">已售{{ equipment.sales }}</span>
        </div>
      </div>
      <div class="card-footer">
        <span class="supplier">{{ equipment.supplier }}</span>
        <span class="stock">库存: {{ equipment.stock }}</span>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useFavoriteStore } from '@/stores/favorite'
import { ElMessage } from 'element-plus'
import { Star, StarFilled } from '@element-plus/icons-vue'

const props = defineProps({
  equipment: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const userStore = useUserStore()
const favoriteStore = useFavoriteStore()

const displayTags = computed(() => 
  props.equipment.tags.filter(tag => ['热销', '新品', '精选'].includes(tag))
)

const isFavorited = computed(() => favoriteStore.isFavorite(props.equipment.id))

function getTagClass(tag) {
  const classMap = {
    '热销': 'tag tag-hot',
    '新品': 'tag tag-new',
    '精选': 'tag tag-selected'
  }
  return classMap[tag] || 'tag'
}

function goDetail() {
  router.push(`/equipment/${props.equipment.id}`)
}

function toggleFavorite() {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  favoriteStore.toggleFavorite(props.equipment)
  ElMessage.success(isFavorited.value ? '已收藏' : '已取消收藏')
}
</script>

<style scoped>
.equipment-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 8px;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.equipment-card:hover .card-image img {
  transform: scale(1.05);
}

.card-tags {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  gap: 4px;
}

.favorite-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.favorite-btn:hover {
  transform: scale(1.1);
}

.card-content {
  flex: 1;
  padding: 16px 0 0 0;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-desc {
  font-size: 12px;
  color: #909399;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.card-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.price-section {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.price {
  font-size: 20px;
  color: #f56c6c;
  font-weight: bold;
}

.original-price {
  font-size: 12px;
  color: #c0c4cc;
  text-decoration: line-through;
}

.sales-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sales {
  font-size: 12px;
  color: #909399;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}
</style>
