<template>
  <transition name="fade">
    <div
      v-show="visible"
      class="fixed bottom-8 right-8 z-40 flex flex-col gap-2"
    >
      <div
        v-for="floor in quickFloors"
        :key="floor.id"
        class="w-12 h-12 bg-white rounded-lg shadow-md flex flex-col items-center justify-center cursor-pointer hover:bg-primary hover:text-white transition-colors text-gray-600 group"
        @click="scrollToFloor(floor.id)"
      >
        <span class="text-lg">{{ floor.icon }}</span>
        <span class="text-xs">{{ floor.name }}</span>
      </div>
      <div
        class="w-12 h-12 bg-white rounded-lg shadow-md flex items-center justify-center cursor-pointer hover:bg-primary hover:text-white transition-colors text-gray-600"
        @click="scrollToTop"
      >
        <Top class="w-6 h-6" />
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Top } from '@element-plus/icons-vue'

const visible = ref(false)

const quickFloors = [
  { id: 'hot', name: '爆款', icon: '🔥' },
  { id: 'new', name: '新品', icon: '✨' },
  { id: 'floor1', name: '奶粉', icon: '🍼' },
  { id: 'floor2', name: '尿裤', icon: '🧻' },
  { id: 'floor3', name: '喂养', icon: '🍴' },
  { id: 'floor4', name: '服饰', icon: '👶' }
]

const handleScroll = () => {
  visible.value = window.scrollY > 300
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const scrollToFloor = (id) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
