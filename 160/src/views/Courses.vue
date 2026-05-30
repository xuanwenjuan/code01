<template>
  <div class="courses-page">
    <PageHeader title="课程列表" subtitle="探索优质课程，开启学习之旅" />
    
    <div class="container page-content">
      <div class="filter-section card">
        <div class="filter-header">
          <span class="filter-title">
            <el-icon><Filter /></el-icon>
            筛选条件
          </span>
          <el-button 
            v-if="hasActiveFilters" 
            type="primary" 
            link 
            size="small"
            @click="resetFilters"
          >
            重置筛选
          </el-button>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">
            <el-icon><Collection /></el-icon>
            课程分类
          </label>
          <div class="filter-options">
            <el-tag
              v-for="category in categories"
              :key="category.id"
              :type="filters.categoryId === category.id ? 'primary' : 'info'"
              :effect="filters.categoryId === category.id ? 'dark' : 'plain'"
              class="filter-tag"
              @click="setFilter('categoryId', filters.categoryId === category.id ? null : category.id)"
            >
              {{ category.name }}
              <span v-if="category.count" class="tag-count">({{ category.count }})</span>
            </el-tag>
          </div>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">
            <el-icon><TrendCharts /></el-icon>
            难度等级
          </label>
          <div class="filter-options">
            <el-tag
              v-for="item in difficultyOptions"
              :key="item.value"
              :type="filters.difficulty === item.value ? item.type : 'info'"
              :effect="filters.difficulty === item.value ? 'dark' : 'plain'"
              class="filter-tag"
              @click="setFilter('difficulty', filters.difficulty === item.value ? null : item.value)"
            >
              {{ item.label }}
            </el-tag>
          </div>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">
            <el-icon><Money /></el-icon>
            价格区间
          </label>
          <div class="filter-options">
            <el-tag
              v-for="item in priceOptions"
              :key="item.value"
              :type="filters.priceType === item.value ? item.type : 'info'"
              :effect="filters.priceType === item.value ? 'dark' : 'plain'"
              class="filter-tag"
              @click="setFilter('priceType', filters.priceType === item.value ? null : item.value)"
            >
              {{ item.label }}
            </el-tag>
          </div>
        </div>
      </div>

      <div class="sort-section card">
        <div class="sort-left">
          <span class="result-count">
            共 <em>{{ totalCourses }}</em> 门课程
          </span>
          <span v-if="hasActiveFilters" class="active-filter-tip">
            已筛选
          </span>
        </div>
        <div class="sort-right">
          <span class="sort-label">排序方式：</span>
          <el-radio-group v-model="filters.sortBy" size="default" @change="handleSort">
            <el-radio-button value="popular">
              <el-icon><HotWater /></el-icon>
              最受欢迎
            </el-radio-button>
            <el-radio-button value="newest">
              <el-icon><Clock /></el-icon>
              最新上线
            </el-radio-button>
            <el-radio-button value="rating">
              <el-icon><Star /></el-icon>
              评分最高
            </el-radio-button>
            <el-radio-button value="price-asc">
              <el-icon><Sort /></el-icon>
              价格升序
            </el-radio-button>
            <el-radio-button value="price-desc">
              <el-icon><Sort /></el-icon>
              价格降序
            </el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <div v-loading="loading" class="course-list-wrapper">
        <div v-if="filteredCourses.length > 0" class="course-grid">
          <CourseCard v-for="course in pagedCourses" :key="course.id" :course="course" />
        </div>
        <EmptyState
          v-else
          description="没有找到符合条件的课程"
          :show-action="true"
          action-text="重置筛选条件"
          @action="resetFilters"
        />
      </div>

      <Pagination
        v-if="totalCourses > 0"
        :total="totalCourses"
        :current-page="currentPage"
        :page-size="pageSize"
        @change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseStore } from '@/store/course'
import CourseCard from '@/components/CourseCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import Pagination from '@/components/Pagination.vue'
import PageHeader from '@/components/PageHeader.vue'
import { 
  Filter, Collection, TrendCharts, Money, 
  HotWater, Clock, Star, Sort 
} from '@element-plus/icons-vue'

