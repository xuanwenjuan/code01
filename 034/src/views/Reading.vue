<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBookStore } from '@/stores/bookStore'
import { useReadingStore } from '@/stores/readingStore'
import { useLogStore } from '@/stores/logStore'
import { getMockBooks, getMockRecords } from '@/mock'
import { READING_STATUS_LABELS } from '@/constants'
import type { ReadingGoal, Book } from '@/types'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
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
})

const readingDialogVisible = ref(false)
const goalDialogVisible = ref(false)
const goalForm = ref<Partial<ReadingGoal>>({})

const currentReadingBooks = computed(() => bookStore.readingBooks)

const recentRecords = computed(() => {
  return readingStore.records.slice(0, 20).map(record => {
    const book = bookStore.getBookById(record.bookId)
    return {
      ...record,
      bookTitle: book?.title || '未知书籍',
      formattedDate: dayjs(record.date).format('YYYY-MM-DD HH:mm')
    }
  })
})

const checkInButtonText = computed(() => {
  if (readingStore.isCheckedInToday) {
    return `已打卡 (${readingStore.todayPagesRead}页/${readingStore.todayDuration}分钟)`
  }
  return '开始阅读打卡'
})

const goalProgress = computed(() => ({
  books: {
    current: bookStore.finishedBooks.length,
    target: readingStore.goal.booksPerYear,
    percentage: Math.min((bookStore.finishedBooks.length / readingStore.goal.booksPerYear) * 100, 100)
  },
  pages: {
    current: readingStore.todayPagesRead,
    target: readingStore.goal.pagesPerDay,
    percentage: Math.min((readingStore.todayPagesRead / readingStore.goal.pagesPerDay) * 100, 100)
  },
  minutes: {
    current: readingStore.todayDuration,
    target: readingStore.goal.minutesPerDay,
    percentage: Math.min((readingStore.todayDuration / readingStore.goal.minutesPerDay) * 100, 100)
  }
}))

const handleOpenCheckIn = () => {
  if (currentReadingBooks.value.length === 0) {
    ElMessage.warning('暂无正在阅读的书籍，请先开始阅读一本书')
    return
  }
  readingDialogVisible.value = true
}

interface ReadingSubmitData {
  bookId: string
  pagesRead: number
  duration: number
  note?: string
}

