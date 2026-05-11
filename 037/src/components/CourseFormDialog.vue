<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑课程' : '添加课程'"
    width="600px"
    destroy-on-close
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      class="dialog-content"
    >
      <el-form-item label="课程名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入课程名称" />
      </el-form-item>
      
      <el-form-item label="讲师" prop="instructor">
        <el-input v-model="formData.instructor" placeholder="请输入讲师姓名" />
      </el-form-item>
      
      <div class="form-item-row">
        <el-form-item label="课程分类" prop="category" class="form-item">
          <el-select v-model="formData.category" placeholder="请选择分类" style="width: 100%;">
            <el-option
              v-for="(label, value) in CourseCategoryMap"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="学习平台" prop="platform" class="form-item">
          <el-select v-model="formData.platform" placeholder="请选择平台" style="width: 100%;">
            <el-option
              v-for="(label, value) in PlatformTypeMap"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>
      </div>
      
      <div class="form-item-row">
        <el-form-item label="总课时" prop="totalHours" class="form-item">
          <el-input-number
            v-model="formData.totalHours"
            :min="1"
            :max="999"
            placeholder="总课时"
            style="width: 100%;"
          />
        </el-form-item>
        
        <el-form-item label="已学课时" prop="studiedHours" class="form-item">
          <el-input-number
            v-model="formData.studiedHours"
            :min="0"
            :max="formData.totalHours"
            placeholder="已学课时"
            style="width: 100%;"
          />
        </el-form-item>
      </div>
      
      <el-form-item label="日计划学时" prop="planHoursPerDay">
        <el-input-number
          v-model="formData.planHoursPerDay"
          :min="0.5"
          :max="12"
          :step="0.5"
          placeholder="每日计划学习时长"
        />
        <span style="margin-left: 8px; color: #909399; font-size: 12px;">小时/天</span>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        {{ isEdit ? '保存' : '添加' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, type PropType } from 'vue'
import type { Course, CourseFormData } from '@/types'
import { CourseCategory, CourseCategoryMap, PlatformType, PlatformTypeMap } from '@/types'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  course: {
    type: Object as PropType<Course>,
    default: undefined
  }
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', data: CourseFormData): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEdit = computed(() => !!props.course)

const formRef = ref<InstanceType<typeof import('element-plus').ElForm>>()
const submitting = ref(false)

const defaultFormData = (): CourseFormData => ({
  name: '',
  instructor: '',
  category: CourseCategory.FRONTEND,
  platform: PlatformType.OTHER,
  totalHours: 10,
  studiedHours: 0,
  planHoursPerDay: 1
})

const formData = ref<CourseFormData>(defaultFormData())

const formRules = {
  name: [
    { required: true, message: '请输入课程名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  instructor: [
    { required: true, message: '请输入讲师姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择课程分类', trigger: 'change' }
  ],
  platform: [
    { required: true, message: '请选择学习平台', trigger: 'change' }
  ],
  totalHours: [
    { required: true, message: '请输入总课时', trigger: 'blur' }
  ],
  planHoursPerDay: [
    { required: true, message: '请输入每日计划学时', trigger: 'blur' }
  ]
}

watch(() => props.course, (newCourse) => {
  if (newCourse) {
    formData.value = {
      name: newCourse.name,
      instructor: newCourse.instructor,
      category: newCourse.category,
      platform: newCourse.platform,
      totalHours: newCourse.totalHours,
      studiedHours: newCourse.studiedHours,
      planHoursPerDay: newCourse.planHoursPerDay
    }
  } else {
    formData.value = defaultFormData()
  }
}, { immediate: true })

const handleClose = (): void => {
  visible.value = false
  setTimeout(() => {
    formRef.value?.resetFields()
    formData.value = defaultFormData()
  }, 300)
}

const handleSubmit = async (): Promise<void> => {
  if (!formRef.value) return
  
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  submitting.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    emit('confirm', { ...formData.value })
    handleClose()
  } finally {
    submitting.value = false
  }
}
</script>
