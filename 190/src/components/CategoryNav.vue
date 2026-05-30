<template>
  <div class="category-nav">
    <el-menu
      :default-active="activeCategory"
      mode="horizontal"
      @select="handleSelect"
      class="category-menu"
    >
      <el-sub-menu v-for="cat in categories" :key="cat.id" :index="String(cat.id)">
        <template #title>
          <el-icon><component :is="cat.icon" /></el-icon>
          <span>{{ cat.name }}</span>
        </template>
        <el-menu-item 
          v-for="child in cat.children" 
          :key="child.id" 
          :index="String(child.id)"
        >
          {{ child.name }}
        </el-menu-item>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { categories } from '@/mock'

const router = useRouter()
const activeCategory = ref('')

function handleSelect(index) {
  router.push(`/category?catId=${index}`)
}
</script>

<style scoped>
.category-nav {
  background: #fff;
  border-bottom: 1px solid #ebeef5;
}

.category-menu {
  border-bottom: none;
  justify-content: center;
}
</style>
