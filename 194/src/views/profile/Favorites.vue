<template>
  <div class="favorites-page">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">我的收藏</h2>
        <p class="count-info">共收藏 {{ favoriteEquipments.length }} 件商品</p>
      </div>
      <div class="header-right">
        <el-tag 
          v-for="tag in allTags" 
          :key="tag" 
          :type="selectedTag === tag ? 'primary' : 'info'"
          effect="light"
          class="filter-tag"
          @click="toggleTagFilter(tag)"
        >
          {{ tag }} ({{ getTagCount(tag) }})
        </el-tag>
        <el-tag 
          v-if="selectedTag"
          type="danger"
          effect="dark"
          class="filter-tag clear-tag"
          @click="selectedTag = ''"
        >
          清除筛选
        </el-tag>
      </div>
    </div>

    <LoadingWrapper :loading="loading">
      <div v-if="filteredEquipments.length > 0" class="favorites-grid">
        <div
          v-for="item in filteredEquipments"
          :key="item.id"
          class="favorite-item"
        >
          <div class="item-image" @click="goDetail(item.id)">
            <img :src="item.image" :alt="item.name" />
            <el-button
              class="remove-btn"
              type="danger"
              size="small"
              circle
              @click.stop="removeFavorite(item.id)"
            >
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
          <div class="item-info">
            <h4 @click="goDetail(item.id)">{{ item.name }}</h4>
            <p class="item-desc">{{ item.description }}</p>
            
            <div class="tag-section">
              <div class="tags-list">
                <el-tag
                  v-for="tag in getTagsForEquipment(item.id)"
                  :key="tag"
                  size="small"
                  type="success"
                  effect="light"
                  closable
                  @close="removeTag(item.id, tag)"
                >
                  {{ tag }}
                </el-tag>
                <el-button
                  v-if="getTagsForEquipment(item.id).length < 5"
                  type="primary"
                  size="small"
                  text
                  @click="showTagDialog(item)"
                >
                  <el-icon><Plus /></el-icon>
                  添加标签
                </el-button>
              </div>
            </div>

            <div class="item-footer">
              <span class="price-text">¥{{ item.price.toLocaleString() }}</span>
              <div class="action-buttons">
                <el-button size="small" @click="goDetail(item.id)">
                  查看详情
                </el-button>
                <el-button type="primary" size="small" @click="handleBuy(item)">
                  立即采购
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <EmptyState v-else type="favorite" text="暂无收藏商品">
        <el-button type="primary" @click="goHome">
          去逛逛
        </el-button>
      </EmptyState>
    </LoadingWrapper>

    <el-dialog
      v-model="tagDialogVisible"
      title="添加标签"
      width="500px"
    >
      <div class="tag-dialog-content">
        <p class="dialog-tip">为 "{{ currentEquipment?.name }}" 添加标签</p>
        
        <div class="available-tags">
          <h5>可选标签：</h5>
          <div class="tags-cloud">
            <el-tag
              v-for="tag in equipmentStore.availableTags"
              :key="tag"
              :type="isTagSelected(tag) ? 'primary' : 'info'"
              effect="light"
              class="selectable-tag"
              @click="toggleTag(tag)"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>

        <div class="create-tag">
          <h5>创建新标签：</h5>
          <div class="create-tag-input">
            <el-input
              v-model="newTagName"
              placeholder="输入新标签名称"
              maxlength="10"
              clearable
              @keyup.enter="createNewTag"
            />
            <el-button type="primary" @click="createNewTag">创建</el-button>
          </div>
        </div>

        <div class="selected-tags">
          <h5>已选标签：</h5>
          <div class="tags-cloud" v-if="selectedTags.length > 0">
            <el-tag
              v-for="tag in selectedTags"
              :key="tag"
              type="primary"
              effect="dark"
              closable
              @close="removeFromSelected(tag)"
            >
              {{ tag }}
            </el-tag>
          </div>
          <p v-else class="empty-tip">暂未选择标签</p>
        </div>
      </div>

      <template #footer>
        <el-button @click="tagDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTags" :disabled="selectedTags.length === 0">
          确认添加
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useEquipmentStore } from '@/store/equipment'
import { useOrderStore } from '@/store/order'
import LoadingWrapper from '@/components/LoadingWrapper.vue'
import EmptyState from '@/components/EmptyState.vue'

const router = useRouter()
const equipmentStore = useEquipmentStore()
const orderStore = useOrderStore()

const loading = ref(false)
const tagDialogVisible = ref(false)
const currentEquipment = ref(null)
const newTagName = ref('')
const selectedTags = ref([])
const selectedTag = ref('')

