import { Model } from 'sequelize';
import { OrderStatus } from '../types';
declare class OrderLog extends Model {
    id: number;
    orderId: number;
    operatorId: number;
    operatorName: string;
    previousStatus: OrderStatus | null;
    newStatus: OrderStatus;
    action: string;
    remarks: string;
    readonly createdAt: Date;
}
export default OrderLog;
