<template>
  <div class="page-container files-page">
    <PageHeader title="文件资料">
      <template #subtitle>
        <el-tag type="info" effect="plain">共 {{ filteredList.length }} 个文件</el-tag>
      </template>
    </PageHeader>

    <div class="content-wrapper">
      <BaseCard class="sidebar" :hover="false">
        <template #header>
          <span class="sidebar-title">文件分类</span>
        </template>
        <div class="category-list">
          <div
            v-for="cat in fileCategories"
            :key="cat"
            class="category-item"
            :class="{ active: currentCategory === cat }"
            @click="currentCategory = cat"
          >
            <span>{{ cat }}</span>
            <el-tag size="small" type="info">{{ getCategoryCount(cat) }}</el-tag>
          </div>
        </div>
      </BaseCard>

      <BaseCard class="main-content" :hover="false">
        <div class="toolbar">
          <el-input
            v-model="keyword"
            placeholder="搜索文件名..."
            :prefix-icon="Search"
            clearable
            style="width: 280px"
          />
          <el-button type="primary" @click="handleRefresh">
            <el-icon><Refresh /></el-icon>刷新
          </el-button>
        </div>

        <el-empty v-if="filteredList.length === 0" description="暂无文件" />

        <div v-else class="file-grid">
          <div
            v-for="file in filteredList"
            :key="file.id"
            class="file-card"
            @click="previewFile(file)"
          >
            <div class="file-icon" :class="file.type">
              <el-icon :size="36">
                <Document v-if="file.type === 'pdf' || file.type === 'docx'" />
                <Picture v-else-if="file.type === 'png' || file.type === 'jpg'" />
                <VideoCamera v-else-if="file.type === 'mp4'" />
                <Folder v-else-if="file.type === 'zip'" />
                <Tickets v-else-if="file.type === 'pptx'" />
                <DataAnalysis v-else-if="file.type === 'xlsx'" />
                <Document v-else />
              </el-icon>
            </div>
            <div class="file-info">
              <p class="file-name" :title="file.name">{{ file.name }}</p>
              <p class="file-meta">{{ formatFileSize(file.size) }} · {{ file.createTime.split(' ')[0] }}</p>
            </div>
            <div class="file-actions">
              <el-icon
                :class="{ 'is-favorite': file.isFavorite }"
                class="favorite-icon"
                @click.stop="toggleFavorite(file)"
              >
                <Star v-if="file.isFavorite" />
                <StarFilled v-else />
              </el-icon>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>

    <el-dialog v-model="previewVisible" title="文件预览" width="600px" destroy-on-close>
      <div v-if="currentFile" class="file-preview">
        <div class="preview-icon" :class="currentFile.type">
          <el-icon :size="64">
            <Document v-if="currentFile.type === 'pdf' || currentFile.type === 'docx'" />
            <Picture v-else-if="currentFile.type === 'png' || currentFile.type === 'jpg'" />
            <VideoCamera v-else-if="currentFile.type === 'mp4'" />
            <Folder v-else-if="currentFile.type === 'zip'" />
            <Tickets v-else-if="currentFile.type === 'pptx'" />
            <DataAnalysis v-else-if="currentFile.type === 'xlsx'" />
            <Document v-else />
          </el-icon>
        </div>
        <h3 class="preview-name">{{ currentFile.name }}</h3>
        <el-descriptions :column="2" border size="small" class="mt-20">
          <el-descriptions-item label="文件大小">{{ formatFileSize(currentFile.size) }}</el-descriptions-item>
          <el-descriptions-item label="上传人">{{ currentFile.uploader }}</el-descriptions-item>
          <el-descriptions-item label="上传时间" :span="2">{{ currentFile.createTime }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <el-button @click="previewVisible = false">关闭</el-button>
        <el-button type="primary" @click="downloadFile(currentFile)">下载</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Star, StarFilled, Document, Picture, VideoCamera, Folder, Tickets, DataAnalysis } from '@element-plus/icons-vue'
