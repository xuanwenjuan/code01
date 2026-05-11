<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Search, Refresh, CircleCheck, CircleClose } from '@element-plus/icons-vue'
import type { MedicationReminder, MedicationStatus, ReminderFilter, FamilyMember } from '@/types'
import { MedicationStatusLabels } from '@/types'
import { useReminderStore } from '@/stores/reminder'
import ReminderDialog from '@/components/ReminderDialog.vue'
import { getTodayString } from '@/utils/date'

const reminderStore = useReminderStore()

const filter = ref<ReminderFilter>({
  date: getTodayString()
})
const dialogVisible = ref(false)
const currentReminder = ref<MedicationReminder | null>(null)

interface MemberOption {
  value: string
  label: string
}

const memberOptions = computed<MemberOption[]>(() => {
  return [
    { value: '', label: '全部成员' },
    ...reminderStore.familyMembers.map((m: FamilyMember) => ({
      value: m.id,
      label: `${m.name} (${m.relation})`
    }))
  ]
})

interface StatusOption {
  value: MedicationStatus | ''
  label: string
}

const statusOptions = computed<StatusOption[]>(() => [
  { value: '', label: '全部状态' },
  ...Object.entries(MedicationStatusLabels).map(([value, label]) => ({
    value: value as MedicationStatus,
    label
  }))
])

const filteredReminders = computed<MedicationReminder[]>(() => {
  return reminderStore.filterReminders(filter.value)
})

const hasActiveFilter = computed<boolean>(() => {
  return !!(filter.value.memberId || filter.value.status || filter.value.keyword)
})

const filterResultCount = computed<number>(() => {
  return filteredReminders.value.length
})

function resetFilter(): void {
  filter.value = {
    date: getTodayString()
  }
}

function handleAdd(): void {
  currentReminder.value = null
  dialogVisible.value = true
}

function handleEdit(reminder: MedicationReminder): void {
  currentReminder.value = reminder
  dialogVisible.value = true
}

async function handleDelete(reminder: MedicationReminder): Promise<void> {
  try {
    await ElMessageBox.confirm(
      `确定要删除"${reminder.memberName}"的${reminder.medicineName}用药提醒吗？`,
      '提示',
      { type: 'warning' }
    )
    reminderStore.deleteReminder(reminder.id)
    ElMessage.success('删除成功')
  } catch {
  }
}

function handleMarkTaken(reminder: MedicationReminder): void {
  reminderStore.markAsTaken(reminder.id, '管理员')
  ElMessage.success('已标记为已服用')
}

function handleMarkSkipped(reminder: MedicationReminder): void {
  reminderStore.markAsSkipped(reminder.id, '管理员')
  ElMessage.success('已标记为已跳过')
}

function statusTagType(status: MedicationStatus): 'primary' | 'success' | 'warning' | 'danger' {
  const map: Record<MedicationStatus, 'primary' | 'success' | 'warning' | 'danger'> = {
    pending: 'primary',
    taken: 'success',
    skipped: 'warning',
    missed: 'danger'
  }
  return map[status]
}

function isMissedHighlight(reminder: MedicationReminder): boolean {
  return reminder.status === 'missed'
}

function getRowClassName({ row }: { row: MedicationReminder }): string {
  return isMissedHighlight(row) ? 'missed-row' : ''
}

onMounted(() => {
  reminderStore.initReminders()
  reminderStore.checkMissedReminders()
})
</script>

<template>
  <div class="reminder-page">
    <div class="page-header">
      <h2 class="page-title">用药管理</h2>
      <el-button type="primary" :icon="Plus" @click="handleAdd">
        新增提醒
      </el-button>
    </div>

    <div class="stat-cards">
      <div class="stat-card">
        <div class="stat-label">今日待服用</div>
        <div class="stat-value primary">{{ reminderStore.statusCounts.pending }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">已服用</div>
        <div class="stat-value success">{{ reminderStore.statusCounts.taken }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">已跳过</div>
        <div class="stat-value warning">{{ reminderStore.statusCounts.skipped }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">已漏服</div>
        <div class="stat-value danger">{{ reminderStore.statusCounts.missed }}</div>
      </div>
    </div>

    <div class="filter-section">
      <el-form :inline="true" :model="filter">
        <el-form-item label="家庭成员">
          <el-select v-model="filter.memberId" placeholder="请选择" clearable style="width: 180px">
            <el-option
              v-for="item in memberOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="用药状态">
          <el-select v-model="filter.status" placeholder="请选择" clearable style="width: 150px">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker
            v-model="filter.date"
            type="date"
            placeholder="选择日期"
            clearable
            style="width: 150px"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="filter.keyword"
            placeholder="搜索药品/成员"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search">搜索</el-button>
          <el-button :icon="Refresh" @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
      
      <div v-if="hasActiveFilter" class="filter-result-info">
        <span>筛选结果：共 <strong>{{ filterResultCount }}</strong> 条记录</span>
        <el-button text type="primary" @click="resetFilter">清除筛选</el-button>
      </div>
    </div>

    <div class="table-section">
      <el-table :data="filteredReminders" stripe style="width: 100%" :row-class-name="getRowClassName">
        <el-table-column label="日期" width="120">
          <template #default="{ row }">
            <span :class="{ 'missed-text': isMissedHighlight(row) }">{{ row.date }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="scheduledTime" label="提醒时间" width="100">
          <template #default="{ row }">
            <span :class="{ 'missed-text': isMissedHighlight(row) }">{{ row.scheduledTime }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="memberName" label="家庭成员" width="100" />
        <el-table-column prop="medicineName" label="药品名称" min-width="150" />
        <el-table-column prop="dosage" label="用量" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" :effect="isMissedHighlight(row) ? 'dark' : 'light'">
              {{ MedicationStatusLabels[row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="actualTime" label="实际服用时间" width="180">
          <template #default="{ row }">
            {{ row.actualTime || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 'pending'">
              <el-button link type="success" :icon="CircleCheck" @click="handleMarkTaken(row)">
                已服用
              </el-button>
              <el-button link type="warning" :icon="CircleClose" @click="handleMarkSkipped(row)">
                跳过
              </el-button>
            </template>
            <el-button link type="primary" :icon="Edit" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button link type="danger" :icon="Delete" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <ReminderDialog
      v-model:visible="dialogVisible"
      :reminder="currentReminder"
      @success="dialogVisible = false"
    />
  </div>
</template>

<style lang="scss" scoped>
.reminder-page {
  :deep(.el-table .missed-row) {
    background: rgba(245, 108, 108, 0.1) !important;
    
    &:hover > td {
      background: rgba(245, 108, 108, 0.15) !important;
    }
    
    .missed-text {
      color: #f56c6c;
      font-weight: 600;
    }
  }

  .filter-result-info {
    margin-top: 12px;
    padding: 8px 12px;
    background: #f0f9eb;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    strong {
      color: #67c23a;
    }
  }
}
</style>
