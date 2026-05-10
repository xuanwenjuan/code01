import type { Warehouse, Location, Product, Inventory, OperationLog, InboundOrder, OutboundOrder } from '@/types'

export const warehouses: Warehouse[] = [
  {
    id: 'w001',
    code: 'WH-NORMAL',
    name: '常温库',
    type: 'normal',
    capacity: 5000,
    usedCapacity: 3200,
    status: 'active',
    createdAt: '2024-01-15',
    zones: [
      { id: 'z001', code: 'A区', name: '电子产品区', warehouseId: 'w001', capacity: 1500, usedCapacity: 1100 },
      { id: 'z002', code: 'B区', name: '日用品区', warehouseId: 'w001', capacity: 2000, usedCapacity: 1300 },
      { id: 'z003', code: 'C区', name: '服装鞋帽区', warehouseId: 'w001', capacity: 1500, usedCapacity: 800 }
    ]
  },
  {
    id: 'w002',
    code: 'WH-COLD',
    name: '冷藏库',
    type: 'cold',
    capacity: 3000,
    usedCapacity: 1800,
    status: 'active',
    createdAt: '2024-02-20',
    zones: [
      { id: 'z004', code: 'D区', name: '冷冻食品区', warehouseId: 'w002', capacity: 1500, usedCapacity: 900, temperature: '-18℃' },
      { id: 'z005', code: 'E区', name: '生鲜蔬果区', warehouseId: 'w002', capacity: 1500, usedCapacity: 900, temperature: '2-8℃' }
    ]
  },
  {
    id: 'w003',
    code: 'WH-DANGER',
    name: '危险品库',
    type: 'dangerous',
    capacity: 2000,
    usedCapacity: 500,
    status: 'active',
    createdAt: '2024-03-10',
    zones: [
      { id: 'z006', code: 'F区', name: '化学品区', warehouseId: 'w003', capacity: 1000, usedCapacity: 300, specialRequirements: '防爆通风' },
      { id: 'z007', code: 'G区', name: '易燃易爆区', warehouseId: 'w003', capacity: 1000, usedCapacity: 200, specialRequirements: '防火隔离' }
    ]
  }
]

export const locations: Location[] = [
  { id: 'l001', code: 'A-01-01', warehouseId: 'w001', zoneId: 'z001', capacity: 50, currentQuantity: 50, status: 'full' },
  { id: 'l002', code: 'A-01-02', warehouseId: 'w001', zoneId: 'z001', capacity: 50, currentQuantity: 25, status: 'partial' },
  { id: 'l003', code: 'A-01-03', warehouseId: 'w001', zoneId: 'z001', capacity: 50, currentQuantity: 0, status: 'empty' },
  { id: 'l004', code: 'A-02-01', warehouseId: 'w001', zoneId: 'z001', capacity: 50, currentQuantity: 40, status: 'partial' },
  { id: 'l005', code: 'B-01-01', warehouseId: 'w001', zoneId: 'z002', capacity: 50, currentQuantity: 35, status: 'partial' },
  { id: 'l006', code: 'B-01-02', warehouseId: 'w001', zoneId: 'z002', capacity: 50, currentQuantity: 50, status: 'full' },
  { id: 'l007', code: 'B-02-01', warehouseId: 'w001', zoneId: 'z002', capacity: 50, currentQuantity: 0, status: 'empty' },
  { id: 'l008', code: 'C-01-01', warehouseId: 'w001', zoneId: 'z003', capacity: 50, currentQuantity: 20, status: 'partial' },
  { id: 'l009', code: 'D-01-01', warehouseId: 'w002', zoneId: 'z004', capacity: 40, currentQuantity: 40, status: 'full' },
  { id: 'l010', code: 'D-01-02', warehouseId: 'w002', zoneId: 'z004', capacity: 40, currentQuantity: 15, status: 'partial' },
  { id: 'l011', code: 'E-01-01', warehouseId: 'w002', zoneId: 'z005', capacity: 40, currentQuantity: 30, status: 'partial' },
  { id: 'l012', code: 'F-01-01', warehouseId: 'w003', zoneId: 'z006', capacity: 30, currentQuantity: 10, status: 'partial' },
  { id: 'l013', code: 'G-01-01', warehouseId: 'w003', zoneId: 'z007', capacity: 30, currentQuantity: 0, status: 'empty' }
]

