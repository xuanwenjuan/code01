<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useBookStore } from '@/stores/bookStore'
import { useReadingStore } from '@/stores/readingStore'
import type { Book } from '@/types'

interface ReadingFormData {
  pagesRead: number
  duration: number
  note: string
}

interface ReadingSubmitData {
  bookId: string
  pagesRead: number
  duration: number
  note?: string
}

const props = defineProps<{
  modelValue: boolean
  book?: Book | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', data: ReadingSubmitData): void
}>()

const bookStore = useBookStore()
const readingStore = useReadingStore()

const initialFormData: ReadingFormData = {
  pagesRead: 0,
  duration: 30,
  note: ''
}

const formData = ref<ReadingFormData>({ ...initialFormData })
const formRef = ref<FormInstance | null>(null)
const selectedBookId = ref<string | undefined>(props.book?.id)

const currentBook = computed<Book | null>(() => {
  if (props.book) return props.book
  if (selectedBookId.value) {
    return bookStore.getBookById(selectedBookId.value)
  }
  return null
})

const selectedBookIdForEmit = computed<string>(() => {
  return currentBook.value?.id || ''
})

const readingBooks = computed<Book[]>(() => bookStore.readingBooks)

const maxPages = computed<number>(() => {
  if (!currentBook.value) return 0
  return currentBook.value.totalPages - currentBook.value.currentPage
})

const currentProgress = computed<{ percentage: number; text: string }>(() => {
  if (!currentBook.value) return { percentage: 0, text: '0/0页' }
  const percentage: number = Math.round((currentBook.value.currentPage / currentBook.value.totalPages) * 100)
  return {
    percentage,
    text: `${currentBook.value.currentPage}/${currentBook.value.totalPages}页`
  }
})

const newProgress = computed<{ percentage: number; text: string }>(() => {
  if (!currentBook.value) return { percentage: 0, text: '0/0页' }
  const newCurrentPage: number = currentBook.value.currentPage + formData.value.pagesRead
  const finalPage: number = Math.min(newCurrentPage, currentBook.value.totalPages)
  const percentage: number = Math.round((finalPage / currentBook.value.totalPages) * 100)
  return {
    percentage,
    text: `${finalPage}/${currentBook.value.totalPages}页`
  }
})

const estimatedTime = computed<string>(() => {
  if (formData.value.pagesRead <= 0) return '-'
  const avgTime: number = formData.value.duration / formData.value.pagesRead
  return `${avgTime.toFixed(1)}分钟/页`
})

const willFinishBook = computed<boolean>(() => {
  if (!currentBook.value) return false
  return currentBook.value.currentPage + formData.value.pagesRead >= currentBook.value.totalPages
})

const rules: FormRules = {
  pagesRead: [
    { required: true, message: '请输入阅读页数', trigger: 'blur' },
    { 
      type: 'number', 
      min: 1, 
      message: '页数必须大于0', 
      trigger: 'blur' 
    }
  ],
  duration: [
    { required: true, message: '请输入阅读时长', trigger: 'blur' },
    { 
      type: 'number', 
      min: 1, 
      message: '时长必须大于0', 
      trigger: 'blur' 
    }
  ]
}

watch(
  () => props.modelValue,
  (val: boolean) => {
    if (val) {
      if (props.book) {
        selectedBookId.value = props.book.id
      } else if (readingBooks.value.length === 1) {
        selectedBookId.value = readingBooks.value[0].id
      }
      formData.value = { ...initialFormData }
    }
  }
)

watch(
  () => selectedBookId.value,
  () => {
    formData.value.pagesRead = 0
  }
)

const handleClose = (): void => {
  emit('update:modelValue', false)
  formRef.value?.resetFields()
}

const handleSubmit = async (): Promise<void> => {
  if (!currentBook.value || !selectedBookIdForEmit.value) return
  
  const valid: boolean | undefined = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  
  const submitData: ReadingSubmitData = {
    bookId: selectedBookIdForEmit.value,
    pagesRead: formData.value.pagesRead,
    duration: formData.value.duration,
    note: formData.value.note || undefined
  }
  
  emit('submit', submitData)
  handleClose()
}

