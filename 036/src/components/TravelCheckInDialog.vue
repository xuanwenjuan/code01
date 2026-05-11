<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="560px"
    :close-on-click-modal="false"
  >
    <div v-if="attraction" class="checkin-dialog">
      <div class="attraction-info">
        <div class="info-header">
          <el-icon class="header-icon"><Location /></el-icon>
          <span class="attraction-name">{{ attraction.name }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">位置：</span>
          <span class="info-value">{{ attraction.location }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">计划日期：</span>
          <span class="info-value">{{ attraction.plannedDate }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">当前状态：</span>
          <StatusTag :status="attraction.status" />
        </div>
        <div v-if="attraction.checkedInAt" class="info-row">
          <span class="info-label">打卡时间：</span>
          <span class="info-value">{{ attraction.checkedInAt }}</span>
        </div>
      </div>

      <el-divider />

      <div class="status-select-section">
        <div class="section-title">选择打卡状态</div>
        <div class="status-options">
          <div
            v-for="option in statusOptions"
            :key="option.value"
            :class="['status-option', { active: selectedStatus === option.value }]"
            @click="selectedStatus = option.value"
          >
            <el-icon class="option-icon" :style="{ color: option.color }">
              <component :is="option.icon" />
            </el-icon>
            <span class="option-label">{{ option.label }}</span>
          </div>
        </div>
      </div>

      <div v-if="selectedStatus === 'checked'" class="photo-section">
        <div class="section-title">打卡照片（可选）</div>
        <el-upload
          class="upload-demo"
          action="#"
          :auto-upload="false"
          list-type="picture-card"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
          :file-list="fileList"
          :limit="4"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>
      </div>

      <div class="note-section">
        <div class="section-title">备注（可选）</div>
        <el-input
          v-model="note"
          type="textarea"
          :rows="3"
          placeholder="记录这次打卡的感想..."
        />
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :disabled="!canSubmit" @click="handleConfirm">
          确认打卡
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Attraction, CheckInStatus } from '@/types'
import { CheckInStatusLabels } from '@/types'
import StatusTag from './StatusTag.vue'

const props = defineProps<{
  modelValue: boolean
  attraction: Attraction | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', data: { status: CheckInStatus; note: string; photos: string[] }): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const selectedStatus = ref<CheckInStatus>('pending')
const note = ref('')
const fileList = ref<Array<{ name: string; url: string }>>([])

const dialogTitle = computed(() => {
  if (!props.attraction) return '打卡操作'
  return `${props.attraction.name} - 打卡操作`
})

const canSubmit = computed(() => {
  return props.attraction !== null && selectedStatus.value !== props.attraction?.status
})

const statusOptions: Array<{
  value: CheckInStatus
  label: string
  icon: string
  color: string
}> = [
  { value: 'pending', label: CheckInStatusLabels.pending, icon: 'Clock', color: '#fa8c16' },
  { value: 'checked', label: CheckInStatusLabels.checked, icon: 'CircleCheck', color: '#52c41a' },
  { value: 'missed', label: CheckInStatusLabels.missed, icon: 'CircleClose', color: '#ff4d4f' }
]

watch(
  () => props.modelValue,
  (val) => {
    if (val && props.attraction) {
      selectedStatus.value = props.attraction.status
      note.value = ''
      fileList.value = []
    }
  }
)

const handleFileChange = (file: { name: string; url?: string }) => {
  if (file.url) {
    fileList.value.push({
      name: file.name,
      url: file.url
    })
  }
}

const handleFileRemove = (file: { name: string }) => {
  const index = fileList.value.findIndex((item) => item.name === file.name)
  if (index !== -1) {
    fileList.value.splice(index, 1)
  }
}

const handleCancel = () => {
  visible.value = false
}

const handleConfirm = () => {
  if (!props.attraction) return
  emit('confirm', {
    status: selectedStatus.value,
    note: note.value,
    photos: fileList.value.map((item) => item.url)
  })
  visible.value = false
}
</script>

<style lang="scss" scoped>
.checkin-dialog {
  .attraction-info {
    .info-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;

      .header-icon {
        font-size: 24px;
        color: #409eff;
      }

      .attraction-name {
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }
    }

    .info-row {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      font-size: 14px;

      .info-label {
        color: #666;
        min-width: 80px;
      }

      .info-value {
        color: #333;
      }
    }
  }

  .section-title {
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
    font-size: 14px;
  }

  .status-options {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
  }

  .status-option {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px;
    border: 2px solid #e4e7ed;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      border-color: #c6e2ff;
      background-color: #ecf5ff;
    }

    &.active {
      border-color: #409eff;
      background-color: #ecf5ff;

      .option-label {
        color: #409eff;
        font-weight: 600;
      }
    }

    .option-icon {
      font-size: 32px;
    }

    .option-label {
      font-size: 14px;
      color: #666;
    }
  }

  .photo-section {
    margin-bottom: 20px;
  }

  .note-section {
    margin-bottom: 10px;
  }
}

.upload-demo {
  :deep(.el-upload--picture-card) {
    width: 100px;
    height: 100px;
    line-height: 100px;
  }
}
</style>
