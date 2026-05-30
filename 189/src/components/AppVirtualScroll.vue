<template>
  <div 
    ref="containerRef"
    class="virtual-scroll-container"
    @scroll="handleScroll"
    :style="{ height: containerHeight }"
  >
    <div 
      class="virtual-scroll-phantom"
      :style="{ height: totalHeight + 'px' }"
    />
    <div 
      class="virtual-scroll-content"
      :style="{ transform: `translateY(${offsetY}px)` }"
    >
      <slot 
        v-for="(item, index) in visibleItems" 
        :key="getItemKey(item, startIndex + index)"
        :item="item"
        :index="startIndex + index"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  itemHeight: {
    type: Number,
    default: 320
  },
  containerHeight: {
    type: String,
    default: 'calc(100vh - 200px)'
  },
  buffer: {
    type: Number,
    default: 5
  },
  itemKey: {
    type: [String, Function],
    default: 'id'
  }
})

const emit = defineEmits(['scroll', 'load-more'])

const containerRef = ref(null)
const scrollTop = ref(0)
const containerHeightNum = ref(0)

const visibleCount = computed(() => {
  return Math.ceil(containerHeightNum.value / props.itemHeight) + props.buffer * 2
})

const totalHeight = computed(() => {
  return props.items.length * props.itemHeight
})

const startIndex = computed(() => {
  const start = Math.floor(scrollTop.value / props.itemHeight) - props.buffer
  return Math.max(0, start)
})

const endIndex = computed(() => {
  const end = startIndex.value + visibleCount.value
  return Math.min(props.items.length, end)
})

const visibleItems = computed(() => {
  return props.items.slice(startIndex.value, endIndex.value)
})

const offsetY = computed(() => {
  return Math.max(0, startIndex.value * props.itemHeight - props.buffer * props.itemHeight)
})

function getItemKey(item, index) {
  if (typeof props.itemKey === 'function') {
    return props.itemKey(item, index)
  }
  return item[props.itemKey] ?? index
}

let ticking = false

function handleScroll(e) {
  if (ticking) return
  
  ticking = true
  requestAnimationFrame(() => {
    scrollTop.value = e.target.scrollTop
    emit('scroll', e)
    
    if (e.target.scrollTop + e.target.clientHeight >= e.target.scrollHeight - 100) {
      emit('load-more')
    }
    
    ticking = false
  })
}

function updateContainerHeight() {
  if (containerRef.value) {
    containerHeightNum.value = containerRef.value.clientHeight
  }
}

function scrollToIndex(index) {
  if (containerRef.value) {
    containerRef.value.scrollTop = index * props.itemHeight
  }
}

function scrollToTop() {
  if (containerRef.value) {
    containerRef.value.scrollTop = 0
  }
}

watch(() => props.items, async () => {
  await nextTick()
  updateContainerHeight()
}, { deep: true })

onMounted(() => {
  updateContainerHeight()
  window.addEventListener('resize', updateContainerHeight)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateContainerHeight)
})

defineExpose({
  scrollToIndex,
  scrollToTop
})
</script>

<style lang="scss" scoped>
.virtual-scroll-container {
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  will-change: transform;
  -webkit-overflow-scrolling: touch;

  .virtual-scroll-phantom {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: -1;
  }

  .virtual-scroll-content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    will-change: transform;
  }
}
</style>
