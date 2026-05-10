# 智慧校园无人便利店管理系统

## 项目介绍

基于 Vue3 + TypeScript + Vite 构建的智慧校园无人便利店纯前端管理系统，支持商品与分类管理、智能出入库管理、操作履历与审计、多条件高级筛选等功能。

## 技术栈

- **核心框架**: Vue 3.4 + TypeScript 5 + Vite 5
- **状态管理**: Pinia 2 + pinia-plugin-persistedstate（持久化）
- **UI 组件库**: Element Plus 2
- **数据模拟**: Mock.js
- **日期处理**: dayjs
- **工程化**: unplugin-auto-import + unplugin-vue-components（Element Plus 按需引入）

## 功能模块

### 1. 商品与分类管理
- ✅ 商品分类的增删改查（零食、文具、速食、饮料、日用品等）
- ✅ 商品基础信息录入、编辑
- ✅ 库存可视化展示
- ✅ 过期/临期商品自动高亮预警

### 2. 智能出入库管理
- ✅ 商品入库操作
- ✅ 模拟售卖扣减库存
- ✅ 临期/残次商品下架
- ✅ 库存变动记录追溯
- ✅ 过期自动预警高亮提示

### 3. 操作履历与审计
- ✅ 自动记录管理员的各项操作日志
- ✅ 支持按时间、操作人多维度查询追溯
- ✅ 操作类型、模块、详情完整记录

### 4. 多条件高级筛选
- ✅ 按商品名称/条码关键词搜索
- ✅ 按商品分类筛选
- ✅ 按库存状态筛选（正常/库存不足/已售罄）
- ✅ 按保质期状态筛选（正常/临期/已过期）
- ✅ 组合条件筛选

## 项目特性

- 📦 **组件化设计**: 高内聚低耦合的组件架构
- 📱 **响应式布局**: 完美适配移动端与 PC 端
- 🔒 **类型安全**: 严格的 TypeScript 类型约束，无 any 类型
- 🎭 **Mock 驱动**: 完整的 Mock 数据层，无需后端即可运行
- 🎨 **统一封装**: 统一的弹窗、表单、表格组件
- ⚙️ **工程化**: 规范的 Vite 配置，支持路径别名、按需引入
- 💾 **状态持久化**: Pinia 数据自动持久化到 localStorage

## 项目结构

```
src/
├── api/                    # API 接口封装
│   └── index.ts
├── components/             # 公共组件
│   └── common/
│       ├── BaseDialog.vue  # 统一弹窗组件
│       ├── BaseTable.vue   # 统一表格组件
│       └── StatusTag.vue   # 状态标签组件
├── mock/                   # Mock 数据模拟
│   └── index.ts
├── router/                 # 路由配置
│   └── index.ts
├── stores/                 # Pinia 状态管理
│   ├── category.ts         # 分类 store
│   ├── product.ts          # 商品 store
│   ├── inventory.ts        # 库存 store
│   └── log.ts              # 日志 store
├── styles/                 # 全局样式
│   └── index.scss
├── types/                  # TypeScript 类型定义
│   ├── index.ts
│   └── product.ts
├── views/                  # 页面组件
│   ├── ProductsView.vue    # 商品管理页面
│   ├── CategoriesView.vue  # 分类管理页面
│   ├── InventoryView.vue   # 库存管理页面
│   └── LogsView.vue        # 操作日志页面
├── App.vue                 # 根组件
├── main.ts                 # 入口文件
└── vite-env.d.ts           # Vite 环境类型
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 商品状态说明

| 状态 | 说明 | 标签颜色 |
|------|------|----------|
| normal | 正常 | 绿色 |
| low_stock | 库存不足 | 橙色 |
| out_of_stock | 已售罄 | 红色 |
| expiring_soon | 即将过期（7天内）| 橙色 |
| expired | 已过期 | 红色 |

## 库存操作类型

| 类型 | 说明 |
|------|------|
| in | 商品入库（增加库存） |
| out | 商品出库（减少库存） |
| sale | 模拟售卖（减少库存） |
| offline | 临期/残次下架（减少库存） |

## 浏览器兼容性

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 许可证

MIT License
