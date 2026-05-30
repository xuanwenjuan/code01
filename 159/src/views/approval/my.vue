<template>
  <div class="page-container approval-page">
    <PageHeader title="我的审批">
      <template #subtitle>
        <el-tag type="info" effect="plain">共 {{ filteredList.length }} 条申请</el-tag>
      </template>
      <template #extra>
        <el-button type="primary" @click="router.push('/approval/leave')">
          <el-icon><Calendar /></el-icon>请假申请
        </el-button>
        <el-button type="success" @click="router.push('/approval/business')">
          <el-icon><Van /></el-icon>出差申请
        </el-button>
      </template>
    </PageHeader>

    <BaseCard :hover="false">
      <div class="stats-row">
        <div
          v-for="tab in statusTabs"
          :key="tab.value"
          class="stat-item"
          :class="{ active: currentStatus === tab.value }"
          @click="currentStatus = tab.value"
        >
          <span class="stat-value" :class="tab.value">{{ tab.count }}</span>
          <span class="stat-label">{{ tab.label }}</span>
        </div>
      </div>

      <el-divider />

      <div class="toolbar">
        <el-input
          v-model="keyword"
          placeholder="搜索审批标题..."
          :prefix-icon="Search"
          clearable
          style="width: 280px"
        />
        <el-button type="primary" text @click="handleRefresh">
          <el-icon><Refresh /></el-icon>刷新
        </el-button>
      </div>

      <el-empty v-if="filteredList.length === 0" description="暂无审批记录" />

      <div v-else class="approval-list">
        <div
          v-for="item in filteredList"
          :key="item.id"
          class="approval-card"
          @click="viewDetail(item)"
        >
          <div class="type-icon" :class="item.type">
            <el-icon :size="20">
              <Calendar v-if="item.type === 'leave'" />
              <Van v-else />
            </el-icon>
          </div>
          <div class="card-info">
            <div class="card-title">
              <span>{{ item.title }}</span>
              <el-tag :type="statusType(item.status)" size="small">
                {{ statusText(item.status) }}
              </el-tag>
            </div>
            <div class="card-meta">
              <span>{{ item.startDate }} 至 {{ item.endDate }} · {{ item.days }}天</span>
              <span>审批人：{{ item.approver }}</span>
              <span>{{ item.createTime }}</span>
            </div>
          </div>
          <div class="card-actions">
            <el-button type="primary" link size="small">查看</el-button>
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
            <el-tag :type="statusType(currentApproval.status)">{{ statusText(currentApproval.status) }}</el-tag>
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
          <el-descriptions-item v-if="currentApproval.rejectReason" label="驳回原因" :span="2">
            <span style="color: var(--color-danger)">{{ currentApproval.rejectReason }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Refresh, Calendar, Van } from '@element-plus/icons-vue'
import { useDataStore } from '@/stores/data'
import BaseCard from '@/components/BaseCard.vue'
import PageHeader from '@/components/PageHeader.vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const store = useDataStore()
const userStore = useUserStore()

const keyword = ref('')
const currentStatus = ref('')
const detailVisible = ref(false)
const currentApproval = ref(null)

const statusText = (s) => ({ pending: '待审批', approved: '已通过', rejected: '已驳回' }[s])
const statusType = (s) => ({ pending: 'warning', approved: 'success', rejected: 'danger' }[s])

const myApprovals = computed(() => store.getMyApprovals(userStore.userInfo.id))

const statusTabs = computed(() => [
  { value: '', label: '全部', count: myApprovals.value.length },
  { value: 'pending', label: '待审批', count: myApprovals.value.filter(i => i.status === 'pending').length },
  { value: 'approved', label: '已通过', count: myApprovals.value.filter(i => i.status === 'approved').length },
  { value: 'rejected', label: '已驳回', count: myApprovals.value.filter(i => i.status === 'rejected').length }
])

const filteredList = computed(() => {
  let list = myApprovals.value
  
  if (currentStatus.value) {
    list = list.filter(i => i.status === currentStatus.value)
  }
  
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    list = list.filter(i =>
      i.title.toLowerCase().includes(kw) ||
      i.reason.toLowerCase().includes(kw)
    )
  }
  
  return list
})

const viewDetail = (item) => {
  currentApproval.value = item
  detailVisible.value = true
}

const handleRefresh = () => {
  keyword.value = ''
  currentStatus.value = ''
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

.stats-row {
  display: flex;
  gap: 12px;
}

.stat-item {
  flex: 1;
  padding: 16px;
  text-align: center;
  border-radius: var(--radius-medium);
  cursor: pointer;
  border: 2px solid transparent;
  transition: all var(--transition-fast);
  
  &.active {
    border-color: var(--color-primary);
    background: var(--bg-light);
  }
  
  .stat-value {
    font-size: 24px;
    font-weight: 600;
    line-height: 1.2;
    margin-bottom: 4px;
    
    &.pending { color: var(--color-warning); }
    &.approved { color: var(--color-success); }
    &.rejected { color: var(--color-danger); }
  }
  
  .stat-label {
    font-size: 13px;
    color: var(--text-regular);
  }
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
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-small);
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    border-color: var(--color-primary);
    background: var(--bg-light);
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
}

.mt-20 {
  margin-top: 20px;
}
</style>
