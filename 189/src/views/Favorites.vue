<template>
  <div class="favorites-page">
    <div class="container page-wrapper">
      <div class="page-header">
        <h2 class="page-title">我的收藏</h2>
        <div class="header-actions">
          <el-button 
            v-if="favoriteStore.selectedIds.length > 0"
            type="danger" 
            text
            @click="handleBatchRemove"
          >
            删除选中 ({{ favoriteStore.selectedIds.length }})
          </el-button>
          <el-button 
            v-if="favoriteStore.selectedIds.length > 0"
            type="primary" 
            text
            @click="showBatchCategoryDialog = true"
          >
            批量分类
          </el-button>
          <el-button 
            v-if="favoriteStore.favoriteProducts.length > 0"
            type="danger" 
            text
            @click="handleClearAll"
          >
            清空收藏
          </el-button>
        </div>
      </div>

      <div class="category-tabs card">
        <div 
          v-for="cat in favoriteStore.categoryStats" 
          :key="cat.id"
          class="category-tab"
          :class="{ active: currentCategory === cat.id }"
          @click="currentCategory = cat.id"
        >
          <span class="dot" :style="{ background: cat.color }"></span>
          <span class="name">{{ cat.name }}</span>
          <span class="count">{{ cat.count }}</span>
        </div>
        <el-button 
          type="primary" 
          text 
          size="small"
          class="add-category-btn"
          @click="showAddCategoryDialog = true"
        >
          <el-icon><Plus /></el-icon>
          新建分类
        </el-button>
      </div>

      <div class="toolbar card" v-if="filteredFavorites.length > 0">
        <el-checkbox 
          :model-value="isAllSelected"
          :indeterminate="isIndeterminate"
          @change="handleSelectAll"
        >
          全选
        </el-checkbox>
        <el-button 
          v-if="favoriteStore.selectedIds.length > 0"
          size="small"
          @click="favoriteStore.clearSelection()"
        >
          取消选择
        </el-button>
        <div class="toolbar-right">
          <span>共 <b>{{ filteredFavorites.length }}</b> 件收藏</span>
        </div>
      </div>

      <AppListContainer
        :data="paginatedFavorites"
        :loading="loading"
        :total="filteredFavorites.length"
        :page-size="pageSize"
        empty-text="暂无收藏的原料"
        @page-change="handlePageChange"
      >
        <template #empty-action>
          <el-button type="primary" @click="$router.push('/products')">去选购</el-button>
        </template>

        <div class="product-grid">
          <div 
            v-for="item in paginatedFavorites" 
            :key="item.productId"
            class="product-item"
          >
            <div class="select-box">
              <el-checkbox 
                :model-value="favoriteStore.selectedIds.includes(item.productId)"
                @change="favoriteStore.toggleSelect(item.productId)"
              />
            </div>
            <ProductCard :product="item.product" />
            <div class="item-actions">
              <el-dropdown trigger="click" @command="(val) => handleCategoryChange(item.productId, val)">
                <el-button type="primary" text size="small">
                  <el-icon><Folder /></el-icon>
                  分类
                  <el-icon><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                      v-for="cat in favoriteStore.categories"
                      :key="cat.id"
                      :command="cat.id"
                      :disabled="cat.id === 'default'"
                    >
                      <span class="dot" :style="{ background: cat.color }"></span>
                      {{ cat.name }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <el-button 
                type="danger" 
                text 
                size="small"
                @click="handleRemove(item.productId)"
              >
                <el-icon><Delete /></el-icon>
                移除
              </el-button>
            </div>
          </div>
        </div>
      </AppListContainer>
    </div>

    <AppConfirmDialog
      v-model="confirmVisible"
      :title="confirmConfig.title"
      :message="confirmConfig.message"
      :type="confirmConfig.type"
      :confirm-text="confirmConfig.confirmText"
      confirm-type="danger"
      @confirm="handleConfirmAction"
    />

    <el-dialog
      v-model="showAddCategoryDialog"
      title="新建分类"
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
        <el-button @click="showAddCategoryDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddCategory">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="showBatchCategoryDialog"
      title="批量修改分类"
      width="400px"
    >
      <p>已选择 <b>{{ favoriteStore.selectedIds.length }}</b> 件商品</p>
      <el-form label-width="80px" style="margin-top: 20px">
        <el-form-item label="选择分类">
          <el-select v-model="batchCategoryId" placeholder="请选择分类" style="width: 100%">
            <el-option
              v-for="cat in favoriteStore.categories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showBatchCategoryDialog = false">取消</el-button>
        <el-button type="primary" @click="handleBatchCategory">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Folder, ArrowDown, Delete } from '@element-plus/icons-vue'
import { useFavoriteStore } from '@/store/favorite'
import ProductCard from '@/components/ProductCard.vue'
import AppListContainer from '@/components/AppListContainer.vue'
import AppConfirmDialog from '@/components/AppConfirmDialog.vue'

const favoriteStore = useFavoriteStore()

