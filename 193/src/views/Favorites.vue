<template>
  <div class="favorites-page">
    <div class="container">
      <el-card>
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <span>我的收藏 ({{ favoriteStore.favorites.length }})</span>
              <el-button 
                type="primary" 
                size="small" 
                @click="showAddCategory = true"
              >
                <el-icon><Plus /></el-icon>
                新建分类
              </el-button>
              <el-button 
                v-if="favoriteStore.favorites.length > 0" 
                type="danger" 
                size="small"
                @click="clearFavorites"
              >
                清空收藏
              </el-button>
            </div>
            <el-tabs v-model="activeCategory" class="category-tabs" size="small">
              <el-tab-pane label="全部" name="all" />
              <el-tab-pane 
                v-for="cat in favoriteStore.categories" 
                :key="cat.id" 
                :label="cat.name" 
                :name="cat.id"
              />
            </el-tabs>
          </div>
        </template>

        <div v-if="filteredFavorites.length > 0">
          <el-row :gutter="20">
            <el-col :span="6" v-for="item in filteredFavorites" :key="item.id">
              <div class="favorite-item">
                <div class="item-actions">
                  <el-dropdown trigger="click" @command="(cmd) => handleCategoryChange(item.id, cmd)">
                    <el-button size="small" type="primary" plain>
                      分类 <el-icon><ArrowDown /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item 
                          v-for="cat in favoriteStore.categories" 
                          :key="cat.id"
                          :command="cat.id"
                        >
                          <span :style="{ color: cat.color }">●</span> {{ cat.name }}
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                  <el-button size="small" type="danger" plain @click="removeFavorite(item.id)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
                <div class="item-category" :style="{ background: getCategoryColor(item.categoryId) + '20' }">
                  <span :style="{ color: getCategoryColor(item.categoryId) }">
                    {{ getCategoryName(item.categoryId) }}
                  </span>
                </div>
                <EquipmentCard :equipment="getEquipment(item.id)" />
              </div>
            </el-col>
          </el-row>
        </div>

        <EmptyState v-else text="暂无收藏" type="favorite">
          <template #action>
            <el-button type="primary" @click="goHome">去逛逛</el-button>
          </template>
        </EmptyState>
      </el-card>

      <el-card class="category-manage-card" v-if="favoriteStore.categories.length > 0">
        <template #header>
          <span>分类管理</span>
        </template>
        <div class="category-list">
          <div 
            v-for="cat in favoriteStore.categories" 
            :key="cat.id"
            class="category-item"
          >
            <div class="category-color" :style="{ background: cat.color }"></div>
            <span class="category-name">{{ cat.name }}</span>
            <span class="category-count">
              {{ (favoriteStore.favoritesByCategory[cat.id] || []).length }} 件
            </span>
            <div class="category-actions">
              <el-button 
                size="small" 
                @click="editCategory(cat)"
                :disabled="cat.id === 'default'"
              >
                编辑
              </el-button>
              <el-button 
                size="small" 
                type="danger" 
                @click="deleteCategory(cat.id)"
                :disabled="cat.id === 'default'"
              >
                删除
              </el-button>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <el-dialog v-model="showAddCategory" title="新建分类" width="400px">
      <el-form :model="categoryForm" label-width="80px">
        <el-form-item label="分类名称">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类颜色">
          <el-color-picker v-model="categoryForm.color" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddCategory = false">取消</el-button>
        <el-button type="primary" @click="addCategory">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showEditCategory" title="编辑分类" width="400px">
      <el-form :model="editCategoryForm" label-width="80px">
        <el-form-item label="分类名称">
          <el-input v-model="editCategoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类颜色">
          <el-color-picker v-model="editCategoryForm.color" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditCategory = false">取消</el-button>
        <el-button type="primary" @click="updateCategory">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useFavoriteStore } from '@/stores/favorite'
import { useEquipmentStore } from '@/stores/equipment'
import EmptyState from '@/components/EmptyState.vue'
import EquipmentCard from '@/components/EquipmentCard.vue'
import { Plus, ArrowDown, Delete } from '@element-plus/icons-vue'

const router = useRouter()
const favoriteStore = useFavoriteStore()
const equipmentStore = useEquipmentStore()

const activeCategory = ref('all')
const showAddCategory = ref(false)
const showEditCategory = ref(false)

const categoryForm = ref({
  name: '',
  color: '#409eff'
})

const editCategoryForm = ref({
  id: '',
  name: '',
  color: '#409eff'
})

const filteredFavorites = computed(() => {
  if (activeCategory.value === 'all') {
    return favoriteStore.favorites
  }
  return favoriteStore.favorites.filter(f => f.categoryId === activeCategory.value)
})

function getEquipment(id) {
  return equipmentStore.getEquipmentById(id) || {}
}

function getCategoryName(categoryId) {
  const cat = favoriteStore.getCategoryById(categoryId)
  return cat?.name || '默认收藏'
}

function getCategoryColor(categoryId) {
  const cat = favoriteStore.getCategoryById(categoryId)
  return cat?.color || '#409eff'
}

function handleCategoryChange(equipmentId, categoryId) {
  favoriteStore.updateFavoriteCategory(equipmentId, categoryId)
  ElMessage.success('分类已更新')
}

function removeFavorite(id) {
  ElMessageBox.confirm('确定要移除该收藏吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    favoriteStore.removeFavorite(id)
    ElMessage.success('已移除收藏')
  }).catch(() => {})
}

function clearFavorites() {
  ElMessageBox.confirm('确定要清空所有收藏吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    favoriteStore.clearFavorites()
    ElMessage.success('已清空收藏')
  }).catch(() => {})
}

function addCategory() {
  if (!categoryForm.value.name.trim()) {
    ElMessage.warning('请输入分类名称')
    return
  }
  favoriteStore.addCategory(categoryForm.value.name, categoryForm.value.color)
  ElMessage.success('分类创建成功')
  showAddCategory.value = false
  categoryForm.value = { name: '', color: '#409eff' }
}

function editCategory(cat) {
  editCategoryForm.value = {
    id: cat.id,
    name: cat.name,
    color: cat.color
  }
  showEditCategory.value = true
}

function updateCategory() {
  if (!editCategoryForm.value.name.trim()) {
    ElMessage.warning('请输入分类名称')
    return
  }
  favoriteStore.updateCategory(
    editCategoryForm.value.id,
    editCategoryForm.value.name,
    editCategoryForm.value.color
  )
  ElMessage.success('分类更新成功')
  showEditCategory.value = false
}

function deleteCategory(categoryId) {
  ElMessageBox.confirm('删除分类后，该分类下的收藏将移至默认分类，确定删除吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    favoriteStore.removeCategory(categoryId)
    ElMessage.success('分类已删除')
  }).catch(() => {})
}

function goHome() {
  router.push('/')
}
</script>

<style scoped>
.favorites-page {
  padding: 20px 0;
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-tabs {
  margin: 0;
}

.favorite-item {
  position: relative;
}

.item-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 6px;
  z-index: 10;
}

.item-category {
  position: absolute;
  top: 50px;
  left: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 10;
}

.category-manage-card {
  margin-top: 20px;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.category-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
}

.category-name {
  flex: 1;
  font-size: 14px;
  color: #303133;
}

.category-count {
  font-size: 12px;
  color: #909399;
  margin-right: 16px;
}

.category-actions {
  display: flex;
  gap: 8px;
}
</style>