export const products: Product[] = [
  { id: 'p001', code: 'PRD-001', name: '智能手机X1', category: '电子产品', unit: '台', specification: '128GB/黑色', minStock: 20, maxStock: 200 },
  { id: 'p002', code: 'PRD-002', name: '笔记本电脑P20', category: '电子产品', unit: '台', specification: '15.6英寸/16GB', minStock: 10, maxStock: 100 },
  { id: 'p003', code: 'PRD-003', name: '无线蓝牙耳机', category: '电子产品', unit: '副', specification: '降噪版', minStock: 50, maxStock: 500 },
  { id: 'p004', code: 'PRD-004', name: '洗衣液5L装', category: '日用品', unit: '桶', specification: '薰衣草香型', minStock: 100, maxStock: 1000 },
  { id: 'p005', code: 'PRD-005', name: '抽纸(24包)', category: '日用品', unit: '箱', specification: '三层/200抽', minStock: 80, maxStock: 800 },
  { id: 'p006', code: 'PRD-006', name: '男士商务衬衫', category: '服装', unit: '件', specification: 'M码/白色', minStock: 30, maxStock: 300 },
  { id: 'p007', code: 'PRD-007', name: '进口牛排', category: '冷冻食品', unit: '盒', specification: '500g/盒', minStock: 20, maxStock: 200 },
  { id: 'p008', code: 'PRD-008', name: '有机蔬菜套装', category: '生鲜蔬果', unit: '箱', specification: '5kg/箱', minStock: 15, maxStock: 150 },
  { id: 'p009', code: 'PRD-009', name: '工业清洁剂', category: '化学品', unit: '桶', specification: '20L/桶', minStock: 5, maxStock: 50 },
  { id: 'p010', code: 'PRD-010', name: '运动跑鞋', category: '服装', unit: '双', specification: '42码/黑色', minStock: 25, maxStock: 250 }
]

