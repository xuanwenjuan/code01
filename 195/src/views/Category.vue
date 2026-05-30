<template>
  <div class="category-page">
    <div class="container">
      <el-breadcrumb class="breadcrumb" separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>工具分类</el-breadcrumb-item>
        <el-breadcrumb-item v-if="category">{{ category.name }}</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="category-header">
        <div class="category-info" v-if="category">
          <span class="cat-icon">{{ category.icon }}</span>
          <div>
            <h1>{{ category.name }}</h1>
            <p>{{ category.description }}</p>
          </div>
        </div>
      </div>

      <div class="filter-bar">
        <div class="filter-group">
          <span class="filter-label">类型：</span>
          <el-radio-group v-model="filterType" size="small">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="fine">精雕工具</el-radio-button>
            <el-radio-button label="rough">粗加工工具</el-radio-button>
          </el-radio-group>
        </div>
        <div class="filter-group">
          <span class="filter-label">排序：</span>
          <el-select v-model="sortType" size="small" style="width: 120px">
            <el-option label="默认排序" value="default" />
            <el-option label="销量优先" value="sales" />
            <el-option label="价格从低到高" value="price-asc" />
            <el-option label="价格从高到低" value="price-desc" />
          </el-select>
        </div>
      </div>

      <div v-loading="loading" class="tools-container">
        <div v-if="filteredTools.length > 0" class="tools-grid">
          <ToolCard v-for="tool in filteredTools" :key="tool.id" :tool="tool" />
        </div>
        <div v-else class="empty-wrapper">
          <el-icon><FolderOpened /></el-icon>
          <p>暂无相关工具</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { FolderOpened } from '@element-plus/icons-vue'
import ToolCard from '@/components/ToolCard.vue'
import { useToolStore } from '@/stores/tool'

const route = useRoute()
const toolStore = useToolStore()

const loading = ref(false)
const filterType = ref('all')
const sortType = ref('default')

const category = computed(() => {
  return toolStore.getCategoryById(route.params.id)
})

const categoryTools = computed(() => {
  return toolStore.getToolsByCategory(route.params.id)
})

const filteredTools = computed(() => {
  let result = [...categoryTools.value]

  if (filterType.value !== 'all') {
    result = result.filter(t => t.type === filterType.value)
  }

  switch (sortType.value) {
    case 'sales':
      result.sort((a, b) => b.sales - a.sales)
      break
    case 'price-asc':
      result.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      result.sort((a, b) => b.price - a.price)
      break
  }

  return result
})

onMounted(() => {
  toolStore.loadFavorites()
})
</script>

<style lang="scss" scoped>
.category-page {
  padding: 40px 0;
}

.breadcrumb {
  margin-bottom: 24px;
}

.category-header {
  margin-bottom: 24px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;

  .category-info {
    display: flex;
    align-items: center;
    gap: 20px;

    .cat-icon {
      font-size: 48px;
    }

    h1 {
      font-size: 24px;
      margin-bottom: 8px;
      color: #333;
    }

    p {
      font-size: 14px;
      color: #666;
    }
  }
}

.filter-bar {
  display: flex;
  gap: 24px;
  padding: 16px 24px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 24px;

  .filter-group {
    display: flex;
    align-items: center;
    gap: 12px;

    .filter-label {
      font-size: 14px;
      color: #666;
    }
  }
}

.tools-container {
  min-height: 400px;

  .tools-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
}
</style>
