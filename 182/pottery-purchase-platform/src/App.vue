<template>
  <el-loading v-if="loading" fullscreen text="加载中..." />
  <AppHeader />
  <main class="page-content">
    <router-view />
  </main>
  <AppFooter />
</template>

<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const { loading } = storeToRefs(appStore)

onMounted(() => {
  console.log('陶艺工具采购平台已启动')
})
</script>
