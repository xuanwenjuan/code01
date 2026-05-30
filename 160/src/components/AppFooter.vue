<template>
  <footer class="app-footer">
    <div class="container footer-container">
      <div class="footer-section">
        <h3>关于我们</h3>
        <p>智慧学堂致力于为用户提供优质的在线教育服务，让学习更简单、更高效。</p>
      </div>
      
      <div class="footer-section">
        <h3>快速链接</h3>
        <ul>
          <li><router-link to="/">首页</router-link></li>
          <li><router-link to="/courses">课程列表</router-link></li>
          <li><router-link to="/learning">学习中心</router-link></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h3>帮助中心</h3>
        <ul>
          <li><a href="#">常见问题</a></li>
          <li><a href="#">学习指南</a></li>
          <li><a href="#">联系客服</a></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h3>联系方式</h3>
        <ul>
          <li><el-icon><Phone /></el-icon> 400-888-8888</li>
          <li><el-icon><Message /></el-icon> support@zhihui.com</li>
          <li><el-icon><Location /></el-icon> 北京市海淀区中关村</li>
        </ul>
      </div>
    </div>
    
    <div class="footer-bottom">
      <div class="container">
        <p>&copy; 2024 智慧学堂 All Rights Reserved. | 京ICP备12345678号</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { Phone, Message, Location } from '@element-plus/icons-vue'
</script>

<style lang="scss" scoped>
.app-footer {
  background: #1f2937;
  color: #9ca3af;
  margin-top: 40px;
}

.footer-container {
  display: flex;
  flex-wrap: wrap;
  padding: 40px 20px;
  gap: 40px;
}

.footer-section {
  flex: 1;
  min-width: 200px;

  h3 {
    color: #fff;
    font-size: 16px;
    margin-bottom: 16px;
    font-weight: 600;
  }

  p {
    line-height: 1.6;
    font-size: 13px;
  }

  ul {
    li {
      margin-bottom: 10px;
      font-size: 13px;
      
      a {
        color: #9ca3af;
        transition: color 0.3s;
        
        &:hover {
          color: #667eea;
        }
      }

      .el-icon {
        margin-right: 8px;
      }
    }
  }
}

.footer-bottom {
  background: #111827;
  padding: 20px 0;
  text-align: center;
  font-size: 13px;
  
  p {
    margin: 0;
  }
}
</style>
