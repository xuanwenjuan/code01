<template>
  <div class="page-container form-page">
    <PageHeader title="发起出差审批" :show-back="true" />

    <BaseCard class="form-card" :hover="false">
      <div class="form-header">
        <div class="header-icon business">
          <el-icon :size="28"><Van /></el-icon>
        </div>
        <div>
          <h3>出差申请</h3>
          <p>请填写出差信息，提交后将由部门经理审批</p>
        </div>
      </div>

      <el-divider />

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="approval-form"
      >
        <el-form-item label="出差事由" prop="title">
          <el-input
            v-model="form.title"
            placeholder="请简要描述出差事由"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="出差地点" prop="destination">
              <el-input v-model="form.destination" placeholder="请输入出差地点" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="交通方式" prop="transportation">
              <el-select v-model="form.transportation" placeholder="请选择交通方式" style="width: 100%">
                <el-option label="飞机" value="飞机" />
                <el-option label="高铁" value="高铁" />
                <el-option label="火车" value="火车" />
                <el-option label="汽车" value="汽车" />
                <el-option label="自驾" value="自驾" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startDate">
              <el-date-picker
                v-model="form.startDate"
                type="date"
                placeholder="选择开始日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endDate">
              <el-date-picker
                v-model="form.endDate"
                type="date"
                placeholder="选择结束日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="出差天数">
              <div class="days-display">
                <span class="days-value">{{ days }}</span>
                <span class="days-unit">天</span>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预计费用">
              <el-input-number
                v-model="form.budget"
                :min="0"
                :precision="2"
                placeholder="请输入预计费用"
                style="width: 100%"
              >
                <template #append>元</template>
              </el-input-number>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="详细说明" prop="reason">
          <el-input
            v-model="form.reason"
            type="textarea"
            :rows="4"
            placeholder="请详细说明出差目的"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="审批人">
          <div class="approver-info">
            <el-avatar :size="32" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
            <span>张小明（技术总监）</span>
          </div>
        </el-form-item>

        <el-divider />

        <el-form-item>
          <div class="form-actions">
            <el-button :loading="loading" type="primary" @click="handleSubmit">
              提交申请
            </el-button>
            <el-button @click="handleReset">重置</el-button>
            <el-button @click="router.back()">取消</el-button>
          </div>
        </el-form-item>
      </el-form>
    </BaseCard>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Van } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { useDataStore } from '@/stores/data'
import { useUserStore } from '@/stores/user'
import BaseCard from '@/components/BaseCard.vue'
import PageHeader from '@/components/PageHeader.vue'

const router = useRouter()
const store = useDataStore()
const userStore = useUserStore()
const formRef = ref()
const loading = ref(false)

const form = reactive({
  type: 'business',
  title: '',
  destination: '',
  startDate: '',
  endDate: '',
  transportation: '',
  budget: null,
  reason: '',
  approver: '张小明'
})

const rules = {
  title: [
    { required: true, message: '请输入出差事由', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  destination: [{ required: true, message: '请输入出差地点', trigger: 'blur' }],
  transportation: [{ required: true, message: '请选择交通方式', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
  reason: [
    { required: true, message: '请输入详细说明', trigger: 'blur' },
    { min: 5, max: 500, message: '长度在 5 到 500 个字符', trigger: 'blur' }
  ]
}

const days = computed(() => {
  if (!form.startDate || !form.endDate) return 0
  const start = dayjs(form.startDate)
  const end = dayjs(form.endDate)
  const diff = end.diff(start, 'day') + 1
  return diff > 0 ? diff : 0
})

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      if (days.value <= 0) {
        ElMessage.error('结束日期必须大于等于开始日期')
        return
      }
      loading.value = true
      setTimeout(() => {
        store.createApproval({
          ...form,
          days: days.value,
          applicant: userStore.userInfo.name,
          applicantId: userStore.userInfo.id
        })
        ElMessage.success('申请提交成功，等待审批')
        loading.value = false
        router.push('/approval/my')
      }, 500)
    }
  })
}

const handleReset = () => {
  formRef.value?.resetFields()
}
</script>

<style scoped lang="scss">
.form-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.form-card {
  flex: 1;
  overflow-y: auto;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.form-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
  
  .header-icon {
    width: 56px;
    height: 56px;
    background: var(--color-primary-light);
    color: var(--color-primary);
    border-radius: var(--radius-medium);
    display: flex;
    align-items: center;
    justify-content: center;
    
    &.business {
      background: var(--color-success-light);
      color: var(--color-success);
    }
  }
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 4px;
  }
  
  p {
    font-size: 13px;
    color: var(--text-secondary);
    margin: 0;
  }
}

.approval-form {
  padding-top: 8px;
}

.days-display {
  display: flex;
  align-items: baseline;
  gap: 6px;
  
  .days-value {
    font-size: 28px;
    font-weight: 700;
    color: var(--color-success);
    line-height: 1;
  }
  
  .days-unit {
    font-size: 14px;
    color: var(--text-regular);
  }
}

.approver-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: var(--bg-light);
  border-radius: var(--radius-small);
  font-size: 14px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>
