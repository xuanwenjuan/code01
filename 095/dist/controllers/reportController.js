"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDailyReport = exports.getMonthlyRevenue = exports.getRevenueByCategory = exports.getRevenueStatistics = void 0;
const database_1 = __importDefault(require("../config/database"));
const models_1 = require("../models");
const response_1 = require("../utils/response");
const types_1 = require("../types");
const sequelize_1 = require("sequelize");
const getRevenueStatistics = async (req, res, next) => {
    try {
        const { startDate, endDate, categoryId } = req.query;
        const where = {
            status: {
                [sequelize_1.Op.in]: [types_1.OrderStatus.PAID, types_1.OrderStatus.PRODUCING, types_1.OrderStatus.QUALITY_CHECKING, types_1.OrderStatus.SHIPPED, types_1.OrderStatus.COMPLETED],
            },
        };
        if (startDate && endDate) {
            where.createdAt = {
                [sequelize_1.Op.between]: [new Date(startDate), new Date(endDate)],
            };
        }
        const orders = await models_1.Order.findAll({
            where,
            include: [
                {
                    model: models_1.OrderItem,
                    as: 'items',
                    include: [
                        {
                            model: models_1.Category,
                            as: 'category',
                            ...(categoryId ? { where: { id: categoryId } } : {}),
                        },
                    ],
                },
            ],
        });
        let totalOrders = orders.length;
        let totalAmount = 0;
        let totalMaterialCost = 0;
        let totalQuantity = 0;
        for (const order of orders) {
            totalAmount += Number(order.totalAmount);
            for (const item of order.items) {
                totalMaterialCost += Number(item.materialCost);
                totalQuantity += Number(item.quantity);
            }
        }
        const grossProfit = totalAmount - totalMaterialCost;
        const grossProfitRate = totalAmount > 0 ? ((grossProfit / totalAmount) * 100).toFixed(2) : 0;
        res.json((0, response_1.successResponse)({
            totalOrders,
            totalQuantity,
            totalAmount,
            totalMaterialCost,
            grossProfit,
            grossProfitRate: Number(grossProfitRate),
        }));
    }
    catch (error) {
        next(error);
    }
};
exports.getRevenueStatistics = getRevenueStatistics;
const getRevenueByCategory = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const where = {
            status: {
                [sequelize_1.Op.in]: [types_1.OrderStatus.PAID, types_1.OrderStatus.PRODUCING, types_1.OrderStatus.QUALITY_CHECKING, types_1.OrderStatus.SHIPPED, types_1.OrderStatus.COMPLETED],
            },
        };
        if (startDate && endDate) {
            where.createdAt = {
                [sequelize_1.Op.between]: [new Date(startDate), new Date(endDate)],
            };
        }
        const categoryStats = await models_1.OrderItem.findAll({
            attributes: [
                'productId',
                [database_1.default.fn('SUM', database_1.default.col('quantity')), 'totalQuantity'],
                [database_1.default.fn('SUM', database_1.default.col('totalPrice')), 'totalAmount'],
                [database_1.default.fn('SUM', database_1.default.col('materialCost')), 'totalMaterialCost'],
            ],
            include: [
                {
                    model: models_1.Category,
                    as: 'category',
                    attributes: ['id', 'name'],
                },
            ],
            group: ['category.id'],
            order: [[database_1.default.literal('totalAmount'), 'DESC']],
        });
        const result = categoryStats.map((stat) => ({
            categoryId: stat.category?.id,
            categoryName: stat.category?.name || '未分类',
            totalQuantity: Number(stat.getDataValue('totalQuantity') || 0),
            totalAmount: Number(stat.getDataValue('totalAmount') || 0),
            totalMaterialCost: Number(stat.getDataValue('totalMaterialCost') || 0),
            grossProfit: Number(stat.getDataValue('totalAmount') || 0) - Number(stat.getDataValue('totalMaterialCost') || 0),
        }));
        res.json((0, response_1.successResponse)(result));
    }
    catch (error) {
        next(error);
    }
};
exports.getRevenueByCategory = getRevenueByCategory;
const getMonthlyRevenue = async (req, res, next) => {
    try {
        const { year = new Date().getFullYear() } = req.query;
        const results = await models_1.RevenueReport.findAll({
            where: database_1.default.where(database_1.default.fn('YEAR', database_1.default.col('reportDate')), year),
            attributes: [
                [database_1.default.fn('DATE_FORMAT', database_1.default.col('reportDate'), '%Y-%m'), 'month'],
                [database_1.default.fn('SUM', database_1.default.col('totalOrders')), 'totalOrders'],
                [database_1.default.fn('SUM', database_1.default.col('totalQuantity')), 'totalQuantity'],
                [database_1.default.fn('SUM', database_1.default.col('totalAmount')), 'totalAmount'],
                [database_1.default.fn('SUM', database_1.default.col('materialCost')), 'materialCost'],
                [database_1.default.fn('SUM', database_1.default.col('grossProfit')), 'grossProfit'],
            ],
            group: [database_1.default.fn('DATE_FORMAT', database_1.default.col('reportDate'), '%Y-%m')],
            order: [[database_1.default.literal('month'), 'ASC']],
        });
        const formattedResults = results.map((row) => ({
            month: row.getDataValue('month'),
            totalOrders: Number(row.getDataValue('totalOrders') || 0),
            totalQuantity: Number(row.getDataValue('totalQuantity') || 0),
            totalAmount: Number(row.getDataValue('totalAmount') || 0),
            materialCost: Number(row.getDataValue('materialCost') || 0),
            grossProfit: Number(row.getDataValue('grossProfit') || 0),
        }));
        res.json((0, response_1.successResponse)(formattedResults));
    }
    catch (error) {
        next(error);
    }
};
exports.getMonthlyRevenue = getMonthlyRevenue;
const generateDailyReport = async (_req, res, next) => {
    const transaction = await database_1.default.transaction();
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const orders = await models_1.Order.findAll({
            where: {
                createdAt: { [sequelize_1.Op.between]: [today, tomorrow] },
                status: {
                    [sequelize_1.Op.in]: [types_1.OrderStatus.PAID, types_1.OrderStatus.PRODUCING, types_1.OrderStatus.QUALITY_CHECKING, types_1.OrderStatus.SHIPPED, types_1.OrderStatus.COMPLETED],
                },
            },
            include: [{ model: models_1.OrderItem, as: 'items' }],
            transaction,
        });
        let totalOrders = orders.length;
        let totalQuantity = 0;
        let totalAmount = 0;
        let totalMaterialCost = 0;
        for (const order of orders) {
            totalAmount += Number(order.totalAmount);
            for (const item of order.items) {
                totalQuantity += Number(item.quantity);
                totalMaterialCost += Number(item.materialCost);
            }
        }
        const grossProfit = totalAmount - totalMaterialCost;
        const grossProfitRate = totalAmount > 0 ? (grossProfit / totalAmount) * 100 : 0;
        await models_1.RevenueReport.create({
            reportDate: today,
            totalOrders,
            totalQuantity,
            totalAmount,
            materialCost: totalMaterialCost,
            processingFee: 0,
            grossProfit,
            grossProfitRate,
        }, { transaction });
        await transaction.commit();
        res.json((0, response_1.successResponse)(null, '日报表生成成功'));
    }
    catch (error) {
        await transaction.rollback();
        next(error);
    }
};
exports.generateDailyReport = generateDailyReport;
//# sourceMappingURL=reportController.js.map