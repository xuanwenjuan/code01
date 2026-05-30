# 精品文创潮品电商后台管理工作台

基于 React 18 + TypeScript + Vite 构建的文创电商后台管理系统。

## 技术栈

- **核心框架**: React 18 + TypeScript + Vite
- **状态管理**: Zustand (支持持久化)
- **UI 组件库**: Ant Design 5
- **数据模拟**: Mock.js

## 功能模块

### 1. 文创品类分类管理
- 支持多级类目结构（手办、盲盒、文具、国潮周边、艺术摆件等）
- 类目新增、编辑、停用、排序调整
- 归属层级维护

### 2. 商品 SKU 规格管理
- 多规格、多配色、多尺寸 SKU 信息维护
- 关联对应类目
- 零售价、活动价设置
- 库存阈值与缺货提醒配置

### 3. 订单售后处理管理
- 正常订单、退货申请、换货申请、退款审核全流程
- 售后状态标记
- 审核意见录入
- 售后进度可视化追踪

### 4. 会员等级权益管理
- 普通会员、银卡、金卡、钻石会员等级划分
- 对应折扣权益、积分规则、生日福利配置
- 会员数据筛选与等级变更记录查看

## 项目特性

- ✅ 组件化拆分开发
- ✅ PC / 平板双端自适应
- ✅ 严格 TypeScript 类型约束
- ✅ Mock 数据驱动视图渲染
- ✅ 统一弹窗表单封装
- ✅ Vite 工程化配置合规

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 项目结构

```
src/
├── components/     # 公共组件
│   ├── Layout.tsx      # 布局组件
│   └── ModalForm.tsx   # 统一弹窗表单
├── pages/          # 页面组件
│   ├── Categories.tsx  # 分类管理
│   ├── Products.tsx    # 商品管理
│   ├── AfterSales.tsx  # 售后管理
│   └── Members.tsx     # 会员管理
├── store/          # 状态管理
│   └── index.ts
├── types/          # 类型定义
│   └── index.ts
├── mock/           # Mock 数据
│   └── index.ts
├── App.tsx         # 主应用
├── main.tsx        # 入口文件
└── index.css       # 全局样式
```