export const inventories: Inventory[] = [
  { id: 'inv001', productId: 'p001', productCode: 'PRD-001', productName: '智能手机X1', category: '电子产品', warehouseId: 'w001', warehouseName: '常温库', zoneId: 'z001', locationId: 'l001', locationCode: 'A-01-01', quantity: 50, status: 'on-shelf', batchNo: 'B202411001', productionDate: '2024-10-15', inboundDate: '2024-11-01', lastModified: '2024-11-15' },
  { id: 'inv002', productId: 'p002', productCode: 'PRD-002', productName: '笔记本电脑P20', category: '电子产品', warehouseId: 'w001', warehouseName: '常温库', zoneId: 'z001', locationId: 'l002', locationCode: 'A-01-02', quantity: 25, status: 'on-shelf', batchNo: 'B202411002', productionDate: '2024-10-20', inboundDate: '2024-11-05', lastModified: '2024-11-16' },
  { id: 'inv003', productId: 'p003', productCode: 'PRD-003', productName: '无线蓝牙耳机', category: '电子产品', warehouseId: 'w001', warehouseName: '常温库', zoneId: 'z001', locationId: 'l004', locationCode: 'A-02-01', quantity: 40, status: 'picking', batchNo: 'B202411003', productionDate: '2024-10-25', inboundDate: '2024-11-08', lastModified: '2024-11-18' },
  { id: 'inv004', productId: 'p004', productCode: 'PRD-004', productName: '洗衣液5L装', category: '日用品', warehouseId: 'w001', warehouseName: '常温库', zoneId: 'z002', locationId: 'l005', locationCode: 'B-01-01', quantity: 35, status: 'on-shelf', batchNo: 'B202411004', productionDate: '2024-09-15', inboundDate: '2024-10-15', lastModified: '2024-11-10' },
  { id: 'inv005', productId: 'p005', productCode: 'PRD-005', productName: '抽纸(24包)', category: '日用品', warehouseId: 'w001', warehouseName: '常温库', zoneId: 'z002', locationId: 'l006', locationCode: 'B-01-02', quantity: 50, status: 'on-shelf', batchNo: 'B202411005', productionDate: '2024-10-01', inboundDate: '2024-10-20', lastModified: '2024-11-12' },
  { id: 'inv006', productId: 'p006', productCode: 'PRD-006', productName: '男士商务衬衫', category: '服装', warehouseId: 'w001', warehouseName: '常温库', zoneId: 'z003', locationId: 'l008', locationCode: 'C-01-01', quantity: 20, status: 'on-shelf', batchNo: 'B202411006', productionDate: '2024-09-20', inboundDate: '2024-10-10', lastModified: '2024-11-05' },
  { id: 'inv007', productId: 'p007', productCode: 'PRD-007', productName: '进口牛排', category: '冷冻食品', warehouseId: 'w002', warehouseName: '冷藏库', zoneId: 'z004', locationId: 'l009', locationCode: 'D-01-01', quantity: 40, status: 'on-shelf', batchNo: 'B202411007', productionDate: '2024-11-01', expiryDate: '2025-05-01', inboundDate: '2024-11-10', lastModified: '2024-11-18' },
  { id: 'inv008', productId: 'p008', productCode: 'PRD-008', productName: '有机蔬菜套装', category: '生鲜蔬果', warehouseId: 'w002', warehouseName: '冷藏库', zoneId: 'z005', locationId: 'l011', locationCode: 'E-01-01', quantity: 30, status: 'on-shelf', batchNo: 'B202411008', productionDate: '2024-11-15', expiryDate: '2024-11-30', inboundDate: '2024-11-16', lastModified: '2024-11-17' },
  { id: 'inv009', productId: 'p009', productCode: 'PRD-009', productName: '工业清洁剂', category: '化学品', warehouseId: 'w003', warehouseName: '危险品库', zoneId: 'z006', locationId: 'l012', locationCode: 'F-01-01', quantity: 10, status: 'on-shelf', batchNo: 'B202411009', productionDate: '2024-08-01', inboundDate: '2024-09-01', lastModified: '2024-10-20' },
  { id: 'inv010', productId: 'p010', productCode: 'PRD-010', productName: '运动跑鞋', category: '服装', warehouseId: 'w001', warehouseName: '常温库', zoneId: 'z003', locationId: 'l008', locationCode: 'C-01-01', quantity: 8, status: 'on-shelf', batchNo: 'B202411010', productionDate: '2024-09-15', inboundDate: '2024-10-05', lastModified: '2024-11-15' }
]

export const operationLogs: OperationLog[] = [
  { id: 'log001', operationType: 'inbound', operationTitle: '商品入库上架', operator: '张伟', operatorRole: '仓管员', operationTime: '2024-11-18 14:30:25', details: '将智能手机X1（批次B202411001）上架至A-01-01货位，数量50台', relatedProduct: '智能手机X1', relatedWarehouse: '常温库', ipAddress: '192.168.1.101' },
  { id: 'log002', operationType: 'outbound', operationTitle: '订单拣货出库', operator: '李娜', operatorRole: '拣货员', operationTime: '2024-11-18 10:15:42', details: '从A-02-01货位拣选无线蓝牙耳机30副，订单号SO20241118001', relatedProduct: '无线蓝牙耳机', relatedWarehouse: '常温库', ipAddress: '192.168.1.102' },
  { id: 'log003', operationType: 'transfer', operationTitle: '库内移库操作', operator: '王明', operatorRole: '仓管员', operationTime: '2024-11-17 16:45:18', details: '将笔记本电脑P20从A-01-03移至A-01-02货位，数量25台', relatedProduct: '笔记本电脑P20', relatedWarehouse: '常温库', ipAddress: '192.168.1.103' },
  { id: 'log004', operationType: 'inventory-check', operationTitle: '库存盘点修正', operator: '陈经理', operatorRole: '仓储主管', operationTime: '2024-11-15 09:20:33', details: '盘点发现洗衣液实际库存比账面少2桶，已调整', relatedProduct: '洗衣液5L装', relatedWarehouse: '常温库', ipAddress: '192.168.1.104' },
  { id: 'log005', operationType: 'adjustment', operationTitle: '库存数量调整', operator: '陈经理', operatorRole: '仓储主管', operationTime: '2024-11-14 15:30:00', details: '因质量问题，将5桶工业清洁剂从库存中移除', relatedProduct: '工业清洁剂', relatedWarehouse: '危险品库', ipAddress: '192.168.1.104' },
  { id: 'log006', operationType: 'inbound', operationTitle: '商品入库上架', operator: '张伟', operatorRole: '仓管员', operationTime: '2024-11-16 11:20:15', details: '将进口牛排（批次B202411007）上架至D-01-01货位，数量40盒', relatedProduct: '进口牛排', relatedWarehouse: '冷藏库', ipAddress: '192.168.1.101' }
]

