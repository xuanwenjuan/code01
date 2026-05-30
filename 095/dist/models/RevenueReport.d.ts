import { Model } from 'sequelize';
declare class RevenueReport extends Model {
    id: number;
    reportDate: Date;
    categoryId: number | null;
    totalOrders: number;
    totalQuantity: number;
    totalAmount: number;
    materialCost: number;
    processingFee: number;
    grossProfit: number;
    grossProfitRate: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default RevenueReport;
