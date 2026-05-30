<template>
  <div class="footprints-page">
    <div class="page-header">
      <h2 class="page-title">浏览足迹</h2>
      <el-button
        v-if="footprints.length > 0"
        type="danger"
        text
        @click="handleClearAll"
      >
        清空足迹
      </el-button>
    </div>

    <div v-if="loading" class="loading-wrapper">
      <el-skeleton v-for="i in 8" :key="i" :rows="4" animated />
    </div>

    <template v-else>
      <div v-if="footprints.length > 0" class="footprints-grid">
        <div
          v-for="item in footprints"
          :key="item.id"
          class="footprint-card"
          @click="goToDetail(item.flowerId)"
        >
          <div class="card-image">
            <img :src="item.image" :alt="item.name" />
          </div>
          <div class="card-body">
            <h3 class="card-title">{{ item.name }}</h3>
            <div class="card-price">{{ formatPrice(item.price) }}</div>
            <div class="card-time">{{ item.createTime }}</div>
          </div>
        </div>
      </div>

      <EmptyState v-else icon="👣" text="暂无浏览足迹">
        <template #action>
          <el-button type="primary" @click="goShopping">去逛逛</el-button>
        </template>
      </EmptyState>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import EmptyState from '@/components/EmptyState.vue'
import { formatPrice } from '@/utils'
import { useUserStore } from '@/stores/user'
import { getFootprints, clearFootprints } from '@/api/order'

const router = useRouter()
const userStore = useUserStore()

const footprints = ref([])
const loading = ref(false)

const loadFootprints = async () => {
  loading.value = true
  try {
    const userId = userStore.userInfo?.id
    if (userId) {
      const res = await getFootprints(userId)
      footprints.value = res.data
    }
  } finally {
    loading.value = false
  }
}

const handleClearAll = async () => {
  ElMessageBox.confirm('确定要清空浏览足迹吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await clearFootprints()
    ElMessage.success('足迹已清空')
    loadFootprints()
  }).catch(() => {})
}

const goToDetail = (flowerId) => {
  router.push(`/detail/${flowerId}`)
}

const goShopping = () => {
  router.push('/list')
}

onMounted(() => {
  loadFootprints()
})
</script>

<style lang="scss" scoped>
.footprints-page {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    
    .page-title {
      font-size: 20px;
      font-weight: 500;
      color: $text-primary;
      margin: 0;
    }
  }
  
  .loading-wrapper {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }
  
  .footprints-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
    
    .footprint-card {
      background: #fff;
      border: 1px solid $border-color;
      border-radius: $radius;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        transform: translateY(-4px);
      }
      
      .card-image {
        width: 100%;
        padding-top: 100%;
        position: relative;
        
        img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      
      .card-body {
        padding: 16px;
        
        .card-title {
          font-size: 14px;
          font-weight: 500;
          color: $text-primary;
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .card-price {
          font-size: 18px;
          font-weight: bold;
          color: $primary-color;
          margin-bottom: 8px;
        }
        
        .card-time {
          font-size: 12px;
          color: $text-light;
        }
      }
    }
  }
}

@media (max-width: 1024px) {
  .footprints-page {
    .loading-wrapper,
    .footprints-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
}

@media (max-width: 768px) {
  .footprints-page {
    .loading-wrapper,
    .footprints-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}
</style>
