<template>
  <div class="app-container">
    <AppHeader v-if="showHeader" />
    <main class="main-content">
      <router-view v-slot="{ Component, route: routeSlot }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="routeSlot.fullPath" />
        </transition>
      </router-view>
    </main>
    <AppFooter v-if="showHeader" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'

const route = useRoute()
const showHeader = computed(() => !route.meta.hideHeader)
</script>

<style lang="scss" scoped>
.app-container {
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
