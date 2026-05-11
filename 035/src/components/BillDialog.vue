<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑账单' : '添加账单'"
    width="500px"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item label="类型">
        <el-radio-group v-model="formData.type" class="type-radio">
          <el-radio-button value="expense" class="expense-radio">支出</el-radio-button>
          <el-radio-button value="income" class="income-radio">收入</el-radio-button>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item label="金额" prop="amount">
        <el-input-number
          v-model="formData.amount"
          :min="0.01"
          :precision="2"
          :controls="false"
          class="amount-input"
          placeholder="请输入金额"
        >
          <template #prefix>¥</template>
        </el-input-number>
        <el-tag 
          v-if="formData.type === 'expense' && formData.amount >= LARGE_AMOUNT_THRESHOLD" 
          type="warning" 
          class="large-warning"
        >
          大额支出提醒
        </el-tag>
      </el-form-item>
      
      <el-form-item label="分类" prop="categoryId">
        <div class="category-grid">
          <div
            v-for="category in filteredCategories"
            :key="category.id"
            class="category-item"
            :class="{ active: formData.categoryId === category.id }"
            :style="{ '--category-color': category.color }"
            @click="selectCategory(category.id)"
          >
            <el-icon :size="24">
              <component :is="category.icon" />
            </el-icon>
            <span>{{ category.name }}</span>
          </div>
        </div>
      </el-form-item>
      
      <el-form-item label="账户" prop="accountId">
        <el-select v-model="formData.accountId" placeholder="请选择账户" style="width: 100%">
          <el-option
            v-for="account in ACCOUNTS"
            :key="account.id"
            :label="account.name"
            :value="account.id"
          >
            <span class="flex-between" style="width: 100%">
              <span class="flex-center" style="gap: 8px">
                <el-icon><component :is="account.icon" /></el-icon>
                {{ account.name }}
              </span>
              <span :style="{ color: account.balance >= 0 ? '#67c23a' : '#f56c6c' }">
                {{ account.balance >= 0 ? '+' : '' }}{{ formatMoney(account.balance) }}
              </span>
            </span>
          </el-option>
        </el-select>
      </el-form-item>
      
      <el-form-item label="日期" prop="date">
        <el-date-picker
          v-model="formData.date"
          type="date"
          placeholder="选择日期"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>
      
      <el-form-item label="备注">
        <el-input
          v-model="formData.note"
          type="textarea"
          :rows="2"
          placeholder="请输入备注（可选）"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        {{ isEdit ? '保存修改' : '确认添加' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { Bill, BillType, CategoryType, AccountType } from '@/types'
import { CATEGORIES, ACCOUNTS, LARGE_AMOUNT_THRESHOLD } from '@/constants'
import { useBillStore } from '@/stores/bill'
import { formatMoney, formatDate } from '@/utils'

const emit = defineEmits<{
  (e: 'success', bill: Bill, isEdit: boolean, oldBill?: Bill): void
}>()

const billStore = useBillStore()

const visible = ref(false)
const loading = ref(false)
const formRef = ref<FormInstance>()
const isEdit = ref(false)
const originalBill = ref<Bill | null>(null)

interface FormData {
  type: BillType
  amount: number | undefined
  categoryId: CategoryType
  accountId: AccountType
  date: string
  note: string
}

const defaultFormData: FormData = {
  type: 'expense',
  amount: undefined,
  categoryId: 'food',
  accountId: 'wechat',
  date: formatDate(new Date()),
  note: '',
}

const formData = ref<FormData>({ ...defaultFormData })

const rules: FormRules = {
  amount: [{ required: true, type: 'number', min: 0.01, message: '请输入有效金额', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  accountId: [{ required: true, message: '请选择账户', trigger: 'change' }],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
}

const filteredCategories = computed(() => 
  CATEGORIES.filter(c => c.type === formData.value.type)
)

watch(() => formData.value.type, (newType: BillType) => {
  const firstCategory = CATEGORIES.find(c => c.type === newType)
  if (firstCategory) {
    formData.value.categoryId = firstCategory.id
  }
})

function selectCategory(categoryId: CategoryType): void {
  formData.value.categoryId = categoryId
}

function open(bill?: Bill): void {
  visible.value = true
  if (bill) {
    isEdit.value = true
    originalBill.value = { ...bill }
    formData.value = {
      type: bill.type,
      amount: bill.amount,
      categoryId: bill.categoryId,
      accountId: bill.accountId,
      date: bill.date,
      note: bill.note,
    }
  } else {
    isEdit.value = false
    originalBill.value = null
    formData.value = { ...defaultFormData, date: formatDate(new Date()) }
  }
}

function handleCancel(): void {
  visible.value = false
}

async function handleSubmit(): Promise<void> {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid || formData.value.amount === undefined || formData.value.amount <= 0) {
    return
  }
  
  loading.value = true
  
  try {
    const billData = {
      type: formData.value.type,
      amount: formData.value.amount,
      categoryId: formData.value.categoryId,
      accountId: formData.value.accountId,
      date: formData.value.date,
      note: formData.value.note,
    }
    
    let bill: Bill | null
    
    if (isEdit.value && originalBill.value) {
      bill = billStore.updateBill(originalBill.value.id, billData)
      if (bill) {
        ElMessage.success('账单修改成功')
        emit('success', bill, true, originalBill.value)
      }
    } else {
      bill = billStore.addBill(billData)
      ElMessage.success('账单添加成功')
      emit('success', bill, false)
    }
    
    visible.value = false
  } finally {
    loading.value = false
  }
}

defineExpose({ open })
</script>

<style scoped lang="scss">
.type-radio {
  width: 100%;
  
  :deep(.el-radio-button__inner) {
    width: 50%;
    text-align: center;
  }
  
  .expense-radio {
    &.is-active :deep(.el-radio-button__inner) {
      background-color: #f56c6c;
      border-color: #f56c6c;
    }
  }
  
  .income-radio {
    &.is-active :deep(.el-radio-button__inner) {
      background-color: #67c23a;
      border-color: #67c23a;
    }
  }
}

.amount-input {
  width: 100%;
}

.large-warning {
  margin-left: 12px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  border: 2px solid #dcdfe6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: var(--category-color);
    color: var(--category-color);
  }
  
  &.active {
    border-color: var(--category-color);
    background-color: var(--category-color);
    color: #fff;
  }
  
  span {
    margin-top: 6px;
    font-size: 12px;
  }
}

@media screen and (max-width: $breakpoint-tablet) {
  .category-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
}
</style>
