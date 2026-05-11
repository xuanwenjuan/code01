<template>
  <div class="filter-panel">
    <el-form :model="filterForm" inline>
      <el-form-item label="类型">
        <el-select v-model="filterForm.type" placeholder="全部" clearable style="width: 120px">
          <el-option label="支出" value="expense" />
          <el-option label="收入" value="income" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="分类">
        <el-select v-model="filterForm.categoryId" placeholder="全部" clearable style="width: 140px">
          <el-option
            v-for="category in availableCategories"
            :key="category.id"
            :label="category.name"
            :value="category.id"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="账户">
        <el-select v-model="filterForm.accountId" placeholder="全部" clearable style="width: 120px">
          <el-option
            v-for="account in ACCOUNTS"
            :key="account.id"
            :label="account.name"
            :value="account.id"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="金额">
        <el-input
          v-model.number="filterForm.minAmount"
          type="number"
          placeholder="最小"
          :min="0"
          :precision="2"
          style="width: 100px"
        >
          <template #prefix>¥</template>
        </el-input>
        <span class="amount-separator">-</span>
        <el-input
          v-model.number="filterForm.maxAmount"
          type="number"
          placeholder="最大"
          :min="0"
          :precision="2"
          style="width: 100px"
        >
          <template #prefix>¥</template>
        </el-input>
      </el-form-item>
      
      <el-form-item label="日期">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始"
          end-placeholder="结束"
          value-format="YYYY-MM-DD"
          style="width: 240px"
        />
      </el-form-item>
      
      <el-form-item label="关键词">
        <el-input
          v-model="filterForm.keyword"
          placeholder="搜索备注"
          clearable
          style="width: 160px"
          @keyup.enter="handleSearch"
        />
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
        <el-button :icon="Refresh" @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
    
    <div v-if="isFilterActive" class="active-filters flex-between">
      <div class="filter-tags">
        <span class="filter-label">当前筛选：</span>
        <el-tag
          v-if="filterForm.type"
          size="small"
          closable
          @close="clearFilter('type')"
        >
          类型: {{ filterForm.type === 'expense' ? '支出' : 'income' }}
        </el-tag>
        <el-tag
          v-if="filterForm.categoryId"
          size="small"
          closable
          @close="clearFilter('categoryId')"
        >
          分类: {{ getCategoryName(filterForm.categoryId) }}
        </el-tag>
        <el-tag
          v-if="filterForm.accountId"
          size="small"
          closable
          @close="clearFilter('accountId')"
        >
          账户: {{ getAccountName(filterForm.accountId) }}
        </el-tag>
        <el-tag
          v-if="filterForm.minAmount !== undefined"
          size="small"
          closable
          @close="clearFilter('minAmount')"
        >
          最小金额: ¥{{ filterForm.minAmount }}
        </el-tag>
        <el-tag
          v-if="filterForm.maxAmount !== undefined"
          size="small"
          closable
          @close="clearFilter('maxAmount')"
        >
          最大金额: ¥{{ filterForm.maxAmount }}
        </el-tag>
        <el-tag
          v-if="dateRange"
          size="small"
          closable
          @close="clearDateRange"
        >
          日期: {{ dateRange[0] }} 至 {{ dateRange[1] }}
        </el-tag>
        <el-tag
          v-if="filterForm.keyword"
          size="small"
          closable
          @close="clearFilter('keyword')"
        >
          关键词: {{ filterForm.keyword }}
        </el-tag>
      </div>
      <el-button type="primary" link size="small" @click="handleReset">清除全部</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, reactive, computed } from 'vue'
import type { BillFilter, BillType, CategoryType } from '@/types'
import { CATEGORIES, ACCOUNTS } from '@/constants'
import { getCategoryName, getAccountName } from '@/utils'

const emit = defineEmits<{
  (e: 'change', filter: BillFilter): void
}>()

const dateRange = ref<[string, string] | null>(null)

const defaultFilter: BillFilter = {
  type: undefined,
  categoryId: undefined,
  accountId: undefined,
  minAmount: undefined,
  maxAmount: undefined,
  startDate: undefined,
  endDate: undefined,
  keyword: undefined,
}

const filterForm = reactive<BillFilter>({ ...defaultFilter })

const availableCategories = computed(() => {
  if (filterForm.type) {
    return CATEGORIES.filter(c => c.type === filterForm.type)
  }
  return CATEGORIES
})

const isFilterActive = computed(() => 
  filterForm.type !== undefined ||
  filterForm.categoryId !== undefined ||
  filterForm.accountId !== undefined ||
  filterForm.minAmount !== undefined ||
  filterForm.maxAmount !== undefined ||
  filterForm.keyword !== undefined ||
  dateRange.value !== null
)

watch(() => filterForm.type, () => {
  filterForm.categoryId = undefined
})

watch(dateRange, (val) => {
  if (val) {
    filterForm.startDate = val[0]
    filterForm.endDate = val[1]
  } else {
    filterForm.startDate = undefined
    filterForm.endDate = undefined
  }
})

function handleSearch(): void {
  if (
    filterForm.minAmount !== undefined &&
    filterForm.maxAmount !== undefined &&
    filterForm.minAmount > filterForm.maxAmount
  ) {
    const temp = filterForm.minAmount
    filterForm.minAmount = filterForm.maxAmount
    filterForm.maxAmount = temp
  }
  emit('change', { ...filterForm })
}

function handleReset(): void {
  Object.assign(filterForm, defaultFilter)
  dateRange.value = null
  emit('change', { ...filterForm })
}

function clearFilter(key: keyof BillFilter): void {
  if (key === 'minAmount' || key === 'maxAmount') {
    ;(filterForm as Record<string, number | undefined>)[key] = undefined
  } else {
    ;(filterForm as Record<string, string | undefined>)[key] = undefined
  }
  emit('change', { ...filterForm })
}

function clearDateRange(): void {
  dateRange.value = null
  filterForm.startDate = undefined
  filterForm.endDate = undefined
  emit('change', { ...filterForm })
}
</script>

<style scoped lang="scss">
.filter-panel {
  background: #fff;
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 16px;
  
  :deep(.el-form-item) {
    margin-bottom: 12px;
    margin-right: 24px;
    
    &:last-child {
      margin-right: 0;
    }
  }
  
  .active-filters {
    padding-top: 12px;
    border-top: 1px solid #ebeef5;
    margin-top: 4px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    
    .filter-tags {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      
      .filter-label {
        color: #606266;
        font-size: 13px;
      }
    }
  }
}

.amount-separator {
  margin: 0 8px;
  color: #909399;
}

@media screen and (max-width: $breakpoint-tablet) {
  .filter-panel {
    padding: 12px;
    
    :deep(.el-form-item) {
      margin-right: 12px;
    }
    
    :deep(.el-input),
    :deep(.el-select) {
      width: 100% !important;
    }
  }
}
</style>
