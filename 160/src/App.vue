<template>
  <div id="app">
    <AppHeader v-if="showHeader" />
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <AppFooter v-if="showFooter" />
    <ActivityPopup v-if="showActivityPopup" @close="showActivityPopup = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import ActivityPopup from '@/components/ActivityPopup.vue'

const route = useRoute()
const showActivityPopup = ref(false)

const showHeader = computed(() => {
  return !['/login', '/register'].includes(route.path)
})

const showFooter = computed(() => {
  return !['/login', '/register', '/video-player'].includes(route.path)
})

onMounted(() => {
  const timer = setTimeout(() => {
    showActivityPopup.value = true
  }, 2000)
  return () => clearTimeout(timer)
})
</script>

<style lang="scss" scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
