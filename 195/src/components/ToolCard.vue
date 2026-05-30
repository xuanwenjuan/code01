<template>
  <div class="tool-card card" @click="goDetail">
    <div class="card-image">
      <img :src="tool.image" :alt="tool.name" />
      <div class="card-badge" v-if="tool.type === 'fine'">精雕</div>
      <div class="card-badge rough" v-else>粗加工</div>
      <el-button
        class="favorite-btn"
        :type="isFav ? 'danger' : 'default'"
        size="small"
        circle
        @click.stop="handleFavorite"
      >
        <el-icon><Star :fill="isFav ? '#f56c6c' : 'none'" /></el-icon>
      </el-button>
    </div>
    <div class="card-content">
      <h3 class="card-title">{{ tool.name }}</h3>
      <p class="card-desc">{{ tool.description }}</p>
      <div class="card-info">
        <span class="info-item">
          <el-icon><SetUp /></el-icon> {{ tool.hardness }}
        </span>
        <span class="info-item">
          <el-icon><TrendCharts /></el-icon> 销量{{ tool.sales }}
        </span>
      </div>
      <div class="card-footer">
        <div class="price-box">
          <span class="price">¥{{ tool.price }}</span>
          <span class="original-price">¥{{ tool.originalPrice }}</span>
        </div>
        <el-button type="primary" size="small" @click.stop="handleBuy">立即购买</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Star, SetUp, TrendCharts } from '@element-plus/icons-vue'
import { useToolStore } from '@/stores/tool'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  tool: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const toolStore = useToolStore()
const userStore = useUserStore()

const isFav = computed(() => toolStore.isFavorite(props.tool.id))

const goDetail = () => {
  router.push(`/tool/${props.tool.id}`)
}

const handleFavorite = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  toolStore.toggleFavorite(props.tool.id)
  ElMessage.success(isFav.value ? '已取消收藏' : '已加入收藏')
}

const handleBuy = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  router.push(`/tool/${props.tool.id}`)
}
</script>

<style lang="scss" scoped>
.tool-card {
  cursor: pointer;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-image {
  position: relative;
  height: 200px;
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

  .card-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    background: linear-gradient(135deg, #8b4513, #d2691e);
    color: #fff;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;

    &.rough {
      background: linear-gradient(135deg, #409eff, #67c23a);
    }
  }

  .favorite-btn {
    position: absolute;
    top: 12px;
    right: 12px;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-desc {
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.card-info {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 12px;
  color: #999;

  .info-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }
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
      color: #e6a23c;
    }

    .original-price {
      font-size: 13px;
      color: #999;
      text-decoration: line-through;
    }
  }
}
</style>