const favoriteEquipments = computed(() => {
  return equipmentStore.getFavoriteEquipments()
})

const allTags = computed(() => {
  return equipmentStore.availableTags
})

const filteredEquipments = computed(() => {
  if (!selectedTag.value) return favoriteEquipments.value
  return favoriteEquipments.value.filter(item =>
    equipmentStore.getTagsForEquipment(item.id).includes(selectedTag.value)
  )
})

const getTagsForEquipment = (equipmentId) => {
  return equipmentStore.getTagsForEquipment(equipmentId)
}

const getTagCount = (tag) => {
  return favoriteEquipments.value.filter(item =>
    equipmentStore.getTagsForEquipment(item.id).includes(tag)
  ).length
}

const toggleTagFilter = (tag) => {
  selectedTag.value = selectedTag.value === tag ? '' : tag
}

const isTagSelected = (tag) => {
  return selectedTags.value.includes(tag)
}

const toggleTag = (tag) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

const removeFromSelected = (tag) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  }
}

const createNewTag = () => {
  if (!newTagName.value.trim()) {
    ElMessage.warning('请输入标签名称')
    return
  }
  if (equipmentStore.availableTags.includes(newTagName.value.trim())) {
    ElMessage.warning('该标签已存在')
    return
  }
  equipmentStore.createNewTag(newTagName.value.trim())
  if (!selectedTags.value.includes(newTagName.value.trim())) {
    selectedTags.value.push(newTagName.value.trim())
  }
  newTagName.value = ''
  ElMessage.success('标签创建成功')
}

const showTagDialog = (equipment) => {
  currentEquipment.value = equipment
  selectedTags.value = [...equipmentStore.getTagsForEquipment(equipment.id)]
  newTagName.value = ''
  tagDialogVisible.value = true
}

const saveTags = () => {
  if (!currentEquipment.value) return
  
  const currentTags = equipmentStore.getTagsForEquipment(currentEquipment.value.id)
  
  currentTags.forEach(tag => {
    if (!selectedTags.value.includes(tag)) {
      equipmentStore.removeTagFromEquipment(currentEquipment.value.id, tag)
    }
  })
  
  selectedTags.value.forEach(tag => {
    if (!currentTags.includes(tag)) {
      equipmentStore.addTagToEquipment(currentEquipment.value.id, tag)
    }
  })
  
  tagDialogVisible.value = false
  ElMessage.success('标签保存成功')
}

const removeTag = (equipmentId, tag) => {
  ElMessageBox.confirm(`确定要移除标签 "${tag}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    equipmentStore.removeTagFromEquipment(equipmentId, tag)
    ElMessage.success('标签已移除')
  }).catch(() => {})
}

const goDetail = (id) => {
  router.push(`/equipment/${id}`)
}

const goHome = () => {
  router.push('/')
}

const removeFavorite = (id) => {
  ElMessageBox.confirm('确定要取消收藏该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    equipmentStore.toggleFavorite(id)
    ElMessage.success('已取消收藏')
  }).catch(() => {})
}

const handleBuy = (item) => {
  orderStore.createOrder(item, 1)
  ElMessage.success('采购订单已创建')
  router.push('/profile/orders')
}
</script>

<style lang="scss" scoped>
.favorites-page {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2d3d;
  margin-bottom: 8px;
}

.count-info {
  font-size: 14px;
  color: #909399;
}

.header-right {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.filter-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.clear-tag {
  cursor: pointer;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.favorite-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.favorite-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.item-image {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.9);
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.item-info h4 {
  font-size: 15px;
  font-weight: 600;
  color: #1f2d3d;
  margin-bottom: 6px;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-info h4:hover {
  color: #409eff;
}

.item-desc {
  font-size: 13px;
  color: #909399;
  margin-bottom: 12px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.tag-section {
  margin-bottom: 12px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.price-text {
  font-size: 18px;
  font-weight: 700;
  color: #f56c6c;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.tag-dialog-content {
  padding: 10px 0;
}

.dialog-tip {
  font-size: 14px;
  color: #606266;
  margin-bottom: 20px;
}

.available-tags,
.create-tag,
.selected-tags {
  margin-bottom: 20px;
}

.available-tags h5,
.create-tag h5,
.selected-tags h5 {
  font-size: 14px;
  font-weight: 600;
  color: #1f2d3d;
  margin-bottom: 12px;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.selectable-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.create-tag-input {
  display: flex;
  gap: 8px;
}

.empty-tip {
  font-size: 13px;
  color: #909399;
}
</style>
