<template>
  <div class="app-container">
    <AppHeader v-if="!$route.meta.hideHeader" />
    <main class="main-content" :class="{ 'no-padding': $route.meta.hideHeader }">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <AppFooter v-if="!$route.meta.hideFooter" />
  </div>
</template>

<script setup>
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
</script>

<style lang="scss">
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #fef7f7;
}

.main-content {
  flex: 1;
  padding-top: 60px;
  
  &.no-padding {
    padding-top: 0;
  }
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
