"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const types_1 = require("../types");
class OperationLog extends sequelize_1.Model {
}
OperationLog.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    module: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(types_1.LogModule)),
        allowNull: false,
    },
    operationType: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(types_1.OperationType)),
        allowNull: false,
    },
    targetId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    operatorId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    operatorName: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    ipAddress: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
    },
    userAgent: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: true,
    },
    requestMethod: {
        type: sequelize_1.DataTypes.STRING(10),
        allowNull: true,
    },
    requestUrl: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: true,
    },
    requestParams: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
    },
    responseStatus: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    duration: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        comment: '请求耗时（毫秒）',
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: database_1.default,
    tableName: 'operation_logs',
    timestamps: false,
    indexes: [
        { fields: ['module'] },
        { fields: ['operationType'] },
        { fields: ['operatorId'] },
        { fields: ['targetId'] },
        { fields: ['createdAt'] },
    ],
});
exports.default = OperationLog;
//# sourceMappingURL=OperationLog.js.map