const loading = ref(true)
const currentCategory = ref('default')
const pageSize = ref(8)
const currentPage = ref(1)
const confirmVisible = ref(false)
const showAddCategoryDialog = ref(false)
const showBatchCategoryDialog = ref(false)
const batchCategoryId = ref('')

const confirmConfig = reactive({
  title: '',
  message: '',
  type: 'warning',
  confirmText: '确定',
  action: null
})

const newCategoryForm = reactive({
  name: '',
  color: '#8B4513'
})

const filteredFavorites = computed(() => {
  if (currentCategory.value === 'default') {
    return favoriteStore.favoriteProducts
  }
  return favoriteStore.favoriteProducts.filter(f => f.category === currentCategory.value)
})

const paginatedFavorites = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredFavorites.value.slice(start, end)
})

const isAllSelected = computed(() => {
  return filteredFavorites.value.length > 0 && 
         filteredFavorites.value.every(f => favoriteStore.selectedIds.includes(f.productId))
})

const isIndeterminate = computed(() => {
  const selectedCount = filteredFavorites.value.filter(f => 
    favoriteStore.selectedIds.includes(f.productId)
  ).length
  return selectedCount > 0 && selectedCount < filteredFavorites.value.length
})

function handlePageChange({ page }) {
  currentPage.value = page
}

function handleSelectAll() {
  const productIds = filteredFavorites.value.map(f => f.productId)
  favoriteStore.selectAll(productIds)
}

function handleCategoryChange(productId, categoryId) {
  favoriteStore.updateCategory(productId, categoryId)
  ElMessage.success('分类已更新')
}

function handleRemove(productId) {
  confirmConfig.title = '移除收藏'
  confirmConfig.message = '确定要移除该收藏吗？'
  confirmConfig.type = 'warning'
  confirmConfig.confirmText = '移除'
  confirmConfig.action = () => {
    favoriteStore.removeFavorite(productId)
    ElMessage.success('已取消收藏')
  }
  confirmVisible.value = true
}

function handleBatchRemove() {
  confirmConfig.title = '批量移除'
  confirmConfig.message = `确定要移除选中的 ${favoriteStore.selectedIds.length} 件收藏吗？`
  confirmConfig.type = 'danger'
  confirmConfig.confirmText = '删除'
  confirmConfig.action = () => {
    favoriteStore.removeFavorites([...favoriteStore.selectedIds])
    ElMessage.success('已批量移除')
  }
  confirmVisible.value = true
}

function handleClearAll() {
  confirmConfig.title = '清空收藏'
  confirmConfig.message = '确定要清空所有收藏吗？此操作不可恢复。'
  confirmConfig.type = 'danger'
  confirmConfig.confirmText = '清空'
  confirmConfig.action = () => {
    favoriteStore.clearFavorites()
    ElMessage.success('已清空收藏')
  }
  confirmVisible.value = true
}

function handleAddCategory() {
  if (!newCategoryForm.name.trim()) {
    ElMessage.warning('请输入分类名称')
    return
  }
  favoriteStore.addCategory(newCategoryForm.name.trim(), newCategoryForm.color)
  ElMessage.success('分类创建成功')
  newCategoryForm.name = ''
  newCategoryForm.color = '#8B4513'
  showAddCategoryDialog.value = false
}

function handleBatchCategory() {
  if (!batchCategoryId.value) {
    ElMessage.warning('请选择分类')
    return
  }
  favoriteStore.batchUpdateCategory([...favoriteStore.selectedIds], batchCategoryId.value)
  ElMessage.success('批量分类成功')
  batchCategoryId.value = ''
  showBatchCategoryDialog.value = false
}

function handleConfirmAction() {
  if (confirmConfig.action) {
    confirmConfig.action()
  }
}

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 300)
})
</script>

<style lang="scss" scoped>
.favorites-page {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: $text-color;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .category-tabs {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 20px;
    margin-bottom: 20px;
    overflow-x: auto;

    .category-tab {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;

      &:hover, &.active {
        background: #f5f0eb;

        .name {
          color: $primary-color;
        }
      }

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }

      .name {
        font-size: 14px;
        color: $text-color;
      }

      .count {
        font-size: 12px;
        color: $text-light;
        background: rgba(0, 0, 0, 0.05);
        padding: 1px 6px;
        border-radius: 10px;
      }
    }

    .add-category-btn {
      margin-left: auto;
      flex-shrink: 0;
    }
  }

  .toolbar {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 20px;
    margin-bottom: 20px;

    .toolbar-right {
      margin-left: auto;
      font-size: 14px;
      color: $text-light;

      b {
        color: $primary-color;
        margin: 0 4px;
      }
    }
  }

  .product-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;

    .product-item {
      position: relative;

      .select-box {
        position: absolute;
        top: 8px;
        left: 8px;
        z-index: 20;
        background: rgba(255, 255, 255, 0.9);
        padding: 4px;
        border-radius: 4px;
      }

      .item-actions {
        display: flex;
        justify-content: space-between;
        padding: 8px 12px;
        background: #fafafa;
        border-radius: 0 0 8px 8px;
      }
    }
  }
}

@media (max-width: 1200px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr) !important;
  }
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}
</style>
