<template>
  <footer class="app-footer">
    <div class="container footer-content">
      <div class="footer-section">
        <div class="footer-logo">
          <el-icon size="28" color="#409eff"><Compass /></el-icon>
          <span>户外装备选购平台</span>
        </div>
        <p class="footer-desc">专业的户外装备选购平台，为您提供优质的户外装备和服务。</p>
      </div>
      
      <div class="footer-section">
        <h4>快速导航</h4>
        <ul>
          <li><router-link to="/">首页</router-link></li>
          <li><router-link to="/category/1">帐篷</router-link></li>
          <li><router-link to="/category/2">睡袋</router-link></li>
          <li><router-link to="/category/3">背包</router-link></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h4>户外场景</h4>
        <ul>
          <li><router-link to="/scene/camping">露营</router-link></li>
          <li><router-link to="/scene/hiking">徒步</router-link></li>
          <li><router-link to="/scene/climbing">攀岩</router-link></li>
          <li><router-link to="/scene/running">越野跑</router-link></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h4>联系我们</h4>
        <ul>
          <li><el-icon><Phone /></el-icon> 400-123-4567</li>
          <li><el-icon><Message /></el-icon> service@outdoor.com</li>
          <li><el-icon><Location /></el-icon> 北京市朝阳区xxx路xxx号</li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2024 户外装备选购平台 版权所有</p>
    </div>
  </footer>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.app-footer {
  background: #1f2937;
  color: #d1d5db;
  margin-top: 60px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  padding: 50px 20px;
  gap: 40px;
}

.footer-section {
  flex: 1;
  
  h4 {
    color: #fff;
    font-size: 16px;
    margin-bottom: 20px;
  }
  
  ul {
    list-style: none;
    
    li {
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      
      a {
        color: #d1d5db;
        transition: color 0.3s;
        
        &:hover {
          color: #409eff;
        }
      }
    }
  }
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 16px;
}

.footer-desc {
  font-size: 14px;
  line-height: 1.6;
  color: #9ca3af;
}

.footer-bottom {
  border-top: 1px solid #374151;
  padding: 20px;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
}
</style>
