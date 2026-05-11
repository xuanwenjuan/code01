<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Club, ClubCategory } from '@/types'
import { clubCategoryLabels, OperationType } from '@/types'
import { useClubStore } from '@/stores/club'
import { useOperationLogStore } from '@/stores/operationLog'
import ClubDialog from '@/components/ClubDialog.vue'

const clubStore = useClubStore()
const operationLogStore = useOperationLogStore()

const dialogVisible = ref(false)
const editingClub = ref<Club | null>(null)
const searchKeyword = ref('')
const filterCategory = ref<ClubCategory | ''>('')
const currentPage = ref(1)
const pageSize = ref(10)

const filteredClubs = computed(() => {
  return clubStore.clubList.filter((club) => {
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      const name = club.name.toLowerCase()
      const description = club.description.toLowerCase()
      const manager = club.managerName.toLowerCase()
      if (!name.includes(keyword) && !description.includes(keyword) && !manager.includes(keyword)) {
        return false
      }
    }
    if (filterCategory.value && club.category !== filterCategory.value) {
      return false
    }
    return true
  })
})

const paginatedClubs = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredClubs.value.slice(start, end)
})

const categoryOptions = Object.entries(clubCategoryLabels).map(([value, label]) => ({
  value,
  label
}))

function handleCreate(): void {
  editingClub.value = null
  dialogVisible.value = true
}

function handleEdit(club: Club): void {
  editingClub.value = { ...club }
  dialogVisible.value = true
}

function handleDelete(club: Club): void {
  ElMessageBox.confirm(`确定要删除社团"${club.name}"吗？此操作不可恢复`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      clubStore.deleteClub(club.id)
      operationLogStore.recordOperation(
        OperationType.DELETE_CLUB,
        club.id,
        club.name,
        `删除了社团：${club.name}`
      )
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}

function handleSubmit(club: Club): void {
  if (editingClub.value) {
    clubStore.updateClub(club.id, club)
    operationLogStore.recordOperation(
      OperationType.UPDATE_CLUB,
      club.id,
      club.name,
      `更新了社团信息：${club.name}`
    )
  } else {
    clubStore.addClub(club)
    operationLogStore.recordOperation(
      OperationType.CREATE_CLUB,
      club.id,
      club.name,
      `创建了社团：${club.name}`
    )
  }
}

function handleReset(): void {
  searchKeyword.value = ''
  filterCategory.value = ''
}

function getCategoryTagType(category: ClubCategory): string {
  const typeMap: Record<ClubCategory, string> = {
    literature: 'primary',
    basketball: 'success',
    programming: 'warning',
    music: 'danger',
    art: 'info',
    science: 'primary',
    other: 'info'
  }
  return typeMap[category] || 'info'
}
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">社团管理</h1>
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        新建社团
      </el-button>
    </div>

    <div class="filter-section">
      <div class="filter-row">
        <div class="filter-item">
          <span class="filter-label">关键词：</span>
          <el-input
            v-model="searchKeyword"
            placeholder="搜索社团名称/描述/负责人"
            clearable
            style="width: 250px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="filter-item">
          <span class="filter-label">社团类别：</span>
          <el-select v-model="filterCategory" placeholder="全部类别" clearable style="width: 150px">
            <el-option
              v-for="option in categoryOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </div>
        <div class="filter-item">
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </div>
      </div>
    </div>

    <div class="table-container">
      <el-table :data="paginatedClubs" stripe border :empty-text="'暂无数据'" v-loading="false">
        <el-table-column prop="name" label="社团名称" width="200">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <el-icon :size="18" color="#409eff">
                <OfficeBuilding />
              </el-icon>
              <span class="font-medium">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="社团类别" width="120">
          <template #default="{ row }">
            <el-tag :type="getCategoryTagType(row.category)">
              {{ clubCategoryLabels[row.category] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="managerName" label="负责人" width="100" />
        <el-table-column prop="memberCount" label="成员数量" width="100" align="center">
          <template #default="{ row }">
            <span class="text-lg font-semibold">{{ row.memberCount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="社团描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="创建时间" width="120" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="filteredClubs.length"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </div>

    <ClubDialog
      v-model:visible="dialogVisible"
      :club="editingClub"
      @submit="handleSubmit"
    />
  </div>
</template>
