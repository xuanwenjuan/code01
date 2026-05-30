<template>
  <div class="material-card" @click="goToDetail">
    <div class="card-image">
      <img :src="material.image" :alt="material.name" />
      <div class="card-badge" v-if="material.features && material.features.length > 0">
        {{ material.features[0] }}
      </div>
    </div>
    <div class="card-content">
      <h3 class="card-title">{{ material.name }}</h3>
      <div class="card-supplier">
        <el-icon :size="12" color="#909399"><OfficeBuilding /></el-icon>
        <span>{{ material.supplierName }}</span>
      </div>
      <div class="card-tags">
        <span v-for="tag in (material.suitableStyles || []).slice(0, 2)" :key="tag" class="tag">
          {{ tag }}
        </span>
      </div>
      <div class="card-footer">
        <div class="card-price">
          <span class="price-symbol">¥</span>
          <span class="price-value">{{ material.price }}</span>
          <span class="price-unit">/{{ material.unit }}</span>
        </div>
        <div class="card-actions">
          <el-button
            type="danger"
            size="small"
            circle
            @click.stop="toggleFavorite"
          >
            <el-icon>
              <Star v-if="isFavorited" :fill="'#f56c6c'" />
              <Star v-else />
            </el-icon>
          </el-button>
          <el-button
            type="primary"
            size="small"
            @click.stop="handleAddCart"
          >
            加入购物车
          </el-button>
        </div>
      </div>
      <div class="card-stats">
        <span class="sales">销量 {{ material.sales || 0 }}</span>
        <span class="rating">
          <el-rate v-model="material.rating" :max="5" disabled size="small" />
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useFavoritesStore } from '@/store/favorites'
import { useCartStore } from '@/store/cart'

const props = defineProps({
  material: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const favoritesStore = useFavoritesStore()
const cartStore = useCartStore()

const isFavorited = computed(() => favoritesStore.isFavorite(props.material.id))

const goToDetail = () => {
  router.push(`/material/${props.material.id}`)
}

const toggleFavorite = () => {
  favoritesStore.toggleFavorite(props.material)
  ElMessage.success(isFavorited.value ? '已收藏' : '已取消收藏')
}

const handleAddCart = () => {
  cartStore.addToCart(props.material, 1)
  ElMessage.success('已加入购物车')
}
</script>

<style scoped>
.material-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
}

.material-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.card-image {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.material-card:hover .card-image img {
  transform: scale(1.05);
}

.card-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 4px 10px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  font-size: 12px;
  border-radius: 4px;
}

.card-content {
  padding: 16px;
}

.card-title {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
  line-height: 1.4;
  height: 42px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.card-supplier {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.card-tags {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.tag {
  padding: 2px 8px;
  background: #ecf5ff;
  color: #409eff;
  font-size: 11px;
  border-radius: 3px;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.card-price {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  color: #f56c6c;
  font-size: 14px;
}

.price-value {
  color: #f56c6c;
  font-size: 22px;
  font-weight: bold;
  margin: 0 2px;
}

.price-unit {
  color: #909399;
  font-size: 12px;
}

.card-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.card-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid #f2f6fc;
  font-size: 12px;
  color: #909399;
}
</style>