export const inboundOrders: InboundOrder[] = [
  {
    id: 'in001',
    orderNo: 'PO20241118001',
    supplier: '深圳电子科技有限公司',
    operator: '张伟',
    status: 'completed',
    createTime: '2024-11-18 09:00:00',
    completeTime: '2024-11-18 14:30:25',
    products: [
      { productId: 'p001', productCode: 'PRD-001', productName: '智能手机X1', quantity: 50, unit: '台', batchNo: 'B202411001', productionDate: '2024-10-15' }
    ]
  },
  {
    id: 'in002',
    orderNo: 'PO20241116001',
    supplier: '澳大利亚肉类进口公司',
    operator: '张伟',
    status: 'completed',
    createTime: '2024-11-16 08:00:00',
    completeTime: '2024-11-16 11:20:15',
    products: [
      { productId: 'p007', productCode: 'PRD-007', productName: '进口牛排', quantity: 40, unit: '盒', batchNo: 'B202411007', productionDate: '2024-11-01', expiryDate: '2025-05-01' }
    ]
  },
  {
    id: 'in003',
    orderNo: 'PO20241119001',
    supplier: '广州日用品制造有限公司',
    operator: '',
    status: 'pending',
    createTime: '2024-11-19 10:00:00',
    products: [
      { productId: 'p004', productCode: 'PRD-004', productName: '洗衣液5L装', quantity: 100, unit: '桶', batchNo: 'B202411011', productionDate: '2024-11-01' },
      { productId: 'p005', productCode: 'PRD-005', productName: '抽纸(24包)', quantity: 80, unit: '箱', batchNo: 'B202411012', productionDate: '2024-11-05' }
    ],
    remark: '预计今日下午到货'
  }
]

export const outboundOrders: OutboundOrder[] = [
  {
    id: 'out001',
    orderNo: 'SO20241118001',
    customer: '北京电商平台有限公司',
    operator: '李娜',
    status: 'picking',
    createTime: '2024-11-18 09:30:00',
    products: [
      { productId: 'p003', productCode: 'PRD-003', productName: '无线蓝牙耳机', quantity: 30, unit: '副', pickedQuantity: 20 }
    ]
  },
  {
    id: 'out002',
    orderNo: 'SO20241117001',
    customer: '上海餐饮连锁有限公司',
    operator: '李娜',
    status: 'completed',
    createTime: '2024-11-17 10:00:00',
    completeTime: '2024-11-17 18:30:00',
    products: [
      { productId: 'p007', productCode: 'PRD-007', productName: '进口牛排', quantity: 20, unit: '盒', pickedQuantity: 20 },
      { productId: 'p008', productCode: 'PRD-008', productName: '有机蔬菜套装', quantity: 15, unit: '箱', pickedQuantity: 15 }
    ]
  },
  {
    id: 'out003',
    orderNo: 'SO20241119001',
    customer: '广州贸易有限公司',
    operator: '',
    status: 'pending',
    createTime: '2024-11-19 11:00:00',
    products: [
      { productId: 'p002', productCode: 'PRD-002', productName: '笔记本电脑P20', quantity: 10, unit: '台', pickedQuantity: 0 }
    ]
  }
]

export const categories = ['电子产品', '日用品', '服装', '冷冻食品', '生鲜蔬果', '化学品']
