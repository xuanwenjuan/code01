<template>
  <div class="favorite-card card-hover">
    <label class="checkbox-wrapper" v-if="showCheckbox">
      <el-checkbox
        :model-value="isSelected"
        @change="handleSelect"
      />
    </label>
    <div class="favorite-cover" @click="handleViewDetail">
      <img :src="book.cover" :alt="book.name" loading="lazy" />
    </div>
    <div class="favorite-info">
      <h4 class="favorite-name" :title="book.name" @click="handleViewDetail">
        {{ book.name }}
      </h4>
      <p class="favorite-author">{{ book.author }}</p>
      <div class="favorite-footer">
        <div class="price-wrapper">
          <span class="price">¥{{ book.price.toFixed(2) }}</span>
          <span v-if="book.originalPrice" class="original-price">
            ¥{{ book.originalPrice.toFixed(2) }}
          </span>
        </div>
        <div class="action-wrapper">
          <el-button
            size="small"
            type="primary"
            text
            @click="handleAddCart"
          >
            采购
          </el-button>
          <el-button
            size="small"
            type="danger"
            text
            @click="handleRemove"
          >
            取消
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'

const props = defineProps({
  book: {
    type: Object,
    required: true
  },
  showCheckbox: {
    type: Boolean,
    default: false
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['remove', 'select', 'add-cart'])

const router = useRouter()

const handleViewDetail = () => {
  router.push(`/book/${props.book.id}`)
}

const handleRemove = () => {
  ElMessageBox.confirm('确定要取消收藏吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    emit('remove', props.book.id)
  }).catch(() => {})
}

const handleSelect = (val) => {
  emit('select', props.book.id, val)
}

const handleAddCart = () => {
  emit('add-cart', props.book)
}
</script>

<style scoped>
.favorite-card {
  display: flex;
  gap: 12px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
}

.favorite-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.checkbox-wrapper {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 10;
}

.favorite-cover {
  width: 80px;
  height: 106px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
  background: #f5f7fa;
}

.favorite-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.favorite-card:hover .favorite-cover img {
  transform: scale(1.05);
}

.favorite-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.favorite-name {
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 4px 0;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.3s;
}

.favorite-name:hover {
  color: #409eff;
}

.favorite-author {
  font-size: 12px;
  color: #909399;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.favorite-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.price-wrapper {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.price {
  color: #f56c6c;
  font-weight: 600;
  font-size: 16px;
}

.original-price {
  color: #909399;
  text-decoration: line-through;
  font-size: 12px;
}

.action-wrapper {
  display: flex;
  gap: 4px;
}
</style>
