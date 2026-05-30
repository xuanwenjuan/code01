import { Model } from 'sequelize';
import { OrderStatus } from '../types';
declare class Order extends Model {
    id: number;
    orderNo: string;
    companyName: string;
    contactPerson: string;
    contactPhone: string;
    totalAmount: number;
    depositAmount: number;
    status: OrderStatus;
    logoDesign: string;
    customRequirements: string;
    sizeStatistics: string;
    productionStartDate: Date | null;
    productionEndDate: Date | null;
    qualityCheckDate: Date | null;
    shipDate: Date | null;
    trackingNumber: string;
    shippingAddress: string;
    remarks: string;
    createdBy: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Order;
