"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const Category_1 = __importDefault(require("./Category"));
class RevenueReport extends sequelize_1.Model {
}
RevenueReport.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    reportDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    categoryId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Category_1.default,
            key: 'id',
        },
    },
    totalOrders: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    totalQuantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    totalAmount: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
    },
    materialCost: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
    },
    processingFee: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
    },
    grossProfit: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
    },
    grossProfitRate: {
        type: sequelize_1.DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
    },
}, {
    sequelize: database_1.default,
    modelName: 'RevenueReport',
    tableName: 'revenue_reports',
});
RevenueReport.belongsTo(Category_1.default, { foreignKey: 'categoryId', as: 'category' });
Category_1.default.hasMany(RevenueReport, { foreignKey: 'categoryId', as: 'revenueReports' });
exports.default = RevenueReport;
//# sourceMappingURL=RevenueReport.js.map