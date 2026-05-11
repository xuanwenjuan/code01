<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLogStore } from '@/stores/logStore'
import { useBookStore } from '@/stores/bookStore'
import { useReadingStore } from '@/stores/readingStore'
import { getMockLogs, getMockBooks, getMockRecords } from '@/mock'
import { OPERATION_TYPE_OPTIONS, OPERATION_TYPE_LABELS } from '@/constants'
import type { OperationType } from '@/types'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'

const logStore = useLogStore()
const bookStore = useBookStore()
const readingStore = useReadingStore()

onMounted(() => {
  if (logStore.logs.length === 0) {
    logStore.logs = getMockLogs()
  }
  if (bookStore.books.length === 0) {
    bookStore.setBooks(getMockBooks())
  }
  if (readingStore.records.length === 0) {
    readingStore.records = getMockRecords()
  }
})

const filterType = ref<OperationType | undefined>(undefined)
const dateRange = ref<[string, string] | undefined>(undefined)
const keyword = ref('')

const filteredLogs = computed(() => {
  return logStore.filteredLogs({
    type: filterType.value,
    startDate: dateRange.value?.[0],
    endDate: dateRange.value?.[1],
    keyword: keyword.value || undefined
  })
})

const logTableData = computed(() => {
  return filteredLogs.value.map(log => ({
    ...log,
    formattedType: OPERATION_TYPE_LABELS[log.type] || log.type,
    formattedTime: dayjs(log.createdAt).format('YYYY-MM-DD HH:mm:ss'),
    bookTitle: log.bookId ? bookStore.getBookById(log.bookId)?.title || '已删除' : '-'
  }))
})

const stats = computed(() => ({
  total: logStore.logs.length,
  today: logStore.logsByDateRange(dayjs().format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')).length,
  week: logStore.logsByDateRange(dayjs().startOf('week').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')).length
}))

const handleReset = () => {
  filterType.value = undefined
  dateRange.value = undefined
  keyword.value = ''
}

const handleClearLogs = () => {
  ElMessageBox.confirm(
    '确定要清空所有操作日志吗？此操作不可恢复。',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    logStore.clearLogs()
    ElMessage.success('日志已清空')
  }).catch(() => {
  })
}
</script>

<template>
  <div class="logs-page">
    <el-row :gutter="20" class="mb-20">
      <el-col :xs="8" :sm="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" style="color: #409eff;"><Document /></el-icon>
            <div>
              <div class="stat-value">{{ stats.total }}</div>
              <div class="stat-label">总操作数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="8" :sm="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" style="color: #67c23a;"><Calendar /></el-icon>
            <div>
              <div class="stat-value">{{ stats.today }}</div>
              <div class="stat-label">今日操作</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="8" :sm="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" style="color: #e6a23c;"><Timer /></el-icon>
            <div>
              <div class="stat-value">{{ stats.week }}</div>
              <div class="stat-label">本周操作</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="filter-card">
      <el-form :inline="true" :model="{ type: filterType, dateRange, keyword }" class="filter-form">
        <el-form-item label="操作类型">
          <el-select
            v-model="filterType"
            placeholder="全部类型"
            clearable
            style="width: 150px;"
          >
            <el-option
              v-for="item in OPERATION_TYPE_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 260px;"
          />
        </el-form-item>

        <el-form-item label="关键词">
          <el-input
            v-model="keyword"
            placeholder="搜索标题/描述"
            clearable
            style="width: 200px;"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleReset">重置</el-button>
          <el-button type="danger" plain @click="handleClearLogs">清空日志</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card mt-20">
      <template #header>
        <div class="card-header">
          <span>操作日志列表</span>
          <el-tag type="info" size="small">共 {{ filteredLogs.length }} 条记录</el-tag>
        </div>
      </template>

      <el-table
        :data="logTableData"
        v-loading="false"
        stripe
        style="width: 100%;"
      >
        <el-table-column label="操作类型" width="120">
          <template #default="{ row }">
            <el-tag
              :type="row.type === 'delete_book' ? 'danger' : row.type === 'add_book' ? 'success' : 'primary'"
              size="small"
            >
              {{ row.formattedType }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="标题" min-width="150">
          <template #default="{ row }">
            <div class="title-cell">{{ row.title }}</div>
          </template>
        </el-table-column>

        <el-table-column label="描述" min-width="250">
          <template #default="{ row }">
            <div class="desc-cell" :title="row.description">{{ row.description }}</div>
          </template>
        </el-table-column>

        <el-table-column label="关联书籍" width="180">
          <template #default="{ row }">
            <el-tag v-if="row.bookTitle !== '-'" type="info" size="small" effect="plain">
              {{ row.bookTitle }}
            </el-tag>
            <span v-else class="text-placeholder">-</span>
          </template>
        </el-table-column>

        <el-table-column label="操作时间" width="180" prop="formattedTime" />
      </el-table>

      <el-empty
        v-if="logTableData.length === 0"
        description="暂无操作日志"
      />
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.logs-page {
  .stat-card {
    :deep(.el-card__body) {
      padding: 15px 20px;
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .stat-icon {
      font-size: 32px;
      opacity: 0.8;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 600;
      color: $text-primary;
      line-height: 1.2;
    }

    .stat-label {
      font-size: 12px;
      color: $text-secondary;
      margin-top: 4px;
    }
  }

  .filter-card {
    :deep(.el-card__body) {
      padding: 15px 20px;
    }

    .filter-form {
      .el-form-item {
        margin-bottom: 0;
      }
    }
  }

  .table-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
    }

    .title-cell {
      font-weight: 500;
      color: $text-primary;
    }

    .desc-cell {
      color: $text-regular;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .text-placeholder {
      color: $text-secondary;
    }
  }
}

@media (max-width: $breakpoint-md) {
  .filter-form {
    .el-form-item {
      margin-bottom: 10px;
    }
  }
}
</style>
