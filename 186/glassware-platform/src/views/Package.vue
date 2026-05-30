<template>
  <div class="package-page">
    <div class="container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>批量采购套餐</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="page-header">
        <h1 class="page-title">批量采购套餐</h1>
        <p class="page-desc">精选实验套装，一站式采购更划算</p>
      </div>

      <div class="package-list">
        <div
          v-for="pkg in productStore.packageList"
          :key="pkg.id"
          class="package-card card"
        >
          <div class="package-image">
            <el-icon size="80" color="#409eff"><Goods /></el-icon>
            <div class="package-badge">
              <span>省¥{{ pkg.originalPrice - pkg.price }}</span>
            </div>
          </div>
          <div class="package-content">
            <div class="package-header">
              <h2 class="package-name">{{ pkg.name }}</h2>
              <div class="package-sales">已售 {{ pkg.sales }} 套</div>
            </div>
            <p class="package-desc">{{ pkg.description }}</p>
            <div class="package-items">
              <h4 class="items-title">套餐包含（共{{ pkg.totalItems }}件）：</h4>
              <div class="items-list">
                <div v-for="(item, index) in pkg.items" :key="index" class="item">
                  <span class="item-name">{{ getProductName(item.productId) }}</span>
                  <span class="item-spec">{{ item.spec }} × {{ item.quantity }}</span>
                </div>
              </div>
            </div>
            <div class="package-footer">
              <div class="package-price">
                <span class="current-price">{{ pkg.price }}</span>
                <span class="original-price">¥{{ pkg.originalPrice }}</span>
              </div>
              <el-button type="primary" size="large" @click="buyPackage(pkg)">
                立即采购
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useProductStore } from '@/stores/product'
import { useOrderStore } from '@/stores/order'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const productStore = useProductStore()
const orderStore = useOrderStore()
const userStore = useUserStore()
const router = useRouter()

const getProductName = (productId) => {
  const product = productStore.getProductById(productId)
  return product ? product.name : '未知商品'
}

const buyPackage = (pkg) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  const items = pkg.items.map(item => ({
    productId: item.productId,
    name: getProductName(item.productId),
    spec: item.spec,
    quantity: item.quantity,
    price: productStore.getProductById(item.productId)?.price || 0,
    image: productStore.getProductById(item.productId)?.image || ''
  }))

  orderStore.createOrder(items, pkg.price)
  ElMessage.success('采购成功！')
  router.push('/orders')
}
</script>

<style lang="scss" scoped>
.package-page {
  .breadcrumb {
    margin-bottom: 20px;
  }

  .page-header {
    text-align: center;
    padding: 40px 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    margin-bottom: 30px;
    color: #fff;

    .page-title {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 10px;
    }

    .page-desc {
      font-size: 16px;
      opacity: 0.9;
    }
  }

  .package-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .package-card {
    display: flex;
    overflow: hidden;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-5px);
    }

    .package-image {
      width: 240px;
      background: linear-gradient(135deg, #ecf5ff 0%, #d9ecff 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      flex-shrink: 0;

      .package-badge {
        position: absolute;
        top: 15px;
        left: 15px;
        background: #f56c6c;
        color: #fff;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
      }
    }

    .package-content {
      flex: 1;
      padding: 25px 30px;
      display: flex;
      flex-direction: column;
      gap: 15px;

      .package-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .package-name {
          font-size: 20px;
          font-weight: 600;
          color: #303133;
        }

        .package-sales {
          color: #909399;
          font-size: 14px;
        }
      }

      .package-desc {
        color: #606266;
        font-size: 14px;
      }

      .package-items {
        .items-title {
          font-size: 14px;
          font-weight: 500;
          color: #303133;
          margin-bottom: 10px;
        }

        .items-list {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;

          .item {
            display: flex;
            justify-content: space-between;
            padding: 8px 12px;
            background: #f5f7fa;
            border-radius: 4px;
            font-size: 13px;

            .item-name {
              color: #606266;
            }

            .item-spec {
              color: #909399;
            }
          }
        }
      }

      .package-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: auto;
        padding-top: 15px;
        border-top: 1px solid #ebeef5;

        .package-price {
          display: flex;
          align-items: baseline;
          gap: 10px;

          .current-price {
            font-size: 28px;
            font-weight: 700;
            color: #f56c6c;

            &::before {
              content: '¥';
              font-size: 16px;
            }
          }

          .original-price {
            font-size: 14px;
            color: #909399;
            text-decoration: line-through;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .package-page {
    .package-card {
      flex-direction: column;

      .package-image {
        width: 100%;
        height: 200px;
      }

      .package-content {
        .package-items {
          .items-list {
            grid-template-columns: 1fr;
          }
        }
      }
    }
  }
}
</style>
