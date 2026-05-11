<script setup lang="ts">
import { ref, computed } from 'vue'
import { useHospitalStore } from '@/stores/hospital'

const store = useHospitalStore()

const filterOperator = ref('')
const filterOperationType = ref('')
const dateRange = ref<[string, string] | null>(null)

const operationTypes = [
  '添加医生', '编辑医生信息', '修改出诊状态', '创建排班',
  '编辑排班', '锁定号源', '解锁号源', '释放号源',
  '添加停诊备注', '患者挂号', '取消挂号'
]

const filteredLogs = computed(() => {
  let result = store.logs
  
  if (filterOperator.value) {
    result = result.filter(l => l.operator.includes(filterOperator.value))
  }
  if (filterOperationType.value) {
    result = result.filter(l => l.operationType === filterOperationType.value)
  }
  if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
    result = result.filter(l => {
      const date = l.timestamp.split('T')[0]
      return date >= dateRange.value![0] && date <= dateRange.value![1]
    })
  }
  
  return result
})

const roleMap = {
  admin: { label: '管理员', type: 'primary' as const },
  registrar: { label: '挂号员', type: 'success' as const }
}

const handleReset = () => {
  filterOperator.value = ''
  filterOperationType.value = ''
  dateRange.value = null
}
</script>

<template>
  <div class="operation-logs">
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 600; font-size: 16px;">操作履历与审计</span>
          <el-tag type="info">共 {{ filteredLogs.length }} 条记录</el-tag>
        </div>
      </template>
      
      <el-form :inline="true" class="filter-form">
        <el-form-item label="操作人">
          <el-input
            v-model="filterOperator"
            placeholder="输入操作人"
            style="width: 150px"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="操作类型">
          <el-select
            v-model="filterOperationType"
            placeholder="全部类型"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="type in operationTypes"
              :key="type"
              :label="type"
              :value="type"
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
          />
        </el-form-item>
        
        <el-form-item>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <el-timeline>
        <el-timeline-item
          v-for="log in filteredLogs"
          :key="log.id"
          :timestamp="new Date(log.timestamp).toLocaleString()"
          placement="top"
        >
          <el-card shadow="hover">
            <div class="log-header">
              <div class="log-left">
                <el-tag :type="roleMap[log.operatorRole].type" size="small">
                  {{ roleMap[log.operatorRole].label }}
                </el-tag>
                <span class="operator">{{ log.operator }}</span>
                <span class="operation-type">{{ log.operationType }}</span>
              </div>
              <span class="log-id">ID: {{ log.id }}</span>
            </div>
            <div class="log-detail">
              <el-icon><Document /></el-icon>
              <span>{{ log.operationDetail }}</span>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
      
      <el-empty
        v-if="filteredLogs.length === 0"
        description="暂无操作记录"
        :image-size="80"
      />
    </el-card>
  </div>
</template>

<style scoped>
.filter-form {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.log-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.operator {
  font-weight: 600;
  color: #303133;
}

.operation-type {
  padding: 2px 8px;
  background: #ECF5FF;
  color: #409EFF;
  border-radius: 4px;
  font-size: 12px;
}

.log-id {
  font-size: 12px;
  color: #C0C4CC;
}

.log-detail {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: #606266;
  line-height: 1.6;
}
</style>