import { useDataStore } from '@/stores/data'
import BaseCard from '@/components/BaseCard.vue'
import PageHeader from '@/components/PageHeader.vue'

const store = useDataStore()

const keyword = ref('')
const currentCategory = ref('全部')
const previewVisible = ref(false)
const currentFile = ref(null)

const fileCategories = computed(() => store.fileCategories)

const filteredList = computed(() => {
  let list = store.getFilesByCategory(currentCategory.value)
  if (keyword.value) {
    list = store.searchFiles(keyword.value)
  }
  return list
})

const getCategoryCount = (cat) => {
  return store.getFilesByCategory(cat).length
}

const toggleFavorite = (file) => {
  store.toggleFileFavorite(file.id)
  ElMessage.success(file.isFavorite ? '已取消收藏' : '已收藏')
}

const previewFile = (file) => {
  currentFile.value = file
  previewVisible.value = true
}

const downloadFile = (file) => {
  ElMessage.info(`正在下载：${file.name}`)
}

const handleRefresh = () => {
  keyword.value = ''
  currentCategory.value = '全部'
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>

<style scoped lang="scss">
.files-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-wrapper {
  display: flex;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

.sidebar {
  width: 220px;
  flex-shrink: 0;
  
  :deep(.card-body) {
    padding: 8px;
  }
}

.sidebar-title {
  font-weight: 600;
  font-size: 15px;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  .category-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    border-radius: var(--radius-small);
    cursor: pointer;
    transition: all var(--transition-fast);
    font-size: 14px;
    
    &:hover {
      background: var(--bg-light);
    }
    
    &.active {
      background: var(--color-primary-light);
      color: var(--color-primary);
      font-weight: 500;
    }
  }
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  
  :deep(.card-body) {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.file-grid {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.file-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-small);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  
  &:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-medium);
    transform: translateY(-2px);
  }
  
  .file-icon {
    width: 64px;
    height: 64px;
    border-radius: var(--radius-small);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
    color: var(--color-primary);
    background: var(--color-primary-light);
    
    &.pdf { background: #fef0f0; color: #f56c6c; }
    &.docx { background: #ecf5ff; color: #409eff; }
    &.xlsx { background: #f0f9eb; color: #67c23a; }
    &.pptx { background: #fdf6ec; color: #e6a23c; }
    &.png, &.jpg { background: #f4f4f5; color: #909399; }
    &.zip { background: #f4f4f5; color: #909399; }
    &.mp4 { background: #fef0f0; color: #f56c6c; }
  }
  
  .file-info {
    text-align: center;
    width: 100%;
    
    .file-name {
      font-size: 14px;
      margin: 0 0 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .file-meta {
      font-size: 12px;
      color: var(--text-secondary);
      margin: 0;
    }
  }
  
  .file-actions {
    position: absolute;
    top: 8px;
    right: 8px;
    
    .favorite-icon {
      color: #c0c4cc;
      font-size: 18px;
      
      &.is-favorite {
        color: var(--color-warning);
      }
    }
  }
}

.file-preview {
  text-align: center;
  
  .preview-icon {
    width: 100px;
    height: 100px;
    border-radius: var(--radius-medium);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    color: var(--color-primary);
    background: var(--color-primary-light);
    
    &.pdf { background: #fef0f0; color: #f56c6c; }
    &.docx { background: #ecf5ff; color: #409eff; }
    &.xlsx { background: #f0f9eb; color: #67c23a; }
    &.pptx { background: #fdf6ec; color: #e6a23c; }
    &.png, &.jpg { background: #f4f4f5; color: #909399; }
    &.zip { background: #f4f4f5; color: #909399; }
    &.mp4 { background: #fef0f0; color: #f56c6c; }
  }
  
  .preview-name {
    font-size: 18px;
    margin: 0;
  }
}

.mt-20 {
  margin-top: 20px;
}
</style>
