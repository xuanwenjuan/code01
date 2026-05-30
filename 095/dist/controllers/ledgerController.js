"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportLedgerReport = exports.getLedgerStatistics = exports.deleteLedger = exports.auditLedger = exports.updateLedger = exports.getLedgerById = exports.getLedgerList = exports.createLedger = exports.updateLedgerValidation = exports.createLedgerValidation = void 0;
const express_validator_1 = require("express-validator");
const database_1 = __importDefault(require("../config/database"));
const models_1 = require("../models");
const response_1 = require("../utils/response");
const errorHandler_1 = require("../middleware/errorHandler");
const types_1 = require("../types");
const sequelize_1 = require("sequelize");
const logger_1 = __importDefault(require("../config/logger"));
exports.createLedgerValidation = [
    (0, express_validator_1.body)('orderId').isInt({ min: 1 }).withMessage('订单ID必须为正整数'),
    (0, express_validator_1.body)('notes').optional().isLength({ max: 2000 }).withMessage('备注长度不能超过2000字符'),
];
exports.updateLedgerValidation = [
    (0, express_validator_1.param)('id').isInt({ min: 1 }).withMessage('台账ID必须为正整数'),
    (0, express_validator_1.body)('notes').optional().isLength({ max: 2000 }).withMessage('备注长度不能超过2000字符'),
    (0, express_validator_1.body)('materialLossRate').optional().isFloat({ min: 0, max: 1 }).withMessage('面料损耗率必须在0-1之间'),
];
const calculateProfit = (orderItems, materialLossRate = 0.05) => {
    let totalRevenue = 0;
    let totalMaterialCost = 0;
    let totalCustomFee = 0;
    for (const item of orderItems) {
        totalRevenue += Number(item.totalPrice);
        totalMaterialCost += Number(item.materialCost) * Number(item.quantity) * (1 + materialLossRate);
        totalCustomFee += Number(item.customFee) * Number(item.quantity);
    }
    const processingCost = totalRevenue * 0.15;
    const totalCost = totalMaterialCost + totalCustomFee + processingCost;
    const profit = totalRevenue - totalCost;
    const profitRate = totalRevenue > 0 ? profit / totalRevenue : 0;
    return {
        totalRevenue,
        totalMaterialCost,
        totalCustomFee,
        processingCost,
        totalCost,
        profit,
        profitRate,
    };
};
const createLedger = async (req, res, next) => {
    const transaction = await database_1.default.transaction();
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            await transaction.rollback();
            return next(new errorHandler_1.AppError(errors.array()[0].msg, 400));
        }
        const { orderId, notes, materialLossRate } = req.body;
        const order = await models_1.Order.findByPk(orderId, {
            transaction,
            include: [{ model: models_1.OrderItem, as: 'items' }],
        });
        if (!order) {
            await transaction.rollback();
            return next(new errorHandler_1.AppError('订单不存在', 404));
        }
        if (order.status !== types_1.OrderStatus.COMPLETED) {
            await transaction.rollback();
            return next(new errorHandler_1.AppError('只能为已完成订单生成台账', 400));
        }
        const existingLedger = await models_1.Ledger.findOne({ where: { orderId }, transaction });
        if (existingLedger) {
            await transaction.rollback();
            return next(new errorHandler_1.AppError('该订单已存在台账记录', 400));
        }
        const lossRate = materialLossRate || 0.05;
        const calculation = calculateProfit(order.items, lossRate);
        const ledger = await models_1.Ledger.create({
            orderId,
            orderNo: order.orderNo,
            companyName: order.companyName,
            totalRevenue: calculation.totalRevenue,
            totalMaterialCost: calculation.totalMaterialCost,
            totalCustomFee: calculation.totalCustomFee,
            processingCost: calculation.processingCost,
            totalCost: calculation.totalCost,
            profit: calculation.profit,
            profitRate: calculation.profitRate,
            materialLossRate: lossRate,
            status: types_1.LedgerStatus.DRAFT,
            notes,
            createdBy: req.user.userId,
        }, { transaction });
        for (const item of order.items) {
            const product = await models_1.Product.findByPk(item.productId, { transaction });
            const category = product ? await models_1.Category.findByPk(product.categoryId, { transaction }) : null;
            const unitMaterialCost = Number(item.materialCost) * (1 + lossRate);
            const unitCustomFee = Number(item.customFee);
            const unitProcessingCost = Number(item.unitPrice) * 0.15;
            const unitTotalCost = unitMaterialCost + unitCustomFee + unitProcessingCost;
            const unitProfit = Number(item.unitPrice) + unitCustomFee - unitTotalCost;
            await models_1.LedgerItem.create({
                ledgerId: ledger.id,
                orderItemId: item.id,
                productId: item.productId,
                productName: item.productName,
                productCode: item.productCode,
                categoryId: category?.id,
                categoryName: category?.name,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                unitMaterialCost,
                unitCustomFee,
                unitProcessingCost,
                unitTotalCost,
                unitProfit,
                totalMaterialCost: unitMaterialCost * item.quantity,
                totalCustomFee: unitCustomFee * item.quantity,
                totalProcessingCost: unitProcessingCost * item.quantity,
                totalCost: unitTotalCost * item.quantity,
                totalRevenue: item.totalPrice,
                totalProfit: unitProfit * item.quantity,
                sizeDetails: item.sizeDetails,
            }, { transaction });
        }
        await transaction.commit();
        const result = await models_1.Ledger.findByPk(ledger.id, {
            include: [
                { model: models_1.LedgerItem, as: 'items' },
                { model: models_1.Order, as: 'order' },
                { model: models_1.User, as: 'creator', attributes: ['id', 'realName', 'username'] },
            ],
        });
        logger_1.default.info(`台账创建成功: 订单${order.orderNo}, 创建人: ${req.user.username}`);
        res.json((0, response_1.successResponse)(result, '台账创建成功'));
    }
    catch (error) {
        await transaction.rollback();
        next(error);
    }
};
exports.createLedger = createLedger;
const getLedgerList = async (req, res, next) => {
    try {
        const { page = 1, pageSize = 10, orderNo, companyName, categoryId, status, startDate, endDate, minProfit, maxProfit, minProfitRate, maxProfitRate, } = req.query;
        const where = {};
        if (orderNo)
            where.orderNo = { [sequelize_1.Op.like]: `%${orderNo}%` };
        if (companyName)
            where.companyName = { [sequelize_1.Op.like]: `%${companyName}%` };
        if (status)
            where.status = status;
        if (minProfit)
            where.profit = { ...where.profit, [sequelize_1.Op.gte]: Number(minProfit) };
        if (maxProfit)
            where.profit = { ...where.profit, [sequelize_1.Op.lte]: Number(maxProfit) };
        if (minProfitRate)
            where.profitRate = { ...where.profitRate, [sequelize_1.Op.gte]: Number(minProfitRate) };
        if (maxProfitRate)
            where.profitRate = { ...where.profitRate, [sequelize_1.Op.lte]: Number(maxProfitRate) };
        if (startDate && endDate) {
            where.createdAt = {
                [sequelize_1.Op.between]: [new Date(startDate), new Date(endDate)],
            };
        }
        const itemWhere = {};
        if (categoryId)
            itemWhere.categoryId = categoryId;
        const { count, rows } = await models_1.Ledger.findAndCountAll({
            where,
            offset: (Number(page) - 1) * Number(pageSize),
            limit: Number(pageSize),
            order: [['createdAt', 'DESC']],
            include: [
                { model: models_1.LedgerItem, as: 'items', where: itemWhere, required: categoryId ? true : false },
                { model: models_1.Order, as: 'order', attributes: ['id', 'orderNo', 'totalAmount'] },
                { model: models_1.User, as: 'creator', attributes: ['id', 'realName', 'username'] },
            ],
        });
        res.json((0, response_1.paginatedResponse)(rows, count, Number(page), Number(pageSize)));
    }
    catch (error) {
        next(error);
    }
};
exports.getLedgerList = getLedgerList;
const getLedgerById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const ledger = await models_1.Ledger.findByPk(id, {
            include: [
                {
                    model: models_1.LedgerItem,
                    as: 'items',
                    include: [{ model: models_1.Category, as: 'category', attributes: ['id', 'name'] }],
                },
                {
                    model: models_1.Order,
                    as: 'order',
                    include: [{ model: models_1.OrderItem, as: 'items' }],
                },
                { model: models_1.User, as: 'creator', attributes: ['id', 'realName', 'username'] },
                { model: models_1.User, as: 'auditor', attributes: ['id', 'realName', 'username'] },
            ],
        });
        if (!ledger) {
            return next(new errorHandler_1.AppError('台账不存在', 404));
        }
        res.json((0, response_1.successResponse)(ledger));
    }
    catch (error) {
        next(error);
    }
};
exports.getLedgerById = getLedgerById;
const updateLedger = async (req, res, next) => {
    const transaction = await database_1.default.transaction();
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            await transaction.rollback();
            return next(new errorHandler_1.AppError(errors.array()[0].msg, 400));
        }
        const { id } = req.params;
        const { notes, materialLossRate } = req.body;
        const ledger = await models_1.Ledger.findByPk(id, {
            transaction,
            include: [{ model: models_1.LedgerItem, as: 'items' }, { model: models_1.Order, as: 'order', include: [{ model: models_1.OrderItem, as: 'items' }] }],
        });
        if (!ledger) {
            await transaction.rollback();
            return next(new errorHandler_1.AppError('台账不存在', 404));
        }
        if (ledger.status !== types_1.LedgerStatus.DRAFT) {
            await transaction.rollback();
            return next(new errorHandler_1.AppError('只能编辑草稿状态的台账', 400));
        }
        const lossRate = materialLossRate !== undefined ? materialLossRate : ledger.materialLossRate;
        if (materialLossRate !== undefined && ledger.order) {
            const calculation = calculateProfit(ledger.order.items, lossRate);
            await ledger.update({
                totalRevenue: calculation.totalRevenue,
                totalMaterialCost: calculation.totalMaterialCost,
                totalCustomFee: calculation.totalCustomFee,
                processingCost: calculation.processingCost,
                totalCost: calculation.totalCost,
                profit: calculation.profit,
                profitRate: calculation.profitRate,
                materialLossRate: lossRate,
                notes: notes !== undefined ? notes : ledger.notes,
            }, { transaction });
            for (const item of ledger.items) {
                const unitMaterialCost = Number(item.unitMaterialCost) * (1 + lossRate) / (1 + Number(ledger.materialLossRate));
                const unitTotalCost = unitMaterialCost + Number(item.unitCustomFee) + Number(item.unitProcessingCost);
                const unitProfit = Number(item.unitPrice) + Number(item.unitCustomFee) - unitTotalCost;
                await item.update({
                    unitMaterialCost,
                    unitTotalCost,
                    unitProfit,
                    totalMaterialCost: unitMaterialCost * Number(item.quantity),
                    totalCost: unitTotalCost * Number(item.quantity),
                    totalProfit: unitProfit * Number(item.quantity),
                }, { transaction });
            }
        }
        else {
            await ledger.update({
                notes: notes !== undefined ? notes : ledger.notes,
            }, { transaction });
        }
        await transaction.commit();
        const result = await models_1.Ledger.findByPk(ledger.id, {
            include: [{ model: models_1.LedgerItem, as: 'items' }],
        });
        logger_1.default.info(`台账更新成功: ID ${id}, 操作人: ${req.user.username}`);
        res.json((0, response_1.successResponse)(result, '台账更新成功'));
    }
    catch (error) {
        await transaction.rollback();
        next(error);
    }
};
exports.updateLedger = updateLedger;
const auditLedger = async (req, res, next) => {
    const transaction = await database_1.default.transaction();
    try {
        const { id } = req.params;
        const { status, auditNotes } = req.body;
        const ledger = await models_1.Ledger.findByPk(id, { transaction });
        if (!ledger) {
            await transaction.rollback();
            return next(new errorHandler_1.AppError('台账不存在', 404));
        }
        if (ledger.status !== types_1.LedgerStatus.DRAFT) {
            await transaction.rollback();
            return next(new errorHandler_1.AppError('只能审核草稿状态的台账', 400));
        }
        if (![types_1.LedgerStatus.FINALIZED, types_1.LedgerStatus.REJECTED].includes(status)) {
            await transaction.rollback();
            return next(new errorHandler_1.AppError('审核状态无效', 400));
        }
        const user = await models_1.User.findByPk(req.user.userId, { transaction });
        await ledger.update({
            status,
            auditNotes,
            auditedBy: req.user.userId,
            auditedAt: new Date(),
        }, { transaction });
        await transaction.commit();
        logger_1.default.info(`台账审核完成: ID ${id}, 状态: ${status}, 审核人: ${user?.realName || req.user.username}`);
        res.json((0, response_1.successResponse)(null, status === types_1.LedgerStatus.FINALIZED ? '台账已确认' : '台账已驳回'));
    }
    catch (error) {
        await transaction.rollback();
        next(error);
    }
};
exports.auditLedger = auditLedger;
const deleteLedger = async (req, res, next) => {
    const transaction = await database_1.default.transaction();
    try {
        const { id } = req.params;
        const ledger = await models_1.Ledger.findByPk(id, { transaction });
        if (!ledger) {
            await transaction.rollback();
            return next(new errorHandler_1.AppError('台账不存在', 404));
        }
        if (ledger.status !== types_1.LedgerStatus.DRAFT && ledger.status !== types_1.LedgerStatus.REJECTED) {
            await transaction.rollback();
            return next(new errorHandler_1.AppError('只能删除草稿或已驳回状态的台账', 400));
        }
        await models_1.LedgerItem.destroy({ where: { ledgerId: id }, transaction });
        await ledger.destroy({ transaction });
        await transaction.commit();
        logger_1.default.info(`台账删除成功: ID ${id}, 操作人: ${req.user.username}`);
        res.json((0, response_1.successResponse)(null, '台账删除成功'));
    }
    catch (error) {
        await transaction.rollback();
        next(error);
    }
};
exports.deleteLedger = deleteLedger;
const getLedgerStatistics = async (req, res, next) => {
    try {
        const { startDate, endDate, categoryId } = req.query;
        const where = { status: types_1.LedgerStatus.FINALIZED };
        if (startDate && endDate) {
            where.createdAt = {
                [sequelize_1.Op.between]: [new Date(startDate), new Date(endDate)],
            };
        }
        const itemWhere = {};
        if (categoryId)
            itemWhere.categoryId = categoryId;
        const ledgers = await models_1.Ledger.findAll({
            where,
            include: [{ model: models_1.LedgerItem, as: 'items', where: itemWhere, required: categoryId ? true : false }],
        });
        let totalRevenue = 0;
        let totalMaterialCost = 0;
        let totalCustomFee = 0;
        let totalProcessingCost = 0;
        let totalCost = 0;
        let totalProfit = 0;
        let totalOrders = ledgers.length;
        for (const ledger of ledgers) {
            totalRevenue += Number(ledger.totalRevenue);
            totalMaterialCost += Number(ledger.totalMaterialCost);
            totalCustomFee += Number(ledger.totalCustomFee);
            totalProcessingCost += Number(ledger.processingCost);
            totalCost += Number(ledger.totalCost);
            totalProfit += Number(ledger.profit);
        }
        const overallProfitRate = totalRevenue > 0 ? totalProfit / totalRevenue : 0;
        const categoryStats = await models_1.LedgerItem.findAll({
            attributes: [
                'categoryId',
                'categoryName',
                [database_1.default.fn('SUM', database_1.default.col('totalRevenue')), 'totalRevenue'],
                [database_1.default.fn('SUM', database_1.default.col('totalProfit')), 'totalProfit'],
                [database_1.default.fn('COUNT', database_1.default.col('id')), 'itemCount'],
            ],
            where: itemWhere,
            group: ['categoryId', 'categoryName'],
            order: [[database_1.default.fn('SUM', database_1.default.col('totalProfit')), 'DESC']],
        });
        const monthlyStats = await models_1.Ledger.findAll({
            where,
            attributes: [
                [database_1.default.fn('DATE_FORMAT', database_1.default.col('createdAt'), '%Y-%m'), 'month'],
                [database_1.default.fn('SUM', database_1.default.col('totalRevenue')), 'totalRevenue'],
                [database_1.default.fn('SUM', database_1.default.col('totalProfit')), 'totalProfit'],
                [database_1.default.fn('COUNT', database_1.default.col('id')), 'orderCount'],
            ],
            group: ['month'],
            order: [['month', 'DESC']],
            limit: 12,
        });
        const statusBreakdown = await models_1.Ledger.findAll({
            attributes: [
                'status',
                [database_1.default.fn('COUNT', database_1.default.col('id')), 'count'],
                [database_1.default.fn('SUM', database_1.default.col('totalRevenue')), 'totalRevenue'],
                [database_1.default.fn('SUM', database_1.default.col('totalProfit')), 'totalProfit'],
            ],
            group: ['status'],
        });
        res.json((0, response_1.successResponse)({
            overview: {
                totalOrders,
                totalRevenue,
                totalMaterialCost,
                totalCustomFee,
                totalProcessingCost,
                totalCost,
                totalProfit,
                overallProfitRate,
            },
            categoryStats,
            monthlyStats: monthlyStats.reverse(),
            statusBreakdown,
        }));
    }
    catch (error) {
        next(error);
    }
};
exports.getLedgerStatistics = getLedgerStatistics;
const exportLedgerReport = async (req, res, next) => {
    try {
        const { startDate, endDate, categoryId, format = 'json' } = req.query;
        const where = { status: types_1.LedgerStatus.FINALIZED };
        if (startDate && endDate) {
            where.createdAt = {
                [sequelize_1.Op.between]: [new Date(startDate), new Date(endDate)],
            };
        }
        const itemWhere = {};
        if (categoryId)
            itemWhere.categoryId = categoryId;
        const ledgers = await models_1.Ledger.findAll({
            where,
            order: [['createdAt', 'DESC']],
            include: [
                { model: models_1.LedgerItem, as: 'items', where: itemWhere, required: categoryId ? true : false },
                { model: models_1.Order, as: 'order', attributes: ['id', 'orderNo', 'companyName'] },
                { model: models_1.User, as: 'creator', attributes: ['id', 'realName'] },
            ],
        });
        const reportData = {
            generatedAt: new Date(),
            period: startDate && endDate ? `${startDate} 至 ${endDate}` : '全部',
            recordCount: ledgers.length,
            data: ledgers,
        };
        if (format === 'csv') {
            const csvRows = [
                ['台账ID', '订单号', '客户名称', '总收入', '材料成本', '定制费', '加工费', '总成本', '利润', '利润率', '创建人', '创建时间'].join(','),
            ];
            for (const ledger of ledgers) {
                csvRows.push([
                    ledger.id,
                    ledger.orderNo,
                    ledger.companyName,
                    ledger.totalRevenue,
                    ledger.totalMaterialCost,
                    ledger.totalCustomFee,
                    ledger.processingCost,
                    ledger.totalCost,
                    ledger.profit,
                    (ledger.profitRate * 100).toFixed(2) + '%',
                    ledger.creator?.realName || '',
                    ledger.createdAt.toISOString(),
                ].join(','));
            }
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename=ledger-report-${Date.now()}.csv`);
            res.send('\uFEFF' + csvRows.join('\n'));
        }
        else {
            res.json((0, response_1.successResponse)(reportData, '报表生成成功'));
        }
    }
    catch (error) {
        next(error);
    }
};
exports.exportLedgerReport = exportLedgerReport;
//# sourceMappingURL=ledgerController.js.map