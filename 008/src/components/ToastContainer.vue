<script setup lang="ts">
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()
</script>

<template>
  <TransitionGroup name="fade" tag="div" class="toast-container">
    <div
      v-for="toast in toastStore.messages"
      :key="toast.id"
      class="toast"
      :class="`toast-${toast.type}`"
    >
      <span>{{ toast.message }}</span>
      <button
        class="close-btn"
        @click="toastStore.removeToast(toast.id)"
        style="margin-left: 12px; width: 24px; height: 24px;"
      >
        ×
      </button>
    </div>
  </TransitionGroup>
</template>
