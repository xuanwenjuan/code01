<template>
  <div class="order-list-wrapper">
    <div class="order-filters">
      <div class="filter-left">
        <el-radio-group v-model="localStatus" size="small" @change="handleStatusChange">
          <el-radio-button value="all">全部订单</el-radio-button>
          <el-radio-button value="pending">待发货</el-radio-button>
          <el-radio-button value="shipping">配送中</el-radio-button>
          <el-radio-button value="completed">已完成</el-radio-button>
        </el-radio-group>
      </div>
      <div class="filter-right">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索订单号、图书名称"
          size="small"
          clearable
          style="width: 240px;"
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <el-table
      :data="paginatedOrders"
      style="width: 100%"
      v-loading="loading"
    >
      <el-table-column prop="orderNo" label="订单号" width="180" />
      <el-table-column label="采购图书" min-width="250">
        <template #default="{ row }">
          <div
            v-for="book in row.books"
            :key="book.id"
            class="order-book-item"
          >
            <span class="book-name">{{ book.name }}</span>
            <span class="book-qty">× {{ book.quantity }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="金额" width="130" align="right">
        <template #default="{ row }">
          <span class="order-price">¥{{ row.totalAmount.toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" effect="light">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="下单时间" width="180" />
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <el-button
            size="small"
            type="primary"
            link
            @click="handleViewDetail(row)"
          >
            查看详情
          </el-button>
          <el-button
            v-if="row.status === 'pending'"
            size="small"
            type="danger"
            link
            @click="handleCancel(row)"
          >
            取消订单
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper" v-if="filteredOrders.length > 0">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[5, 10, 20]"
        :total="filteredOrders.length"
        layout="total, sizes, prev, pager, next, jumper"
        background
      />
    </div>

    <EmptyState
      v-if="!loading && filteredOrders.length === 0"
      :icon="'Document'"
      :text="searchKeyword ? '未找到相关订单' : '暂无采购订单'"
      :show-action="!searchKeyword"
      action-text="去采购"
      @action="handleGoPurchase"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useOrderStore } from '@/stores/order'
import EmptyState from './EmptyState.vue'

const props = defineProps({
  status: {
    type: String,
    default: 'all'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:status', 'view-detail', 'cancel'])

const router = useRouter()
const orderStore = useOrderStore()

const localStatus = ref(props.status)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    shipping: 'primary',
    completed: 'success',
    cancelled: 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    pending: '待发货',
    shipping: '配送中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return texts[status] || status
}

const filteredOrders = computed(() => {
  let result = orderStore.orders

  if (localStatus.value !== 'all') {
    result = result.filter(o => o.status === localStatus.value)
  }

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(o => {
      const matchOrderNo = o.orderNo.toLowerCase().includes(keyword)
      const matchBook = o.books.some(b => b.name.toLowerCase().includes(keyword))
      return matchOrderNo || matchBook
    })
  }

  return result
})

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredOrders.value.slice(start, end)
})

const handleStatusChange = () => {
  emit('update:status', localStatus.value)
  currentPage.value = 1
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleViewDetail = (row) => {
  emit('view-detail', row)
}

const handleCancel = (row) => {
  ElMessageBox.confirm('确定要取消该订单吗？', '取消订单', {
    confirmButtonText: '确定取消',
    cancelButtonText: '再想想',
    type: 'warning'
  }).then(() => {
    row.status = 'cancelled'
    orderStore.saveOrders()
    emit('cancel', row)
    ElMessage.success('订单已取消')
  }).catch(() => {})
}

const handleGoPurchase = () => {
  router.push('/')
}

watch(() => props.status, (val) => {
  localStatus.value = val
})
</script>

<style scoped>
.order-list-wrapper {
  width: 100%;
}

.order-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.order-book-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 13px;
}

.book-name {
  color: #303133;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 12px;
}

.book-qty {
  color: #909399;
  flex-shrink: 0;
}

.order-price {
  color: #f56c6c;
  font-weight: 600;
  font-size: 15px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
