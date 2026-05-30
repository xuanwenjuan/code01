<template>
  <div class="package-card card" @click="goDetail">
    <div class="card-image">
      <img :src="pkg.image" :alt="pkg.name" />
      <div class="hot-badge" v-if="pkg.sales > 1000">爆款</div>
    </div>
    <div class="card-content">
      <h3 class="card-title">{{ pkg.name }}</h3>
      <p class="card-desc">{{ pkg.description }}</p>
      <div class="bonus-tag">
        <el-icon><Present /></el-icon>
        <span>{{ pkg.bonus }}</span>
      </div>
      <div class="card-footer">
        <div class="price-box">
          <span class="price">¥{{ pkg.price }}</span>
          <span class="original-price">¥{{ pkg.originalPrice }}</span>
        </div>
        <div class="sales">已售{{ pkg.sales }}套</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { Present } from '@element-plus/icons-vue'

const props = defineProps({
  pkg: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const goDetail = () => {
  router.push('/packages')
}
</script>

<style lang="scss" scoped>
.package-card {
  cursor: pointer;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-image {
  position: relative;
  height: 180px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }

  &:hover img {
    transform: scale(1.05);
  }

  .hot-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    background: linear-gradient(135deg, #f56c6c, #e6a23c);
    color: #fff;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }
}

.card-content {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.card-desc {
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
  flex: 1;
}

.bonus-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: #fdf6ec;
  border-radius: 4px;
  font-size: 12px;
  color: #e6a23c;
  margin-bottom: 12px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #eee;

  .price-box {
    display: flex;
    align-items: baseline;
    gap: 8px;

    .price {
      font-size: 20px;
      font-weight: 700;
      color: #f56c6c;
    }

    .original-price {
      font-size: 13px;
      color: #999;
      text-decoration: line-through;
    }
  }

  .sales {
    font-size: 12px;
    color: #999;
  }
}
</style>
