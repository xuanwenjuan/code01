import { Model } from 'sequelize';
declare class OrderItem extends Model {
    id: number;
    orderId: number;
    productId: number;
    productName: string;
    productCode: string;
    quantity: number;
    unitPrice: number;
    customFee: number;
    materialCost: number;
    totalPrice: number;
    sizeDetails: string;
    remarks: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default OrderItem;
