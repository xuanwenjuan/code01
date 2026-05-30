<template>
  <div class="page-container contacts-page">
    <PageHeader title="员工通讯录">
      <template #subtitle>
        <el-tag type="primary" effect="plain">共 {{ filteredList.length }} 位员工</el-tag>
      </template>
    </PageHeader>

    <div class="content-wrapper">
      <BaseCard class="sidebar" :hover="false">
        <template #header>
          <div class="sidebar-title">
            <el-icon :size="18" color="#409EFF"><OfficeBuilding /></el-icon>
            <span>部门架构</span>
          </div>
        </template>
        <el-tree
          :data="departmentList"
          :props="{ label: 'name', children: 'children' }"
          node-key="id"
          default-expand-all
          :expand-on-click-node="false"
          highlight-current
          @node-click="handleDeptClick"
        >
          <template #default="{ data }">
            <span class="tree-node">
              <el-icon :size="16">
                <component :is="data.children ? 'FolderOpened' : 'User'" />
              </el-icon>
              <span class="node-label">{{ data.name }}</span>
            </span>
          </template>
        </el-tree>
      </BaseCard>

      <BaseCard class="main-content" :hover="false">
        <div class="toolbar">
          <el-input
            v-model="keyword"
            placeholder="搜索姓名、电话、邮箱、职位..."
            :prefix-icon="Search"
            clearable
            style="width: 320px"
          />
          <el-button type="primary" @click="handleRefresh">
            <el-icon><Refresh /></el-icon>刷新
          </el-button>
        </div>

        <el-empty v-if="filteredList.length === 0" description="暂无匹配的员工信息">
          <el-button type="primary" @click="clearFilters">清除筛选</el-button>
        </el-empty>

        <div v-else class="employee-grid">
          <div
            v-for="employee in filteredList"
            :key="employee.id"
            class="employee-card"
            @click="viewDetail(employee)"
          >
            <el-avatar :size="64" :src="employee.avatar" />
            <div class="employee-info">
              <h4>{{ employee.name }}</h4>
              <p class="position">{{ employee.position }}</p>
              <p class="dept">
                <el-icon :size="12"><OfficeBuilding /></el-icon>
                {{ employee.department }}
              </p>
              <p class="phone">
                <el-icon :size="12"><Phone /></el-icon>
                {{ employee.phone }}
              </p>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>

    <el-dialog v-model="detailVisible" title="员工详情" width="500px" destroy-on-close>
      <div v-if="currentEmployee" class="employee-detail">
        <div class="detail-header">
          <el-avatar :size="80" :src="currentEmployee.avatar" />
          <div class="detail-basic">
            <h3>{{ currentEmployee.name }}</h3>
            <el-tag size="small" type="primary" effect="plain">{{ currentEmployee.position }}</el-tag>
            <p class="dept">
              <el-icon><OfficeBuilding /></el-icon>
              {{ currentEmployee.department }}
            </p>
          </div>
        </div>

        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="手机号">{{ currentEmployee.phone }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ currentEmployee.email }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ currentEmployee.gender }}</el-descriptions-item>
          <el-descriptions-item label="出生日期">{{ currentEmployee.birthday }}</el-descriptions-item>
          <el-descriptions-item label="入职日期">{{ currentEmployee.entryDate }}</el-descriptions-item>
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
import { Search, Refresh, OfficeBuilding, Phone, User, FolderOpened } from '@element-plus/icons-vue'
import { useDataStore } from '@/stores/data'
import BaseCard from '@/components/BaseCard.vue'
import PageHeader from '@/components/PageHeader.vue'

const store = useDataStore()

const keyword = ref('')
const deptId = ref(null)
const detailVisible = ref(false)
const currentEmployee = ref(null)

const departmentList = computed(() => store.departmentList)

const filteredList = computed(() => {
  let list = store.employeeList
  
  if (deptId.value) {
    list = store.getEmployeesByDept(deptId.value)
  }
  
  if (keyword.value) {
    list = store.searchEmployees(keyword.value)
  }
  
  return list
})

const handleDeptClick = (data) => {
  deptId.value = data.id
}

const viewDetail = (employee) => {
  currentEmployee.value = employee
  detailVisible.value = true
}

const clearFilters = () => {
  keyword.value = ''
  deptId.value = null
}

const handleRefresh = () => {
  keyword.value = ''
  deptId.value = null
}
</script>

<style scoped lang="scss">
.contacts-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-wrapper {
  display: flex;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

.sidebar {
  width: 260px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  
  :deep(.card-body) {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 15px;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.employee-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  flex: 1;
  overflow-y: auto;
}

.employee-card {
  display: flex;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-medium);
    transform: translateY(-2px);
  }
  
  .employee-info {
    flex: 1;
    min-width: 0;
    
    h4 {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 8px;
    }
    
    p {
      margin: 0 0 4px;
      font-size: 13px;
      color: var(--text-regular);
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .position {
      color: var(--color-primary);
    }
  }
}

.employee-detail {
  .detail-header {
    display: flex;
    gap: 20px;
    align-items: center;
    margin-bottom: 20px;
    
    .detail-basic {
      h3 {
        font-size: 20px;
        margin: 0 0 8px;
      }
      
      p {
        margin: 8px 0 0;
        font-size: 14px;
        color: var(--text-regular);
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }
}
</style>
