export type Status = 'active' | 'inactive'

export const StatusLabel: Record<Status, string> = {
  active: '启用',
  inactive: '停用'
}

export enum WineCategory {
  IMPORTED_WINE = 'imported_wine',
  SPIRITS = 'spirits',
  CRAFT_BEER = 'craft_beer',
  CHINESE_LIQUOR = 'chinese_liquor'
}

export const WineCategoryLabel: Record<WineCategory, string> = {
  [WineCategory.IMPORTED_WINE]: '进口红酒',
  [WineCategory.SPIRITS]: '洋酒',
  [WineCategory.CRAFT_BEER]: '精酿啤酒',
  [WineCategory.CHINESE_LIQUOR]: '国产白酒'
}

export interface WineBrand {
  readonly id: string
  name: string
  category: WineCategory
  origin: string
  alcoholContent: number
  vintage?: number
  level: string
  status: Status
  readonly createTime: string
  updateTime?: string
}

export interface WineBrandFilters {
  category?: WineCategory | ''
  status?: Status | ''
  keyword?: string
}

export interface WineBrandForm {
  name: string
  category: WineCategory
  origin: string
  alcoholContent: number
  vintage?: number
  level: string
  status: Status
}

export enum CooperationLevel {
  DIAMOND = 'diamond',
  GOLD = 'gold',
  SILVER = 'silver',
  BRONZE = 'bronze'
}

export const CooperationLevelLabel: Record<CooperationLevel, string> = {
  [CooperationLevel.DIAMOND]: '钻石级',
  [CooperationLevel.GOLD]: '黄金级',
  [CooperationLevel.SILVER]: '白银级',
  [CooperationLevel.BRONZE]: '青铜级'
}

export enum SettlementMethod {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  CASH = 'cash'
}

export const SettlementMethodLabel: Record<SettlementMethod, string> = {
  [SettlementMethod.MONTHLY]: '月结',
  [SettlementMethod.QUARTERLY]: '季结',
  [SettlementMethod.YEARLY]: '年结',
  [SettlementMethod.CASH]: '现款'
}

export interface Supplier {
  readonly id: string
  name: string
  contactPerson: string
  phone: string
  address: string
  channel: string
  cooperationLevel: CooperationLevel
  supplyCycle: number
  settlementMethod: SettlementMethod
  cooperationStartDate: string
  cooperationEndDate?: string
  status: Status
  readonly createTime: string
  updateTime?: string
}

export interface SupplierFilters {
  cooperationLevel?: CooperationLevel | ''
  status?: Status | ''
  keyword?: string
}

export interface SupplierForm {
  name: string
  contactPerson: string
  phone: string
  address: string
  channel: string
  cooperationLevel: CooperationLevel
  supplyCycle: number
  settlementMethod: SettlementMethod
  cooperationStartDate: string
  cooperationEndDate?: string
  status: Status
}

export enum PurchaseType {
  NORMAL = 'normal',
  RETURN = 'return'
}

export const PurchaseTypeLabel: Record<PurchaseType, string> = {
  [PurchaseType.NORMAL]: '正常入库',
  [PurchaseType.RETURN]: '退货入库'
}

export enum PurchaseStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export const PurchaseStatusLabel: Record<PurchaseStatus, string> = {
  [PurchaseStatus.PENDING]: '待审核',
  [PurchaseStatus.APPROVED]: '已入库',
  [PurchaseStatus.REJECTED]: '已驳回'
}

export interface PurchaseItem {
  readonly id?: string
  wineBrandId: string
  wineBrandName: string
  quantity: number
  unitPrice: number
}

export interface PurchaseOrder {
  readonly id: string
  orderNo: string
  supplierId: string
  supplierName: string
  type: PurchaseType
  batchNo: string
  items: PurchaseItem[]
  totalAmount: number
  status: PurchaseStatus
  auditor?: string
  auditTime?: string
  rejectReason?: string
  remark?: string
  readonly createTime: string
  updateTime?: string
}

export interface PurchaseFilters {
  type?: PurchaseType | ''
  status?: PurchaseStatus | ''
  keyword?: string
  startDate?: string
  endDate?: string
}

export interface PurchaseForm {
  supplierId: string
  supplierName: string
  type: PurchaseType
  batchNo: string
  items: PurchaseItem[]
  remark?: string
}

export enum SaleType {
  SINGLE = 'single',
  BATCH = 'batch'
}

export const SaleTypeLabel: Record<SaleType, string> = {
  [SaleType.SINGLE]: '单品出库',
  [SaleType.BATCH]: '批量出库'
}

export interface SaleItem {
  readonly id?: string
  wineBrandId: string
  wineBrandName: string
  quantity: number
  unitPrice: number
}

export interface SaleOrder {
  readonly id: string
  orderNo: string
  customerName: string
  customerPhone: string
  type: SaleType
  items: SaleItem[]
  totalAmount: number
  remark?: string
  readonly createTime: string
}

export interface Inventory {
  readonly id: string
  wineBrandId: string
  wineBrandName: string
  category: WineCategory
  quantity: number
  warningQuantity: number
  batchNo: string
  productionDate: string
  expiryDate: string
  unitPrice: number
  readonly createTime: string
  updateTime?: string
}

export type WarningType = 'low' | 'expiring' | ''

export interface InventoryFilters {
  category?: WineCategory | ''
  warning?: WarningType
  keyword?: string
  batchNo?: string
}

export interface InventoryForm {
  wineBrandId: string
  wineBrandName: string
  category: WineCategory
  quantity: number
  warningQuantity: number
  batchNo: string
  productionDate: string
  expiryDate: string
  unitPrice: number
}

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export type FormMode = 'add' | 'edit' | 'view'

export interface SelectOption {
  label: string
  value: string | number
}

export interface TableColumn {
  prop: string
  label: string
  width?: number
  minWidth?: number
  fixed?: 'left' | 'right'
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
}

export interface PaginationParams {
  page: number
  pageSize: number
  total?: number
}

export type SortOrder = 'asc' | 'desc' | null

export interface SortParams {
  prop: string
  order: SortOrder
}

export type DialogType = 'alert' | 'confirm' | 'prompt' | 'form'

export interface DialogOptions {
  title: string
  message?: string
  confirmButtonText?: string
  cancelButtonText?: string
  showClose?: boolean
  closeOnClickModal?: boolean
}

export interface LoadingOptions {
  text?: string
  background?: string
}

export interface ValidationRule {
  required?: boolean
  message?: string
  trigger?: string | string[]
  type?: string
  min?: number
  max?: number
  pattern?: RegExp
  validator?: (rule: ValidationRule, value: unknown) => Promise<void>
}

export type Recordable<T = unknown> = Record<string, T>

export type Nullable<T> = T | null

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type ArrayElement<A> = A extends readonly (infer T)[] ? T : never

export type FunctionType = (...args: unknown[]) => unknown
