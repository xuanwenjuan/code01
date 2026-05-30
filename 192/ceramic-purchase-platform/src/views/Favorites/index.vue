<template>
  <div class="favorites-page">
    <div class="container">
      <el-page-header @back="goBack" class="mb-20">
        <template #content>
          <span>我的收藏</span>
        </template>
      </el-page-header>

      <div class="card">
        <div v-if="favoritesStore.items.length > 0">
          <div class="favorites-header">
            <span>共收藏 {{ favoritesStore.totalCount }} 件商品</span>
            <div class="header-actions">
              <el-button type="primary" size="small" @click="showTagManager = true">
                <el-icon><PriceTag /></el-icon> 标签管理
              </el-button>
              <el-button type="danger" text @click="handleClearAll">
                <el-icon><Delete /></el-icon> 清空收藏
              </el-button>
            </div>
          </div>

          <div class="tag-filter">
            <el-tag
              v-for="tag in favoritesStore.allTags"
              :key="tag"
              :type="favoritesStore.activeTag === tag ? 'primary' : 'info'"
              :effect="favoritesStore.activeTag === tag ? 'dark' : 'plain'"
              class="filter-tag"
              @click="favoritesStore.activeTag = tag"
            >
              {{ tag === 'all' ? '全部' : tag }}
              <span class="tag-count">
                ({{ tag === 'all' ? favoritesStore.totalCount : favoritesStore.items.filter(i => i.tags && i.tags.includes(tag)).length }})
              </span>
            </el-tag>
          </div>

          <el-row :gutter="20" v-if="favoritesStore.filteredItems.length > 0">
            <el-col v-for="item in favoritesStore.filteredItems" :key="item.id" :span="6">
              <div class="favorite-item">
                <MaterialCard :material="item" />
                <div class="item-tags">
                  <el-tag
                    v-for="tag in item.tags"
                    :key="tag"
                    size="small"
                    class="item-tag"
                    closable
                    @close="handleRemoveItemTag(item.id, tag)"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
                <div class="item-actions">
                  <el-button size="small" @click="showTagEditor(item)">
                    <el-icon><PriceTag /></el-icon> 编辑标签
                  </el-button>
                  <el-button type="danger" size="small" @click="handleRemove(item.id)">
                    <el-icon><Delete /></el-icon> 取消收藏
                  </el-button>
                </div>
              </div>
            </el-col>
          </el-row>
          <EmptyState v-else description="该标签下暂无收藏" />
        </div>
        <EmptyState v-else description="暂无收藏的商品" show-action action-text="去逛逛" @action="goHome" />
      </div>
    </div>

    <el-dialog
      v-model="showTagManager"
      title="标签管理"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="tag-manager">
        <div class="add-tag-area">
          <el-input
            v-model="newTagName"
            placeholder="输入新标签名称"
            style="width: 300px"
            @keyup.enter="handleAddTag"
          />
          <el-button type="primary" @click="handleAddTag">
            <el-icon><Plus /></el-icon> 添加
          </el-button>
        </div>
        <div class="tag-list">
          <div v-for="tag in favoritesStore.tags" :key="tag" class="tag-item">
            <el-tag size="large">{{ tag }}</el-tag>
            <el-button
              type="danger"
              text
              size="small"
              @click="handleDeleteTag(tag)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
        <el-alert
          title="提示：删除标签后，商品上的该标签也会被移除"
          type="info"
          :closable="false"
          show-icon
          class="mt-16"
        />
      </div>
    </el-dialog>

    <el-dialog
      v-model="showTagDialog"
      title="编辑商品标签"
      width="500px"
      :close-on-click-modal="false"
    >
      <div v-if="currentItem" class="tag-editor">
        <div class="current-item">
          <img :src="currentItem.image" :alt="currentItem.name" class="item-thumb" />
          <div class="item-info">
            <div class="item-name">{{ currentItem.name }}</div>
            <div class="item-price">¥{{ currentItem.price }} / {{ currentItem.unit }}</div>
          </div>
        </div>
        <div class="tag-selector">
          <div class="selector-label">选择标签：</div>
          <el-checkbox-group v-model="selectedTags">
            <el-checkbox
              v-for="tag in favoritesStore.tags"
              :key="tag"
              :label="tag"
              class="tag-checkbox"
            />
          </el-checkbox-group>
        </div>
      </div>
      <template #footer>
        <el-button @click="showTagDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveTags">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useFavoritesStore } from '@/store/favorites'
