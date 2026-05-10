<template>
  <div class="page-container">
    <h2 style="margin-bottom: 24px;">首页概览</h2>
    
    <el-row :gutter="20">
      <el-col :span="6">
        <div class="stat-card">
          <div style="display: flex; align-items: center; gap: 12px;">
            <el-icon :size="40"><User /></el-icon>
            <div>
              <div style="font-size: 28px; font-weight: bold;">{{ employeeStore.employees.length }}</div>
              <div style="font-size: 14px; opacity: 0.9;">员工总数</div>
            </div>
          </div>
        </div>
      </el-col>
      
      <el-col :span="6">
        <div class="stat-card success">
          <div style="display: flex; align-items: center; gap: 12px;">
            <el-icon :size="40"><CircleCheck /></el-icon>
            <div>
              <div style="font-size: 28px; font-weight: bold;">{{ employeeStore.activeCount }}</div>
              <div style="font-size: 14px; opacity: 0.9;">在职员工</div>
            </div>
          </div>
        </div>
      </el-col>
      
      <el-col :span="6">
        <div class="stat-card warning">
          <div style="display: flex; align-items: center; gap: 12px;">
            <el-icon :size="40"><Clock /></el-icon>
            <div>
              <div style="font-size: 28px; font-weight: bold;">{{ approvalStore.pendingCount }}</div>
              <div style="font-size: 14px; opacity: 0.9;">待审批</div>
            </div>
          </div>
        </div>
      </el-col>
      
      <el-col :span="6">
        <div class="stat-card info">
          <div style="display: flex; align-items: center; gap: 12px;">
            <el-icon :size="40"><Document /></el-icon>
            <div>
              <div style="font-size: 28px; font-weight: bold;">{{ approvalStore.approvals.length }}</div>
              <div style="font-size: 14px; opacity: 0.9;">审批总数</div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" style="margin-top: 24px;">
      <el-col :span="16">
        <el-card>
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>待审批列表</span>
              <el-button type="primary" text @click="$router.push('/approvals')">
                查看全部
              </el-button>
            </div>
          </template>
          
          <el-table :data="pendingApprovals" style="width: 100%">
            <el-table-column prop="employeeName" label="申请人" width="100" />
            <el-table-column prop="departmentName" label="部门" width="120" />
            <el-table-column prop="title" label="申请类型" width="120" />
            <el-table-column prop="reason" label="申请理由" show-overflow-tooltip />
            <el-table-column prop="duration" label="时长(天)" width="100" />
            <el-table-column prop="createTime" label="申请时间" width="160" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <span :class="['status-tag', `status-${row.status}`]">
                  {{ statusText[row.status] }}
                </span>
              </template>
            </el-table-column>
          </el-table>
          
          <el-empty v-if="pendingApprovals.length === 0" description="暂无待审批申请" />
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card>
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>最新操作记录</span>
              <el-button type="primary" text @click="$router.push('/operation-logs')">
                查看全部
              </el-button>
            </div>
          </template>
          
          <el-timeline>
            <el-timeline-item
              v-for="log in recentLogs"
              :key="log.id"
              :timestamp="log.createTime"
              placement="top"
            >
              <el-card>
                <h4>{{ log.operatorName }}</h4>
                <p style="margin-top: 8px; color: #606266;">{{ log.description }}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
          
          <el-empty v-if="recentLogs.length === 0" description="暂无操作记录" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEmployeeStore } from '@/stores/employee'
import { useApprovalStore } from '@/stores/approval'
import { useOperationLogStore } from '@/stores/operationLog'
import type { ApprovalStatus } from '@/types'

const employeeStore = useEmployeeStore()
const approvalStore = useApprovalStore()
const logStore = useOperationLogStore()

const statusText: Record<ApprovalStatus, string> = {
  pending: '待审批',
  approved: '已通过',
  rejected: '已驳回'
}

const pendingApprovals = computed(() => {
  return approvalStore.approvals
    .filter(a => a.status === 'pending')
    .slice(0, 5)
})

const recentLogs = computed(() => {
  return logStore.logs.slice(0, 5)
})
</script>