<template>
  <el-card class="package-card card-hover" shadow="hover" @click="handleClick">
    <div class="package-header">
      <h3 class="package-name">{{ pkg.name }}</h3>
      <el-tag type="danger" effect="dark">套餐</el-tag>
    </div>

    <p class="package-desc">{{ pkg.description }}</p>

    <div class="package-items">
      <div v-for="item in pkg.items.slice(0, 3)" :key="item.productId" class="package-item">
        <span>{{ item.name }}</span>
        <span class="item-count">×{{ item.quantity }}</span>
      </div>
      <div v-if="pkg.items.length > 3" class="more-items">
        等{{ pkg.items.length }}件商品
      </div>
    </div>

    <div class="package-footer">
      <div class="package-price">
        <span class="price-label">套餐价</span>
        <span class="price">¥{{ pkg.price }}</span>
        <span class="original-price">¥{{ pkg.originalPrice }}</span>
      </div>
      <el-button type="primary" size="small">立即购买</el-button>
    </div>

    <div class="package-stats">
      <span>已售 {{ pkg.sales }} 套</span>
      <span>好评 {{ pkg.rating }} 分</span>
    </div>
  </el-card>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  pkg: {
    type: Object,
    required: true
  }
})

const router = useRouter()

function handleClick() {
  router.push('/packages')
}
</script>

<style lang="scss" scoped>
.package-card {
  height: 100%;

  :deep(.el-card__body) {
    padding: 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
}

.package-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;

  .package-name {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }
}

.package-desc {
  color: var(--text-secondary);
  font-size: 13px;
  margin-bottom: 16px;
}

.package-items {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;

  .package-item {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
    font-size: 13px;
    color: var(--text-regular);

    .item-count {
      color: var(--primary-color);
      font-weight: 500;
    }
  }

  .more-items {
    text-align: center;
    color: var(--text-secondary);
    font-size: 12px;
    padding-top: 8px;
    border-top: 1px dashed #e4e7ed;
    margin-top: 4px;
  }
}

.package-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  margin-bottom: 12px;

  .package-price {
    display: flex;
    align-items: baseline;
    gap: 6px;

    .price-label {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .price {
      font-size: 24px;
      color: var(--primary-color);
      font-weight: 700;
    }

    .original-price {
      font-size: 13px;
      color: var(--text-secondary);
      text-decoration: line-through;
    }
  }
}

.package-stats {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-secondary);
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}
</style>
