<script setup lang="ts">
import { ref, watch, type Ref } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { Club } from '@/types'
import { ClubCategory, clubCategoryLabels } from '@/types'
import dayjs from 'dayjs'

const props = defineProps<{
  visible: boolean
  club: Club | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', club: Club): void
  (e: 'cancel'): void
}>()

const formRef: Ref<FormInstance | undefined> = ref(undefined)
const formData = ref<Partial<Club>>({
  name: '',
  category: ClubCategory.OTHER,
  description: '',
  managerName: '',
  memberCount: 0
})

const categoryOptions = Object.entries(clubCategoryLabels).map(([value, label]) => ({
  value: value as ClubCategory,
  label
}))

const rules: FormRules = {
  name: [
    { required: true, message: '请输入社团名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择社团类别', trigger: 'change' }
  ],
  managerName: [
    { required: true, message: '请输入负责人姓名', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入社团描述', trigger: 'blur' },
    { min: 10, max: 500, message: '长度在 10 到 500 个字符', trigger: 'blur' }
  ]
}

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      if (props.club) {
        formData.value = { ...props.club }
      } else {
        formData.value = {
          name: '',
          category: ClubCategory.OTHER,
          description: '',
          managerName: '',
          memberCount: 0
        }
      }
    }
  }
)

function handleSubmit(): void {
  formRef.value?.validate((valid) => {
    if (valid) {
      const club: Club = {
        id: props.club?.id || crypto.randomUUID(),
        name: formData.value.name as string,
        category: formData.value.category as ClubCategory,
        description: formData.value.description as string,
        managerId: props.club?.managerId || crypto.randomUUID(),
        managerName: formData.value.managerName as string,
        memberCount: formData.value.memberCount || 0,
        createdAt: props.club?.createdAt || dayjs().format('YYYY-MM-DD'),
        updatedAt: dayjs().format('YYYY-MM-DD')
      }
      emit('submit', club)
      emit('update:visible', false)
      ElMessage.success(props.club ? '更新成功' : '创建成功')
    }
  })
}

function handleCancel(): void {
  emit('update:visible', false)
  emit('cancel')
}

const isEdit = ref(!!props.club)

watch(
  () => props.club,
  (newVal) => {
    isEdit.value = !!newVal
  }
)
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑社团' : '创建社团'"
    width="600px"
    @close="handleCancel"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <el-form-item label="社团名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入社团名称" maxlength="50" />
      </el-form-item>
      <el-form-item label="社团类别" prop="category">
        <el-select v-model="formData.category" placeholder="请选择社团类别" style="width: 100%">
          <el-option
            v-for="option in categoryOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="负责人" prop="managerName">
        <el-input v-model="formData.managerName" placeholder="请输入负责人姓名" />
      </el-form-item>
      <el-form-item label="成员数量">
        <el-input-number v-model="formData.memberCount" :min="0" :max="9999" />
      </el-form-item>
      <el-form-item label="社团描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="4"
          placeholder="请输入社团描述"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
