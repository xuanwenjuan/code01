<template>
  <div class="course-card card" @click="goToDetail">
    <div class="course-cover">
      <img :src="course.cover" :alt="course.name" />
      <div class="course-tag" :style="{ backgroundColor: getDifficultyColor(course.difficulty) }">
        {{ getDifficultyText(course.difficulty) }}
      </div>
      <div v-if="course.price === 0" class="free-tag">免费</div>
    </div>
    <div class="course-info">
      <h3 class="course-name" :title="course.name">{{ course.name }}</h3>
      <p class="course-desc">{{ course.description }}</p>
      <div class="course-meta">
        <div class="instructor">
          <el-avatar :size="24" :src="course.instructor?.avatar" />
          <span>{{ course.instructor?.name }}</span>
        </div>
        <div class="stats">
          <span><el-icon><User /></el-icon>{{ formatCount(course.studentCount) }}人学习</span>
        </div>
      </div>
      <div class="course-footer">
        <div class="rating">
          <el-rate v-model="course.rating" disabled :max="5" :size="14" />
          <span class="rating-text">{{ course.rating }}</span>
        </div>
        <div class="price">
          <span v-if="course.price === 0" class="free">免费</span>
          <span v-else class="price-text">¥{{ course.price }}</span>
          <span v-if="course.originalPrice > course.price" class="original-price">¥{{ course.originalPrice }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { User } from '@element-plus/icons-vue'
import { getDifficultyText, getDifficultyColor, formatCount } from '@/utils'

const props = defineProps({
  course: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const goToDetail = () => {
  router.push(`/course/${props.course.id}`)
}
</script>

<style lang="scss" scoped>
.course-card {
  cursor: pointer;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.course-cover {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  overflow: hidden;

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .course-tag {
    position: absolute;
    top: 10px;
    left: 10px;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    color: #fff;
  }

  .free-tag {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    background: #67c23a;
    color: #fff;
  }
}

.course-card:hover .course-cover img {
  transform: scale(1.05);
}

.course-info {
  padding: 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.course-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #303133;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  min-height: 45px;
}

.course-desc {
  font-size: 13px;
  color: #909399;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.course-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 12px;
  color: #909399;

  .instructor {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .stats {
    display: flex;
    align-items: center;
    gap: 4px;

    .el-icon {
      font-size: 14px;
    }
  }
}

.course-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;

  .rating {
    display: flex;
    align-items: center;
    gap: 6px;

    .rating-text {
      font-size: 13px;
      color: #f5a623;
      font-weight: 600;
    }
  }

  .price {
    display: flex;
    align-items: baseline;
    gap: 6px;

    .price-text {
      font-size: 18px;
      font-weight: bold;
      color: #f56c6c;
    }

    .free {
      font-size: 18px;
      font-weight: bold;
      color: #67c23a;
    }

    .original-price {
      font-size: 12px;
      color: #c0c4cc;
      text-decoration: line-through;
    }
  }
}
</style>
