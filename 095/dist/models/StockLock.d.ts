import { Model, Optional } from 'sequelize';
import { StockLockReason } from '../types';
interface StockLockAttributes {
    id: number;
    materialId: number;
    orderId?: number;
    orderItemId?: number;
    lockQuantity: number;
    lockReason: StockLockReason;
    lockedBy: number;
    lockedByName?: string;
    unlockedAt?: Date;
    unlockedBy?: number;
    isActive: boolean;
    remarks?: string;
    createdAt: Date;
    updatedAt: Date;
}
interface StockLockCreationAttributes extends Optional<StockLockAttributes, 'id' | 'createdAt' | 'updatedAt' | 'isActive'> {
}
declare class StockLock extends Model<StockLockAttributes, StockLockCreationAttributes> implements StockLockAttributes {
    id: number;
    materialId: number;
    orderId?: number;
    orderItemId?: number;
    lockQuantity: number;
    lockReason: StockLockReason;
    lockedBy: number;
    lockedByName?: string;
    unlockedAt?: Date;
    unlockedBy?: number;
    isActive: boolean;
    remarks?: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default StockLock;