import MaterialCard from '@/components/MaterialCard.vue'
import EmptyState from '@/components/EmptyState.vue'

const router = useRouter()
const favoritesStore = useFavoritesStore()

const showTagManager = ref(false)
const showTagDialog = ref(false)
const newTagName = ref('')
const currentItem = ref(null)
const selectedTags = ref([])

const goBack = () => {
  router.back()
}

const goHome = () => {
  router.push('/')
}

const handleRemove = (id) => {
  ElMessageBox.confirm('确定要取消收藏该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '再想想',
    type: 'warning'
  }).then(() => {
    favoritesStore.removeFavorite(id)
    ElMessage.success('已取消收藏')
  }).catch(() => {})
}

const handleClearAll = () => {
  ElMessageBox.confirm('确定要清空所有收藏吗？', '提示', {
    confirmButtonText: '确定清空',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    favoritesStore.clearFavorites()
    ElMessage.success('已清空收藏')
  }).catch(() => {})
}

const handleAddTag = () => {
  if (!newTagName.value.trim()) {
    ElMessage.warning('请输入标签名称')
    return
  }
  favoritesStore.addTag(newTagName.value.trim())
  newTagName.value = ''
  ElMessage.success('标签添加成功')
}

const handleDeleteTag = (tagName) => {
  ElMessageBox.confirm(`确定要删除标签"${tagName}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    favoritesStore.removeTag(tagName)
    favoritesStore.items.forEach(item => {
      if (item.tags) {
        const index = item.tags.indexOf(tagName)
        if (index > -1) {
          item.tags.splice(index, 1)
        }
      }
    })
    if (favoritesStore.activeTag === tagName) {
      favoritesStore.activeTag = 'all'
    }
    ElMessage.success('标签已删除')
  }).catch(() => {})
}

const showTagEditor = (item) => {
  currentItem.value = item
  selectedTags.value = [...(item.tags || [])]
  showTagDialog.value = true
}

const handleRemoveItemTag = (itemId, tagName) => {
  favoritesStore.removeItemTag(itemId, tagName)
  ElMessage.success('已移除标签')
}

const handleSaveTags = () => {
  if (currentItem.value) {
    favoritesStore.setItemTags(currentItem.value.id, [...selectedTags.value])
    ElMessage.success('标签保存成功')
    showTagDialog.value = false
  }
}
</script>

<style scoped>
.favorites-page {
  padding-bottom: 40px;
}

.favorites-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 14px;
  color: #606266;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.tag-filter {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  flex-wrap: wrap;
}

.filter-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.tag-count {
  margin-left: 4px;
  opacity: 0.8;
}

.favorite-item {
  margin-bottom: 20px;
}

.item-tags {
  margin: 12px 0;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  min-height: 24px;
}

.item-tag {
  cursor: pointer;
}

.item-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
}

.tag-manager {
  padding: 10px 0;
}

.add-tag-area {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #f5f7fa;
  border-radius: 4px;
}

.mt-16 {
  margin-top: 16px;
}

.tag-editor {
  padding: 10px 0;
}

.current-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.item-thumb {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.item-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
}

.item-price {
  font-size: 18px;
  color: #f56c6c;
  font-weight: bold;
}

.tag-selector {
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.selector-label {
  font-size: 14px;
  color: #303133;
  margin-bottom: 12px;
  font-weight: 500;
}

.tag-checkbox {
  margin-right: 20px;
  margin-bottom: 12px;
}
</style>
