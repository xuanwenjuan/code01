import Mock from 'mockjs'
import { Supplier, Material, InquiryOrder, DeliveryRecord } from '@/types'

const Random = Mock.Random

const supplierCategories: Supplier['category'][] = ['五金', '塑胶', '电子', '冲压件']
const cooperationStatuses: Supplier['cooperationStatus'][] = ['合作中', '已暂停', '待审核', '已终止']

export const mockSuppliers: Supplier[] = Mock.mock({
  'list|20': [
    {
      id: '@id',
      name: '@city()@pick(["精密机械","五金制品","电子科技","塑胶工业","冲压件厂"])有限公司',
      category: () => Random.pick(supplierCategories),
      qualification: '@pick(["ISO9001","ISO14001","IATF16949","CE认证"])',
      contactPerson: '@cname',
      contactPhone: /^1[3-9]\d{9}$/,
      cooperationStatus: () => Random.pick(cooperationStatuses),
      qualificationExpireDate: '@date("2024-06-01", "2026-12-31")',
      isExpiringSoon: () => Random.boolean(30, 70, true),
      createTime: '@datetime',
      updateTime: '@datetime',
    },
  ],
}).list

const materialCategories = ['传动件', '紧固件', '密封件', '轴承', '齿轮', '弹簧']
const units = ['个', '件', '套', '箱', 'KG']

export const mockMaterials: Material[] = Mock.mock({
  'list|30': [
    {
      id: '@id',
      code: () => `MAT${Random.integer(10000, 99999)}`,
      name: '@pick(["轴承","齿轮","螺栓","螺母","密封圈","弹簧","传动轴","法兰","垫片","销钉"])',
      specification: '@pick(["φ20mm","φ30mm","M10","M12","φ50mm","φ15mm"])-@pick(["A","B","C"])',
      material: '@pick(["不锈钢304","碳钢","铝合金","铜","工程塑料"])',
      purchasePrice: () => Random.float(1, 500, 2, 2),
      safetyStock: () => Random.integer(10, 500),
      category: () => Random.pick(materialCategories),
      unit: () => Random.pick(units),
      createTime: '@datetime',
      updateTime: '@datetime',
    },
  ],
}).list

const orderStatuses: InquiryOrder['status'][] = ['待确认', '已下单', '供货中', '已交付']

export const mockInquiryOrders: InquiryOrder[] = Mock.mock({
  'list|25': [
    {
      id: '@id',
      orderNo: () => `INQ${Random.date('yyyyMMdd')}${Random.integer(100, 999)}`,
      supplierId: () => mockSuppliers[Random.integer(0, mockSuppliers.length - 1)].id,
      supplierName: () => mockSuppliers[Random.integer(0, mockSuppliers.length - 1)].name,
      materialId: () => mockMaterials[Random.integer(0, mockMaterials.length - 1)].id,
      materialName: () => mockMaterials[Random.integer(0, mockMaterials.length - 1)].name,
      quantity: () => Random.integer(10, 1000),
      inquiryPrice: () => Random.float(10, 300, 2, 2),
      quotedPrice: () => Random.boolean() ? Random.float(10, 300, 2, 2) : null,
      status: () => Random.pick(orderStatuses),
      createTime: '@datetime',
      confirmTime: () => Random.boolean() ? Random.datetime() : null,
    },
  ],
}).list

const qualityResults: DeliveryRecord['qualityResult'][] = ['合格', '不合格', '待检验']
const settlementStatuses: DeliveryRecord['settlementStatus'][] = ['待对账', '对账中', '已结算', '已逾期']

export const mockDeliveryRecords: DeliveryRecord[] = Mock.mock({
  'list|30': [
    {
      id: '@id',
      deliveryNo: () => `DEL${Random.date('yyyyMMdd')}${Random.integer(100, 999)}`,
      supplierId: () => mockSuppliers[Random.integer(0, mockSuppliers.length - 1)].id,
      supplierName: () => mockSuppliers[Random.integer(0, mockSuppliers.length - 1)].name,
      materialId: () => mockMaterials[Random.integer(0, mockMaterials.length - 1)].id,
      materialName: () => mockMaterials[Random.integer(0, mockMaterials.length - 1)].name,
      quantity: () => Random.integer(10, 500),
      deliveryDate: '@date("2024-01-01", "2025-12-31")',
      qualityResult: () => Random.pick(qualityResults),
      settlementAmount: () => Random.float(1000, 50000, 2, 2),
      settlementStatus: () => Random.pick(settlementStatuses),
      createTime: '@datetime',
    },
  ],
}).list
