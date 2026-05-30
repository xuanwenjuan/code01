<template>
  <footer class="app-footer">
    <div class="container footer-inner">
      <div class="footer-section">
        <h3 class="footer-title">🪵 传统木雕工具采购平台</h3>
        <p class="footer-desc">
          专业的木雕工具采购平台，汇聚优质供货商，为木雕工坊提供高品质工具
        </p>
      </div>

      <div class="footer-section">
        <h4>快速链接</h4>
        <ul>
          <li><router-link to="/">首页</router-link></li>
          <li><router-link to="/packages">成套工具</router-link></li>
          <li><router-link to="/login">登录</router-link></li>
        </ul>
      </div>

      <div class="footer-section">
        <h4>工具分类</h4>
        <ul>
          <li v-for="cat in categoryList" :key="cat.id">
            <router-link :to="`/category/${cat.id}`">{{ cat.name }}</router-link>
          </li>
        </ul>
      </div>

      <div class="footer-section">
        <h4>联系我们</h4>
        <ul class="contact-list">
          <li>📞 400-888-8888</li>
          <li>📧 service@woodtool.com</li>
          <li>📍 浙江省东阳市木雕产业园</li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container">
        <p>© 2024 传统木雕工具采购平台 版权所有</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useToolStore } from '@/stores/tool'

const toolStore = useToolStore()
const categoryList = computed(() => toolStore.categoryList)
</script>

<style lang="scss" scoped>
.app-footer {
  background: #2c1810;
  color: #d4c4b0;
  margin-top: 60px;
}

.footer-inner {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 40px;
  padding: 40px 20px;
}

.footer-section {
  h3, h4 {
    color: #fff;
    margin-bottom: 16px;
  }

  h3 {
    font-size: 18px;
  }

  h4 {
    font-size: 16px;
  }

  .footer-desc {
    line-height: 1.6;
    font-size: 14px;
    opacity: 0.8;
  }

  ul {
    li {
      margin-bottom: 10px;
      font-size: 14px;

      a {
        color: #d4c4b0;
        transition: color 0.3s;

        &:hover {
          color: #d2691e;
        }
      }
    }
  }

  .contact-list {
    li {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
}

.footer-bottom {
  border-top: 1px solid #4a3728;
  padding: 20px 0;
  text-align: center;
  font-size: 13px;
  opacity: 0.6;
}
</style>
