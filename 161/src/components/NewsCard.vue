<template>
  <div class="news-card card-hover" @click="goDetail">
    <div class="card-image">
      <img :src="newsItem.image" :alt="newsItem.title" />
      <div v-if="newsItem.hot" class="hot-tag">热门</div>
    </div>
    <div class="card-content">
      <div class="card-category">{{ newsItem.category }}</div>
      <h3 class="card-title text-ellipsis-2">{{ newsItem.title }}</h3>
      <p class="card-summary text-ellipsis-2">{{ newsItem.summary }}</p>
      <div class="card-bottom">
        <span class="author">{{ newsItem.author }}</span>
        <span class="view-count">
          <el-icon><View /></el-icon>
          {{ newsItem.viewCount }}
        </span>
        <span class="publish-time">{{ newsItem.publishTime }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  newsItem: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const goDetail = () => {
  router.push(`/news/detail/${props.newsItem.id}`)
}
</script>

<style lang="scss" scoped>
.news-card {
  display: flex;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.card-image {
  position: relative;
  width: 220px;
  height: 160px;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .hot-tag {
    position: absolute;
    top: 10px;
    left: 10px;
    padding: 2px 8px;
    background: #f56c6c;
    border-radius: 4px;
    font-size: 12px;
    color: #fff;
  }
}

.card-content {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;

  .card-category {
    display: inline-block;
    padding: 2px 8px;
    background: #ecf5ff;
    color: #409eff;
    font-size: 12px;
    border-radius: 4px;
    width: fit-content;
    margin-bottom: 10px;
  }

  .card-title {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
    margin-bottom: 8px;
    line-height: 1.4;
  }

  .card-summary {
    font-size: 14px;
    color: #606266;
    line-height: 1.6;
    margin-bottom: auto;
  }

  .card-bottom {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 13px;
    color: #909399;

    .view-count {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
}
</style>
