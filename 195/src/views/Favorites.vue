<template>
  <div class="favorites-page">
    <div class="container">
      <el-breadcrumb class="breadcrumb" separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>我的收藏</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="page-header">
        <h1>常用木雕工具收藏管理</h1>
        <p>共收藏 {{ favoriteTools.length }} 件工具</p>
      </div>

      <div class="category-tabs card">
        <div class="tabs-header">
          <div
            v-for="cat in allCategories"
            :key="cat.id"
            class="tab-item"
            :class="{ active: activeCategory === cat.id }"
            @click="activeCategory = cat.id"
          >
            <span class="cat-dot" :style="{ background: cat.color }"></span>
            <span>{{ cat.name }}</span>
            <el-tag size="small" type="info">
              {{ getCategoryCount(cat.id) }}
            </el-tag>
          </div>
          <div class="tab-item add-btn" @click="showAddCategory = true">
            <el-icon><Plus /></el-icon>
            <span>新建分类</span>
          </div>
        </div>
      </div>

      <div v-loading="loading" class="favorites-container">
        <div v-if="displayTools.length > 0" class="tools-grid">
          <div v-for="tool in displayTools" :key="tool.id" class="favorite-item card">
            <div class="item-image" @click="goDetail(tool.id)">
              <img :src="tool.image" :alt="tool.name" />
              <el-tag
                class="cat-tag"
                size="small"
                :style="{ background: getCategoryColor(tool.id) }"
              >
                {{ getCategoryName(tool.id) }}
              </el-tag>
            </div>
            <div class="item-info">
              <h3 class="item-name" @click="goDetail(tool.id)">{{ tool.name }}</h3>
              <p class="item-desc">{{ tool.description }}</p>
              <div class="item-meta">
                <span class="meta-item">
                  <el-icon><SetUp /></el-icon> {{ tool.hardness }}
                </span>
                <span class="meta-item">
                  <el-icon><TrendCharts /></el-icon> 销量{{ tool.sales }}
                </span>
                <span class="meta-item">
                  <el-icon><Timer /></el-icon> 使用{{ getUsageCount(tool.id) }}次
                </span>
              </div>
              <div class="item-footer">
                <div class="price-box">
                  <span class="price">¥{{ tool.price }}</span>
                  <span class="original-price">¥{{ tool.originalPrice }}</span>
                </div>
                <div class="actions">
                  <el-dropdown @command="(cmd) => handleCategoryChange(tool.id, cmd)">
                    <el-button size="small" :icon="Folder">
                      移动分类
                      <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item
                          v-for="cat in toolStore.favoriteCategories"
                          :key="cat.id"
                          :command="cat.id"
                        >
                          <span class="cat-dot" :style="{ background: cat.color }"></span>
                          {{ cat.name }}
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                  <el-button type="primary" size="small" @click="goDetail(tool.id)">
                    查看详情
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    :icon="Delete"
                    @click="handleRemove(tool.id)"
                  >
                    取消收藏
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-wrapper">
          <el-icon><Star /></el-icon>
          <p>该分类下暂无收藏的工具</p>
          <el-button type="primary" @click="goHome">去逛逛</el-button>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="showAddCategory"
      title="新建收藏分类"
      width="400px"
    >
      <el-form :model="newCategoryForm" label-width="80px">
        <el-form-item label="分类名称">
          <el-input v-model="newCategoryForm.name" placeholder="请输入分类名称" maxlength="10" />
        </el-form-item>
        <el-form-item label="分类颜色">
          <el-color-picker v-model="newCategoryForm.color" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddCategory = false">取消</el-button>
        <el-button type="primary" @click="handleAddCategory">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { SetUp, TrendCharts, Delete, Star, Plus, Folder, ArrowDown, Timer } from '@element-plus/icons-vue'
import { useToolStore } from '@/stores/tool'

const router = useRouter()
const toolStore = useToolStore()

const loading = ref(false)
const activeCategory = ref('all')
const showAddCategory = ref(false)
const newCategoryForm = reactive({
  name: '',
  color: '#409eff'
})

const allCategories = computed(() => [
  { id: 'all', name: '全部收藏', color: '#909399' },
  ...toolStore.favoriteCategories
])

