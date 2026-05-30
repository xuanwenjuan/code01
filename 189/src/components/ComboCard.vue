<template>
  <div class="combo-card card">
    <div class="combo-image">
      <img :src="combo.image" :alt="combo.name" />
      <div class="combo-tag">套餐推荐</div>
    </div>
    <div class="combo-info">
      <h3 class="combo-name">{{ combo.name }}</h3>
      <p class="combo-desc">{{ combo.description }}</p>
      <div class="combo-products">
        <span v-for="item in combo.products" :key="item.id" class="combo-product">
          {{ item.name }} ×{{ item.quantity }}
        </span>
      </div>
      <div class="combo-footer">
        <div class="combo-price">
          <span class="price-current">¥{{ combo.price }}</span>
          <span class="price-original">¥{{ combo.originalPrice }}</span>
        </div>
        <span class="combo-sales">已售 {{ combo.sales }}</span>
      </div>
      <el-button type="primary" class="combo-btn" block>立即抢购</el-button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  combo: {
    type: Object,
    required: true
  }
})
</script>

<style lang="scss" scoped>
.combo-card {
  display: flex;
  overflow: hidden;
  height: 100%;

  .combo-image {
    position: relative;
    width: 200px;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .combo-tag {
      position: absolute;
      top: 0;
      left: 0;
      padding: 4px 12px;
      background: linear-gradient(135deg, $primary-color, $secondary-color);
      color: #fff;
      font-size: 12px;
      border-radius: 0 0 8px 0;
    }
  }

  .combo-info {
    flex: 1;
    padding: 16px;
    display: flex;
    flex-direction: column;

    .combo-name {
      font-size: 18px;
      font-weight: 600;
      color: $text-color;
      margin-bottom: 8px;
    }

    .combo-desc {
      font-size: 13px;
      color: $text-light;
      margin-bottom: 12px;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .combo-products {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 12px;

      .combo-product {
        padding: 2px 8px;
        background: #f5f0eb;
        border-radius: 4px;
        font-size: 12px;
        color: $primary-color;
      }
    }

    .combo-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .combo-price {
        display: flex;
        align-items: baseline;
        gap: 8px;

        .price-current {
          font-size: 24px;
          font-weight: 700;
          color: $danger-color;
        }

        .price-original {
          font-size: 14px;
          color: $text-light;
          text-decoration: line-through;
        }
      }

      .combo-sales {
        font-size: 12px;
        color: $text-light;
      }
    }

    .combo-btn {
      margin-top: auto;
      background: linear-gradient(135deg, $primary-color, $secondary-color);
      border: none;
    }
  }
}

@media (max-width: 768px) {
  .combo-card {
    flex-direction: column;

    .combo-image {
      width: 100%;
      height: 160px;
    }
  }
}
</style>
