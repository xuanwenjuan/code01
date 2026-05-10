<template>
  <div class="departments-page">
    <div class="page-header">
      <div class="page-title">科室管理</div>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增科室
      </el-button>
    </div>

    <el-table
      :data="systemStore.departments"
      v-loading="systemStore.isLoading"
      border
      stripe
      style="width: 100%"
    >
      <el-table-column prop="name" label="科室名称" min-width="120" />
      <el-table-column prop="description" label="科室描述" min-width="200" show-overflow-tooltip />
      <el-table-column prop="location" label="位置" width="150" />
      <el-table-column prop="phone" label="联系电话" width="150" />
      <el-table-column label="医生数" width="100" align="center">
        <template #default="{ row }">
          <el-tag type="primary" size="small">{{ getDoctorCount(row.id) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
            {{ row.status === 'active' ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button
            type="danger"
            link
            size="small"
            :disabled="getDoctorCount(row.id) > 0"
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <DepartmentDialog
      v-model:visible="dialogVisible"
      :title="dialogTitle"
      :department="currentDepartment"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { Department } from '@/types'
import { useSystemStore } from '@/stores/system'
import DepartmentDialog from '@/components/DepartmentDialog.vue'

const systemStore = useSystemStore()

const dialogVisible = ref(false)
const isEdit = ref(false)
const currentDepartment = ref<Department | null>(null)

const dialogTitle = computed(() => isEdit.value ? '编辑科室' : '新增科室')

function getDoctorCount(deptId: string): number {
  return systemStore.doctors.filter(d => d.departmentId === deptId).length
}

function handleAdd() {
  isEdit.value = false
  currentDepartment.value = null
  dialogVisible.value = true
}

function handleEdit(row: Department) {
  isEdit.value = true
  currentDepartment.value = row
  dialogVisible.value = true
}

async function handleDelete(row: Department) {
  try {
    await ElMessageBox.confirm(
      `确定要删除科室「${row.name}」吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await systemStore.deleteDepartment(row.id)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

async function handleSubmit(data: Partial<Department>) {
  try {
    if (isEdit.value && currentDepartment.value) {
      await systemStore.updateDepartment(currentDepartment.value.id, data)
      ElMessage.success('更新成功')
    } else {
      await systemStore.createDepartment(data)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
  } catch (error) {
    ElMessage.error('操作失败')
  }
}
</script>

<style scoped lang="scss">
.departments-page {
  padding: 20px;
}
</style>
