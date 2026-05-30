<template>
  <div class="packages-page">
    <div class="container">
      <el-breadcrumb class="breadcrumb" separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>成套工具</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="page-header">
        <h1>木雕成套工具采购套餐</h1>
        <p>一站式采购，性价比更高，满足不同阶段木雕需求</p>
      </div>

      <div v-loading="loading" class="packages-grid">
        <div v-for="pkg in packageList" :key="pkg.id" class="package-card-large card">
          <div class="card-header">
            <img :src="pkg.image" :alt="pkg.name" class="package-image" />
            <div class="package-badge" v-if="pkg.sales > 2000">热门推荐</div>
          </div>
          <div class="card-body">
            <h3 class="package-name">{{ pkg.name }}</h3>
            <p class="package-desc">{{ pkg.description }}</p>

            <div class="package-tools">
              <h4>包含工具：</h4>
              <div class="tools-list">
                <el-tag
                  v-for="toolId in pkg.tools"
                  :key="toolId"
                  type="info"
                  size="small"
                  style="margin-right: 8px; margin-bottom: 8px"
                >
                  {{ getToolName(toolId) }}
                </el-tag>
              </div>
            </div>

            <div class="package-bonus">
              <el-icon><Present /></el-icon>
              <span>{{ pkg.bonus }}</span>
            </div>

            <div class="package-footer">
              <div class="price-box">
                <span class="price">¥{{ pkg.price }}</span>
                <span class="original-price">¥{{ pkg.originalPrice }}</span>
                <span class="save">立省¥{{ pkg.originalPrice - pkg.price }}</span>
              </div>
              <el-button type="primary" size="large" @click="handleBuy(pkg)">
                立即选购
              </el-button>
            </div>

            <div class="package-sales">
              已售 {{ pkg.sales }} 套
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Present } from '@element-plus/icons-vue'
import { useToolStore } from '@/stores/tool'
import { useUserStore } from '@/stores/user'
import { useOrderStore } from '@/stores/order'

const router = useRouter()
const toolStore = useToolStore()
const userStore = useUserStore()
const orderStore = useOrderStore()

const loading = ref(false)
const packageList = computed(() => toolStore.packageList)

const getToolName = (toolId) => {
  const tool = toolStore.getToolById(toolId)
  return tool ? tool.name : '未知工具'
}

const handleBuy = (pkg) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  if (!userStore.isBuyer) {
    ElMessage.warning('只有采购方可以下单')
    return
  }
  const items = pkg.tools.map(toolId => {
    const tool = toolStore.getToolById(toolId)
    return {
      toolId,
      toolName: tool?.name || '未知工具',
      price: tool?.price || 0,
      quantity: 1
    }
  })
  const order = orderStore.createOrder(items, userStore.userInfo.name, '综合供应商')
  ElMessage.success(`采购成功！订单号：${order.id}`)
  router.push('/orders')
}
</script>

<style lang="scss" scoped>
.packages-page {
  padding: 40px 0;
}

.breadcrumb {
  margin-bottom: 24px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;

  h1 {
    font-size: 32px;
    margin-bottom: 12px;
    color: #333;
  }

  p {
    font-size: 16px;
    color: #666;
  }
}

.packages-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.package-card-large {
  overflow: hidden;

  .card-header {
    position: relative;
    height: 240px;

    .package-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .package-badge {
      position: absolute;
      top: 16px;
      right: 16px;
      background: linear-gradient(135deg, #f56c6c, #e6a23c);
      color: #fff;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
    }
  }

  .card-body {
    padding: 24px;

    .package-name {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #333;
    }

    .package-desc {
      font-size: 14px;
      color: #666;
      margin-bottom: 16px;
    }

    .package-tools {
      margin-bottom: 16px;

      h4 {
        font-size: 14px;
        margin-bottom: 8px;
        color: #333;
      }

      .tools-list {
        display: flex;
        flex-wrap: wrap;
      }
    }

    .package-bonus {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #fdf6ec;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
      color: #e6a23c;
    }

    .package-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .price-box {
        display: flex;
        align-items: baseline;
        gap: 12px;

        .price {
          font-size: 28px;
          font-weight: 700;
          color: #f56c6c;
        }

        .original-price {
          font-size: 14px;
          color: #999;
          text-decoration: line-through;
        }

        .save {
          padding: 2px 8px;
          background: #f56c6c;
          color: #fff;
          border-radius: 4px;
          font-size: 12px;
        }
      }
    }

    .package-sales {
      text-align: right;
      font-size: 12px;
      color: #999;
    }
  }
}
</style>
