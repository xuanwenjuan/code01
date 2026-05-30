<template>
  <div class="home-page">
    <section class="banner-section">
      <el-carousel :interval="4000" height="360px" arrow="always">
        <el-carousel-item v-for="banner in courseStore.banners" :key="banner.id">
          <div class="banner-item" @click="goToLink(banner.link)">
            <img :src="banner.image" :alt="banner.title" />
            <div class="banner-content">
              <h2>{{ banner.title }}</h2>
              <p>{{ banner.subtitle }}</p>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </section>

    <section class="container category-section">
      <h2 class="section-title">课程分类</h2>
      <div class="category-grid">
        <div
          v-for="category in courseStore.categories"
          :key="category.id"
          class="category-item card"
          @click="goToCategory(category.id)"
        >
          <el-icon :size="32" color="#667eea">
            <component :is="category.icon" />
          </el-icon>
          <span class="category-name">{{ category.name }}</span>
          <span class="category-count">{{ category.count }}门课程</span>
        </div>
      </div>
    </section>

    <section class="container hot-course-section">
      <div class="section-header">
        <h2 class="section-title">🔥 热门推荐</h2>
        <router-link to="/courses?sortBy=popular" class="more-link">查看更多 →</router-link>
      </div>
      <div v-loading="loading" class="course-grid">
        <CourseCard v-for="course in hotCourses" :key="course.id" :course="course" />
      </div>
    </section>

    <section class="container new-course-section">
      <div class="section-header">
        <h2 class="section-title">✨ 最新上线</h2>
        <router-link to="/courses?sortBy=newest" class="more-link">查看更多 →</router-link>
      </div>
      <div v-loading="loading" class="course-grid">
        <CourseCard v-for="course in newCourses" :key="course.id" :course="course" />
      </div>
    </section>

    <section class="free-course-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title" style="color: #fff">🎁 免费好课</h2>
          <router-link to="/courses?priceType=free" class="more-link" style="color: rgba(255,255,255,0.8)">查看更多 →</router-link>
        </div>
        <div v-loading="loading" class="course-grid">
          <CourseCard v-for="course in freeCourses" :key="course.id" :course="course" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCourseStore } from '@/store/course'
import CourseCard from '@/components/CourseCard.vue'

const courseStore = useCourseStore()
const router = useRouter()
const loading = ref(false)

const hotCourses = courseStore.getHotCourses(8)
const newCourses = courseStore.getNewCourses(8)
const freeCourses = courseStore.courses.filter(c => c.price === 0).slice(0, 8)

onMounted(() => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
})

const goToLink = (link) => {
  router.push(link)
}

const goToCategory = (categoryId) => {
  router.push({ path: '/courses', query: { categoryId } })
}
</script>

<style lang="scss" scoped>
.home-page {
  padding-bottom: 20px;
}

.banner-section {
  margin-bottom: 40px;

  :deep(.el-carousel__item) {
    overflow: hidden;
  }

  .banner-item {
    position: relative;
    width: 100%;
    height: 100%;
    cursor: pointer;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .banner-content {
      position: absolute;
      top: 50%;
      left: 10%;
      transform: translateY(-50%);
      color: #fff;

      h2 {
        font-size: 36px;
        margin-bottom: 12px;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
      }

      p {
        font-size: 18px;
        opacity: 0.9;
      }
    }
  }
}

.category-section {
  margin-bottom: 50px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 16px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);

    .category-name {
      color: #667eea;
    }
  }

  .category-name {
    font-size: 15px;
    font-weight: 500;
    margin: 12px 0 6px;
    transition: color 0.3s;
  }

  .category-count {
    font-size: 12px;
    color: #909399;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .more-link {
    font-size: 14px;
    color: #667eea;
    transition: opacity 0.3s;

    &:hover {
      opacity: 0.8;
    }
  }
}

.hot-course-section,
.new-course-section {
  margin-bottom: 50px;
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.free-course-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 50px 0;
  margin-bottom: 50px;

  .section-title {
    color: #fff;
  }

  .course-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;

    @media (max-width: 1200px) {
      grid-template-columns: repeat(3, 1fr);
    }

    @media (max-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
    }
  }
}
</style>
