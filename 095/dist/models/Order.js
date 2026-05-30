"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const types_1 = require("../types");
const User_1 = __importDefault(require("./User"));
class Order extends sequelize_1.Model {
}
Order.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    orderNo: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    companyName: {
        type: sequelize_1.DataTypes.STRING(200),
        allowNull: false,
    },
    contactPerson: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
    },
    contactPhone: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
    },
    totalAmount: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
    },
    depositAmount: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(types_1.OrderStatus)),
        allowNull: false,
        defaultValue: types_1.OrderStatus.PENDING_PAYMENT,
    },
    logoDesign: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('logoDesign');
            return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
            this.setDataValue('logoDesign', JSON.stringify(value));
        },
    },
    customRequirements: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    sizeStatistics: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('sizeStatistics');
            return rawValue ? JSON.parse(rawValue) : {};
        },
        set(value) {
            this.setDataValue('sizeStatistics', JSON.stringify(value));
        },
    },
    productionStartDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    productionEndDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    qualityCheckDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    shipDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    trackingNumber: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    shippingAddress: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: true,
    },
    remarks: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    createdBy: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User_1.default,
            key: 'id',
        },
    },
}, {
    sequelize: database_1.default,
    modelName: 'Order',
    tableName: 'orders',
});
Order.belongsTo(User_1.default, { foreignKey: 'createdBy', as: 'creator' });
User_1.default.hasMany(Order, { foreignKey: 'createdBy', as: 'orders' });
exports.default = Order;
//# sourceMappingURL=Order.js.map