const favoriteTools = computed(() => toolStore.getFavoriteTools())

const displayTools = computed(() => {
  if (activeCategory.value === 'all') {
    return favoriteTools.value
  }
  return toolStore.getFavoriteToolsByCategory(activeCategory.value)
})

const getCategoryCount = (catId) => {
  if (catId === 'all') return favoriteTools.value.length
  return toolStore.getFavoriteToolsByCategory(catId).length
}

const getCategoryColor = (toolId) => {
  const catId = toolStore.getToolCategory(toolId)
  const cat = toolStore.favoriteCategories.find(c => c.id === catId)
  return cat?.color || '#409eff'
}

const getCategoryName = (toolId) => {
  const catId = toolStore.getToolCategory(toolId)
  const cat = toolStore.favoriteCategories.find(c => c.id === catId)
  return cat?.name || '默认收藏'
}

const getUsageCount = (toolId) => {
  return toolStore.getUsageCount(toolId)
}

const goDetail = (id) => {
  toolStore.recordUsage(id)
  router.push(`/tool/${id}`)
}

const goHome = () => {
  router.push('/')
}

const handleRemove = (toolId) => {
  ElMessageBox.confirm('确定要取消收藏该工具吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    toolStore.toggleFavorite(toolId)
    ElMessage.success('已取消收藏')
  }).catch(() => {})
}

const handleCategoryChange = (toolId, categoryId) => {
  toolStore.setToolCategory(toolId, categoryId)
  ElMessage.success('已移动到对应分类')
}

const handleAddCategory = () => {
  if (!newCategoryForm.name.trim()) {
    ElMessage.warning('请输入分类名称')
    return
  }
  const newCat = {
    id: `cat_${Date.now()}`,
    name: newCategoryForm.name,
    color: newCategoryForm.color
  }
  toolStore.favoriteCategories.push(newCat)
  ElMessage.success('分类创建成功')
  showAddCategory.value = false
  newCategoryForm.name = ''
  newCategoryForm.color = '#409eff'
}

onMounted(() => {
  toolStore.loadFavorites()
})
</script>

<style lang="scss" scoped>
.favorites-page {
  padding: 40px 0;
}

.breadcrumb {
  margin-bottom: 24px;
}

.page-header {
  margin-bottom: 24px;

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

.category-tabs {
  padding: 16px 24px;
  margin-bottom: 20px;

  .tabs-header {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;

    .tab-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.3s;
      background: #f5f7fa;
      color: #666;

      &:hover {
        background: #e8ecef;
      }

      &.active {
        background: #409eff;
        color: #fff;

        .el-tag {
          background: rgba(255, 255, 255, 0.2) !important;
          color: #fff !important;
          border: none !important;
        }
      }

      .cat-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }

      &.add-btn {
        background: #f0f9eb;
        color: #67c23a;
        border: 1px dashed #67c23a;

        &:hover {
          background: #e1f3d8;
        }
      }
    }
  }
}

.favorites-container {
  .tools-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .favorite-item {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 20px;
    padding: 16px;
    overflow: hidden;

    .item-image {
      position: relative;
      cursor: pointer;
      height: 150px;
      border-radius: 8px;
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

      .cat-tag {
        position: absolute;
        top: 8px;
        left: 8px;
        border: none;
        color: #fff;
      }
    }

    .item-info {
      display: flex;
      flex-direction: column;

      .item-name {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 8px;
        color: #333;
        cursor: pointer;

        &:hover {
          color: #8b4513;
        }
      }

      .item-desc {
        font-size: 14px;
        color: #666;
        margin-bottom: 12px;
        flex: 1;
      }

      .item-meta {
        display: flex;
        gap: 20px;
        margin-bottom: 16px;
        font-size: 13px;
        color: #999;

        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }

      .item-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 12px;
        border-top: 1px solid #eee;

        .price-box {
          display: flex;
          align-items: baseline;
          gap: 12px;

          .price {
            font-size: 24px;
            font-weight: 700;
            color: #e6a23c;
          }

          .original-price {
            font-size: 14px;
            color: #999;
            text-decoration: line-through;
          }
        }

        .actions {
          display: flex;
          gap: 8px;
        }
      }
    }
  }
}
</style>
