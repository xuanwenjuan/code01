<template>
  <div>
    <div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
      <button
        :class="['btn', 'btn-sm', currentTab === 'form' ? 'btn-primary' : 'btn-secondary']"
        @click="currentTab = 'form'"
      >
        借阅登记
      </button>
      <button
        :class="['btn', 'btn-sm', currentTab === 'list' ? 'btn-primary' : 'btn-secondary']"
        @click="currentTab = 'list'"
      >
        借阅记录
      </button>
      <button
        :class="['btn', 'btn-sm', currentTab === 'maintenance' ? 'btn-primary' : 'btn-secondary']"
        @click="currentTab = 'maintenance'"
      >
        养护管理
      </button>
    </div>

    <Transition name="fade" mode="out-in">
      <BorrowForm v-if="currentTab === 'form'" key="form" />
      <BorrowList v-else-if="currentTab === 'list'" key="list" />
      <MaintenanceList v-else key="maintenance" />
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BorrowForm from './BorrowForm.vue'
import BorrowList from './BorrowList.vue'
import MaintenanceList from '../maintenance/MaintenanceList.vue'

const currentTab = ref('form')
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>