<template>
  <div class="home-page">
    <div class="container">
      <el-carousel height="300px" class="banner" indicator-position="outside">
        <el-carousel-item v-for="i in 3" :key="i">
          <div class="banner-item" :class="`banner-${i}`">
            <div class="banner-content">
              <h2>精选图书 品质保障</h2>
              <p>百万图书 一站式采购 满千包邮</p>
              <el-button type="primary" size="large">立即采购</el-button>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>

      <section class="section categories-section">
        <h3 class="section-title">图书分类</h3>
        <div class="category-list">
          <div
            class="category-item"
            :class="{ active: !bookStore.selectedCategory }"
            @click="selectCategory('')"
          >
            <el-icon :size="32"><Collection /></el-icon>
            <span>全部</span>
          </div>
          <div
            v-for="category in bookStore.categories"
            :key="category.id"
            class="category-item"
            :class="{ active: bookStore.selectedCategory === category.name }"
            @click="selectCategory(category.name)"
          >
            <el-icon :size="32">
              <component :is="category.icon" />
            </el-icon>
            <span>{{ category.name }}</span>
          </div>
        </div>
      </section>

      <section class="section packages-section">
        <h3 class="section-title">批量采购优惠套餐</h3>
        <div class="package-list">
          <div
            v-for="pkg in bookStore.packages"
            :key="pkg.id"
            class="package-card card-hover"
          >
            <div class="package-cover">
              <img :src="pkg.cover" :alt="pkg.name" />
              <span class="package-tag" :class="`tag-${pkg.tag}`">{{ pkg.tag }}</span>
            </div>
            <div class="package-info">
              <h4 class="package-name">{{ pkg.name }}</h4>
              <p class="package-desc">{{ pkg.description }}</p>
              <div class="package-price">
                <span class="price">¥{{ pkg.discountPrice.toFixed(2) }}</span>
                <span class="original-price">¥{{ pkg.originalPrice.toFixed(2) }}</span>
                <span class="package-discount">{{ pkg.discount }}</span>
              </div>
              <div class="package-footer">
                <span class="min-count">起订量 {{ pkg.minCount }} 套</span>
                <el-button type="primary" size="small" @click="buyPackage(pkg)">立即采购</el-button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="section new-books-section">
        <h3 class="section-title">
          <el-icon color="#e6a23c"><MagicStick /></el-icon>
          新书专区
        </h3>
        <div v-loading="bookStore.loading" class="books-grid">
          <template v-if="bookStore.newBooks.length > 0">
            <BookCard
              v-for="book in bookStore.newBooks.slice(0, 8)"
              :key="book.id"
              :book="book"
            />
          </template>
          <div v-else class="empty-container">
            <el-icon><Document /></el-icon>
            <p>暂无新书</p>
          </div>
        </div>
      </section>

      <section class="section classic-books-section">
        <h3 class="section-title">
          <el-icon color="#909399"><Medal /></el-icon>
          经典名著专区
        </h3>
        <div v-loading="bookStore.loading" class="books-grid">
          <template v-if="bookStore.classicBooks.length > 0">
            <BookCard
              v-for="book in bookStore.classicBooks.slice(0, 8)"
              :key="book.id"
              :book="book"
            />
          </template>
          <div v-else class="empty-container">
            <el-icon><Document /></el-icon>
            <p>暂无经典书籍</p>
          </div>
        </div>
      </section>

      <section class="section all-books-section">
        <h3 class="section-title">
          <el-icon><Books /></el-icon>
          全部图书
          <span v-if="bookStore.selectedCategory" class="filter-tag">
            分类：{{ bookStore.selectedCategory }}
            <el-icon class="close-icon" @click="clearFilter"><CircleClose /></el-icon>
          </span>
          <span v-if="bookStore.searchKeyword" class="filter-tag">
            搜索：{{ bookStore.searchKeyword }}
            <el-icon class="close-icon" @click="clearSearch"><CircleClose /></el-icon>
          </span>
        </h3>
        <div v-loading="bookStore.loading" class="books-grid">
          <template v-if="bookStore.filteredBooks.length > 0">
            <BookCard
              v-for="book in bookStore.filteredBooks"
              :key="book.id"
              :book="book"
            />
          </template>
          <div v-else class="empty-container">
            <el-icon><Search /></el-icon>
            <p>未找到相关图书</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useBookStore } from '@/stores/book'
import { useUserStore } from '@/stores/user'
import { useOrderStore } from '@/stores/order'
import BookCard from '@/components/common/BookCard.vue'

const router = useRouter()
const bookStore = useBookStore()
const userStore = useUserStore()
const orderStore = useOrderStore()

onMounted(() => {
  bookStore.fetchBooks()
})

const selectCategory = (category) => {
  bookStore.selectedCategory = category
}

const clearFilter = () => {
  bookStore.selectedCategory = ''
}

const clearSearch = () => {
  bookStore.searchKeyword = ''
}

const buyPackage = (pkg) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  const books = pkg.books.map(bookId => {
    const book = bookStore.getBookById(bookId)
    return {
      id: book.id,
      name: book.name,
      price: pkg.discountPrice / pkg.books.length,
      quantity: pkg.minCount
    }
  })
  
  orderStore.addOrder({
    books,
    totalAmount: pkg.discountPrice * pkg.minCount,
    address: userStore.userInfo.company
  })
  
  ElMessage.success('采购订单已提交')
  router.push('/center')
}
</script>

<style scoped>
.home-page {
  padding-top: 20px;
}

.banner {
  margin-bottom: 40px;
  border-radius: 8px;
  overflow: hidden;
}

.banner-item {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 60px;
  color: #fff;
}

.banner-1 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.banner-2 {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.banner-3 {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.banner-content h2 {
  font-size: 36px;
  margin-bottom: 12px;
}

.banner-content p {
  font-size: 18px;
  margin-bottom: 24px;
  opacity: 0.9;
}

.section {
  margin-bottom: 40px;
}

.category-list {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 16px;
}

.category-item {
  background: #fff;
  border-radius: 8px;
  padding: 20px 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.category-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.category-item.active {
  border-color: #409eff;
  background: #ecf5ff;
}

.category-item .el-icon {
  margin-bottom: 8px;
  color: #409eff;
}

.category-item span {
  display: block;
  font-size: 14px;
  color: #606266;
}

.category-item.active span {
  color: #409eff;
  font-weight: 500;
}

.package-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.package-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}

.package-cover {
  position: relative;
  height: 150px;
  overflow: hidden;
}

.package-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.package-tag {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
}

.package-tag.tag-热销 {
  background: #f56c6c;
}

.package-tag.tag-推荐 {
  background: #67c23a;
}

.package-tag.tag-新品 {
  background: #e6a23c;
}

.package-info {
  padding: 16px;
}

.package-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #303133;
}

.package-desc {
  font-size: 13px;
  color: #606266;
  margin: 0 0 12px 0;
  line-height: 1.5;
  height: 40px;
  overflow: hidden;
}

.package-price {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 12px;
}

.package-price .price {
  font-size: 20px;
}

.package-discount {
  padding: 2px 6px;
  background: #fef0f0;
  color: #f56c6c;
  font-size: 12px;
  border-radius: 4px;
}

.package-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.min-count {
  font-size: 12px;
  color: #909399;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
}

.filter-tag {
  font-size: 14px;
  font-weight: normal;
  background: #ecf5ff;
  color: #409eff;
  padding: 4px 12px;
  border-radius: 20px;
  margin-left: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.close-icon {
  cursor: pointer;
  font-size: 14px;
}

.close-icon:hover {
  color: #f56c6c;
}
</style>
