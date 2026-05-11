<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useBookStore } from '@/stores/bookStore'
import { useReadingStore } from '@/stores/readingStore'
import { useLogStore } from '@/stores/logStore'
import { getMockBooks, getMockRecords, getMockLogs } from '@/mock'
import { 
  BOOK_CATEGORY_OPTIONS, 
  READING_STATUS_OPTIONS, 
  getBookCategoryLabel,
  getReadingStatusLabel,
  getReadingStatusColor
} from '@/constants'
import type { Book, ReadingSubmitData, BookFilter } from '@/types'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import BookDialog from '@/components/BookDialog.vue'
import ReadingDialog from '@/components/ReadingDialog.vue'

const bookStore = useBookStore()
const readingStore = useReadingStore()
const logStore = useLogStore()

onMounted(() => {
  if (bookStore.books.length === 0) {
    bookStore.setBooks(getMockBooks())
  }
  if (readingStore.records.length === 0) {
    readingStore.records = getMockRecords()
  }
  if (logStore.logs.length === 0) {
    logStore.logs = getMockLogs()
  }
})

const bookDialogVisible = ref(false)
const readingDialogVisible = ref(false)
const editingBook = ref<Book | null>(null)

const dateRange = ref<[string, string] | undefined>(undefined)

const currentFilter = computed<BookFilter>(() => bookStore.filter)

const filteredBooks = computed<Book[]>(() => bookStore.filteredBooks)

watch(dateRange, (val) => {
  bookStore.updateFilter({
    startDate: val?.[0],
    endDate: val?.[1]
  })
}, { immediate: true })

const handleUpdateFilter = (key: keyof BookFilter, value: BookFilter[keyof BookFilter]): void => {
  bookStore.updateFilter({ [key]: value })
}

const handleAdd = (): void => {
  editingBook.value = null
  bookDialogVisible.value = true
}

const handleEdit = (book: Book): void => {
  editingBook.value = book
  bookDialogVisible.value = true
}

const handleDelete = (book: Book): void => {
  ElMessageBox.confirm(
    `确定要删除书籍《${book.title}》吗？此操作不可恢复。`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const deletedBook = bookStore.deleteBook(book.id)
    if (deletedBook) {
      logStore.logDeleteBook(deletedBook.title, deletedBook.id)
      ElMessage.success('删除成功')
    }
  }).catch(() => {
  })
}

const handleRead = (book: Book): void => {
  if (book.readingStatus === 'finished') {
    ElMessage.warning('该书已读完')
    return
  }
  readingDialogVisible.value = true
  setTimeout(() => {
    editingBook.value = book
  }, 0)
}

const handleBookSubmit = (data: Partial<Book>): void => {
  if (editingBook.value) {
    const updatedBook = bookStore.updateBook(editingBook.value.id, data)
    if (updatedBook) {
      logStore.logUpdateBook(updatedBook)
      ElMessage.success('更新成功')
    }
  } else {
    const newBook = bookStore.addBook(data as Omit<Book, 'id' | 'createdAt' | 'updatedAt'>)
    logStore.logAddBook(newBook)
    ElMessage.success('添加成功')
  }
}

const handleReadingSubmit = (data: ReadingSubmitData): void => {
  const targetBook = bookStore.getBookById(data.bookId)
  if (!targetBook) return

  const wasFinished = targetBook.readingStatus === 'finished'
  const updatedBook = bookStore.updateReadingProgress(data.bookId, data.pagesRead)
  
  if (updatedBook) {
    const isNowFinished = updatedBook.readingStatus === 'finished' && !wasFinished
    readingStore.checkIn(data.bookId, data.pagesRead, data.duration, data.note)
    logStore.logCheckIn(updatedBook, data.pagesRead, data.duration, isNowFinished)
    logStore.logUpdateProgress(updatedBook, data.pagesRead)
    
    if (data.note) {
      logStore.logAddNote(updatedBook, data.note)
    }

    if (isNowFinished) {
      ElMessage.success(`恭喜！《${updatedBook.title}》已读完！🎉`)
    } else {
      ElMessage.success('打卡成功')
    }
  }
}

const handleResetFilter = (): void => {
  bookStore.resetFilter()
  dateRange.value = undefined
}

const formatDate = (date: string): string => {
  return dayjs(date).format('YYYY-MM-DD')
}
</script>

