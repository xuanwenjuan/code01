<template>
  <footer class="bg-white mt-12 border-t">
    <div class="container mx-auto px-4 py-12">
      <div class="grid grid-cols-5 gap-8 mb-12">
        <div>
          <h4 class="text-lg font-bold text-gray-800 mb-4">购物指南</h4>
          <ul class="space-y-2 text-gray-600">
            <li><a href="#" class="hover:text-primary">购物流程</a></li>
            <li><a href="#" class="hover:text-primary">会员介绍</a></li>
            <li><a href="#" class="hover:text-primary">常见问题</a></li>
            <li><a href="#" class="hover:text-primary">消费维权</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-lg font-bold text-gray-800 mb-4">配送方式</h4>
          <ul class="space-y-2 text-gray-600">
            <li><a href="#" class="hover:text-primary">上门自提</a></li>
            <li><a href="#" class="hover:text-primary">快递运输</a></li>
            <li><a href="#" class="hover:text-primary">配送范围</a></li>
            <li><a href="#" class="hover:text-primary">配送费用</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-lg font-bold text-gray-800 mb-4">支付方式</h4>
          <ul class="space-y-2 text-gray-600">
            <li><a href="#" class="hover:text-primary">货到付款</a></li>
            <li><a href="#" class="hover:text-primary">在线支付</a></li>
            <li><a href="#" class="hover:text-primary">分期付款</a></li>
            <li><a href="#" class="hover:text-primary">邮局汇款</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-lg font-bold text-gray-800 mb-4">售后服务</h4>
          <ul class="space-y-2 text-gray-600">
            <li><a href="#" class="hover:text-primary">退换货政策</a></li>
            <li><a href="#" class="hover:text-primary">退款说明</a></li>
            <li><a href="#" class="hover:text-primary">保修政策</a></li>
            <li><a href="#" class="hover:text-primary">售后服务</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-lg font-bold text-gray-800 mb-4">联系我们</h4>
          <div class="flex items-center gap-3 mb-3">
            <Phone class="w-6 h-6 text-primary" />
            <span class="text-xl font-bold text-primary">400-888-8888</span>
          </div>
          <p class="text-gray-600 text-sm mb-3">工作时间：周一至周日 9:00-21:00</p>
          <div class="flex gap-3">
            <a href="#" class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
              <ChatDotRound class="w-5 h-5" />
            </a>
            <a href="#" class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
              <Share class="w-5 h-5" />
            </a>
            <a href="#" class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
              <VideoCamera class="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
      
      <div class="border-t pt-8">
        <div class="flex flex-wrap justify-center gap-6 mb-6">
          <a href="#" class="text-gray-600 hover:text-primary text-sm">关于我们</a>
          <a href="#" class="text-gray-600 hover:text-primary text-sm">联系我们</a>
          <a href="#" class="text-gray-600 hover:text-primary text-sm">人才招聘</a>
          <a href="#" class="text-gray-600 hover:text-primary text-sm">商家入驻</a>
          <a href="#" class="text-gray-600 hover:text-primary text-sm">广告服务</a>
          <a href="#" class="text-gray-600 hover:text-primary text-sm">友情链接</a>
          <a href="#" class="text-gray-600 hover:text-primary text-sm">销售联盟</a>
          <a href="#" class="text-gray-600 hover:text-primary text-sm">隐私政策</a>
          <a href="#" class="text-gray-600 hover:text-primary text-sm">用户协议</a>
        </div>
        <div class="text-center text-gray-500 text-sm">
          <p>© 2024 母婴用品商城 版权所有 京ICP备12345678号-1</p>
          <p class="mt-2">本站商品信息均来自于合作方，其真实性、准确性和合法性由信息拥有者负责。本站不承担任何保证责任。</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { Phone, ChatDotRound, Share, VideoCamera } from '@element-plus/icons-vue'
</script>
