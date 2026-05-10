<template>
  <div class="prescriptions-page">
    <div class="page-header">
      <div class="page-title">处方管理</div>
    </div>

    <div class="filter-bar">
      <el-select
        v-model="filterStatus"
        placeholder="全部状态"
        clearable
        style="width: 180px"
      >
        <el-option label="待发药" value="pending" />
        <el-option label="已收费" value="issued" />
        <el-option label="已发药" value="dispensed" />
      </el-select>
      <el-input
        v-model="filterKeyword"
        placeholder="搜索患者/医生姓名"
        clearable
        style="width: 250px"
      />
    </div>

    <el-table
      :data="filteredPrescriptions"
      v-loading="clinicStore.isLoading"
      border
      stripe
      style="width: 100%"
    >
      <el-table-column prop="id" label="处方编号" width="200" show-overflow-tooltip />
      <el-table-column prop="patientName" label="患者姓名" width="100" />
      <el-table-column prop="doctorName" label="开方医生" width="100" />
      <el-table-column prop="departmentName" label="科室" width="100" />
      <el-table-column label="药品明细" min-width="250">
        <template #default="{ row }">
          <el-popover placement="top" :width="400" trigger="hover">
            <template #reference>
              <span class="medicine-link">共 {{ row.items.length }} 种药品</span>
            </template>
            <el-table :data="row.items" size="small" border>
              <el-table-column prop="medicineName" label="药品" />
              <el-table-column prop="dosage" label="剂量" />
              <el-table-column prop="usage" label="用法" />
              <el-table-column label="数量">
                <template #default="{ row }">
                  {{ row.quantity }}{{ row.unit }}
                </template>
              </el-table-column>
            </el-table>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="金额" width="100" align="right">
        <template #default="{ row }">
          <span class="price">¥{{ row.totalPrice.toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="开方时间" width="180">
        <template #default="{ row }">
          {{ formatTime(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleViewDetail(row)">
            详情
          </el-button>
          <el-button type="success" link size="small" @click="handlePrint(row)">
            打印
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="detailDialogVisible"
      title="处方详情"
      width="700px"
    >
      <div v-if="currentPrescription" class="prescription-detail">
        <el-descriptions :column="3" border size="small">
          <el-descriptions-item label="处方编号">
            {{ currentPrescription.id }}
          </el-descriptions-item>
          <el-descriptions-item label="开方日期">
            {{ formatTime(currentPrescription.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentPrescription.status)" size="small">
              {{ getStatusLabel(currentPrescription.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="患者姓名">
            {{ currentPrescription.patientName }}
          </el-descriptions-item>
          <el-descriptions-item label="科室">
            {{ currentPrescription.departmentName }}
          </el-descriptions-item>
          <el-descriptions-item label="医生">
            {{ currentPrescription.doctorName }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <h4 class="detail-title">药品明细</h4>
        <el-table :data="currentPrescription.items" size="small" border>
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="medicineName" label="药品名称" min-width="150" />
          <el-table-column prop="specification" label="规格" width="120" />
          <el-table-column prop="dosage" label="剂量" width="100" />
          <el-table-column prop="usage" label="用法" min-width="120" />
          <el-table-column prop="quantity" label="数量" width="80" align="center" />
          <el-table-column prop="unit" label="单位" width="60" align="center" />
          <el-table-column prop="price" label="单价" width="100" align="right">
            <template #default="{ row }">
              ¥{{ row.price.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="小计" width="100" align="right">
            <template #default="{ row }">
              ¥{{ (row.price * row.quantity).toFixed(2) }}
            </template>
          </el-table-column>
        </el-table>

        <div class="prescription-footer">
          <div v-if="currentPrescription.remark" class="remark">
            <strong>备注：</strong>{{ currentPrescription.remark }}
          </div>
          <div class="total">
            总计：<span class="price">¥{{ currentPrescription.totalPrice.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import type { Prescription } from '@/types'
import { useClinicStore } from '@/stores/clinic'

const clinicStore = useClinicStore()

const filterStatus = ref('')
const filterKeyword = ref('')
const detailDialogVisible = ref(false)
const currentPrescription = ref<Prescription | null>(null)

const filteredPrescriptions = computed(() => {
  return clinicStore.prescriptions.filter(presc => {
    if (filterStatus.value && presc.status !== filterStatus.value) {
      return false
    }
    if (filterKeyword.value) {
      const keyword = filterKeyword.value.toLowerCase()
      if (
        !presc.patientName.toLowerCase().includes(keyword) &&
        !presc.doctorName.toLowerCase().includes(keyword)
      ) {
        return false
      }
    }
    return true
  })
})

function getStatusType(status: string): string {
  const types: Record<string, string> = {
    pending: 'warning',
    issued: 'primary',
    dispensed: 'success'
  }
  return types[status] || 'info'
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: '待发药',
    issued: '已收费',
    dispensed: '已发药'
  }
  return labels[status] || status
}

function formatTime(time: string): string {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

function handleViewDetail(row: Prescription) {
  currentPrescription.value = row
  detailDialogVisible.value = true
}

function handlePrint(row: Prescription) {
  ElMessage.info('处方打印功能已触发')
}

onMounted(() => {
  clinicStore.fetchPrescriptions()
})
</script>

<style scoped lang="scss">
.prescriptions-page {
  padding: 20px;
}

.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
}

.medicine-link {
  color: #409eff;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

.price {
  font-weight: 600;
  color: #f56c6c;
}

.prescription-detail {
  .detail-title {
    margin: 16px 0 12px;
    font-size: 14px;
    font-weight: 600;
  }

  .prescription-footer {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px dashed #ebeef5;

    .remark {
      margin-bottom: 12px;
      color: #606266;
      line-height: 1.6;
    }

    .total {
      text-align: right;
      font-size: 16px;

      .price {
        font-size: 24px;
      }
    }
  }
}
</style>
