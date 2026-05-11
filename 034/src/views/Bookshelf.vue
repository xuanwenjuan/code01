<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBookStore } from '@/stores/bookStore'
import { useReadingStore } from '@/stores/readingStore'
import { useLogStore } from '@/stores/logStore'
import { getMockBooks } from '@/mock'
import { BOOK_CATEGORY_OPTIONS, READING_STATUS_LABELS } from '@/constants'
import type { Book, BookCategory, ReadingStatus } from '@/types'
import { ElMessage, ElMessageBox } from 'element-plus'
import BookCard from '@/components/BookCard.vue'
import BookDialog from '@/components/BookDialog.vue'
import ReadingDialog from '@/components/ReadingDialog.vue'

const bookStore = useBookStore()
const readingStore = useReadingStore()
const logStore = useLogStore()

onMounted(() => {
  if (bookStore.books.length === 0) {
    bookStore.setBooks(getMockBooks())
  }
})

const activeCategory = ref<BookCategory | 'all'>('all')
const activeStatus = ref<ReadingStatus | 'all'>('all')
const bookDialogVisible = ref(false)
const readingDialogVisible = ref(false)
const editingBook = ref<Book | null>(null)
const readingBook = ref<Book | null>(null)

const categories = computed(() => [
  { label: '全部', value: 'all' as const },
  ...BOOK_CATEGORY_OPTIONS
])

const statusOptions = [
  { label: '全部状态', value: 'all' as const },
  { label: '未读', value: 'unread' as const },
  { label: '阅读中', value: 'reading' as const },
  { label: '已读完', value: 'finished' as const }
]

const filteredBooks = computed(() => {
  let books = bookStore.books
  
  if (activeCategory.value !== 'all') {
    books = books.filter(b => b.category === activeCategory.value)
  }
  
  if (activeStatus.value !== 'all') {
    books = books.filter(b => b.readingStatus === activeStatus.value)
  }
  
  return books
})

const categoryStats = computed(() => {
  const stats = BOOK_CATEGORY_OPTIONS.map(opt => ({
    ...opt,
    count: bookStore.booksByCategory[opt.value].length
  }))
  return stats
})

const getCategoryLabel = (category: string) => {
  const option = BOOK_CATEGORY_OPTIONS.find(opt => opt.value === category)
  return option?.label || category
}

const handleEdit = (book: Book) => {
  editingBook.value = book
  bookDialogVisible.value = true
}

const handleDelete = (book: Book) => {
  ElMessageBox.confirm(
    `确定要删除书籍《${book.title}》吗？此操作不可恢复。`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    bookStore.deleteBook(book.id)
    logStore.addLog({
      type: 'delete_book',
      title: '删除书籍',
      description: `删除了书籍《${book.title}》`,
      bookId: book.id
    })
    ElMessage.success('删除成功')
  }).catch(() => {
  })
}

const handleRead = (book: Book) => {
  if (book.readingStatus === 'finished') {
    ElMessage.warning('该书已读完')
    return
  }
  readingBook.value = book
  readingDialogVisible.value = true
}

const handleView = (book: Book) => {
  ElMessageBox.alert(
    `
      <div style="line-height: 1.8;">
        <p><strong>书名：</strong>${book.title}</p>
        <p><strong>作者：</strong>${book.author}</p>
        <p><strong>分类：</strong>${getCategoryLabel(book.category)}</p>
        <p><strong>状态：</strong>${READING_STATUS_LABELS[book.readingStatus]}</p>
        <p><strong>进度：</strong>${book.currentPage}/${book.totalPages} 页</p>
        <p><strong>位置：</strong>${book.location || '未设置'}</p>
        <p style="margin-top: 10px;"><strong>简介：</strong></p>
        <p style="text-indent: 2em;">${book.description || '暂无简介'}</p>
      </div>
    `,
    book.title,
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '关闭'
    }
  )
}

const handleBookSubmit = (data: Partial<Book>) => {
  if (editingBook.value) {
    const updatedBook = bookStore.updateBook(editingBook.value.id, data)
    if (updatedBook) {
      logStore.addLog({
        type: 'update_book',
        title: '更新书籍',
        description: `更新了书籍《${updatedBook.title}》的信息`,
        bookId: updatedBook.id
      })
      ElMessage.success('更新成功')
    }
  }
}

interface ReadingSubmitData {
  bookId: string
  pagesRead: number
  duration: number
  note?: string
}

