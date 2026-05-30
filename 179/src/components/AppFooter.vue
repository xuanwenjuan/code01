<template>
  <footer class="app-footer">
    <div class="container footer-content">
      <div class="footer-section">
        <h3 class="footer-logo">✨ 古韵饰品</h3>
        <p class="footer-desc">专注复古饰品十余年，为您甄选全球经典复古风格饰品，让经典永不褪色。</p>
        <div class="contact-info">
          <p><el-icon><Phone /></el-icon> 400-888-8888</p>
          <p><el-icon><Message /></el-icon> service@guyun.com</p>
          <p><el-icon><Location /></el-icon> 北京市朝阳区某某路123号</p>
        </div>
      </div>
      
      <div class="footer-section">
        <h4>快速链接</h4>
        <ul>
          <li><router-link to="/">首页</router-link></li>
          <li><router-link to="/products">全部饰品</router-link></li>
          <li><router-link to="/about">关于我们</router-link></li>
          <li><router-link to="/contact">联系我们</router-link></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h4>帮助中心</h4>
        <ul>
          <li><router-link to="/help/shipping">配送说明</router-link></li>
          <li><router-link to="/help/return">退换货政策</router-link></li>
          <li><router-link to="/help/payment">支付方式</router-link></li>
          <li><router-link to="/help/faq">常见问题</router-link></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h4>关注我们</h4>
        <div class="qrcode">
          <div class="qrcode-img">
            <el-icon :size="60" style="color: #d4af37;"><Picture /></el-icon>
          </div>
          <p>扫码关注公众号</p>
        </div>
        <div class="social-links">
          <span class="social-icon">📱</span>
          <span class="social-icon">💬</span>
          <span class="social-icon">📧</span>
        </div>
      </div>
    </div>
    
    <div class="footer-bottom">
      <div class="container">
        <p>© 2024 古韵饰品 版权所有 | 京ICP备12345678号</p>
        <p class="footer-links">
          <a href="#">隐私政策</a>
          <span>|</span>
          <a href="#">服务条款</a>
          <span>|</span>
          <a href="#">网站地图</a>
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.app-footer {
  background: linear-gradient(135deg, #2c1810 0%, #4a2c1a 100%);
  color: #e8dcc4;
  margin-top: 60px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  padding: 50px 20px 40px;
  flex-wrap: wrap;
  gap: 40px;
}

.footer-section {
  flex: 1;
  min-width: 200px;
  
  h3 {
    font-size: 20px;
    color: #d4af37;
    margin-bottom: 16px;
  }
  
  h4 {
    font-size: 16px;
    color: #d4af37;
    margin-bottom: 16px;
    font-weight: 500;
  }
  
  ul {
    list-style: none;
    
    li {
      margin-bottom: 10px;
      
      a {
        color: #b8a98c;
        transition: color 0.3s;
        
        &:hover {
          color: #d4af37;
        }
      }
    }
  }
}

.footer-logo {
  font-weight: 700;
  letter-spacing: 1px;
}

.footer-desc {
  font-size: 13px;
  line-height: 1.8;
  color: #b8a98c;
  margin-bottom: 20px;
}

.contact-info {
  p {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #b8a98c;
    margin-bottom: 10px;
    
    .el-icon {
      color: #d4af37;
    }
  }
}

.qrcode {
  text-align: center;
  margin-bottom: 16px;
  
  .qrcode-img {
    width: 100px;
    height: 100px;
    background: #fff;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 10px;
  }
  
  p {
    font-size: 12px;
    color: #b8a98c;
  }
}

.social-links {
  display: flex;
  justify-content: center;
  gap: 12px;
  
  .social-icon {
    width: 36px;
    height: 36px;
    background: rgba(212, 175, 55, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      background: #d4af37;
      transform: translateY(-2px);
    }
  }
}

.footer-bottom {
  border-top: 1px solid rgba(212, 175, 55, 0.2);
  padding: 20px 0;
  
  .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
  }
  
  p {
    font-size: 12px;
    color: #8a7a5c;
  }
  
  .footer-links {
    a {
      color: #8a7a5c;
      margin: 0 8px;
      transition: color 0.3s;
      
      &:hover {
        color: #d4af37;
      }
    }
    
    span {
      color: #5a4a2c;
    }
  }
}
</style>
