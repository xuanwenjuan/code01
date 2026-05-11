<template>
  <div class="cards-page">
    <el-card>
      <template #header>
        <div class="flex-between">
          <span>卡种管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增卡种
          </el-button>
        </div>
      </template>

      <el-table :data="cardStore.cards" v-loading="cardStore.loading" style="width: 100%">
        <el-table-column prop="name" label="卡种名称" width="150" />
        <el-table-column prop="type" label="卡种类型" width="120">
          <template #default="{ row }">
            {{ getCardTypeName(row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格(元)" width="120">
          <template #default="{ row }">
            ¥{{ row.price }}
          </template>
        </el-table-column>
        <el-table-column label="有效期/次数" width="150">
          <template #default="{ row }">
            {{ row.type === 'times' ? `${row.times}次` : `${row.duration}天` }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button
              v-if="row.status === 'active'"
              type="warning"
              link
              size="small"
              @click="handleToggleStatus(row)"
            >
              禁用
            </el-button>
            <el-button v-else type="success" link size="small" @click="handleToggleStatus(row)">
              启用
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper mt-10">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="cardStore.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑卡种' : '新增卡种'"
      width="500px"
      :close-on-click-modal="false"
      @close="handleClose"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="卡种名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入卡种名称" />
        </el-form-item>
        <el-form-item label="卡种类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择卡种类型" style="width: 100%" @change="handleTypeChange">
            <el-option label="月卡" value="month" />
            <el-option label="季卡" value="quarter" />
            <el-option label="年卡" value="year" />
            <el-option label="次卡" value="times" />
          </el-select>
        </el-form-item>
        <el-form-item label="价格(元)" prop="price">
          <el-input-number v-model="form.price" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item v-if="form.type === 'times'" label="次数" prop="times">
          <el-input-number v-model="form.times" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item v-else label="有效期(天)" prop="duration">
          <el-input-number v-model="form.duration" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="active">启用</el-radio>
            <el-radio value="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { Card, CardType } from '@/types'
import { useCardStore } from '@/stores/card'

const cardStore = useCardStore()

const currentPage = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const loading = ref(false)
const currentCard = ref<Card | null>(null)

const isEdit = computed(() => !!currentCard.value)

interface CardForm {
  name: string
  type: CardType
  price: number
  duration?: number
  times?: number
  status: 'active' | 'inactive'
  description: string
}

const form = reactive<CardForm>({
  name: '',
  type: 'month',
  price: 0,
  duration: 30,
  times: undefined,
  status: 'active',
  description: '',
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入卡种名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择卡种类型', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  duration: [{ required: true, message: '请输入有效期', trigger: 'blur' }],
  times: [{ required: true, message: '请输入次数', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

function getCardTypeName(type: CardType): string {
  const map: Record<CardType, string> = {
    month: '月卡',
    quarter: '季卡',
    year: '年卡',
    times: '次卡',
  }
  return map[type]
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

async function loadData() {
  await cardStore.fetchCards(currentPage.value, pageSize.value)
}

function handleSizeChange(val: number) {
  pageSize.value = val
  loadData()
}

function handleCurrentChange(val: number) {
  currentPage.value = val
  loadData()
}

function resetForm() {
  Object.assign(form, {
    name: '',
    type: 'month',
    price: 0,
    duration: 30,
    times: undefined,
    status: 'active',
    description: '',
  })
}

function handleAdd() {
  currentCard.value = null
  resetForm()
  dialogVisible.value = true
}

function handleEdit(row: Card) {
  currentCard.value = row
  Object.assign(form, {
    name: row.name,
    type: row.type,
    price: row.price,
    duration: row.duration,
    times: row.times,
    status: row.status,
    description: row.description,
  })
  dialogVisible.value = true
}

function handleTypeChange(type: CardType) {
  if (type === 'times') {
    form.duration = undefined
    form.times = 10
  } else {
    form.times = undefined
    const durationMap: Record<string, number> = {
      month: 30,
      quarter: 90,
      year: 365,
    }
    form.duration = durationMap[type] || 30
  }
}

function handleToggleStatus(row: Card) {
  const newStatus = row.status === 'active' ? 'inactive' : 'active'
  const action = newStatus === 'active' ? '启用' : '禁用'
  ElMessageBox.confirm(`确定要${action}卡种 "${row.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    await cardStore.toggleCardStatus(row.id, newStatus, row.name)
    ElMessage.success(`${action}成功`)
  }).catch(() => {})
}

function handleDelete(row: Card) {
  ElMessageBox.confirm(`确定要删除卡种 "${row.name}" 吗？此操作不可恢复。`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error',
  }).then(async () => {
    await cardStore.deleteCard(row.id, row.name)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

function handleClose() {
  formRef.value?.resetFields()
  dialogVisible.value = false
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const submitData: Omit<Card, 'id' | 'createTime'> = { ...form }
        if (currentCard.value) {
          await cardStore.updateCard(currentCard.value.id, submitData)
          ElMessage.success('更新成功')
        } else {
          await cardStore.createCard(submitData)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
      } finally {
        loading.value = false
      }
    }
  })
}

onMounted(() => {
  loadData()
})

watch([currentPage, pageSize], () => {
  loadData()
})
</script>

<style scoped>
.cards-page {
  min-height: 100%;
}

.mt-10 {
  margin-top: 10px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
}
</style>
