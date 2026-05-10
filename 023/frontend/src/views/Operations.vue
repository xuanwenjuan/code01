<template>
  <div class="container">
    <div class="page-header">
      <h2>操作履历管理</h2>
      <div class="header-actions">
        <el-button @click="refreshLogs">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <div class="filter-panel">
      <el-form :inline="true" :model="filter" class="filter-row">
        <el-form-item label="模块">
          <el-select v-model="filter.module" placeholder="全部" clearable style="width: 160px">
            <el-option
              v-for="module in MODULE_TYPES"
              :key="module"
              :label="module"
              :value="module"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="操作">
          <el-select v-model="filter.action" placeholder="全部" clearable style="width: 140px">
            <el-option
              v-for="action in ACTION_TYPES"
              :key="action"
              :label="action"
              :value="action"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="filter.keyword"
            placeholder="搜索详情"
            clearable
            style="width: 200px"
            @keyup.enter="applyFilter"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="applyFilter">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-container">
      <el-table :data="paginatedLogs" row-key="id" border stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="module" label="模块" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getModuleTagType(row.module)" size="small" effect="light">
              {{ row.module }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="action" label="操作" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getActionTagType(row.action)" size="small" effect="light">
              {{ row.action }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="target_id" label="目标ID" width="100" align="center">
          <template #default="{ row }">
            {{ row.target_id || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="detail" label="操作详情" min-width="350" show-overflow-tooltip>
          <template #default="{ row }">
            <el-tooltip
              v-if="row.detail && row.detail.length > 50"
              :content="row.detail"
              placement="top"
              effect="dark"
            >
              <span>{{ row.detail.slice(0, 50) }}...</span>
            </el-tooltip>
            <span v-else>{{ row.detail || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="操作时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination" v-if="filteredLogs.length > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredLogs.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { operationApi, MODULE_TYPES, ACTION_TYPES } from '@/api';
import type {
  OperationLog,
  OperationFilter,
  ModuleType,
  ActionType
} from '@/types';

const logs = ref<OperationLog[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(20);

const filter = reactive<OperationFilter>({
  module: undefined,
  action: undefined,
  keyword: undefined
});

const filteredLogs = computed<OperationLog[]>(() => {
  let result = [...logs.value];
  
  if (filter.module) {
    result = result.filter((l: OperationLog) => l.module === filter.module);
  }
  if (filter.action) {
    result = result.filter((l: OperationLog) => l.action === filter.action);
  }
  if (filter.keyword) {
    const keyword = filter.keyword.toLowerCase();
    result = result.filter((l: OperationLog) =>
      (l.detail || '').toLowerCase().includes(keyword)
    );
  }
  
  return result;
});

const paginatedLogs = computed<OperationLog[]>(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredLogs.value.slice(start, end);
});

const getModuleTagType = (module: ModuleType): string => {
  const types: Record<ModuleType, string> = {
    '分类管理': 'primary',
    '用品管理': 'success',
    '出入库管理': 'warning'
  };
  return types[module] || 'info';
};

const getActionTagType = (action: ActionType): string => {
  const types: Record<ActionType, string> = {
    '新增': 'success',
    '更新': 'warning',
    '删除': 'danger',
    '入库': 'primary',
    '售卖': 'success',
    '残次下架': 'danger'
  };
  return types[action] || 'info';
};

const loadLogs = async (): Promise<void> => {
  loading.value = true;
  try {
    const res = await operationApi.getAll(filter.keyword || undefined);
    logs.value = res.data.data || [];
    currentPage.value = 1;
  } catch (error) {
    console.error('加载操作日志失败', error);
    ElMessage.error('加载操作日志失败');
  } finally {
    loading.value = false;
  }
};

const refreshLogs = (): void => {
  loadLogs();
};

const applyFilter = (): void => {
  currentPage.value = 1;
};

const resetFilter = (): void => {
  Object.assign(filter, {
    module: undefined,
    action: undefined,
    keyword: undefined
  });
  currentPage.value = 1;
};

const handleSizeChange = (val: number): void => {
  pageSize.value = val;
  currentPage.value = 1;
};

const handleCurrentChange = (val: number): void => {
  currentPage.value = val;
};

const formatTime = (time: string): string => {
  return new Date(time).toLocaleString('zh-CN');
};

onMounted((): void => {
  loadLogs();
});
</script>

<style scoped>
.header-actions {
  display: flex;
  gap: 10px;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
