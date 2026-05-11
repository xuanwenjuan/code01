<script setup lang="ts">
import { computed } from 'vue'
import type { Book } from '@/types'
import { READING_STATUS_COLORS, READING_STATUS_LABELS, LONG_UNREAD_DAYS } from '@/constants'
import dayjs from 'dayjs'

const props = defineProps<{
  book: Book
}>()

const emit = defineEmits<{
  (e: 'edit', book: Book): void
  (e: 'delete', book: Book): void
  (e: 'read', book: Book): void
  (e: 'view', book: Book): void
}>()

const progress = computed(() => {
  if (props.book.totalPages === 0) return 0
  return Math.round((props.book.currentPage / props.book.totalPages) * 100)
})

const isLongUnread = computed(() => {
  if (props.book.readingStatus !== 'reading') return false
  const daysSinceUpdate = dayjs().diff(dayjs(props.book.updatedAt), 'day')
  return daysSinceUpdate >= LONG_UNREAD_DAYS
})

const cardClass = computed(() => {
  return {
    'book-card': true,
    'warning-highlight': isLongUnread.value
  }
})

const handleEdit = () => {
  emit('edit', props.book)
}

const handleDelete = () => {
  emit('delete', props.book)
}

const handleRead = () => {
  emit('read', props.book)
}

const handleView = () => {
  emit('view', props.book)
}
</script>

<template>
  <el-card :class="cardClass" shadow="hover" @click="handleView">
    <div class="book-cover">
      <el-image
        :src="book.cover"
        fit="cover"
        :preview-src-list="[book.cover]"
      >
        <template #error>
          <div class="image-slot">
            <el-icon :size="40"><Reading /></el-icon>
          </div>
        </template>
      </el-image>
      <el-tag
        v-if="isLongUnread"
        type="warning"
        class="warning-tag"
        effect="dark"
      >
        长期未读
      </el-tag>
    </div>

    <div class="book-info">
      <h3 class="book-title" :title="book.title">{{ book.title }}</h3>
      <p class="book-author">{{ book.author }}</p>
      
      <div class="status-row">
        <el-tag :type="READING_STATUS_COLORS[book.readingStatus]" size="small">
          {{ READING_STATUS_LABELS[book.readingStatus] }}
        </el-tag>
      </div>

      <div class="progress-section">
        <el-progress
          :percentage="progress"
          :stroke-width="6"
          :show-text="false"
        />
        <span class="progress-text">{{ book.currentPage }}/{{ book.totalPages }}</span>
      </div>

      <div class="location" :title="book.location">
        <el-icon><Location /></el-icon>
        <span>{{ book.location || '未设置' }}</span>
      </div>
    </div>

    <div class="actions">
      <el-tooltip content="继续阅读" placement="top">
        <el-button type="primary" size="small" circle @click.stop="handleRead">
          <el-icon><Reading /></el-icon>
        </el-button>
      </el-tooltip>
      <el-tooltip content="编辑" placement="top">
        <el-button type="primary" size="small" circle plain @click.stop="handleEdit">
          <el-icon><Edit /></el-icon>
        </el-button>
      </el-tooltip>
      <el-tooltip content="删除" placement="top">
        <el-button type="danger" size="small" circle plain @click.stop="handleDelete">
          <el-icon><Delete /></el-icon>
        </el-button>
      </el-tooltip>
    </div>
  </el-card>
</template>

<style scoped lang="scss">
.book-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
  }

  :deep(.el-card__body) {
    padding: 16px;
    flex: 1;
    display: flex;
    flex-direction: column;
  }
}

.book-cover {
  position: relative;
  height: 180px;
  margin-bottom: 12px;
  border-radius: 4px;
  overflow: hidden;
  background: #f5f7fa;

  :deep(.el-image) {
    width: 100%;
    height: 100%;
  }

  .image-slot {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: #f5f7fa;
    color: #909399;
  }

  .warning-tag {
    position: absolute;
    top: 8px;
    right: 8px;
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
}

.book-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.book-title {
  font-size: 16px;
  font-weight: 600;
  color: $text-primary;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-author {
  font-size: 13px;
  color: $text-secondary;
  margin: 0 0 10px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-row {
  margin-bottom: 10px;
}

.progress-section {
  margin-bottom: 8px;

  .progress-text {
    font-size: 12px;
    color: $text-secondary;
    display: block;
    text-align: right;
    margin-top: 2px;
  }
}

.location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: $text-secondary;

  .el-icon {
    font-size: 14px;
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.actions {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid $border-color-light;
}
</style>
