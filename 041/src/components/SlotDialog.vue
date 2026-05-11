<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { ScheduleSlot, ScheduleTime } from '@/types'
import { useHospitalStore } from '@/stores/hospital'

const props = defineProps<{
  visible: boolean
  mode: 'register' | 'view'
  slot?: ScheduleSlot | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}>()

const store = useHospitalStore()

const patientName = ref('')

const timeLabel = computed(() => {
  const timeMap: Record<ScheduleTime, string> = {
    morning: '上午',
    afternoon: '下午',
    night: '夜间'
  }
  return props.slot ? timeMap[props.slot.time] : ''
})

const statusLabel = computed(() => {
  if (!props.slot) return ''
  const statusMap = {
    available: { text: '充足', type: 'success' as const },
    limited: { text: '紧张', type: 'warning' as const },
    full: { text: '已满', type: 'danger' as const }
  }
  return statusMap[props.slot.status]
})

watch(() => props.visible, (val) => {
  if (val) {
    patientName.value = ''
  }
})

const handleRegister = async () => {
  if (!patientName.value.trim()) {
    ElMessage.warning('请输入患者姓名')
    return
  }
  
  if (props.slot) {
    const success = await store.registerPatient(props.slot.id, patientName.value)
    if (success) {
      ElMessage.success('挂号成功')
      emit('success')
      emit('update:visible', false)
    } else {
      ElMessage.error('号源不足，挂号失败')
    }
  }
}

const handleClose = () => {
  emit('update:visible', false)
}
</script>

<template>
  <el-dialog
    :title="mode === 'register' ? '患者挂号' : '号源详情'"
    v-model="visible"
    width="450px"
    @close="handleClose"
  >
    <div v-if="slot" class="slot-info">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="医生">
          {{ slot.doctorName }}
          <el-tag v-if="slot.isExpert" type="danger" class="expert-tag">专家号</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="日期">{{ slot.date }}</el-descriptions-item>
        <el-descriptions-item label="时段">{{ timeLabel }}</el-descriptions-item>
        <el-descriptions-item label="号源状态">
          <el-tag :type="statusLabel?.type">{{ statusLabel?.text }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="号源总量">{{ slot.total }} 号</el-descriptions-item>
        <el-descriptions-item label="已挂号">{{ slot.reserved }} 号</el-descriptions-item>
        <el-descriptions-item label="剩余号源">{{ slot.available }} 号</el-descriptions-item>
      </el-descriptions>
      
      <el-form v-if="mode === 'register'" class="register-form" label-width="80px">
        <el-form-item label="患者姓名">
          <el-input v-model="patientName" placeholder="请输入患者姓名" />
        </el-form-item>
      </el-form>
    </div>
    
    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
      <el-button
        v-if="mode === 'register' && slot && slot.status !== 'full'"
        type="primary"
        @click="handleRegister"
      >
        确认挂号
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.slot-info {
  margin-bottom: 20px;
}

.expert-tag {
  margin-left: 10px;
}

.register-form {
  margin-top: 20px;
}
</style>
