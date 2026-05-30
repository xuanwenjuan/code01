# 跨境进出口报关业务管理工作台

基于 Vue3 + TypeScript + Vite 构建的现代化报关业务管理系统。

## 技术栈

- **前端框架**: Vue 3.4 +
- **开发语言**: TypeScript
- **构建工具**: Vite
- **状态管理**: Pinia + 本地持久化
- **UI组件库**: Element Plus
- **数据模拟**: Mock.js
- **日期处理**: Day.js

## 功能模块

### 1. 报关企业客户管理
- 维护外贸企业客户档案
- 统一社会信用代码管理
- 进出口资质管理
- 报关签约状态管理
- 合作有效期管理
- 客户信息编辑
- 到期资质预警提醒

### 2. 商品备案类目管理
- 按机电、化工、纺织、食品等划分报关商品类目
- 商品编码维护
- 申报要素管理
- 监管条件配置
- 征免性质设置
- 类目新增编辑与停用管控

### 3. 报关单业务管理
- 报关单录入与申报
- 海关审核流程管理
- 查验放行流程管理
- 办结归档流程管理
- 报关单状态流转
- 申报进度可视化展示

### 4. 费用对账结算管理
- 报关服务费记录
- 港杂费用管理
- 税费明细管理
- 按客户分类统计
- 按月份分类统计
- 按结算状态分类统计
- 账单预览功能
- 待结算/已结算状态标识

## 项目特性

- ✅ 组件化开发，代码结构清晰
- ✅ PC/平板双端自适应响应式布局
- ✅ 严格 TypeScript 类型约束，禁止 any 类型
- ✅ Mock.js 数据驱动页面渲染
- ✅ 统一弹窗表单封装
- ✅ Vite 工程化配置，构建速度快
- ✅ Pinia 全局状态管理 + 本地持久化

## 项目结构

```
src/
├── components/         # 公共组件
│   ├── CustomerForm.vue
│   ├── ProductForm.vue
│   └── DeclarationForm.vue
├── stores/            # Pinia 状态管理
│   ├── customer.ts
│   ├── product.ts
│   ├── declaration.ts
│   └── settlement.ts
├── views/             # 页面视图
│   ├── Dashboard.vue
│   ├── customer/
│   ├── product/
│   ├── declaration/
│   └── settlement/
├── layout/            # 布局组件
│   └── index.vue
├── router/            # 路由配置
│   └── index.ts
├── mock/              # Mock 数据
│   └── index.ts
├── types/             # TypeScript 类型定义
│   └── index.ts
├── styles/            # 全局样式
│   ├── variables.scss
│   └── global.scss
├── App.vue
└── main.ts
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 开发规范

1. 使用 TypeScript 严格模式，避免使用 `any` 类型
2. 组件采用 Composition API 风格
3. 使用 `<script setup>` 语法糖
4. 样式采用 Scoped SCSS
5. 遵循 Element Plus 组件使用规范
6. 统一的错误处理和用户反馈机制
