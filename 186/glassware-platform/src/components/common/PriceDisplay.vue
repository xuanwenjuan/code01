<template>
  <span :class="['price-display', size, { 'has-original': originalPrice }]">
    <span class="current-price" :class="colorClass">
      <span v-if="showSymbol" class="symbol">¥</span>
      {{ formattedPrice }}
    </span>
    <span v-if="originalPrice" class="original-price">
      <span v-if="showSymbol" class="symbol">¥</span>
      {{ formatPrice(originalPrice) }}
    </span>
    <span v-if="showDiscount && originalPrice && price < originalPrice" class="discount-tag">
      省¥{{ formatPrice(originalPrice - price) }}
    </span>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  price: {
    type: [Number, String],
    required: true
  },
  originalPrice: {
    type: [Number, String],
    default: null
  },
  size: {
    type: String,
    default: 'medium'
  },
  color: {
    type: String,
    default: 'danger'
  },
  showSymbol: {
    type: Boolean,
    default: true
  },
  showDiscount: {
    type: Boolean,
    default: false
  }
})

const formatPrice = (value) => {
  const num = parseFloat(value)
  return isNaN(num) ? '0.00' : num.toFixed(2)
}

const formattedPrice = computed(() => formatPrice(props.price))

const colorClass = computed(() => {
  const colors = {
    danger: 'text-danger',
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    info: 'text-info',
    default: 'text-default'
  }
  return colors[props.color] || colors.danger
})
</script>

<style lang="scss" scoped>
.price-display {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;

  &.small {
    .current-price {
      font-size: 14px;
    }
    .original-price {
      font-size: 12px;
    }
    .symbol {
      font-size: 10px;
    }
  }

  &.medium {
    .current-price {
      font-size: 18px;
    }
    .original-price {
      font-size: 14px;
    }
    .symbol {
      font-size: 12px;
    }
  }

  &.large {
    .current-price {
      font-size: 28px;
      font-weight: 700;
    }
    .original-price {
      font-size: 16px;
    }
    .symbol {
      font-size: 16px;
    }
  }

  &.xlarge {
    .current-price {
      font-size: 36px;
      font-weight: 700;
    }
    .original-price {
      font-size: 18px;
    }
    .symbol {
      font-size: 20px;
    }
  }

  .current-price {
    font-weight: 600;
    display: inline-flex;
    align-items: baseline;
    gap: 2px;

    &.text-danger {
      color: #f56c6c;
    }
    &.text-primary {
      color: #409eff;
    }
    &.text-success {
      color: #67c23a;
    }
    &.text-warning {
      color: #e6a23c;
    }
    &.text-info {
      color: #909399;
    }
    &.text-default {
      color: #303133;
    }

    .symbol {
      font-weight: normal;
    }
  }

  .original-price {
    color: #909399;
    text-decoration: line-through;
    display: inline-flex;
    align-items: baseline;
    gap: 2px;

    .symbol {
      font-weight: normal;
    }
  }

  .discount-tag {
    padding: 2px 8px;
    background: #fef0f0;
    color: #f56c6c;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }
}
</style>
