<template>
  <el-card class="equipment-card card-hover" shadow="hover" @click="goDetail">
    <div class="card-image">
      <img :src="equipment.image" :alt="equipment.name" />
      <el-tag 
        :class="equipment.subCategory === 'deepspace' ? 'tag-deepspace' : 'tag-planet'"
        size="small"
        class="category-tag"
      >
        {{ equipment.subCategory === 'deepspace' ? '深空观测' : '行星观测' }}
      </el-tag>
      <el-button
        class="favorite-btn"
        :type="isFavorited ? 'danger' : 'default'"
        size="small"
        circle
        @click.stop="toggleFav"
      >
        <el-icon><StarFilled v-if="isFavorited" /><Star v-else /></el-icon>
      </el-button>
    </div>

    <div class="card-content">
      <h3 class="equipment-name">{{ equipment.name }}</h3>
      <p class="equipment-desc">{{ equipment.description }}</p>

      <div class="equipment-specs">
        <span v-if="equipment.aperture">口径: {{ equipment.aperture }}mm</span>
        <span v-if="equipment.magnifyMax">倍率: {{ equipment.magnifyMin }}-{{ equipment.magnifyMax }}x</span>
        <span v-if="equipment.pixels">像素: {{ equipment.pixels }}</span>
      </div>

      <div class="card-footer">
        <div class="price-info">
          <span class="price-text">¥{{ equipment.price.toLocaleString() }}</span>
          <span class="original-price" v-if="equipment.originalPrice">
            ¥{{ equipment.originalPrice.toLocaleString() }}
          </span>
        </div>
        <div class="sales-info">
          <el-rate v-model="equipment.rating" disabled size="small" />
          <span class="sales-count">已售{{ equipment.sales }}</span>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useEquipmentStore } from '@/store/equipment'

const props = defineProps({
  equipment: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const equipmentStore = useEquipmentStore()

const isFavorited = computed(() => equipmentStore.isFavorite(props.equipment.id))

function goDetail() {
  router.push(`/equipment/${props.equipment.id}`)
}

function toggleFav() {
  equipmentStore.toggleFavorite(props.equipment.id)
}
</script>

<style lang="scss" scoped>
.equipment-card {
  cursor: pointer;
  overflow: hidden;
}

.card-image {
  position: relative;
  height: 200px;
  overflow: hidden;
  margin: -15px -15px 15px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
}

.equipment-card:hover .card-image img {
  transform: scale(1.05);
}

.category-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  border: none;
}

.favorite-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.9);
}

.equipment-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2d3d;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.equipment-desc {
  font-size: 13px;
  color: #606266;
  margin-bottom: 12px;
  height: 36px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.equipment-specs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;

  span {
    font-size: 12px;
    color: #909399;
    background: #f5f7fa;
    padding: 2px 8px;
    border-radius: 4px;
  }
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.price-info {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.price-text {
  font-size: 18px;
  font-weight: 700;
  color: #f56c6c;
}

.original-price {
  font-size: 13px;
  color: #909399;
  text-decoration: line-through;
}

.sales-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sales-count {
  font-size: 12px;
  color: #909399;
}
</style>
