<template>
  <footer class="app-footer">
    <div class="container footer-content">
      <div class="footer-section">
        <h3 class="footer-title">
          <span class="logo-icon">🌸</span>
          花语轩
        </h3>
        <p class="footer-desc">
          专业的鲜花花艺礼品订购平台，为您传递每一份美好心意。精选优质花材，同城2小时送达。
        </p>
        <div class="contact-info">
          <p><el-icon><Phone /></el-icon> 400-888-8888</p>
          <p><el-icon><Clock /></el-icon> 9:00 - 21:00</p>
          <p><el-icon><Location /></el-icon> 全国配送</p>
        </div>
      </div>
      
      <div class="footer-section">
        <h4>购物指南</h4>
        <ul>
          <li><a href="#">购物流程</a></li>
          <li><a href="#">支付方式</a></li>
          <li><a href="#">配送说明</a></li>
          <li><a href="#">售后服务</a></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h4>关于我们</h4>
        <ul>
          <li><a href="#">品牌故事</a></li>
          <li><a href="#">加盟合作</a></li>
          <li><a href="#">加入我们</a></li>
          <li><a href="#">联系我们</a></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h4>关注我们</h4>
        <div class="qrcode">
          <div class="qrcode-img">📱</div>
          <p>扫码关注公众号</p>
        </div>
      </div>
    </div>
    
    <div class="footer-bottom">
      <div class="container">
        <p>&copy; 2024 花语轩 Floral Shop. All Rights Reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { Phone, Clock, Location } from '@element-plus/icons-vue'
</script>

<style lang="scss" scoped>
.app-footer {
  background: #fff;
  border-top: 1px solid $border-color;
  margin-top: 40px;
  
  .footer-content {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 40px;
    padding: 40px 20px;
  }
  
  .footer-section {
    h3, h4 {
      margin-bottom: 16px;
      color: $text-primary;
    }
    
    h3 {
      font-size: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
      
      .logo-icon {
        font-size: 24px;
      }
    }
    
    h4 {
      font-size: 16px;
    }
    
    .footer-desc {
      color: $text-secondary;
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 16px;
    }
    
    .contact-info {
      p {
        display: flex;
        align-items: center;
        gap: 8px;
        color: $text-secondary;
        font-size: 14px;
        margin-bottom: 8px;
      }
    }
    
    ul {
      li {
        margin-bottom: 10px;
        
        a {
          color: $text-secondary;
          font-size: 14px;
          transition: color 0.3s;
          
          &:hover {
            color: $primary-color;
          }
        }
      }
    }
    
    .qrcode {
      text-align: center;
      
      .qrcode-img {
        width: 100px;
        height: 100px;
        background: #f5f5f5;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 40px;
        margin: 0 auto 10px;
      }
      
      p {
        font-size: 12px;
        color: $text-light;
      }
    }
  }
  
  .footer-bottom {
    background: #f5f5f5;
    padding: 16px 0;
    text-align: center;
    
    p {
      color: $text-light;
      font-size: 13px;
    }
  }
}

@media (max-width: 768px) {
  .app-footer {
    .footer-content {
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
  }
}
</style>
