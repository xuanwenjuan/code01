<template>
  <div class="product-card-wrapper" @click="handleClick">
    <div class="product-card card-hover">
      <div class="product-image">
        <img :src="product.image || product.cover" :alt="product.name" />
        <div class="product-tags" v-if="showTags">
          <el-tag v-if="product.isColdResistant" type="primary" size="small" effect="dark">耐寒</el-tag>
          <el-tag v-if="product.isPreservative" type="success" size="small" effect="dark">防腐</el-tag>
        </div>
        <div class="product-actions" v-if="showActions">
          <el-button 
            type="danger" 
            circle 
            size="small"
            @click.stop="handleFavorite"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
      <div class="product-info">
        <h3 class="product-name text-ellipsis-2">{{ product.name }}</h3>
        <div class="product-price">
          <span class="current-price">¥{{ product.price }}</span>
          <span class="original-price" v-if="product.originalPrice">¥{{ product.originalPrice }}</span>
        </div>
        <div class="product-meta" v-if="showMeta">
          <span class="sales">销量 {{ product.sales || 0 }}</span>
          <span class="rating" v-if="product.rating">
            <el-rate :model-value="product.rating" disabled size="small" />
          </span>
        </div>
        <slot name="footer" :product="product">
          <div class="product-footer" v-if="product.createTime">
            <span class="create-time">{{ product.createTime }}</span>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { Delete } from '@element-plus/icons-vue'

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  showTags: {
    type: Boolean,
    default: true
  },
  showActions: {
    type: Boolean,
    default: false
  },
  showMeta: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['click', 'favorite'])

const router = useRouter()

const handleClick = () => {
  const id = props.product.productId || props.product.id
  if (id) {
    router.push({ name: 'ProductDetail', params: { id } })
  }
  emit('click', props.product)
}

const handleFavorite = () => {
  emit('favorite', props.product)
}
</script>

<style lang="scss" scoped>
.product-card-wrapper {
  cursor: pointer;
}

.product-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .product-image {
    width: 100%;
    padding-top: 100%;
    position: relative;

    img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .product-tags {
      position: absolute;
      top: 8px;
      left: 8px;
      display: flex;
      gap: 4px;
    }

    .product-actions {
      position: absolute;
      top: 8px;
      right: 8px;
    }
  }

  .product-info {
    padding: 12px;

    .product-name {
      font-size: 14px;
      color: #303133;
      line-height: 1.5;
      height: 42px;
      margin-bottom: 8px;
    }

    .product-price {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin-bottom: 8px;

      .current-price {
        font-size: 18px;
        font-weight: 600;
        color: #f56c6c;
      }

      .original-price {
        font-size: 12px;
        color: #909399;
        text-decoration: line-through;
      }
    }

    .product-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      .sales {
        font-size: 12px;
        color: #909399;
      }
    }

    .product-footer {
      padding-top: 8px;
      border-top: 1px solid #f5f7fa;

      .create-time {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}
</style>