const formatNumber = (num: number): string => {
  return num.toLocaleString()
}
</script>

<template>
  <el-dialog
    v-model="modelValue"
    title="阅读打卡"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item label="选择书籍">
        <el-select
          v-if="!book"
          v-model="selectedBookId"
          placeholder="请选择正在阅读的书籍"
          style="width: 100%;"
        >
          <el-option
            v-for="item in readingBooks"
            :key="item.id"
            :label="item.title"
            :value="item.id"
          />
        </el-select>
        <el-tag v-else type="primary" effect="dark">
          {{ book.title }}
        </el-tag>
      </el-form-item>

      <el-form-item label="当前进度" v-if="currentBook">
        <div class="progress-info">
          <div class="progress-labels">
            <span class="label">当前</span>
            <span class="pages">{{ currentProgress.text }}</span>
          </div>
          <el-progress
            :percentage="currentProgress.percentage"
            :stroke-width="10"
            status="active"
          />
        </div>
      </el-form-item>

      <el-divider v-if="currentBook && formData.pagesRead > 0" dashed>
        <el-icon><ArrowDown /></el-icon>
      </el-divider>

      <el-form-item label="预计进度" v-if="currentBook && formData.pagesRead > 0">
        <div class="progress-info">
          <div class="progress-labels">
            <span class="label">打卡后</span>
            <span class="pages">
              {{ newProgress.text }}
              <el-tag v-if="willFinishBook" type="success" effect="dark" size="small" style="margin-left: 8px;">
                将完成
              </el-tag>
            </span>
          </div>
          <el-progress
            :percentage="newProgress.percentage"
            :stroke-width="10"
            :status="willFinishBook ? 'success' : 'active'"
          />
        </div>
      </el-form-item>

      <el-form-item label="阅读页数" prop="pagesRead">
        <div class="input-group">
          <el-input-number
            v-model="formData.pagesRead"
            :min="1"
            :max="maxPages"
            :controls="true"
            :step="10"
            style="width: 100%;"
          />
          <span v-if="maxPages > 0" class="hint-text">
            剩余 {{ formatNumber(maxPages) }} 页
          </span>
        </div>
      </el-form-item>

      <el-form-item label="阅读时长" prop="duration">
        <div class="input-group">
          <el-input-number
            v-model="formData.duration"
            :min="1"
            :controls="true"
            :step="15"
            style="width: 100%;"
          >
            <template #suffix>分钟</template>
          </el-input-number>
          <span v-if="formData.pagesRead > 0" class="hint-text">
            阅读速度: {{ estimatedTime }}
          </span>
        </div>
      </el-form-item>

      <el-form-item label="阅读笔记">
        <el-input
          v-model="formData.note"
          type="textarea"
          :rows="3"
          :maxlength="500"
          show-word-limit
          placeholder="记录一下今天的阅读心得（可选，最多500字）"
        />
      </el-form-item>

      <el-alert
        v-if="willFinishBook"
        title="太棒了！本次打卡后将完成这本书！🎉"
        type="success"
        :closable="false"
        show-icon
        class="finish-alert"
      />
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button 
        type="primary" 
        @click="handleSubmit"
        :disabled="!currentBook"
      >
        {{ willFinishBook ? '完成阅读 🎉' : '确认打卡' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.progress-info {
  width: 100%;

  .progress-labels {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;

    .label {
      font-size: 12px;
      color: $text-secondary;
    }

    .pages {
      font-size: 12px;
      font-weight: 500;
      color: $text-primary;
      display: flex;
      align-items: center;
    }
  }
}

.input-group {
  width: 100%;

  .hint-text {
    display: block;
    font-size: 12px;
    color: $text-secondary;
    margin-top: 6px;
  }
}

.finish-alert {
  margin-top: 10px;

  :deep(.el-alert__title) {
    font-weight: 500;
  }
}

:deep(.el-divider__text) {
  background-color: transparent;
  color: $primary-color;
}
</style>