const handleReadingSubmit = (data: ReadingSubmitData) => {
  const targetBook = bookStore.getBookById(data.bookId)
  if (!targetBook) return

  const newCurrentPage: number = targetBook.currentPage + data.pagesRead
  const updatedBook = bookStore.updateReadingProgress(data.bookId, newCurrentPage)
  
  if (updatedBook) {
    readingStore.checkIn(data.bookId, data.pagesRead, data.duration, data.note)
    logStore.addLog({
      type: 'check_in',
      title: '阅读打卡',
      description: `完成今日阅读打卡，阅读${data.pagesRead}页，耗时${data.duration}分钟`,
      bookId: data.bookId
    })
    
    if (data.note) {
      logStore.addLog({
        type: 'add_note',
        title: '添加读书笔记',
        description: `为《${targetBook.title}》添加了阅读笔记`,
        bookId: data.bookId
      })
    }

    if (updatedBook.readingStatus === 'finished') {
      ElMessage.success(`恭喜！《${updatedBook.title}》已读完！`)
    } else {
      ElMessage.success('打卡成功')
    }
  }
}
</script>

<template>
  <div class="bookshelf-page">
    <el-row :gutter="20">
      <el-col :xs="24" :md="6" :lg="5">
        <el-card class="category-card">
          <template #header>
            <div class="header-title">
              <el-icon><Collection /></el-icon>
              <span>分类管理</span>
            </div>
          </template>
          
          <div class="category-item all-category" :class="{ active: activeCategory === 'all' }" @click="activeCategory = 'all'">
            <el-icon><FolderOpened /></el-icon>
            <span class="category-label">全部书籍</span>
            <el-tag type="info" size="small">{{ bookStore.books.length }}</el-tag>
          </div>

          <el-divider style="margin: 10px 0;" />

          <div
            v-for="cat in categoryStats"
            :key="cat.value"
            class="category-item"
            :class="{ active: activeCategory === cat.value }"
            @click="activeCategory = cat.value"
          >
            <el-icon><Folder /></el-icon>
            <span class="category-label">{{ cat.label }}</span>
            <el-tag type="primary" size="small" effect="plain">{{ cat.count }}</el-tag>
          </div>

          <el-divider style="margin: 15px 0;" />

          <div class="status-filter">
            <div class="filter-title">阅读状态</div>
            <el-radio-group v-model="activeStatus" size="small" style="display: flex; flex-direction: column; gap: 8px;">
              <el-radio v-for="opt in statusOptions" :key="opt.value" :value="opt.value" border>
                {{ opt.label }}
              </el-radio>
            </el-radio-group>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="18" :lg="19">
        <el-card class="books-card">
          <template #header>
            <div class="card-header">
              <span>
                {{ activeCategory === 'all' ? '全部书籍' : getCategoryLabel(activeCategory) }}
                <span class="book-count">({{ filteredBooks.length }}本)</span>
              </span>
            </div>
          </template>

          <el-row :gutter="20" v-if="filteredBooks.length > 0">
            <el-col :xs="12" :sm="8" :md="6" :lg="4" v-for="book in filteredBooks" :key="book.id">
              <div class="book-item">
                <BookCard
                  :book="book"
                  @edit="handleEdit"
                  @delete="handleDelete"
                  @read="handleRead"
                  @view="handleView"
                />
              </div>
            </el-col>
          </el-row>

          <el-empty v-else description="该分类下暂无书籍" />
        </el-card>
      </el-col>
    </el-row>

    <BookDialog
      v-model="bookDialogVisible"
      :book="editingBook"
      @submit="handleBookSubmit"
    />

    <ReadingDialog
      v-model="readingDialogVisible"
      :book="readingBook"
      @submit="handleReadingSubmit"
    />
  </div>
</template>

<style scoped lang="scss">
.bookshelf-page {
  .category-card {
    position: sticky;
    top: 20px;

    .header-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
    }

    .category-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 4px;

      .category-label {
        flex: 1;
      }

      .el-tag {
        flex-shrink: 0;
      }

      &:hover {
        background: $bg-color;
      }

      &.active {
        background: rgba(64, 158, 255, 0.1);
        color: $primary-color;
        font-weight: 500;
      }

      &.all-category {
        background: rgba(103, 194, 58, 0.05);
      }

      &.all-category.active {
        background: rgba(103, 194, 58, 0.15);
        color: $success-color;
      }
    }

    .status-filter {
      .filter-title {
        font-size: 13px;
        color: $text-secondary;
        margin-bottom: 10px;
        font-weight: 500;
      }
    }
  }

  .books-card {
    .card-header {
      font-weight: 600;
      font-size: 16px;

      .book-count {
        font-size: 13px;
        color: $text-secondary;
        font-weight: normal;
        margin-left: 5px;
      }
    }

    .book-item {
      margin-bottom: 20px;
    }
  }
}

@media (max-width: $breakpoint-md) {
  .category-card {
    position: static;
    margin-bottom: 20px;
  }

  .books-card {
    :deep(.el-card__body) {
      padding: 10px;
    }
  }
}
</style>
