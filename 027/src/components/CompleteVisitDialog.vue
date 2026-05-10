<template>
  <el-dialog
    :model-value="visible"
    title="完成就诊"
    width="500px"
    :close-on-click-modal="false"
    destroy-on-close
    @close="handleClose"
  >
    <div class="visit-info" v-if="registration">
      <el-descriptions :column="2" border size="small">
        <el-descriptions-item label="患者姓名">
          {{ registration.patientName }}
        </el-descriptions-item>
        <el-descriptions-item label="就诊科室">
          {{ registration.departmentName }}
        </el-descriptions-item>
        <el-descriptions-item label="接诊医生">
          {{ registration.doctorName }}
        </el-descriptions-item>
        <el-descriptions-item label="就诊日期">
          {{ registration.scheduleDate }}
        </el-descriptions-item>
        <el-descriptions-item label="主诉" :span="2">
          {{ registration.symptoms || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="80px"
      class="mt-4"
    >
      <el-form-item label="诊断结果" prop="diagnosis">
        <el-input
          v-model="formData.diagnosis"
          type="textarea"
          :rows="4"
          placeholder="请输入诊断结果"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="success" :loading="loading" @click="handleSubmit">
        完成就诊
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { Registration } from '@/types'
import { useClinicStore } from '@/stores/clinic'

interface Props {
  visible: boolean
  registration: Registration | null
}

const props = withDefaults(defineProps<Props>(), {
  registration: null
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}>()

const clinicStore = useClinicStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const formData = reactive({
  diagnosis: ''
})

const formRules: FormRules = {
  diagnosis: [{ required: true, message: '请输入诊断结果', trigger: 'blur' }]
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      formData.diagnosis = props.registration?.diagnosis || ''
    }
  }
)

function handleClose() {
  emit('update:visible', false)
}

async function handleSubmit() {
  if (!props.registration) return

  await formRef.value?.validate()
  loading.value = true
  try {
    await clinicStore.completeVisit(props.registration.id, formData.diagnosis)
    emit('success')
    emit('update:visible', false)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.visit-info {
  margin-bottom: 16px;
}

.mt-4 {
  margin-top: 16px;
}
</style>
