<template>
  <div class="page-container approval-page">
    <PageHeader title="待我审批">
      <template #subtitle>
        <el-tag type="warning" effect="dark">
          <el-icon><Bell /></el-icon>待处理：{{ pendingList.length }}
        </el-tag>
      </template>
    </PageHeader>

    <BaseCard :hover="false">
      <div class="toolbar">
        <el-radio-group v-model="filterType" size="small">
          <el-radio-button value="">全部类型</el-radio-button>
          <el-radio-button value="leave">请假申请</el-radio-button>
          <el-radio-button value="business">出差申请</el-radio-button>
        </el-radio-group>
        <el-button type="primary" text @click="handleRefresh">
          <el-icon><Refresh /></el-icon>刷新
        </el-button>
      </div>

      <el-empty v-if="filteredList.length === 0" description="暂无待审批的申请" />

      <div v-else class="approval-list">
        <div
          v-for="item in filteredList"
          :key="item.id"
          class="approval-card"
        >
          <div class="card-left">
            <div class="type-icon" :class="item.type">
              <el-icon :size="20">
                <Calendar v-if="item.type === 'leave'" />
                <Van v-else />
              </el-icon>
            </div>
            <div class="card-info">
              <div class="card-title">
                <span>{{ item.title }}</span>
                <el-tag type="warning" size="small">待处理</el-tag>
              </div>
              <div class="card-meta">
                <span>申请人：{{ item.applicant }}</span>
                <span>{{ item.startDate }} 至 {{ item.endDate }} · {{ item.days }}天</span>
                <span>{{ item.createTime }}</span>
              </div>
            </div>
          </div>
          <div class="card-actions">
            <el-button type="success" size="small" @click="handleApprove(item)">
              <el-icon><Check /></el-icon>通过
            </el-button>
            <el-button type="danger" size="small" @click="handleReject(item)">
              <el-icon><Close /></el-icon>驳回
            </el-button>
            <el-button type="primary" link size="small" @click="viewDetail(item)">详情</el-button>
          </div>
        </div>
      </div>
    </BaseCard>

    <el-dialog v-model="detailVisible" title="审批详情" width="600px" destroy-on-close>
      <div v-if="currentApproval" class="approval-detail">
        <div class="detail-header">
          <div class="type-icon large" :class="currentApproval.type">
            <el-icon :size="28">
              <Calendar v-if="currentApproval.type === 'leave'" />
              <Van v-else />
            </el-icon>
          </div>
          <div>
            <h3>{{ currentApproval.title }}</h3>
            <el-tag type="warning">待审批</el-tag>
          </div>
        </div>

        <el-descriptions :column="2" border size="small" class="mt-20">
          <el-descriptions-item label="申请人">{{ currentApproval.applicant }}</el-descriptions-item>
          <el-descriptions-item label="申请时间">{{ currentApproval.createTime }}</el-descriptions-item>
          <el-descriptions-item label="开始时间">{{ currentApproval.startDate }}</el-descriptions-item>
          <el-descriptions-item label="结束时间">{{ currentApproval.endDate }}</el-descriptions-item>
          <el-descriptions-item label="时长" :span="2">{{ currentApproval.days }} 天</el-descriptions-item>
          <el-descriptions-item v-if="currentApproval.type === 'leave'" label="请假类型" :span="2">
            {{ currentApproval.leaveType }}
          </el-descriptions-item>
          <el-descriptions-item v-else label="出差地点">{{ currentApproval.destination }}</el-descriptions-item>
          <el-descriptions-item v-else label="交通方式">{{ currentApproval.transportation }}</el-descriptions-item>
          <el-descriptions-item label="申请事由" :span="2">{{ currentApproval.reason }}</el-descriptions-item>
        </el-descriptions>

        <div class="approval-actions">
          <el-button type="success" size="large" @click="handleApprove(currentApproval)">
            <el-icon><Check /></el-icon>通过申请
          </el-button>
          <el-button type="danger" size="large" @click="handleReject(currentApproval)">
            <el-icon><Close /></el-icon>驳回申请
          </el-button>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="rejectVisible" title="驳回原因" width="420px">
      <el-form :model="rejectForm" label-position="top">
        <el-form-item label="请输入驳回原因（必填）">
          <el-input
            v-model="rejectForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请详细说明驳回原因..."
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectVisible = false">取消</el-button>
        <el-button type="primary" :loading="actionLoading" @click="confirmReject">
          确认驳回
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Calendar, Van, Bell, Check, Close } from '@element-plus/icons-vue'
import { useDataStore } from '@/stores/data'
import BaseCard from '@/components/BaseCard.vue'
import PageHeader from '@/components/PageHeader.vue'

const store = useDataStore()

const filterType = ref('')
const detailVisible = ref(false)
const rejectVisible = ref(false)
const currentApproval = ref(null)
const actionLoading = ref(false)
const rejectForm = ref({ id: null, reason: '' })

const pendingList = computed(() => store.getPendingApprovals())

const filteredList = computed(() => {
  let list = pendingList.value
  if (filterType.value) {
    list = list.filter(i => i.type === filterType.value)
  }
  return list
})

const viewDetail = (item) => {
  currentApproval.value = item
  detailVisible.value = true
}

const handleApprove = async (item) => {
  try {
    await ElMessageBox.confirm('确定要通过此申请吗？', '通过审批', {
      confirmButtonText: '确定通过',
      cancelButtonText: '取消',
      type: 'success'
    })
    store.updateApprovalStatus(item.id, 'approved')
    ElMessage.success('审批通过')
    detailVisible.value = false
  } catch {}
}

const handleReject = (item) => {
  rejectForm.value = { id: item.id, reason: '' }
  rejectVisible.value = true
}

const confirmReject = () => {
  if (!rejectForm.value.reason.trim()) {
    ElMessage.warning('请输入驳回原因')
    return
  }
  actionLoading.value = true
  setTimeout(() => {
    store.updateApprovalStatus(rejectForm.value.id, 'rejected', rejectForm.value.reason)
    ElMessage.success('已驳回')
    rejectVisible.value = false
    detailVisible.value = false
    actionLoading.value = false
  }, 500)
}

const handleRefresh = () => {
  filterType.value = ''
}
</script>

<style scoped lang="scss">
.approval-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

:deep(.card-body) {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.approval-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.approval-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-left: 4px solid var(--color-warning);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-small);
  transition: all var(--transition-fast);
  
  &:hover {
    background: var(--bg-light);
    border-color: var(--color-warning);
  }
  
  .card-left {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
    min-width: 0;
  }
  
  .type-icon {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-small);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    
    &.leave {
      background: var(--color-primary-light);
      color: var(--color-primary);
    }
    
    &.business {
      background: var(--color-success-light);
      color: var(--color-success);
    }
    
    &.large {
      width: 60px;
      height: 60px;
      border-radius: var(--radius-medium);
    }
  }
  
  .card-info {
    flex: 1;
    min-width: 0;
    
    .card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
      
      span {
        font-size: 14px;
        font-weight: 500;
      }
    }
    
    .card-meta {
      font-size: 12px;
      color: var(--text-secondary);
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
  }
  
  .card-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }
}

.approval-detail {
  .detail-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
    
    h3 {
      font-size: 18px;
      margin: 0 0 8px;
    }
  }
  
  .approval-actions {
    display: flex;
    gap: 16px;
    justify-content: center;
    margin-top: 20px;
    
    .el-button {
      min-width: 120px;
    }
  }
}

.mt-20 {
  margin-top: 20px;
}
</style>