const handleCheckIn = (data: ReadingSubmitData) => {
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

const handleOpenGoal = () => {
  goalForm.value = { ...readingStore.goal }
  goalDialogVisible.value = true
}

const handleUpdateGoal = async () => {
  if (!goalForm.value.booksPerYear || !goalForm.value.pagesPerDay || !goalForm.value.minutesPerDay) {
    ElMessage.warning('请填写完整的目标信息')
    return
  }

  readingStore.updateGoal({
    booksPerYear: goalForm.value.booksPerYear,
    pagesPerDay: goalForm.value.pagesPerDay,
    minutesPerDay: goalForm.value.minutesPerDay
  })

  logStore.addLog({
    type: 'update_goal',
    title: '更新阅读目标',
    description: `更新阅读目标：每年${goalForm.value.booksPerYear}本，每日${goalForm.value.pagesPerDay}页，每日${goalForm.value.minutesPerDay}分钟`
  })

  goalDialogVisible.value = false
  ElMessage.success('目标更新成功')
}

const handleViewBook = (book: Book) => {
  ElMessageBox.alert(
    `
      <div style="line-height: 1.8;">
        <p><strong>书名：</strong>${book.title}</p>
        <p><strong>作者：</strong>${book.author}</p>
        <p><strong>状态：</strong>${READING_STATUS_LABELS[book.readingStatus]}</p>
        <p><strong>进度：</strong>${book.currentPage}/${book.totalPages} 页 (${Math.round((book.currentPage / book.totalPages) * 100)}%)</p>
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
</script>

<template>
  <div class="reading-page">
    <el-row :gutter="20">
      <el-col :xs="24" :lg="8">
        <el-card class="checkin-card">
          <template #header>
            <div class="header-title">
              <el-icon><Calendar /></el-icon>
              <span>今日打卡</span>
            </div>
          </template>

          <div class="checkin-content">
            <div class="streak-box">
              <div class="streak-value">{{ readingStore.checkInStreak }}</div>
              <div class="streak-label">连续打卡天数</div>
            </div>

            <el-divider />

            <div class="today-stats">
              <div class="stat-item">
                <div class="stat-value">{{ readingStore.todayPagesRead }}</div>
                <div class="stat-label">今日阅读页数</div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <div class="stat-value">{{ readingStore.todayDuration }}</div>
                <div class="stat-label">今日阅读时长(分)</div>
              </div>
            </div>

            <el-button
              :type="readingStore.isCheckedInToday ? 'success' : 'primary'"
              size="large"
              class="checkin-btn"
              @click="handleOpenCheckIn"
            >
              <el-icon><Star /></el-icon>
              {{ checkInButtonText }}
            </el-button>
          </div>
        </el-card>

        <el-card class="goal-card mt-20">
          <template #header>
            <div class="header-title">
              <el-icon><Target /></el-icon>
              <span>阅读目标</span>
              <el-button type="primary" link size="small" @click="handleOpenGoal">
                修改
              </el-button>
            </div>
          </template>

          <div class="goal-content">
            <div class="goal-item">
              <div class="goal-header">
                <span class="goal-label">年度读书目标</span>
                <span class="goal-value">{{ goalProgress.books.current }}/{{ goalProgress.books.target }} 本</span>
              </div>
              <el-progress :percentage="goalProgress.books.percentage" :stroke-width="10" />
            </div>

            <div class="goal-item">
              <div class="goal-header">
                <span class="goal-label">每日页数目标</span>
                <span class="goal-value">{{ goalProgress.pages.current }}/{{ goalProgress.pages.target }} 页</span>
              </div>
              <el-progress :percentage="goalProgress.pages.percentage" :stroke-width="10" />
            </div>

            <div class="goal-item">
              <div class="goal-header">
                <span class="goal-label">每日时长目标</span>
                <span class="goal-value">{{ goalProgress.minutes.current }}/{{ goalProgress.minutes.target }} 分钟</span>
              </div>
              <el-progress :percentage="goalProgress.minutes.percentage" :stroke-width="10" />
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="16">
        <el-card>
          <template #header>
            <div class="header-title">
              <el-icon><Reading /></el-icon>
              <span>正在阅读</span>
              <el-tag type="primary" size="small">{{ currentReadingBooks.length }}本</el-tag>
            </div>
          </template>

          <div v-if="currentReadingBooks.length > 0" class="reading-books">
            <el-row :gutter="20">
              <el-col :xs="12" :sm="8" v-for="book in currentReadingBooks" :key="book.id">
                <el-card class="book-progress-card" shadow="hover" @click="handleViewBook(book)">
                  <div class="book-cover">
                    <el-image
                      :src="book.cover"
                      fit="cover"
                      height="160"
                    >
                      <template #error>
                        <div class="img-placeholder">
                          <el-icon :size="40"><Reading /></el-icon>
                        </div>
                      </template>
                    </el-image>
                  </div>
                  <div class="book-info">
                    <h3 class="book-title" :title="book.title">{{ book.title }}</h3>
                    <p class="book-author">{{ book.author }}</p>
                    <el-progress
                      :percentage="Math.round((book.currentPage / book.totalPages) * 100)"
                      :stroke-width="8"
                    />
                    <div class="progress-text">
                      {{ book.currentPage }}/{{ book.totalPages }} 页
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>

          <el-empty v-else description="暂无正在阅读的书籍" />
        </el-card>

        <el-card class="mt-20">
          <template #header>
            <div class="header-title">
              <el-icon><Document /></el-icon>
              <span>最近阅读记录</span>
            </div>
          </template>

          <el-table :data="recentRecords" stripe style="width: 100%;">
            <el-table-column label="书籍" prop="bookTitle" min-width="150">
              <template #default="{ row }">
                <el-tag type="info" size="small">{{ row.bookTitle }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="阅读页数" prop="pagesRead" width="100" />
            <el-table-column label="阅读时长" width="120">
              <template #default="{ row }">
                {{ row.duration }} 分钟
              </template>
            </el-table-column>
            <el-table-column label="笔记" min-width="200">
              <template #default="{ row }">
                <span :title="row.note">{{ row.note || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="时间" prop="formattedDate" width="160" />
          </el-table>

          <el-empty v-if="recentRecords.length === 0" description="暂无阅读记录" />
        </el-card>
      </el-col>
    </el-row>

    <ReadingDialog
      v-model="readingDialogVisible"
      @submit="handleCheckIn"
    />

    <el-dialog
      v-model="goalDialogVisible"
      title="设置阅读目标"
      width="400px"
    >
      <el-form label-width="100px">
        <el-form-item label="年度读书目标">
          <el-input-number
            v-model="goalForm.booksPerYear"
            :min="1"
            style="width: 100%;"
          >
            <template #suffix>本</template>
          </el-input-number>
        </el-form-item>
        <el-form-item label="每日页数目标">
          <el-input-number
            v-model="goalForm.pagesPerDay"
            :min="1"
            style="width: 100%;"
          >
            <template #suffix>页</template>
          </el-input-number>
        </el-form-item>
        <el-form-item label="每日时长目标">
          <el-input-number
            v-model="goalForm.minutesPerDay"
            :min="1"
            style="width: 100%;"
          >
            <template #suffix>分钟</template>
          </el-input-number>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="goalDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateGoal">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.reading-page {
  .checkin-card, .goal-card {
    .header-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;

      .el-button {
        margin-left: auto;
      }
    }
  }

  .checkin-card {
    .checkin-content {
      text-align: center;
    }

    .streak-box {
      padding: 20px 0;

      .streak-value {
        font-size: 48px;
        font-weight: bold;
        color: $primary-color;
        line-height: 1;
      }

      .streak-label {
        font-size: 14px;
        color: $text-secondary;
        margin-top: 10px;
      }
    }

    .today-stats {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px 0;

      .stat-item {
        flex: 1;

        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: $text-primary;
        }

        .stat-label {
          font-size: 12px;
          color: $text-secondary;
          margin-top: 4px;
        }
      }

      .stat-divider {
        width: 1px;
        height: 40px;
        background: $border-color;
      }
    }

    .checkin-btn {
      width: 100%;
      margin-top: 15px;
    }
  }

  .goal-card {
    .goal-content {
      .goal-item {
        margin-bottom: 15px;

        &:last-child {
          margin-bottom: 0;
        }
      }

      .goal-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;

        .goal-label {
          font-size: 13px;
          color: $text-secondary;
        }

        .goal-value {
          font-size: 13px;
          color: $primary-color;
          font-weight: 500;
        }
      }
    }
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 16px;

    .el-tag {
      margin-left: 8px;
    }
  }

  .reading-books {
    .book-progress-card {
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-4px);
      }

      :deep(.el-card__body) {
        padding: 0;
      }

      .book-cover {
        height: 160px;
        overflow: hidden;

        :deep(.el-image) {
          width: 100%;
        }

        .img-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: $bg-color;
          color: $text-secondary;
        }
      }

      .book-info {
        padding: 12px;

        .book-title {
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 4px 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .book-author {
          font-size: 12px;
          color: $text-secondary;
          margin: 0 0 10px 0;
        }

        .progress-text {
          font-size: 12px;
          color: $text-secondary;
          text-align: right;
          margin-top: 4px;
        }
      }
    }
  }
}

@media (max-width: $breakpoint-sm) {
  .checkin-card .streak-box .streak-value {
    font-size: 36px;
  }
}
</style>
