<script setup>
import { onMounted } from 'vue'
import { useUserStore } from './stores/user'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'

const userStore = useUserStore()

onMounted(() => {
  userStore.checkAuth()
})
</script>

<template>
  <div class="app-wrapper">
    <AppHeader />
    <main class="main-content">
      <router-view />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}
</style>
