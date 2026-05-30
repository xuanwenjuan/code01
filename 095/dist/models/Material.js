"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const types_1 = require("../types");
class Material extends sequelize_1.Model {
}
Material.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    batchNo: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    type: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(types_1.MaterialType)),
        allowNull: false,
    },
    specification: {
        type: sequelize_1.DataTypes.STRING(200),
        allowNull: true,
    },
    unit: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
    },
    stockQuantity: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    lockedQuantity: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        comment: '已锁定的库存数量',
    },
    availableQuantity: {
        type: sequelize_1.DataTypes.VIRTUAL,
        get() {
            return Number(this.stockQuantity) - Number(this.lockedQuantity);
        },
        comment: '可用库存数量（虚拟字段）',
    },
    warningThreshold: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 10,
    },
    unitPrice: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    supplier: {
        type: sequelize_1.DataTypes.STRING(200),
        allowNull: true,
    },
    supplierPhone: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: true,
    },
    supplierAddress: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: true,
    },
    purchaseDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    storageDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    origin: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    color: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
    },
    weight: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
    },
    width: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
    },
    usage: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(types_1.MaterialStatus)),
        allowNull: false,
        defaultValue: types_1.MaterialStatus.IN_STOCK,
    },
    remarks: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: database_1.default,
    modelName: 'Material',
    tableName: 'materials',
});
exports.default = Material;
//# sourceMappingURL=Material.js.map