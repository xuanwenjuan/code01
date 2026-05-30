<template>
  <div class="home-page">
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <h1>传承匠心 · 精工细作</h1>
          <p>专业木雕工具采购平台，为木雕工坊提供高品质工具</p>
          <div class="hero-buttons">
            <el-button type="primary" size="large" @click="goPackages">
              选购成套工具
            </el-button>
            <el-button size="large" @click="goCategory(1)">
              浏览精雕工具
            </el-button>
          </div>
        </div>
      </div>
    </section>

    <section class="category-section">
      <div class="container">
        <h2 class="section-title">工具品类分类</h2>
        <div class="category-grid">
          <div
            v-for="cat in categoryList"
            :key="cat.id"
            class="category-item card"
            @click="goCategory(cat.id)"
          >
            <span class="cat-icon">{{ cat.icon }}</span>
            <h3>{{ cat.name }}</h3>
            <p>{{ cat.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="tools-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">精雕工具专区</h2>
          <el-button link @click="goCategory(1)">查看更多 →</el-button>
        </div>
        <div v-loading="loading" class="tools-grid">
          <ToolCard v-for="tool in displayFineTools" :key="tool.id" :tool="tool" />
        </div>
      </div>
    </section>

    <section class="tools-section rough-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">粗加工工具专区</h2>
          <el-button link @click="goCategory(2)">查看更多 →</el-button>
        </div>
        <div v-loading="loading" class="tools-grid">
          <ToolCard v-for="tool in displayRoughTools" :key="tool.id" :tool="tool" />
        </div>
      </div>
    </section>

    <section class="packages-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">木雕成套工具采购套餐</h2>
          <el-button link @click="goPackages">查看全部套餐 →</el-button>
        </div>
        <div class="packages-grid">
          <PackageCard v-for="pkg in packageList" :key="pkg.id" :pkg="pkg" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ToolCard from '@/components/ToolCard.vue'
import PackageCard from '@/components/PackageCard.vue'
import { useToolStore } from '@/stores/tool'

const route = useRoute()
const router = useRouter()
const toolStore = useToolStore()

const loading = ref(false)

const categoryList = computed(() => toolStore.categoryList)
const fineTools = computed(() => toolStore.fineTools)
const roughTools = computed(() => toolStore.roughTools)
const packageList = computed(() => toolStore.packageList)

const displayFineTools = computed(() => {
  if (route.query.search) {
    return toolStore.searchTools(route.query.search).slice(0, 4)
  }
  return fineTools.value.slice(0, 4)
})

const displayRoughTools = computed(() => {
  return roughTools.value.slice(0, 4)
})

const goCategory = (id) => {
  router.push(`/category/${id}`)
}

const goPackages = () => {
  router.push('/packages')
}

onMounted(() => {
  toolStore.loadFavorites()
})
</script>

<style lang="scss" scoped>
.hero-section {
  background: linear-gradient(135deg, #8b4513 0%, #d2691e 100%);
  padding: 80px 0;
  color: #fff;
  margin-bottom: 60px;

  .hero-content {
    text-align: center;

    h1 {
      font-size: 42px;
      margin-bottom: 16px;
      font-weight: 700;
    }

    p {
      font-size: 18px;
      margin-bottom: 32px;
      opacity: 0.9;
    }

    .hero-buttons {
      display: flex;
      gap: 16px;
      justify-content: center;
    }
  }
}

.category-section {
  margin-bottom: 60px;

  .category-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 20px;
  }

  .category-item {
    padding: 24px 16px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-4px);

      .cat-icon {
        transform: scale(1.2);
      }
    }

    .cat-icon {
      font-size: 40px;
      margin-bottom: 12px;
      display: block;
      transition: transform 0.3s;
    }

    h3 {
      font-size: 16px;
      margin-bottom: 8px;
      color: #333;
    }

    p {
      font-size: 12px;
      color: #999;
      line-height: 1.4;
    }
  }
}

.tools-section {
  margin-bottom: 60px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .tools-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
}

.rough-section {
  background: #fff8f0;
  padding: 40px 0;
  margin: 0 -20px 60px;

  .container {
    padding: 0 20px;
  }
}

.packages-section {
  margin-bottom: 60px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .packages-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
}
</style>
