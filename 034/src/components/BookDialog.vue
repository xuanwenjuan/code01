<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { Book, BookCategory, ReadingStatus } from '@/types'
import { BOOK_CATEGORY_OPTIONS, READING_STATUS_OPTIONS } from '@/constants'

interface BookFormData {
  title: string
  author: string
  category: BookCategory
  cover: string
  description: string
  publishDate: string
  totalPages: number
  currentPage: number
  readingStatus: ReadingStatus
  location: string
}

const props = defineProps<{
  modelValue: boolean
  book?: Book | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', data: Partial<Book>): void
}>()

const isEdit = computed<boolean>(() => !!props.book)
const title = computed<string>(() => isEdit.value ? '编辑书籍' : '添加书籍')

const initialFormData: BookFormData = {
  title: '',
  author: '',
  category: 'other',
  cover: '',
  description: '',
  publishDate: '',
  totalPages: 0,
  currentPage: 0,
  readingStatus: 'unread',
  location: ''
}

const formData = ref<BookFormData>({ ...initialFormData })
const formRef = ref<FormInstance | null>(null)

const rules: FormRules = {
  title: [
    { required: true, message: '请输入书名', trigger: 'blur' }
  ],
  author: [
    { required: true, message: '请输入作者', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  totalPages: [
    { required: true, message: '请输入总页数', trigger: 'blur' },
    { type: 'number', min: 1, message: '页数必须大于0', trigger: 'blur' }
  ]
}

const getBookFormData = (book: Book): BookFormData => ({
  title: book.title,
  author: book.author,
  category: book.category,
  cover: book.cover,
  description: book.description,
  publishDate: book.publishDate,
  totalPages: book.totalPages,
  currentPage: book.currentPage,
  readingStatus: book.readingStatus,
  location: book.location
})

watch(
  () => props.modelValue,
  (val: boolean) => {
    if (val && props.book) {
      formData.value = getBookFormData(props.book)
    } else if (val) {
      resetForm()
    }
  }
)

const resetForm = (): void => {
  formData.value = { ...initialFormData }
}

const handleClose = (): void => {
  emit('update:modelValue', false)
  formRef.value?.resetFields()
}

const handleSubmit = async (): Promise<void> => {
  if (!formRef.value) return
  
  const valid: boolean | undefined = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  emit('submit', { ...formData.value })
  handleClose()
}
</script>

<template>
  <el-dialog
    v-model="modelValue"
    :title="title"
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
      <el-form-item label="书名" prop="title">
        <el-input v-model="formData.title" placeholder="请输入书名" />
      </el-form-item>

      <el-form-item label="作者" prop="author">
        <el-input v-model="formData.author" placeholder="请输入作者" />
      </el-form-item>

      <el-form-item label="分类" prop="category">
        <el-select v-model="formData.category" placeholder="请选择分类" style="width: 100%;">
          <el-option
            v-for="item in BOOK_CATEGORY_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="封面">
        <el-input v-model="formData.cover" placeholder="请输入封面图片URL" />
      </el-form-item>

      <el-form-item label="出版日期">
        <el-date-picker
          v-model="formData.publishDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="选择出版日期"
          style="width: 100%;"
        />
      </el-form-item>

      <el-form-item label="总页数" prop="totalPages">
        <el-input-number
          v-model="formData.totalPages"
          :min="1"
          style="width: 100%;"
        />
      </el-form-item>

      <el-form-item label="当前页">
        <el-input-number
          v-model="formData.currentPage"
          :min="0"
          :max="formData.totalPages"
          style="width: 100%;"
        />
      </el-form-item>

      <el-form-item label="阅读状态">
        <el-select v-model="formData.readingStatus" placeholder="请选择状态" style="width: 100%;">
          <el-option
            v-for="item in READING_STATUS_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="存放位置">
        <el-input v-model="formData.location" placeholder="如：书房A区-第1层" />
      </el-form-item>

      <el-form-item label="简介">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入书籍简介"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确认</el-button>
    </template>
  </el-dialog>
</template>
