<template>
  <div class="package-card">
    <div class="package-image">
      <img :src="pkg.image" :alt="pkg.name" />
      <div class="discount-badge">{{ pkg.discount }}</div>
    </div>
    <div class="package-content">
      <h3 class="package-title">{{ pkg.name }}</h3>
      <p class="package-desc">{{ pkg.description }}</p>
      <div class="package-materials">
        <span class="label">包含原料：</span>
        <span v-for="(item, index) in pkg.materials" :key="index" class="material-item">
          {{ item.name }} x{{ item.quantity }}
          <span v-if="index < pkg.materials.length - 1">、</span>
        </span>
      </div>
      <div class="package-suitable">
        <span class="label">适用人群：</span>
        <span v-for="(item, index) in pkg.suitableFor" :key="index" class="suitable-tag">
          {{ item }}
        </span>
      </div>
      <div class="package-footer">
        <div class="package-price">
          <span class="current-price">¥{{ pkg.price }}</span>
          <span class="original-price">¥{{ pkg.originalPrice }}</span>
        </div>
        <div class="package-stats">
          <span>已售 {{ pkg.sales }}</span>
          <el-rate v-model="pkg.rating" :max="5" disabled size="small" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  pkg: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.package-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  display: flex;
  height: 220px;
}

.package-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.package-image {
  position: relative;
  width: 300px;
  height: 100%;
  overflow: hidden;
  flex-shrink: 0;
}

.package-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.discount-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 12px;
  background: linear-gradient(135deg, #f093fb, #f5576c);
  color: #fff;
  font-size: 14px;
  font-weight: bold;
  border-radius: 20px;
}

.package-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.package-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.package-desc {
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.package-materials,
.package-suitable {
  font-size: 12px;
  color: #606266;
  margin-bottom: 8px;
  line-height: 1.6;
}

.label {
  color: #909399;
  margin-right: 4px;
}

.material-item {
  color: #409eff;
}

.suitable-tag {
  display: inline-block;
  padding: 2px 8px;
  background: #f0f9eb;
  color: #67c23a;
  border-radius: 3px;
  margin-right: 6px;
  font-size: 11px;
}

.package-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f2f6fc;
}

.current-price {
  color: #f56c6c;
  font-size: 26px;
  font-weight: bold;
}

.original-price {
  color: #909399;
  text-decoration: line-through;
  font-size: 14px;
  margin-left: 8px;
}

.package-stats {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #909399;
}
</style>
