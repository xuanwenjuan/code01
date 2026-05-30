"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const types_1 = require("../types");
class StockLock extends sequelize_1.Model {
}
StockLock.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    materialId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'materials',
            key: 'id',
        },
    },
    orderId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'orders',
            key: 'id',
        },
    },
    orderItemId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'order_items',
            key: 'id',
        },
    },
    lockQuantity: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    lockReason: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(types_1.StockLockReason)),
        allowNull: false,
    },
    lockedBy: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    lockedByName: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    unlockedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    unlockedBy: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    remarks: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: database_1.default,
    modelName: 'StockLock',
    tableName: 'stock_locks',
    indexes: [
        { fields: ['materialId'] },
        { fields: ['orderId'] },
        { fields: ['orderItemId'] },
        { fields: ['isActive'] },
        { fields: ['lockedBy'] },
    ],
});
exports.default = StockLock;
//# sourceMappingURL=StockLock.js.map