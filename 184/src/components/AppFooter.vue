<template>
  <footer class="app-footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h3 class="footer-title">
            <el-icon :size="24" color="#409eff"><Brush /></el-icon>
            模型喷涂耗材平台
          </h3>
          <p class="footer-desc">专业的模型喷涂耗材一站式采购平台，汇聚全球知名品牌，为模型爱好者提供优质产品和服务。</p>
          <div class="contact-info">
            <p><el-icon><Phone /></el-icon> 400-123-4567</p>
            <p><el-icon><Message /></el-icon> service@modelspray.com</p>
            <p><el-icon><Location /></el-icon> 北京市朝阳区模型产业园A座</p>
          </div>
        </div>
        
        <div class="footer-section">
          <h4>快速链接</h4>
          <ul class="footer-links">
            <li><router-link to="/">首页</router-link></li>
            <li><router-link to="/products">商品中心</router-link></li>
            <li><router-link to="/color-schemes">配色方案</router-link></li>
            <li><router-link to="/login">用户登录</router-link></li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h4>商品分类</h4>
          <ul class="footer-links">
            <li>油性漆</li>
            <li>水性漆</li>
            <li>底漆/补土</li>
            <li>光油/消光</li>
            <li>工具耗材</li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h4>帮助中心</h4>
          <ul class="footer-links">
            <li>新手指南</li>
            <li>配送说明</li>
            <li>退换货政策</li>
            <li>常见问题</li>
            <li>联系客服</li>
          </ul>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>© 2024 模型喷涂耗材采购平台 版权所有 | 京ICP备12345678号</p>
        <p class="tips">温馨提示：本平台仅提供模拟数据，不涉及真实交易</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped lang="scss">
.app-footer {
  background: #1a1a2e;
  color: rgba(255, 255, 255, 0.8);
  padding: 40px 0 0;
  margin-top: 40px;
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 40px;
  padding-bottom: 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-section {
  h3, h4 {
    color: #fff;
    margin-bottom: 16px;
    font-size: 16px;
  }
  
  h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
  }
  
  .footer-desc {
    line-height: 1.6;
    margin-bottom: 16px;
    color: rgba(255, 255, 255, 0.6);
  }
  
  .contact-info {
    p {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      color: rgba(255, 255, 255, 0.7);
    }
  }
}

.footer-links {
  li {
    margin-bottom: 10px;
    
    a, li {
      color: rgba(255, 255, 255, 0.6);
      transition: color 0.3s;
      cursor: pointer;
      
      &:hover {
        color: #409eff;
      }
    }
  }
}

.footer-bottom {
  padding: 20px 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  
  .tips {
    margin-top: 8px;
    color: rgba(255, 255, 255, 0.4);
  }
}

@media (max-width: 900px) {
  .footer-content {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
