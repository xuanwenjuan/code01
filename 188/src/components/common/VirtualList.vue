<template>
  <div class="virtual-list" ref="containerRef" @scroll="handleScroll">
    <div class="virtual-list-phantom" :style="{ height: totalHeight + 'px' }"></div>
    <div class="virtual-list-content" :style="contentStyle">
      <slot v-for="(item, index) in visibleData" :item="item" :index="startIndex + index" name="item">
        <div class="virtual-list-item">
          {{ item }}
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  itemHeight: {
    type: Number,
    default: 100
  },
  bufferSize: {
    type: Number,
    default: 5
  }
})

const containerRef = ref(null)
const startIndex = ref(0)
const endIndex = ref(0)
const scrollTop = ref(0)

const totalHeight = computed(() => props.data.length * props.itemHeight)

const visibleCount = computed(() => {
  if (!containerRef.value) return 10
  return Math.ceil(containerRef.value.clientHeight / props.itemHeight)
})

const visibleData = computed(() => {
  const start = Math.max(0, startIndex.value - props.bufferSize)
  const end = Math.min(props.data.length, endIndex.value + props.bufferSize)
  return props.data.slice(start, end)
})

const contentStyle = computed(() => ({
  transform: `translateY(${Math.max(0, (startIndex.value - props.bufferSize) * props.itemHeight)}px)`
}))

const handleScroll = () => {
  if (!containerRef.value) return
  scrollTop.value = containerRef.value.scrollTop
  startIndex.value = Math.floor(scrollTop.value / props.itemHeight)
  endIndex.value = startIndex.value + visibleCount.value
}

const updatePositions = async () => {
  await nextTick()
  handleScroll()
}

watch(() => props.data, () => {
  updatePositions()
}, { deep: true })

onMounted(() => {
  updatePositions()
})

defineExpose({
  scrollTo: (index) => {
    if (containerRef.value) {
      containerRef.value.scrollTop = index * props.itemHeight
    }
  }
})
</script>

<style lang="scss" scoped>
.virtual-list {
  position: relative;
  overflow-y: auto;
  height: 100%;

  .virtual-list-phantom {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: -1;
  }

  .virtual-list-content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
  }

  .virtual-list-item {
    height: v-bind('itemHeight + "px"');
    box-sizing: border-box;
  }
}
</style>
