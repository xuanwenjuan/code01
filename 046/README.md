# 连锁茶饮品牌门店运营管理工作台

基于 React 18 + TypeScript + Vite 构建的现代化茶饮门店运营管理系统。

## 技术栈

- **核心框架**: React 18 + TypeScript + Vite
- **状态管理**: Zustand (支持本地持久化)
- **UI 组件**: Ant Design 5
- **数据模拟**: Mock.js
- **路由管理**: React Router Dom

## 功能模块

### 1. 饮品品类与菜单管理
- 多级品类结构（鲜果茶、奶绿、咖啡、小食等）
- 饮品上架/下架管理
- 售价调整与原价对比
- 规格配置（甜度、冰度等）
- 搜索与分类筛选

### 2. 门店员工人事管理
- 员工信息录入与编辑
- 岗位归属管理（店长、调饮师、收银员、保洁员）
- 在职/离职/休假状态管理
- 排班班次绑定
- 多门店支持

### 3. 每日营业订单管理
- 堂食/外卖订单全流程管理
- 订单状态流转：待接单 → 制作中 → 已出餐 → 已完成 → 已取消
- 订单详情查看
- 营业数据汇总统计（今日订单、已完成、营业总额、客单价）

### 4. 原料库存损耗管理
- 原料分类管理（茶底、奶品、配料、包装）
- 入库登记与出库调整
- 库存预警机制
- 临期原料标识
- 多条件筛选查询

## 项目特性

- ✅ 组件化拆分开发
- ✅ PC / 平板双端自适应布局
- ✅ 严格 TypeScript 类型约束
- ✅ Mock 数据驱动视图渲染
- ✅ 统一弹窗与表单封装
- ✅ Zustand 状态持久化存储
- ✅ Ant Design 5 主题定制
- ✅ Vite 工程化配置

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

## 项目结构

```
src/
├── components/          # 公共组件
│   ├── Layout.tsx      # 布局组件
│   └── Layout.less     # 布局样式
├── pages/              # 页面组件
│   ├── MenuManagement.tsx       # 菜单管理
│   ├── EmployeeManagement.tsx   # 员工管理
│   ├── OrderManagement.tsx      # 订单管理
│   └── InventoryManagement.tsx  # 库存管理
├── stores/             # Zustand 状态管理
│   └── index.ts
├── types/              # TypeScript 类型定义
│   └── index.ts
├── mock/               # Mock 数据模拟
│   └── index.ts
├── main.tsx           # 应用入口
├── App.tsx            # 根组件
└── index.css          # 全局样式
```

## 数据持久化

项目使用 Zustand 的 persist 中间件，所有状态数据会自动保存到 localStorage 中，刷新页面后数据不会丢失。

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge
