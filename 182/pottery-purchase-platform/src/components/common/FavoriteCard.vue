<template>
  <div class="favorite-card" :class="{ 'selected': isSelected }">
    <div v-if="showCheckbox" class="checkbox-wrapper">
      <el-checkbox v-model="isSelected" @change="$emit('select-change', item.id, isSelected)" />
    </div>
    <div class="product-card" @click="$emit('product-click', item.productId)">
      <div class="product-image">
        <img :src="item.image" :alt="item.name" />
        <div v-if="item.tag" class="product-tag">{{ item.tag }}</div>
      </div>
      <div class="product-info">
        <h4 class="product-name text-ellipsis">{{ item.name }}</h4>
        <div class="product-price-row">
          <span class="product-price">¥{{ item.price }}</span>
          <span v-if="item.originalPrice" class="original-price">¥{{ item.originalPrice }}</span>
        </div>
        <p v-if="item.addTime" class="add-time">收藏于 {{ item.addTime }}</p>
      </div>
    </div>
    <div class="product-actions">
      <el-button type="primary" size="small" @click="$emit('buy', item)">
        立即购买
      </el-button>
      <el-button type="danger" size="small" text @click="$emit('remove', item.productId)">
        取消收藏
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  showCheckbox: {
    type: Boolean,
    default: false
  },
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'product-click',
  'buy',
  'remove',
  'select-change',
  'update:modelValue'
])

const isSelected = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  isSelected.value = val
})

watch(isSelected, (val) => {
  emit('update:modelValue', val)
})
</script>

<style scoped>
.favorite-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  position: relative;
  background: #fff;
}

.favorite-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.favorite-card.selected {
  border-color: #d4a574;
  box-shadow: 0 0 0 2px rgba(212, 165, 116, 0.2);
}

.checkbox-wrapper {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  padding: 4px;
  border-radius: 4px;
}

.product-card {
  cursor: pointer;
}

.product-image {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.favorite-card:hover .product-image img {
  transform: scale(1.05);
}

.product-tag {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #e74c3c;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.product-info {
  padding: 12px;
}

.product-name {
  font-size: 14px;
  margin-bottom: 8px;
  color: #333;
  line-height: 1.4;
  height: 40px;
}

.product-price-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 6px;
}

.product-price {
  font-size: 18px;
  font-weight: bold;
  color: #e74c3c;
}

.original-price {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
}

.add-time {
  font-size: 12px;
  color: #999;
  margin: 0;
}

.product-actions {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid #f5f5f5;
  background: #fafafa;
}

.product-actions .el-button {
  flex: 1;
}
</style>
