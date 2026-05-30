"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const Order_1 = __importDefault(require("./Order"));
const User_1 = __importDefault(require("./User"));
const types_1 = require("../types");
class OrderLog extends sequelize_1.Model {
}
OrderLog.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    orderId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Order_1.default,
            key: 'id',
        },
    },
    operatorId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User_1.default,
            key: 'id',
        },
    },
    operatorName: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
    },
    previousStatus: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(types_1.OrderStatus)),
        allowNull: true,
    },
    newStatus: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(types_1.OrderStatus)),
        allowNull: false,
    },
    action: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    remarks: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: database_1.default,
    modelName: 'OrderLog',
    tableName: 'order_logs',
    timestamps: true,
    updatedAt: false,
});
OrderLog.belongsTo(Order_1.default, { foreignKey: 'orderId', as: 'order' });
Order_1.default.hasMany(OrderLog, { foreignKey: 'orderId', as: 'logs' });
OrderLog.belongsTo(User_1.default, { foreignKey: 'operatorId', as: 'operator' });
User_1.default.hasMany(OrderLog, { foreignKey: 'operatorId', as: 'orderLogs' });
exports.default = OrderLog;
//# sourceMappingURL=OrderLog.js.map