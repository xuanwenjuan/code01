<template>
  <div class="operation-logs">
    <el-card class="filter-section">
      <el-form :model="filterParams" inline>
        <el-form-item label="关键词">
          <el-input
            v-model="filterParams.keyword"
            placeholder="搜索操作内容/行程名称"
            clearable
            style="width: 250px"
            @input="handleFilter"
          />
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select
            v-model="filterParams.type"
            placeholder="全部类型"
            clearable
            style="width: 160px"
            @change="handleFilter"
          >
            <el-option
              v-for="item in logStore.getLogTypes()"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterParams.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 280px"
            @change="handleDateRangeChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleResetFilter">重置</el-button>
          <el-button @click="handleClearLogs">清空日志</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="page-header">
      <span class="page-title">操作日志（共 {{ filteredLogs.length }} 条）</span>
    </div>

    <el-card class="table-container">
      <el-timeline>
        <el-timeline-item
          v-for="log in filteredLogs"
          :key="log.id"
          :timestamp="log.timestamp"
          placement="top"
          :type="getTimelineType(log.type)"
        >
          <el-card shadow="hover">
            <div class="log-item">
              <div class="log-header">
                <el-tag :type="getTagType(log.type)" size="small">
                  {{ OperationTypeLabels[log.type] }}
                </el-tag>
                <span class="log-operator">
                  <el-icon><User /></el-icon>
                  {{ log.operator }}
                </span>
              </div>
              <div class="log-content">
                <el-icon><Document /></el-icon>
                <span>{{ log.content }}</span>
              </div>
              <div v-if="log.tripName" class="log-trip">
                <el-icon><Location /></el-icon>
                <span>关联行程：{{ log.tripName }}</span>
              </div>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>

      <el-empty v-if="filteredLogs.length === 0" description="暂无操作日志" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { OperationType, LogFilterParams } from '@/types'
import { OperationTypeLabels } from '@/types'
import { useLogStore } from '@/stores/logStore'

type TimelineType = 'primary' | 'success' | 'warning' | 'danger' | 'info'
type TagType = 'success' | 'info' | 'warning' | 'danger'

const logStore = useLogStore()

interface LocalLogFilterParams {
  keyword: string
  type: OperationType | ''
  dateRange: [string, string] | []
}

const filterParams = reactive<LocalLogFilterParams>({
  keyword: '',
  type: '',
  dateRange: []
})

const dateStart = ref<string | undefined>(undefined)
const dateEnd = ref<string | undefined>(undefined)

watch(
  (): [string, string] | [] => filterParams.dateRange,
  (val: [string, string] | []): void => {
    if (val && val.length === 2) {
      dateStart.value = val[0]
      dateEnd.value = val[1]
    } else {
      dateStart.value = undefined
      dateEnd.value = undefined
    }
  }
)

const filteredLogs = computed(() => {
  const params: LogFilterParams = {
    keyword: filterParams.keyword || undefined,
    type: filterParams.type || undefined,
    dateStart: dateStart.value,
    dateEnd: dateEnd.value
  }
  return logStore.filterLogs(params)
})

const getTimelineType = (type: OperationType): TimelineType => {
  const typeMap: Record<OperationType, TimelineType> = {
    create_trip: 'success',
    update_trip: 'primary',
    delete_trip: 'danger',
    add_checkin: 'primary',
    update_checkin: 'warning',
    add_expense: 'info',
    update_budget: 'warning'
  }
  return typeMap[type]
}

const getTagType = (type: OperationType): TagType => {
  const typeMap: Record<OperationType, TagType> = {
    create_trip: 'success',
    update_trip: 'info',
    delete_trip: 'danger',
    add_checkin: 'info',
    update_checkin: 'warning',
    add_expense: 'info',
    update_budget: 'warning'
  }
  return typeMap[type]
}

const handleFilter = (): void => {}

const handleDateRangeChange = (): void => {}

const handleResetFilter = (): void => {
  filterParams.keyword = ''
  filterParams.type = ''
  filterParams.dateRange = []
}

const handleClearLogs = async (): Promise<void> => {
  try {
    await ElMessageBox.confirm('确定要清空所有操作日志吗？此操作不可恢复。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    logStore.clearLogs()
    ElMessage.success('日志已清空')
  } catch {
  }
}
</script>

<style lang="scss" scoped>
.operation-logs {
  .log-item {
    .log-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .log-operator {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #999;
        font-size: 13px;
      }
    }

    .log-content {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      color: #333;
      font-size: 14px;
      line-height: 1.6;

      .el-icon {
        margin-top: 3px;
        color: #409eff;
      }
    }

    .log-trip {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid #eee;
      color: #666;
      font-size: 13px;

      .el-icon {
        color: #67c23a;
      }
    }
  }
}
</style>
