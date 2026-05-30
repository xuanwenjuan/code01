<template>
  <div class="book-card card-hover" @click="goDetail">
    <div class="book-cover">
      <img :src="book.cover" :alt="book.name" />
      <div class="book-tags">
        <span v-if="book.isNew" class="tag tag-new">新书</span>
        <span v-if="book.isClassic" class="tag tag-classic">经典</span>
      </div>
      <div class="book-actions">
        <el-button
          type="primary"
          size="small"
          circle
          @click.stop="handleFavorite"
        >
          <el-icon>
            <component :is="isFavorited ? 'StarFilled' : 'Star'" />
          </el-icon>
        </el-button>
      </div>
    </div>
    <div class="book-info">
      <h3 class="book-name" :title="book.name">{{ book.name }}</h3>
      <p class="book-author">{{ book.author }}</p>
      <p class="book-publisher">{{ book.publisher }}</p>
      <div class="book-price">
        <span class="price">¥{{ book.price.toFixed(2) }}</span>
        <span class="original-price">¥{{ book.originalPrice.toFixed(2) }}</span>
      </div>
      <div class="book-meta">
        <span>库存 {{ book.stock }}</span>
        <span>已售 {{ book.sales }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useOrderStore } from '@/stores/order'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  book: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const orderStore = useOrderStore()
const userStore = useUserStore()

const isFavorited = computed(() => orderStore.isFavorite(props.book.id))

const goDetail = () => {
  router.push(`/book/${props.book.id}`)
}

const handleFavorite = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  orderStore.toggleFavorite(props.book)
  ElMessage.success(isFavorited.value ? '已取消收藏' : '收藏成功')
}
</script>

<style scoped>
.book-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.book-cover {
  position: relative;
  width: 100%;
  padding-top: 133%;
  background: #f5f7fa;
  overflow: hidden;
}

.book-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.book-card:hover .book-cover img {
  transform: scale(1.05);
}

.book-tags {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  gap: 4px;
}

.book-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.book-card:hover .book-actions {
  opacity: 1;
}

.book-info {
  padding: 12px;
}

.book-name {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 6px 0;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-author {
  font-size: 13px;
  color: #606266;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-publisher {
  font-size: 12px;
  color: #909399;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-price {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
}

.book-price .price {
  font-size: 18px;
}

.book-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}
</style>
