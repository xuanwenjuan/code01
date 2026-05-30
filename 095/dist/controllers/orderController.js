"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveReturn = exports.approveReturnValidation = exports.createReturnApplication = exports.returnApplicationValidation = exports.scheduleProduction = exports.scheduleProductionValidation = exports.getOrderStatistics = exports.getOrderLogs = exports.cancelOrder = exports.updateOrder = exports.updateOrderStatus = exports.getOrderById = exports.getOrderList = exports.createOrder = exports.updateOrderStatusValidation = exports.createOrderValidation = void 0;
const express_validator_1 = require("express-validator");
const database_1 = __importDefault(require("../config/database"));
const models_1 = require("../models");
const response_1 = require("../utils/response");
const errorHandler_1 = require("../middleware/errorHandler");
const types_1 = require("../types");
const sequelize_1 = require("sequelize");
const logger_1 = __importDefault(require("../config/logger"));
const operationLog_1 = require("../middleware/operationLog");
exports.createOrderValidation = [
    (0, express_validator_1.body)('companyName').notEmpty().withMessage('公司名称不能为空').trim().isLength({ min: 1, max: 200 }).withMessage('公司名称长度应在1-200字符之间'),
    (0, express_validator_1.body)('contactPerson').notEmpty().withMessage('联系人不能为空').trim().isLength({ min: 1, max: 50 }).withMessage('联系人长度应在1-50字符之间'),
    (0, express_validator_1.body)('contactPhone').notEmpty().withMessage('联系电话不能为空').trim().isLength({ min: 1, max: 20 }).withMessage('联系电话长度应在1-20字符之间'),
    (0, express_validator_1.body)('depositAmount').optional().isFloat({ min: 0 }).withMessage('订金金额必须为非负数字'),
    (0, express_validator_1.body)('shippingAddress').optional().isLength({ max: 500 }).withMessage('收货地址长度不能超过500字符'),
    (0, express_validator_1.body)('items').isArray({ min: 1 }).withMessage('订单至少包含一个产品'),
    (0, express_validator_1.body)('items.*.productId').isInt({ min: 1 }).withMessage('产品ID必须为正整数'),
    (0, express_validator_1.body)('items.*.quantity').isInt({ min: 1 }).withMessage('产品数量必须为正整数'),
    (0, express_validator_1.body)('items.*.customFee').optional().isFloat({ min: 0 }).withMessage('定制费用必须为非负数字'),
    (0, express_validator_1.body)('items.*.materialCost').optional().isFloat({ min: 0 }).withMessage('材料成本必须为非负数字'),
    (0, express_validator_1.body)('logoDesign').optional().isArray().withMessage('LOGO设计必须为数组格式'),
    (0, express_validator_1.body)('customRequirements').optional().isLength({ max: 2000 }).withMessage('定制要求长度不能超过2000字符'),
    (0, express_validator_1.body)('remarks').optional().isLength({ max: 2000 }).withMessage('备注长度不能超过2000字符'),
];
exports.updateOrderStatusValidation = [
    (0, express_validator_1.param)('id').isInt({ min: 1 }).withMessage('订单ID必须为正整数'),
    (0, express_validator_1.body)('status').isIn(Object.values(types_1.OrderStatus)).withMessage('状态值无效，有效值：' + Object.values(types_1.OrderStatus).join(', ')),
    (0, express_validator_1.body)('remarks').optional().isLength({ max: 1000 }).withMessage('备注长度不能超过1000字符'),
];
const statusTransitionRules = {
    [types_1.OrderStatus.PENDING_PAYMENT]: [types_1.OrderStatus.PAID, types_1.OrderStatus.CANCELLED, types_1.OrderStatus.EXPIRED],
    [types_1.OrderStatus.PAID]: [types_1.OrderStatus.PENDING_PAYMENT, types_1.OrderStatus.PRODUCING, types_1.OrderStatus.CANCELLED, types_1.OrderStatus.REFUNDING],
    [types_1.OrderStatus.PRODUCING]: [types_1.OrderStatus.PAID, types_1.OrderStatus.QUALITY_CHECKING, types_1.OrderStatus.CANCELLED, types_1.OrderStatus.REFUNDING],
    [types_1.OrderStatus.QUALITY_CHECKING]: [types_1.OrderStatus.PRODUCING, types_1.OrderStatus.SHIPPED, types_1.OrderStatus.CANCELLED, types_1.OrderStatus.REFUNDING],
    [types_1.OrderStatus.SHIPPED]: [types_1.OrderStatus.QUALITY_CHECKING, types_1.OrderStatus.COMPLETED, types_1.OrderStatus.REFUNDING],
    [types_1.OrderStatus.COMPLETED]: [types_1.OrderStatus.SHIPPED, types_1.OrderStatus.REFUNDING],
    [types_1.OrderStatus.CANCELLED]: [],
    [types_1.OrderStatus.REFUNDING]: [types_1.OrderStatus.REFUNDED, types_1.OrderStatus.PAID],
    [types_1.OrderStatus.REFUNDED]: [],
    [types_1.OrderStatus.EXPIRED]: [],
};
const generateOrderNo = () => {
    const date = new Date();
    const timestamp = date.getTime().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0');
    return `PO${date.getFullYear()}${timestamp}${random}`;
};
const validateStatusTransition = (currentStatus, newStatus) => {
    const allowedTransitions = statusTransitionRules[currentStatus];
    return allowedTransitions.includes(newStatus);
};
const createOrderLog = async (orderId, operatorId, operatorName, previousStatus, newStatus, action, remarks) => {
    await models_1.OrderLog.create({
        orderId,
        operatorId,
        operatorName,
        previousStatus,
        newStatus,
        action,
        remarks,
    });
};
const getStatusActionName = (status) => {
    const actionMap = {
        [types_1.OrderStatus.PENDING_PAYMENT]: '待付款',
        [types_1.OrderStatus.PAID]: '已付款',
        [types_1.OrderStatus.PRODUCING]: '开始生产',
        [types_1.OrderStatus.QUALITY_CHECKING]: '质检中',
        [types_1.OrderStatus.SHIPPED]: '已发货',
        [types_1.OrderStatus.COMPLETED]: '已完成',
        [types_1.OrderStatus.CANCELLED]: '已取消',
        [types_1.OrderStatus.REFUNDING]: '退款中',
        [types_1.OrderStatus.REFUNDED]: '已退款',
        [types_1.OrderStatus.EXPIRED]: '已过期',
    };
    return actionMap[status];
};
const createOrder = async (req, res, next) => {
    const transaction = await database_1.default.transaction();
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            await transaction.rollback();
            return next(new errorHandler_1.AppError(errors.array()[0].msg, 400));
        }
        const { companyName, contactPerson, contactPhone, depositAmount, logoDesign, customRequirements, sizeStatistics, items, remarks, shippingAddress } = req.body;
        const orderNo = generateOrderNo();
        let totalAmount = 0;
        const orderItemsData = [];
        for (const item of items) {
            const product = await models_1.Product.findByPk(item.productId, { transaction });
            if (!product) {
                await transaction.rollback();
                return next(new errorHandler_1.AppError(`产品ID ${item.productId} 不存在`, 404));
            }
            if (!product.isActive) {
                await transaction.rollback();
                return next(new errorHandler_1.AppError(`产品"${product.name}"已停用，无法下单`, 400));
            }
            const category = await models_1.Category.findByPk(product.categoryId, { transaction });
            if (category?.status === types_1.CategoryStatus.DISCONTINUED) {
                await transaction.rollback();
                return next(new errorHandler_1.AppError(`产品"${product.name}"所属类目"${category.name}"已停产，无法下单`, 400));
            }
            const unitPrice = Number(product.basePrice) + Number(item.customFee || 0);
            const totalPrice = unitPrice * Number(item.quantity);
            totalAmount += totalPrice;
            orderItemsData.push({
                productId: item.productId,
                productName: product.name,
                productCode: product.code,
                quantity: item.quantity,
                unitPrice: product.basePrice,
                customFee: item.customFee || 0,
                materialCost: item.materialCost || 0,
                totalPrice,
                sizeDetails: item.sizeDetails || {},
                remarks: item.remarks,
            });
        }
        const order = await models_1.Order.create({
            orderNo,
            companyName,
            contactPerson,
            contactPhone,
            totalAmount,
            depositAmount: depositAmount || 0,
            status: types_1.OrderStatus.PENDING_PAYMENT,
            logoDesign: logoDesign || [],
            customRequirements,
            sizeStatistics: sizeStatistics || {},
            shippingAddress,
            remarks,
            createdBy: req.user.userId,
        }, { transaction });
        for (const itemData of orderItemsData) {
            await models_1.OrderItem.create({
                orderId: order.id,
                ...itemData,
            }, { transaction });
        }
        const user = await models_1.User.findByPk(req.user.userId, { transaction });
        await createOrderLog(order.id, req.user.userId, user?.realName || req.user.username, null, types_1.OrderStatus.PENDING_PAYMENT, '创建订单', remarks);
        await transaction.commit();
        const result = await models_1.Order.findByPk(order.id, {
            include: [
                { model: models_1.OrderItem, as: 'items' },
                { model: models_1.OrderLog, as: 'logs', order: [['createdAt', 'DESC']] },
            ],
        });
        logger_1.default.info(`订单创建成功: ${orderNo}, 客户: ${companyName}, 创建人: ${user?.realName || req.user.username}`);
        res.json((0, response_1.successResponse)(result, '订单创建成功'));
    }
    catch (error) {
        await transaction.rollback();
        next(error);
    }
};
exports.createOrder = createOrder;
const getOrderList = async (req, res, next) => {
    try {
        const { page = 1, pageSize = 10, orderNo, companyName, status, startDate, endDate, createdBy } = req.query;
        const where = {};
        if (orderNo)
            where.orderNo = { [sequelize_1.Op.like]: `%${orderNo}%` };
        if (companyName)
            where.companyName = { [sequelize_1.Op.like]: `%${companyName}%` };
        if (status)
            where.status = status;
        if (createdBy)
            where.createdBy = createdBy;
        if (startDate && endDate) {
            where.createdAt = {
                [sequelize_1.Op.between]: [new Date(startDate), new Date(endDate)],
            };
        }
        const { count, rows } = await models_1.Order.findAndCountAll({
            where,
            offset: (Number(page) - 1) * Number(pageSize),
            limit: Number(pageSize),
            order: [['createdAt', 'DESC']],
            include: [
                { model: models_1.User, as: 'creator', attributes: ['id', 'realName', 'username'] },
            ],
        });
        const statusCounts = await models_1.Order.findAll({
            attributes: ['status', [database_1.default.fn('COUNT', database_1.default.col('id')), 'count']],
            group: ['status'],
        });
        res.json({
            ...(0, response_1.successResponse)(rows),
            data: {
                list: rows,
                total: count,
                page: Number(page),
                pageSize: Number(pageSize),
                statusCounts,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getOrderList = getOrderList;
const getOrderById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const order = await models_1.Order.findByPk(id, {
            include: [
                { model: models_1.OrderItem, as: 'items' },
                { model: models_1.OrderLog, as: 'logs', order: [['createdAt', 'DESC']], include: [{ model: models_1.User, as: 'operator', attributes: ['id', 'realName'] }] },
                { model: models_1.User, as: 'creator', attributes: ['id', 'realName', 'username'] },
            ],
        });
        if (!order) {
            return next(new errorHandler_1.AppError('订单不存在', 404));
        }
        const allowedTransitions = statusTransitionRules[order.status];
        res.json((0, response_1.successResponse)({
            ...order.toJSON(),
            allowedTransitions,
        }));
    }
    catch (error) {
        next(error);
    }
};
exports.getOrderById = getOrderById;
const updateOrderStatus = async (req, res, next) => {
    const transaction = await database_1.default.transaction();
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            await transaction.rollback();
            return next(new errorHandler_1.AppError(errors.array()[0].msg, 400));
        }
        const { id } = req.params;
        const { status, remarks, trackingNumber, shippingAddress, productionEndDate, qualityCheckDate, shipDate } = req.body;
        const order = await models_1.Order.findByPk(id, { transaction });
        if (!order) {
            await transaction.rollback();
            return next(new errorHandler_1.AppError('订单不存在', 404));
        }
        const previousStatus = order.status;
        if (!validateStatusTransition(previousStatus, status)) {
            await transaction.rollback();
            return next(new errorHandler_1.AppError(`订单状态不允许从"${getStatusActionName(previousStatus)}"变更为"${getStatusActionName(status)}"`, 400));
        }
        const updateData = { status };
        if (status === types_1.OrderStatus.PRODUCING && !order.productionStartDate) {
            updateData.productionStartDate = new Date();
        }
        if (productionEndDate) {
            updateData.productionEndDate = new Date(productionEndDate);
        }
        if (qualityCheckDate) {
            updateData.qualityCheckDate = new Date(qualityCheckDate);
        }
        if (shipDate) {
            updateData.shipDate = new Date(shipDate);
        }
        if (trackingNumber)
            updateData.trackingNumber = trackingNumber;
        if (shippingAddress)
            updateData.shippingAddress = shippingAddress;
        await order.update(updateData, { transaction });
        const user = await models_1.User.findByPk(req.user.userId, { transaction });
        await createOrderLog(order.id, req.user.userId, user?.realName || req.user.username, previousStatus, status, getStatusActionName(status), remarks);
        await transaction.commit();
        logger_1.default.info(`订单状态变更: ${order.orderNo}, ${previousStatus} -> ${status}, 操作人: ${user?.realName || req.user.username}`);
        const result = await models_1.Order.findByPk(order.id, {
            include: [
                { model: models_1.OrderItem, as: 'items' },
                { model: models_1.OrderLog, as: 'logs', order: [['createdAt', 'DESC']] },
            ],
        });
        res.json((0, response_1.successResponse)(result, '订单状态更新成功'));
    }
    catch (error) {
        await transaction.rollback();
        next(error);
    }
};
exports.updateOrderStatus = updateOrderStatus;
const updateOrder = async (req, res, next) => {
    const transaction = await database_1.default.transaction();
    try {
        const { id } = req.params;
        const { companyName, contactPerson, contactPhone, depositAmount, logoDesign, customRequirements, sizeStatistics, items, remarks, shippingAddress } = req.body;
        const order = await models_1.Order.findByPk(id, { transaction });
        if (!order) {
            await transaction.rollback();
            return next(new errorHandler_1.AppError('订单不存在', 404));
        }
        if (order.status !== types_1.OrderStatus.PENDING_PAYMENT) {
            await transaction.rollback();
            return next(new errorHandler_1.AppError('只能编辑待付款状态的订单', 400));
        }
        let totalAmount = order.totalAmount;
        if (items && items.length > 0) {
            await models_1.OrderItem.destroy({ where: { orderId: id }, transaction });
            totalAmount = 0;
            for (const item of items) {
                const product = await models_1.Product.findByPk(item.productId, { transaction });
                if (!product) {
                    await transaction.rollback();
                    return next(new errorHandler_1.AppError(`产品ID ${item.productId} 不存在`, 404));
                }
                if (!product.isActive) {
                    await transaction.rollback();
                    return next(new errorHandler_1.AppError(`产品"${product.name}"已停用，无法下单`, 400));
                }
                const unitPrice = Number(product.basePrice) + Number(item.customFee || 0);
                const totalPrice = unitPrice * Number(item.quantity);
                totalAmount += totalPrice;
                await models_1.OrderItem.create({
                    orderId: order.id,
                    productId: item.productId,
                    productName: product.name,
                    productCode: product.code,
                    quantity: item.quantity,
                    unitPrice: product.basePrice,
                    customFee: item.customFee || 0,
                    materialCost: item.materialCost || 0,
                    totalPrice,
                    sizeDetails: item.sizeDetails || {},
                    remarks: item.remarks,
                }, { transaction });
            }
        }
        await order.update({
            companyName: companyName !== undefined ? companyName : order.companyName,
            contactPerson: contactPerson !== undefined ? contactPerson : order.contactPerson,
            contactPhone: contactPhone !== undefined ? contactPhone : order.contactPhone,
            totalAmount,
            depositAmount: depositAmount !== undefined ? depositAmount : order.depositAmount,
            logoDesign: logoDesign !== undefined ? logoDesign : order.logoDesign,
            customRequirements: customRequirements !== undefined ? customRequirements : order.customRequirements,
            sizeStatistics: sizeStatistics !== undefined ? sizeStatistics : order.sizeStatistics,
            shippingAddress: shippingAddress !== undefined ? shippingAddress : order.shippingAddress,
            remarks: remarks !== undefined ? remarks : order.remarks,
        }, { transaction });
        const user = await models_1.User.findByPk(req.user.userId, { transaction });
        await createOrderLog(order.id, req.user.userId, user?.realName || req.user.username, order.status, order.status, '编辑订单', remarks);
        await transaction.commit();
        const result = await models_1.Order.findByPk(order.id, {
            include: [
                { model: models_1.OrderItem, as: 'items' },
                { model: models_1.OrderLog, as: 'logs', order: [['createdAt', 'DESC']] },
            ],
        });
        logger_1.default.info(`订单编辑成功: ${order.orderNo}, 操作人: ${user?.realName || req.user.username}`);
        res.json((0, response_1.successResponse)(result, '订单更新成功'));
    }
    catch (error) {
        await transaction.rollback();
        next(error);
    }
};
exports.updateOrder = updateOrder;
const cancelOrder = async (req, res, next) => {
    const transaction = await database_1.default.transaction();
    try {
        const { id } = req.params;
        const { remarks } = req.body;
        const order = await models_1.Order.findByPk(id, { transaction });
        if (!order) {
            await transaction.rollback();
            return next(new errorHandler_1.AppError('订单不存在', 404));
        }
        if (![types_1.OrderStatus.PENDING_PAYMENT, types_1.OrderStatus.PAID].includes(order.status)) {
            await transaction.rollback();
            return next(new errorHandler_1.AppError('当前订单状态不允许取消', 400));
        }
        const previousStatus = order.status;
        await order.update({ status: types_1.OrderStatus.CANCELLED }, { transaction });
        const user = await models_1.User.findByPk(req.user.userId, { transaction });
        await createOrderLog(order.id, req.user.userId, user?.realName || req.user.username, previousStatus, types_1.OrderStatus.CANCELLED, '取消订单', remarks);
        await transaction.commit();
        logger_1.default.info(`订单取消成功: ${order.orderNo}, 操作人: ${user?.realName || req.user.username}`);
        res.json((0, response_1.successResponse)(null, '订单取消成功'));
    }
    catch (error) {
        await transaction.rollback();
        next(error);
    }
};
exports.cancelOrder = cancelOrder;
const getOrderLogs = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { page = 1, pageSize = 20 } = req.query;
        const { count, rows } = await models_1.OrderLog.findAndCountAll({
            where: { orderId: id },
            offset: (Number(page) - 1) * Number(pageSize),
            limit: Number(pageSize),
            order: [['createdAt', 'DESC']],
            include: [{ model: models_1.User, as: 'operator', attributes: ['id', 'realName', 'username'] }],
        });
        res.json((0, response_1.paginatedResponse)(rows, count, Number(page), Number(pageSize)));
    }
    catch (error) {
        next(error);
    }
};
exports.getOrderLogs = getOrderLogs;
const getOrderStatistics = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const where = {};
        if (startDate && endDate) {
            where.createdAt = {
                [sequelize_1.Op.between]: [new Date(startDate), new Date(endDate)],
            };
        }
        const statusCounts = await models_1.Order.findAll({
            where,
            attributes: ['status', [database_1.default.fn('COUNT', database_1.default.col('id')), 'count']],
            group: ['status'],
        });
        const totalAmount = await models_1.Order.sum('totalAmount', { where });
        const totalDeposit = await models_1.Order.sum('depositAmount', { where });
        const totalOrders = await models_1.Order.count({ where });
        const recentOrders = await models_1.Order.findAll({
            where,
            limit: 10,
            order: [['createdAt', 'DESC']],
            include: [{ model: models_1.User, as: 'creator', attributes: ['id', 'realName'] }],
        });
        res.json((0, response_1.successResponse)({
            overview: {
                totalOrders,
                totalAmount: totalAmount || 0,
                totalDeposit: totalDeposit || 0,
            },
            statusCounts,
            recentOrders,
        }));
    }
    catch (error) {
        next(error);
    }
};
exports.getOrderStatistics = getOrderStatistics;
exports.scheduleProductionValidation = [
    (0, express_validator_1.param)('id').isInt({ min: 1 }).withMessage('订单ID必须为正整数'),
    (0, express_validator_1.body)('materialAllocations').isArray({ min: 1 }).withMessage('物料分配不能为空'),
    (0, express_validator_1.body)('materialAllocations.*.materialId').isInt({ min: 1 }).withMessage('材料ID必须为正整数'),
    (0, express_validator_1.body)('materialAllocations.*.quantity').isFloat({ min: 0.01 }).withMessage('分配数量必须大于0'),
    (0, express_validator_1.body)('remarks').optional().isLength({ max: 500 }).withMessage('备注长度不能超过500字符'),
];
const scheduleProduction = async (req, res, next) => {
    const transaction = await database_1.default.transaction();
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            await transaction.rollback();
            return next(new errorHandler_1.ValidationError('参数验证失败'));
        }
        const { id } = req.params;
        const { materialAllocations, remarks } = req.body;
        const order = await models_1.Order.findByPk(id, {
            transaction,
            include: [{ model: models_1.OrderItem, as: 'items' }],
        });
        if (!order) {
            await transaction.rollback();
            return next(new errorHandler_1.NotFoundError('订单不存在'));
        }
        if (order.status !== types_1.OrderStatus.PAID) {
            await transaction.rollback();
            return next(new errorHandler_1.AppError('只有已付款的订单才能安排生产', 400));
        }
        for (const allocation of materialAllocations) {
            const material = await database_1.default.models.Material.findByPk(allocation.materialId, { transaction });
            if (!material) {
                await transaction.rollback();
                return next(new errorHandler_1.NotFoundError(`材料ID ${allocation.materialId} 不存在`));
            }
            const availableQuantity = Number(material.stockQuantity) - Number(material.lockedQuantity);
            if (availableQuantity < Number(allocation.quantity)) {
                await transaction.rollback();
                return next(new errorHandler_1.AppError(`材料"${material.name}"可用库存不足，当前可用: ${availableQuantity}${material.unit}，需要: ${allocation.quantity}${material.unit}`, 400));
            }
            await database_1.default.models.StockLock.create({
                materialId: allocation.materialId,
                orderId: id,
                lockQuantity: allocation.quantity,
                lockReason: types_1.StockLockReason.ORDER_PRODUCTION,
                lockedBy: req.user.userId,
                lockedByName: req.user.realName || req.user.username,
                remarks: allocation.remarks || remarks,
            }, { transaction });
            await material.update({ lockedQuantity: Number(material.lockedQuantity) + Number(allocation.quantity) }, { transaction });
        }
        await order.update({
            status: types_1.OrderStatus.PRODUCING,
            productionStartDate: new Date(),
        }, { transaction });
        await createOrderLog(order.id, req.user.userId, req.user.realName || req.user.username, types_1.OrderStatus.PAID, types_1.OrderStatus.PRODUCING, '安排生产', remarks);
        await transaction.commit();
        await (0, operationLog_1.createOperationLog)(req, res, types_1.LogModule.ORDER, types_1.OperationType.STATUS_CHANGE, order.id, `安排订单生产: ${order.orderNo}, 锁定${materialAllocations.length}种物料`);
        logger_1.default.info(`订单${order.orderNo}安排生产成功，锁定${materialAllocations.length}种物料，操作人: ${req.user?.username}`);
        res.json((0, response_1.successResponse)(null, '生产安排成功，物料已锁定'));
    }
    catch (error) {
        await transaction.rollback();
        next(error);
    }
};
exports.scheduleProduction = scheduleProduction;
exports.returnApplicationValidation = [
    (0, express_validator_1.param)('id').isInt({ min: 1 }).withMessage('订单ID必须为正整数'),
    (0, express_validator_1.body)('returnItems').isArray({ min: 1 }).withMessage('退货商品不能为空'),
    (0, express_validator_1.body)('returnItems.*.orderItemId').isInt({ min: 1 }).withMessage('订单项ID必须为正整数'),
    (0, express_validator_1.body)('returnItems.*.returnQuantity').isInt({ min: 1 }).withMessage('退货数量必须大于0'),
    (0, express_validator_1.body)('returnReason').notEmpty().withMessage('退货原因不能为空').isLength({ max: 500 }).withMessage('退货原因长度不能超过500字符'),
    (0, express_validator_1.body)('returnMaterial').optional().isBoolean().withMessage('是否退回物料必须是布尔值'),
    (0, express_validator_1.body)('refundAmount').optional().isFloat({ min: 0 }).withMessage('退款金额必须为非负数字'),
    (0, express_validator_1.body)('remarks').optional().isLength({ max: 500 }).withMessage('备注长度不能超过500字符'),
];
const createReturnApplication = async (req, res, next) => {
    const transaction = await database_1.default.transaction();
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            await transaction.rollback();
            return next(new errorHandler_1.ValidationError('参数验证失败'));
        }
        const { id } = req.params;
        const { returnItems, returnReason, returnMaterial = true, refundAmount, remarks } = req.body;
        const order = await models_1.Order.findByPk(id, {
            transaction,
            include: [{ model: models_1.OrderItem, as: 'items' }],
        });
        if (!order) {
            await transaction.rollback();
            return next(new errorHandler_1.NotFoundError('订单不存在'));
        }
        if (![types_1.OrderStatus.PRODUCING, types_1.OrderStatus.SHIPPED, types_1.OrderStatus.COMPLETED].includes(order.status)) {
            await transaction.rollback();
            return next(new errorHandler_1.AppError('当前订单状态不支持退货', 400));
        }
        let totalRefundAmount = 0;
        for (const returnItem of returnItems) {
            const orderItem = order.items.find((item) => item.id === returnItem.orderItemId);
            if (!orderItem) {
                await transaction.rollback();
                return next(new errorHandler_1.NotFoundError(`订单项ID ${returnItem.orderItemId} 不存在`));
            }
            const remainingQuantity = Number(orderItem.quantity) - Number(orderItem.returnedQuantity);
            if (remainingQuantity < Number(returnItem.returnQuantity)) {
                await transaction.rollback();
                return next(new errorHandler_1.AppError(`商品"${orderItem.productName}"退货数量超过可退数量，当前可退: ${remainingQuantity}`, 400));
            }
            const itemRefundAmount = Number(orderItem.unitPrice) * Number(returnItem.returnQuantity);
            totalRefundAmount += itemRefundAmount;
            await orderItem.update({ returnedQuantity: Number(orderItem.returnedQuantity) + Number(returnItem.returnQuantity) }, { transaction });
        }
        const finalRefundAmount = refundAmount !== undefined ? Number(refundAmount) : totalRefundAmount;
        const ledger = await models_1.Ledger.findOne({
            where: { orderId: id },
            transaction,
        });
        if (ledger && ledger.status === types_1.LedgerStatus.FINALIZED) {
            const newFinalProfit = Number(ledger.finalProfit) - finalRefundAmount;
            await ledger.update({
                returnLoss: Number(ledger.returnLoss || 0) + finalRefundAmount,
                finalProfit: newFinalProfit,
            }, { transaction });
        }
        if (returnMaterial) {
            const activeLocks = await database_1.default.models.StockLock.findAll({
                where: { orderId: id, isActive: true },
                transaction,
            });
            for (const lock of activeLocks) {
                const material = await database_1.default.models.Material.findByPk(lock.materialId, { transaction });
                if (material) {
                    const returnRatio = finalRefundAmount / Number(order.totalAmount);
                    const returnQuantity = Number(lock.lockQuantity) * returnRatio;
                    const newLockedQuantity = Math.max(0, Number(material.lockedQuantity) - returnQuantity);
                    await material.update({ lockedQuantity: newLockedQuantity }, { transaction });
                    await lock.update({ isActive: false, unlockedAt: new Date(), unlockedBy: req.user.userId }, { transaction });
                }
            }
        }
        const previousStatus = order.status;
        await order.update({ status: types_1.OrderStatus.RETURNING }, { transaction });
        await createOrderLog(order.id, req.user.userId, req.user.realName || req.user.username, previousStatus, types_1.OrderStatus.RETURNING, '申请退货', `退货原因: ${returnReason}, 预估退款金额: ${finalRefundAmount}, ${remarks || ''}`);
        await transaction.commit();
        await (0, operationLog_1.createOperationLog)(req, res, types_1.LogModule.ORDER, types_1.OperationType.RETURN, order.id, `订单退货申请: ${order.orderNo}, 预估退款: ${finalRefundAmount}`);
        logger_1.default.info(`订单${order.orderNo}退货申请成功，预估退款: ${finalRefundAmount}，操作人: ${req.user?.username}`);
        res.json((0, response_1.successResponse)({
            orderId: id,
            orderNo: order.orderNo,
            totalRefundAmount: finalRefundAmount,
            returnMaterial,
        }, '退货申请已提交'));
    }
    catch (error) {
        await transaction.rollback();
        next(error);
    }
};
exports.createReturnApplication = createReturnApplication;
exports.approveReturnValidation = [
    (0, express_validator_1.param)('id').isInt({ min: 1 }).withMessage('订单ID必须为正整数'),
    (0, express_validator_1.body)('actualRefundAmount').optional().isFloat({ min: 0 }).withMessage('实际退款金额必须为非负数字'),
    (0, express_validator_1.body)('auditNotes').optional().isLength({ max: 500 }).withMessage('审核备注长度不能超过500字符'),
];
const approveReturn = async (req, res, next) => {
    const transaction = await database_1.default.transaction();
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            await transaction.rollback();
            return next(new errorHandler_1.ValidationError('参数验证失败'));
        }
        const { id } = req.params;
        const { actualRefundAmount, auditNotes } = req.body;
        const order = await models_1.Order.findByPk(id, {
            transaction,
            include: [{ model: models_1.OrderItem, as: 'items' }],
        });
        if (!order) {
            await transaction.rollback();
            return next(new errorHandler_1.NotFoundError('订单不存在'));
        }
        if (order.status !== types_1.OrderStatus.RETURNING) {
            await transaction.rollback();
            return next(new errorHandler_1.AppError('只有退货中的订单才能审核', 400));
        }
        const finalRefundAmount = actualRefundAmount !== undefined ? Number(actualRefundAmount) : Number(order.totalAmount);
        const ledger = await models_1.Ledger.findOne({
            where: { orderId: id },
            transaction,
        });
        if (ledger) {
            const newFinalProfit = Number(ledger.finalProfit) - finalRefundAmount;
            await ledger.update({
                returnLoss: Number(ledger.returnLoss || 0) + finalRefundAmount,
                finalProfit: newFinalProfit,
                status: types_1.LedgerStatus.ADJUSTED,
            }, { transaction });
        }
        await order.update({ status: types_1.OrderStatus.RETURNED }, { transaction });
        await createOrderLog(order.id, req.user.userId, req.user.realName || req.user.username, types_1.OrderStatus.RETURNING, types_1.OrderStatus.RETURNED, '退货完成', `实际退款金额: ${finalRefundAmount}, ${auditNotes || ''}`);
        await transaction.commit();
        await (0, operationLog_1.createOperationLog)(req, res, types_1.LogModule.ORDER, types_1.OperationType.RETURN, order.id, `订单退货完成: ${order.orderNo}, 实际退款: ${finalRefundAmount}`);
        logger_1.default.info(`订单${order.orderNo}退货完成，实际退款: ${finalRefundAmount}，审核人: ${req.user?.username}`);
        res.json((0, response_1.successResponse)({
            orderId: id,
            orderNo: order.orderNo,
            actualRefundAmount: finalRefundAmount,
        }, '退货审核完成'));
    }
    catch (error) {
        await transaction.rollback();
        next(error);
    }
};
exports.approveReturn = approveReturn;
//# sourceMappingURL=orderController.js.map