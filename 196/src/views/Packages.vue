<template>
  <div class="packages-page">
    <div class="container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item @click="$router.push('/')">首页</el-breadcrumb-item>
        <el-breadcrumb-item>采购套餐</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="page-header">
        <h1>养蜂成套设备采购套餐</h1>
        <p>为不同规模养蜂场量身定制，一站式购齐，省心更省钱</p>
      </div>

      <div class="package-grid">
        <div
          v-for="pkg in productStore.packages"
          :key="pkg.id"
          class="package-card card-hover"
        >
          <div class="package-badge">
            <el-tag type="danger" effect="dark">省{{ pkg.originalPrice - pkg.price }}元</el-tag>
          </div>
          <h2 class="package-name">{{ pkg.name }}</h2>
          <p class="package-desc">{{ pkg.description }}</p>

          <div class="package-items">
            <h4>套餐包含</h4>
            <ul>
              <li v-for="item in pkg.items" :key="item.productId">
                <span>{{ item.name }}</span>
                <span class="qty">×{{ item.quantity }}</span>
              </li>
            </ul>
          </div>

          <div class="package-suitable">
            <el-icon><UserFilled /></el-icon>
            适合：{{ pkg.suitableFor }}
          </div>

          <div class="package-footer">
            <div class="price-info">
              <span class="price">¥{{ pkg.price }}</span>
              <span class="original-price">¥{{ pkg.originalPrice }}</span>
            </div>
            <div class="package-stats">
              <span>已售{{ pkg.sales }}套</span>
              <span>好评{{ pkg.rating }}分</span>
            </div>
            <el-button type="primary" size="large" block @click="buyPackage(pkg)">
              立即购买
            </el-button>
          </div>
        </div>
      </div>

      <div class="package-tips">
        <el-card>
          <template #header>
            <span>
              <el-icon><InfoFilled /></el-icon>
              温馨提示
            </span>
          </template>
          <ul>
            <li>套餐商品可享受组合优惠，不与其他优惠叠加</li>
            <li>套餐内商品如需单独更换，请联系客服</li>
            <li>所有套餐商品均享受免费配送服务</li>
            <li>套餐商品质保期与单独购买商品一致</li>
          </ul>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useProductStore, useUserStore, useOrderStore } from '@/stores'
import { ElMessage } from 'element-plus'

const router = useRouter()
const productStore = useProductStore()
const userStore = useUserStore()
const orderStore = useOrderStore()

function buyPackage(pkg) {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  const order = {
    userId: userStore.currentUser.id,
    items: pkg.items.map(item => ({
      ...item,
      image: ''
    })),
    totalAmount: pkg.price,
    address: userStore.currentUser.address,
    receiver: userStore.currentUser.name,
    phone: userStore.currentUser.phone
  }

  orderStore.createOrder(order)
  ElMessage.success('下单成功！')
  router.push('/orders')
}
</script>

<style lang="scss" scoped>
.packages-page {
  padding: 20px 0;

  .breadcrumb {
    margin-bottom: 20px;
  }

  .page-header {
    text-align: center;
    padding: 40px 0;
    background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
    border-radius: 12px;
    margin-bottom: 32px;

    h1 {
      font-size: 32px;
      margin-bottom: 8px;
      color: var(--text-primary);
    }

    p {
      color: var(--text-secondary);
      font-size: 16px;
    }
  }

  .package-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
    margin-bottom: 32px;

    .package-card {
      background: #fff;
      border-radius: 12px;
      padding: 32px;
      position: relative;
      display: flex;
      flex-direction: column;

      .package-badge {
        position: absolute;
        top: 20px;
        right: 20px;
      }

      .package-name {
        font-size: 24px;
        margin-bottom: 8px;
        color: var(--text-primary);
      }

      .package-desc {
        color: var(--text-secondary);
        margin-bottom: 20px;
      }

      .package-items {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;

        h4 {
          margin: 0 0 12px;
          font-size: 14px;
          color: var(--text-regular);
        }

        ul {
          padding: 0;
          margin: 0;

          li {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            border-bottom: 1px dashed #e4e7ed;

            &:last-child {
              border-bottom: none;
            }

            .qty {
              color: var(--primary-color);
              font-weight: 500;
            }
          }
        }
      }

      .package-suitable {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--text-regular);
        margin-bottom: 20px;
      }

      .package-footer {
        margin-top: auto;

        .price-info {
          display: flex;
          align-items: baseline;
          gap: 12px;
          margin-bottom: 8px;

          .price {
            font-size: 32px;
            color: var(--primary-color);
            font-weight: 700;
          }

          .original-price {
            font-size: 16px;
            color: var(--text-secondary);
            text-decoration: line-through;
          }
        }

        .package-stats {
          display: flex;
          gap: 16px;
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 16px;
        }
      }
    }
  }

  .package-tips {
    ul {
      padding-left: 20px;

      li {
        padding: 4px 0;
        color: var(--text-regular);
      }
    }
  }
}
</style>
