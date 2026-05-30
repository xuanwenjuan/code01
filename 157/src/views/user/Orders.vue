<template>
  <div class="bg-white rounded-xl shadow-sm p-8">
    <h2 class="text-xl font-bold text-gray-800 mb-6">订单管理</h2>
    
    <div class="flex gap-4 mb-6 border-b">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="px-6 py-3 border-b-2 -mb-px transition-colors"
        :class="{
          'border-primary text-primary': currentTab === tab.value,
          'border-transparent text-gray-500 hover:text-gray-800': currentTab !== tab.value
        }"
        @click="currentTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>
    
    <div v-if="filteredOrders.length > 0" class="space-y-6">
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="border rounded-xl overflow-hidden"
      >
        <div class="bg-gray-50 px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-6">
            <span class="text-gray-500">订单号：{{ order.id }}</span>
            <span class="text-gray-500">{{ order.createTime }}</span>
          </div>
          <span
            class="px-3 py-1 rounded-full text-sm"
            :class="{
              'bg-yellow-100 text-yellow-700': order.status === 'pending',
              'bg-blue-100 text-blue-700': order.status === 'shipped',
              'bg-green-100 text-green-700': order.status === 'completed'
            }"
          >
            {{ order.statusText }}
          </span>
        </div>
        
        <div class="p-6">
          <div class="space-y-4">
            <div
              v-for="item in order.items"
              :key="item.id"
              class="flex items-center gap-4"
            >
              <img :src="item.image" class="w-20 h-20 object-cover rounded-lg" />
              <div class="flex-1">
                <h3 class="font-medium text-gray-800 mb-1">{{ item.name }}</h3>
                <p v-if="item.spec" class="text-sm text-gray-500">{{ item.spec }}</p>
              </div>
              <div class="text-red-500 font-bold">¥{{ item.price }}</div>
              <div class="text-gray-500">x {{ item.quantity }}</div>
            </div>
          </div>
          
          <div class="mt-6 pt-6 border-t flex items-center justify-between">
            <div class="text-gray-600">
              共 {{ order.items.reduce((sum, item) => sum + item.quantity, 0) }} 件商品，
              合计：<span class="text-2xl font-bold text-red-500">¥{{ order.totalPrice }}</span>
            </div>
            <div class="flex gap-3">
              <el-button type="primary" plain>查看详情</el-button>
              <el-button v-if="order.status === 'pending'" type="danger">取消订单</el-button>
              <el-button v-if="order.status === 'pending'" type="primary">立即付款</el-button>
              <el-button v-if="order.status === 'shipped'" type="primary">确认收货</el-button>
              <el-button v-if="order.status === 'completed'" type="primary">再次购买</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="py-16 text-center">
      <el-empty description="暂无订单">
        <router-link to="/" class="el-button el-button--primary">
          去购物
        </router-link>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { orders } from '@/data/mock'

const currentTab = ref('all')

const tabs = [
  { label: '全部订单', value: 'all' },
  { label: '待付款', value: 'pending' },
  { label: '待收货', value: 'shipped' },
  { label: '已完成', value: 'completed' }
]

const filteredOrders = computed(() => {
  if (currentTab.value === 'all') {
    return orders
  }
  return orders.filter(o => o.status === currentTab.value)
})
</script>
