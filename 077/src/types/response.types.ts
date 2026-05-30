export interface IApiResponse<T = any> {
  code: number;
  message: string;
  data: T | null;
  success: boolean;
  timestamp: number;
}

export interface IPaginationParams {
  page: number;
  pageSize: number;
}

export interface IPaginationResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface IListResponse<T> extends IApiResponse<IPaginationResult<T>> {}

export interface ILoginResponse {
  token: string;
  expiresIn: number;
  user: {
    id: number;
    username: string;
    realName: string;
    phone: string;
    email?: string;
    role: string;
    status: number;
  };
}

export interface IOrderDetailResponse {
  order: any;
  orderLogs: any[];
  paymentRecords: any[];
}

export interface IDashboardStats {
  totalCustomers: number;
  totalEquipments: number;
  activeEquipments: number;
  totalOrders: number;
  activeOrders: number;
  thisMonthIncome: number;
  overdueOrders: number;
  maintenanceDue: number;
}