const courseStore = useCourseStore()
const route = useRoute()
const router = useRouter()

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(12)

const categories = [{ id: null, name: '全部', count: courseStore.courses.length }, ...courseStore.categories]

const difficultyOptions = [
  { value: 'beginner', label: '入门', type: 'success' },
  { value: 'intermediate', label: '进阶', type: 'warning' },
  { value: 'advanced', label: '高级', type: 'danger' }
]

const priceOptions = [
  { value: 'free', label: '免费', type: 'success' },
  { value: 'paid', label: '付费', type: 'warning' }
]

const hasActiveFilters = computed(() => {
  return filters.categoryId || filters.difficulty || filters.priceType || filters.keyword
})

const filters = reactive({
  categoryId: null,
  difficulty: null,
  priceType: null,
  sortBy: 'popular',
  keyword: ''
})

const filteredCourses = computed(() => {
  let result = courseStore.filterCourses(filters)
  
  if (filters.keyword) {
    const keyword = filters.keyword.toLowerCase()
    result = result.filter(c => 
      c.name.toLowerCase().includes(keyword) ||
      c.description.toLowerCase().includes(keyword) ||
      c.tags.some(t => t.toLowerCase().includes(keyword))
    )
  }
  
  return result
})

const totalCourses = computed(() => filteredCourses.value.length)

const pagedCourses = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredCourses.value.slice(start, end)
})

const setFilter = (key, value) => {
  filters[key] = value
  currentPage.value = 1
}

const handleSort = () => {
  currentPage.value = 1
}

const handlePageChange = ({ page }) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const resetFilters = () => {
  filters.categoryId = null
  filters.difficulty = null
  filters.priceType = null
  filters.sortBy = 'popular'
  filters.keyword = ''
  currentPage.value = 1
}

const initFromQuery = () => {
  if (route.query.categoryId) {
    filters.categoryId = parseInt(route.query.categoryId)
  }
  if (route.query.priceType) {
    filters.priceType = route.query.priceType
  }
  if (route.query.sortBy) {
    filters.sortBy = route.query.sortBy
  }
  if (route.query.keyword) {
    filters.keyword = route.query.keyword
  }
}

onMounted(() => {
  initFromQuery()
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 300)
})

watch(() => route.query, () => {
  initFromQuery()
})
</script>

<style lang="scss" scoped>
.courses-page {
  min-height: calc(100vh - 64px);
}

.page-content {
  padding-bottom: 60px;
}

.filter-section {
  padding: 24px;
  margin-bottom: 20px;

  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #ebeef5;

    .filter-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
      color: #303133;

      .el-icon {
        color: #667eea;
      }
    }
  }
}

.filter-group {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  .filter-label {
    width: 100px;
    flex-shrink: 0;
    font-size: 14px;
    font-weight: 500;
    color: #606266;
    padding-top: 4px;
    display: flex;
    align-items: center;
    gap: 6px;

    .el-icon {
      color: #667eea;
    }
  }

  .filter-options {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .filter-tag {
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-1px);
    }

    .tag-count {
      margin-left: 4px;
      opacity: 0.8;
      font-size: 12px;
    }
  }
}

.sort-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  margin-bottom: 20px;

  .sort-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .result-count {
      font-size: 14px;
      color: #606266;

      em {
        color: #667eea;
        font-style: normal;
        font-weight: 600;
        font-size: 18px;
        margin: 0 4px;
      }
    }

    .active-filter-tip {
      padding: 2px 8px;
      background: #ecf5ff;
      color: #667eea;
      border-radius: 4px;
      font-size: 12px;
    }
  }

  .sort-right {
    display: flex;
    align-items: center;
    gap: 12px;

    .sort-label {
      font-size: 14px;
      color: #606266;
    }

    :deep(.el-radio-button__inner) {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
}

.course-list-wrapper {
  min-height: 400px;
  margin-bottom: 30px;
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
</style>
