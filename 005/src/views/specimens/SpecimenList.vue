<template>
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">标本信息管理</h2>
      <button class="btn btn-primary" @click="openAddModal">
        <span>+</span> 新增标本
      </button>
    </div>

    <SpecimenFilter />

    <div v-if="specimenStore.loading" class="loading">
      <div class="spinner"></div>
    </div>

    <EmptyState
      v-else-if="specimenStore.filteredSpecimens.length === 0"
      message="暂无标本数据"
    />

    <div v-else class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>编号</th>
            <th>标本名称</th>
            <th>科属分类</th>
            <th>采集产地</th>
            <th>采集年限</th>
            <th>年限状态</th>
            <th>库存</th>
            <th>柜位</th>
            <th>珍稀等级</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="specimen in specimenStore.filteredSpecimens" :key="specimen.id">
            <td style="font-family: monospace; font-size: 12px;">{{ specimen.code }}</td>
            <td style="font-weight: 600;">{{ specimen.name }}</td>
            <td>
              <span class="badge badge-primary">
                {{ categoryStore.getCategoryName(specimen.categoryId) }}
              </span>
            </td>
            <td>{{ specimen.origin || '-' }}</td>
            <td>
              <div>{{ specimen.collectYear }}</div>
              <div style="font-size: 11px; color: #666;">
                已保存 {{ calculateSpecimenAge(specimen.collectYear) }} 年
                (有效期 {{ getWarrantyYears(categoryStore.getCategoryName(specimen.categoryId)) }} 年)
              </div>
            </td>
            <td>
              <span :class="['badge', getAgeStatusColor(getAgeStatus(specimen))]">
                {{ getAgeStatusLabel(getAgeStatus(specimen)) }}
              </span>
            </td>
            <td>{{ specimen.stock }}</td>
            <td>{{ specimen.storage || '-' }}</td>
            <td>
              <span :class="['badge', getRareLevelColor(specimen.rareLevel)]">
                {{ getRareLevelLabel(specimen.rareLevel) }}
              </span>
            </td>
            <td>
              <span :class="['badge', getSpecimenStatusColor(specimen.status)]">
                {{ getSpecimenStatusLabel(specimen.status) }}
              </span>
            </td>
            <td>
              <div class="flex gap-2" style="flex-wrap: wrap;">
                <button class="btn btn-secondary btn-sm" @click="openEditModal(specimen)">
                  编辑
                </button>
                <button
                  class="btn btn-danger btn-sm"
                  @click="handleDelete(specimen)"
                >
                  删除
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-4" style="color: #666; font-size: 13px;">
      共 {{ specimenStore.filteredSpecimens.length }} 条记录
      <span v-if="specimenStore.filteredSpecimens.length !== specimenStore.specimens.length">
        (全部 {{ specimenStore.specimens.length }} 条)
      </span>
    </div>

    <Teleport to="body">
      <div v-if="modalVisible" class="modal-overlay" @click.self="closeModal">
        <div class="modal modal-lg">
          <div class="modal-header">
            <h3 class="modal-title">{{ isEdit ? '编辑标本' : '新增标本' }}</h3>
            <button class="modal-close" @click="closeModal">&times;</button>
          </div>
          <div class="modal-body">
            <SpecimenForm
              ref="formRef"
              :specimen="currentSpecimen"
              @validate="onValidate"
            />
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeModal">取消</button>
            <button class="btn btn-primary" @click="handleSubmit">
              {{ isEdit ? '保存' : '添加' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSpecimenStore } from '../../stores/specimen'
import { useCategoryStore } from '../../stores/category'
import { useAppStore } from '../../stores/app'
import { useLogStore } from '../../stores/log'
import { useBorrowStore } from '../../stores/borrow'
import {
  getRareLevelLabel,
  getRareLevelColor,
  getSpecimenStatusLabel,
  getSpecimenStatusColor,
  getAgeStatusLabel,
  getAgeStatusColor,
  calculateSpecimenAge,
  getWarrantyYears,
  getRemainingWarrantyYears
} from '../../utils/helpers'
import SpecimenForm from './SpecimenForm.vue'
import SpecimenFilter from './SpecimenFilter.vue'
import EmptyState from '../../components/EmptyState.vue'

const specimenStore = useSpecimenStore()
const categoryStore = useCategoryStore()
const appStore = useAppStore()
const logStore = useLogStore()
const borrowStore = useBorrowStore()

const modalVisible = ref(false)
const isEdit = ref(false)
const currentSpecimen = ref(null)
const formRef = ref(null)
const isFormValid = ref(true)

const getAgeStatus = (specimen) => {
  const categoryName = categoryStore.getCategoryName(specimen.categoryId)
  const age = calculateSpecimenAge(specimen.collectYear)
  const warranty = getWarrantyYears(categoryName)
  
  if (age >= warranty) {
    return 'expired'
  } else if (age >= warranty - 1) {
    return 'warning'
  }
  return 'normal'
}

const openAddModal = () => {
  if (categoryStore.categories.length === 0) {
    appStore.warning('请先添加药材分类')
    return
  }
  isEdit.value = false
  currentSpecimen.value = null
  modalVisible.value = true
}

const openEditModal = (specimen) => {
  isEdit.value = true
  currentSpecimen.value = { ...specimen }
  modalVisible.value = true
}

const closeModal = () => {
  modalVisible.value = false
  currentSpecimen.value = null
  isFormValid.value = true
}

const onValidate = (valid) => {
  isFormValid.value = valid
}

const handleSubmit = async () => {
  if (!formRef.value.validate()) return

  const formData = formRef.value.getFormData()

  try {
    if (isEdit.value) {
      await specimenStore.updateSpecimen({
        id: currentSpecimen.value.id,
        code: currentSpecimen.value.code,
        createdAt: currentSpecimen.value.createdAt,
        ...formData
      })
      appStore.success('标本更新成功')
      await logStore.logOperation('specimen_update', `更新了标本: ${formData.name}`, {
        specimenName: formData.name,
        specimenId: currentSpecimen.value.id
      })
    } else {
      const id = await specimenStore.addSpecimen(formData)
      appStore.success('标本添加成功')
      await logStore.logOperation('specimen_add', `新增了标本: ${formData.name}`, {
        specimenName: formData.name,
        specimenId: id
      })
    }
    closeModal()
  } catch (error) {
    console.error('操作失败:', error)
    appStore.error('操作失败，请重试')
  }
}

const handleDelete = (specimen) => {
  const activeBorrows = borrowStore.getActiveBorrowsBySpecimen(specimen.id)
  if (activeBorrows.length > 0) {
    appStore.error('该标本存在未归还的借阅记录，无法删除')
    return
  }

  appStore.showConfirm(
    '确认删除',
    `确定要删除标本"${specimen.name}"吗？此操作不可恢复。`,
    async () => {
      await specimenStore.deleteSpecimen(specimen.id)
      appStore.success('标本删除成功')
      await logStore.logOperation('specimen_delete', `删除了标本: ${specimen.name}`, {
        specimenName: specimen.name,
        specimenId: specimen.id
      })
    }
  )
}
</script>