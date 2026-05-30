<template>
  <div class="favorite-item card">
    <div class="product-image" @click="handleClick">
      <img :src="product.image" :alt="product.name" loading="lazy" />
      <div class="image-overlay">
        <el-button type="primary" size="small" circle @click.stop="handleClick">
          <el-icon><View /></el-icon>
        </el-button>
      </div>
      <div class="remove-btn" @click.stop="handleRemove">
        <el-icon :size="18"><Close /></el-icon>
      </div>
      <div class="tags" v-if="product.originalPrice > product.price || product.stock < 50">
        <el-tag v-if="product.originalPrice > product.price" type="danger" size="small">
          特价
        </el-tag>
        <el-tag v-if="product.stock < 50" type="warning" size="small">
          库存紧张
        </el-tag>
      </div>
    </div>

    <div class="product-info">
      <h4 class="product-name" :title="product.name" @click="handleClick">
        {{ product.name }}
      </h4>
      <p class="product-desc">{{ product.description }}</p>

      <div class="product-specs">
        <span class="spec">
          <el-icon><Aim /></el-icon>
          {{ product.precision }}
        </span>
        <span class="spec">
          <el-icon><Box /></el-icon>
          {{ product.material }}
        </span>
      </div>

      <div class="product-footer">
        <div class="price-info">
          <span class="current-price">¥{{ product.price.toLocaleString() }}</span>
          <span class="original-price" v-if="product.originalPrice > product.price">
            ¥{{ product.originalPrice.toLocaleString() }}
          </span>
        </div>
        <el-button type="primary" size="small" @click.stop="handleBuy">
          <el-icon><ShoppingCart /></el-icon>
          采购
        </el-button>
      </div>

      <div v-if="showCheckbox" class="product-checkbox">
        <el-checkbox v-model="checked" @change="handleCheck">
          选择
        </el-checkbox>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { View, Close, Aim, Box, ShoppingCart } from '@element-plus/icons-vue'

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  showCheckbox: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click', 'remove', 'buy', 'check'])

const router = useRouter()
const checked = ref(false)

const handleClick = () => {
  router.push(`/product/${props.product.id}`)
  emit('click', props.product)
}

const handleRemove = () => {
  ElMessageBox.confirm(
    `确定要移除「${props.product.name}」吗？`,
    '提示',
    {
      confirmButtonText: '确定移除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    emit('remove', props.product)
  }).catch(() => {})
}

const handleBuy = () => {
  emit('buy', props.product)
  router.push(`/product/${props.product.id}`)
}

const handleCheck = (val) => {
  emit('check', { product: props.product, checked: val })
}
</script>

<style scoped>
.favorite-item {
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.favorite-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.product-image {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  background: #f5f7fa;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.favorite-item:hover .product-image img {
  transform: scale(1.08);
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.favorite-item:hover .image-overlay {
  opacity: 1;
}

.remove-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 28px;
  height: 28px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 2;
}

.remove-btn:hover {
  background: #f56c6c;
  transform: scale(1.1);
}

.tags {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  gap: 6px;
  z-index: 2;
}

.product-info {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-name {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  line-height: 1.4;
  height: 40px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-desc {
  margin: 0 0 12px;
  font-size: 12px;
  color: #909399;
  height: 34px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-specs {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.spec {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #606266;
  background: #f5f7fa;
  padding: 3px 8px;
  border-radius: 4px;
}

.spec .el-icon {
  color: #409eff;
  font-size: 12px;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.price-info {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.current-price {
  font-size: 18px;
  font-weight: 600;
  color: #f56c6c;
}

.original-price {
  font-size: 12px;
  color: #c0c4cc;
  text-decoration: line-through;
}

.product-checkbox {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}
</style>
