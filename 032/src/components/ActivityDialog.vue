<script setup lang="ts">
import { ref, watch, type Ref, computed } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { Activity, Club } from '@/types'
import { ActivityStatus, activityStatusLabels } from '@/types'
import { useClubStore } from '@/stores/club'
import { generateId } from '@/utils'
import dayjs from 'dayjs'

const props = defineProps<{
  visible: boolean
  activity: Activity | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', activity: Activity): void
  (e: 'cancel'): void
}>()

const clubStore = useClubStore()

const formRef: Ref<FormInstance | undefined> = ref(undefined)
const formData = ref<Partial<Activity>>({
  title: '',
  clubId: '',
  description: '',
  location: '',
  startTime: '',
  endTime: '',
  maxParticipants: 50,
  status: ActivityStatus.PREPARING,
  checkInEnabled: true,
  checkInStartTime: null
})

const clubOptions = computed(() =>
  clubStore.clubList.map((club: Club) => ({
    label: club.name,
    value: club.id
  }))
)

const statusOptions = Object.entries(activityStatusLabels).map(([value, label]) => ({
  value: value as ActivityStatus,
  label
}))

const rules: FormRules = {
  title: [
    { required: true, message: '请输入活动标题', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  clubId: [
    { required: true, message: '请选择所属社团', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入活动描述', trigger: 'blur' },
    { min: 10, max: 1000, message: '长度在 10 到 1000 个字符', trigger: 'blur' }
  ],
  location: [
    { required: true, message: '请输入活动地点', trigger: 'blur' }
  ],
  startTime: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  endTime: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ],
  maxParticipants: [
    { required: true, message: '请输入最大参与人数', trigger: 'blur' },
    { type: 'number', min: 1, max: 10000, message: '人数在 1 到 10000 之间', trigger: 'blur' }
  ]
}

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      if (props.activity) {
        formData.value = { ...props.activity }
      } else {
        const now = dayjs()
        formData.value = {
          title: '',
          clubId: clubOptions.value.length > 0 ? clubOptions.value[0].value : '',
          description: '',
          location: '',
          startTime: '',
          endTime: '',
          maxParticipants: 50,
          status: ActivityStatus.PREPARING,
          currentParticipants: 0,
          checkInEnabled: true,
          checkInStartTime: null
        }
      }
    }
  }
)

function validateTime(): boolean {
  if (!formData.value.startTime || !formData.value.endTime) {
    return true
  }
  const start = dayjs(formData.value.startTime)
  const end = dayjs(formData.value.endTime)
  if (end.isBefore(start)) {
    ElMessage.error('结束时间必须晚于开始时间')
    return false
  }
  return true
}

function handleSubmit(): void {
  if (!validateTime()) return

  formRef.value?.validate((valid) => {
    if (valid) {
      const selectedClub = clubStore.getClubById(formData.value.clubId as string)
      const activity: Activity = {
        id: props.activity?.id || generateId(),
        title: formData.value.title as string,
        clubId: formData.value.clubId as string,
        clubName: selectedClub?.name || '',
        description: formData.value.description as string,
        location: formData.value.location as string,
        startTime: formData.value.startTime as string,
        endTime: formData.value.endTime as string,
        maxParticipants: formData.value.maxParticipants as number,
        currentParticipants: props.activity?.currentParticipants || 0,
        status: formData.value.status as ActivityStatus,
        checkInEnabled: formData.value.checkInEnabled ?? true,
        checkInStartTime: formData.value.checkInStartTime || null,
        createdAt: props.activity?.createdAt || dayjs().format('YYYY-MM-DD HH:mm'),
        updatedAt: dayjs().format('YYYY-MM-DD HH:mm')
      }
      emit('submit', activity)
      emit('update:visible', false)
      ElMessage.success(props.activity ? '更新成功' : '创建成功')
    }
  })
}

function handleCancel(): void {
  emit('update:visible', false)
  emit('cancel')
}

const isEdit = computed(() => !!props.activity)

watch(
  () => formData.value.startTime,
  (newVal) => {
    if (newVal && !formData.value.checkInStartTime) {
      formData.value.checkInStartTime = newVal
    }
  }
)
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑活动' : '创建活动'"
    width="720px"
    @close="handleCancel"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <el-form-item label="活动标题" prop="title">
        <el-input v-model="formData.title" placeholder="请输入活动标题" maxlength="100" />
      </el-form-item>

      <el-form-item label="所属社团" prop="clubId">
        <el-select v-model="formData.clubId" placeholder="请选择所属社团" style="width: 100%">
          <el-option
            v-for="option in clubOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="活动地点" prop="location">
        <el-input v-model="formData.location" placeholder="请输入活动地点" />
      </el-form-item>

      <el-form-item label="活动时间">
        <el-col :span="11">
          <el-form-item prop="startTime">
            <el-date-picker
              v-model="formData.startTime"
              type="datetime"
              placeholder="开始时间"
              value-format="YYYY-MM-DD HH:mm"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="2" class="text-center">至</el-col>
        <el-col :span="11">
          <el-form-item prop="endTime">
            <el-date-picker
              v-model="formData.endTime"
              type="datetime"
              placeholder="结束时间"
              value-format="YYYY-MM-DD HH:mm"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-form-item>

      <el-form-item label="参与人数">
        <el-input-number
          v-model="formData.maxParticipants"
          :min="1"
          :max="10000"
          label="最大参与人数"
        />
        <span v-if="isEdit" class="ml-4 text-gray-500">
          当前报名：{{ formData.currentParticipants || 0 }} 人
        </span>
      </el-form-item>

      <el-form-item label="活动状态" prop="status">
        <el-select v-model="formData.status" placeholder="请选择活动状态" style="width: 100%">
          <el-option
            v-for="option in statusOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>

      <el-divider content-position="left">签到设置</el-divider>

      <el-form-item label="开启签到">
        <el-switch v-model="formData.checkInEnabled" />
        <span class="ml-3 text-gray-500 text-sm">开启后可进行扫码签到和手动签到</span>
      </el-form-item>

      <el-form-item v-if="formData.checkInEnabled" label="签到开始时间">
        <el-date-picker
          v-model="formData.checkInStartTime"
          type="datetime"
          placeholder="默认与活动开始时间一致"
          value-format="YYYY-MM-DD HH:mm"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="活动描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="4"
          placeholder="请输入活动描述"
          maxlength="1000"
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

<style scoped>
.ml-3 {
  margin-left: 12px;
}
.ml-4 {
  margin-left: 16px;
}
.text-gray-500 {
  color: #909399;
}
.text-center {
  text-align: center;
}
.text-sm {
  font-size: 13px;
}
</style>