<template>
  <div class="books-page">
    <el-card class="filter-card">
      <el-form :inline="true" class="filter-form">
        <el-form-item label="分类">
          <el-select
            :model-value="currentFilter.category"
            @update:model-value="(val) => handleUpdateFilter('category', val)"
            placeholder="全部分类"
            clearable
            style="width: 150px;"
          >
            <el-option
              v-for="item in BOOK_CATEGORY_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <el-select
            :model-value="currentFilter.readingStatus"
            @update:model-value="(val) => handleUpdateFilter('readingStatus', val)"
            placeholder="全部状态"
            clearable
            style="width: 150px;"
          >
            <el-option
              v-for="item in READING_STATUS_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="作者">
          <el-input
            :model-value="currentFilter.author"
            @update:model-value="(val) => handleUpdateFilter('author', val)"
            placeholder="搜索作者"
            clearable
            style="width: 150px;"
          />
        </el-form-item>

        <el-form-item label="关键词">
          <el-input
            :model-value="currentFilter.keyword"
            @update:model-value="(val) => handleUpdateFilter('keyword', val)"
            placeholder="搜索书名/简介"
            clearable
            style="width: 200px;"
          />
        </el-form-item>

        <el-form-item label="时间">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 260px;"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleResetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card mt-20">
      <template #header>
        <div class="card-header">
          <span>
            书籍列表
            <el-tag type="info" size="small" class="ml-2">共 {{ filteredBooks.length }} 本</el-tag>
          </span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加书籍
          </el-button>
        </div>
      </template>

      <el-table
        :data="filteredBooks"
        stripe
        style="width: 100%;"
      >
        <el-table-column label="封面" width="80">
          <template #default="{ row }">
            <el-image
              :src="row.cover"
              fit="cover"
              width="50"
              height="70"
              style="border-radius: 4px;"
              :preview-src-list="[row.cover]"
            >
              <template #error>
                <div class="img-placeholder">
                  <el-icon><Reading /></el-icon>
                </div>
              </template>
            </el-image>
          </template>
        </el-table-column>

        <el-table-column label="书名" min-width="150">
          <template #default="{ row }">
            <div class="title-cell" :title="row.title">{{ row.title }}</div>
          </template>
        </el-table-column>

        <el-table-column label="作者" width="120">
          <template #default="{ row }">
            <div :title="row.author">{{ row.author }}</div>
          </template>
        </el-table-column>

        <el-table-column label="分类" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ getBookCategoryLabel(row.category) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="阅读进度" width="180">
          <template #default="{ row }">
            <div class="progress-cell">
              <el-progress
                :percentage="Math.round((row.currentPage / row.totalPages) * 100)"
                :stroke-width="10"
                :show-text="false"
              />
              <span class="progress-text">{{ row.currentPage }}/{{ row.totalPages }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag
              :type="getReadingStatusColor(row.readingStatus)"
              size="small"
            >
              {{ getReadingStatusLabel(row.readingStatus) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="存放位置" width="120">
          <template #default="{ row }">
            <div class="location-cell" :title="row.location">
              <el-icon><Location /></el-icon>
              <span>{{ row.location || '-' }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="更新时间" width="120">
          <template #default="{ row }">
            {{ formatDate(row.updatedAt) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              link
              @click="handleRead(row)"
              :disabled="row.readingStatus === 'finished'"
            >
              阅读
            </el-button>
            <el-button
              type="primary"
              size="small"
              link
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              link
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty
        v-if="filteredBooks.length === 0"
        description="暂无符合条件的书籍"
      />
    </el-card>

    <BookDialog
      v-model="bookDialogVisible"
      :book="editingBook"
      @submit="handleBookSubmit"
    />

    <ReadingDialog
      v-model="readingDialogVisible"
      :book="editingBook"
      @submit="handleReadingSubmit"
    />
  </div>
</template>

<style scoped lang="scss">
.books-page {
  .filter-card {
    :deep(.el-card__body) {
      padding: 15px 20px;
    }

    .filter-form {
      .el-form-item {
        margin-bottom: 0;
      }
    }
  }

  .ml-2 {
    margin-left: 8px;
  }

  .table-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .img-placeholder {
      width: 50px;
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: $bg-color;
      color: $text-secondary;
      border-radius: 4px;
    }

    .title-cell {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-weight: 500;
    }

    .progress-cell {
      display: flex;
      align-items: center;
      gap: 8px;

      .progress-text {
        font-size: 12px;
        color: $text-secondary;
        white-space: nowrap;
      }
    }

    .location-cell {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: $text-secondary;

      span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}

@media (max-width: $breakpoint-md) {
  .filter-form {
    .el-form-item {
      margin-bottom: 10px;
    }
  }
}
</style>
