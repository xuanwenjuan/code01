"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMaterial = exports.getMaterialStatistics = exports.getLowStockMaterials = exports.batchUpdateStock = exports.unlockStock = exports.lockStock = exports.updateStock = exports.updateMaterial = exports.getMaterialById = exports.getMaterialList = exports.createMaterial = exports.stockLockValidation = exports.stockOperationValidation = exports.updateMaterialValidation = exports.createMaterialValidation = void 0;
const express_validator_1 = require("express-validator");
const database_1 = __importDefault(require("../config/database"));
const sequelize_1 = require("sequelize");
const Material_1 = __importDefault(require("../models/Material"));
const StockLock_1 = __importDefault(require("../models/StockLock"));
const response_1 = require("../utils/response");
const errorHandler_1 = require("../middleware/errorHandler");
const types_1 = require("../types");
const logger_1 = __importDefault(require("../config/logger"));
const operationLog_1 = require("../middleware/operationLog");
exports.createMaterialValidation = [
    (0, express_validator_1.body)('batchNo').notEmpty().withMessage('批次号不能为空').trim().isLength({ min: 1, max: 50 }).withMessage('批次号长度应在1-50字符之间'),
    (0, express_validator_1.body)('name').notEmpty().withMessage('材料名称不能为空').trim().isLength({ min: 1, max: 100 }).withMessage('材料名称长度应在1-100字符之间'),
    (0, express_validator_1.body)('type').isIn(Object.values(types_1.MaterialType)).withMessage('材料类型无效'),
    (0, express_validator_1.body)('specification').optional().isLength({ max: 200 }).withMessage('规格描述长度不能超过200字符'),
    (0, express_validator_1.body)('unit').notEmpty().withMessage('单位不能为空').trim().isLength({ min: 1, max: 20 }).withMessage('单位长度应在1-20字符之间'),
    (0, express_validator_1.body)('stockQuantity').optional().isFloat({ min: 0 }).withMessage('库存数量必须为非负数字'),
    (0, express_validator_1.body)('warningThreshold').optional().isFloat({ min: 0 }).withMessage('预警阈值必须为非负数字'),
    (0, express_validator_1.body)('unitPrice').optional().isFloat({ min: 0 }).withMessage('单价必须为非负数字'),
    (0, express_validator_1.body)('supplier').optional().isLength({ max: 200 }).withMessage('供应商名称长度不能超过200字符'),
    (0, express_validator_1.body)('remarks').optional().isLength({ max: 2000 }).withMessage('备注长度不能超过2000字符'),
];
exports.updateMaterialValidation = [
    (0, express_validator_1.param)('id').isInt({ min: 1 }).withMessage('材料ID必须为正整数'),
    ...exports.createMaterialValidation,
];
exports.stockOperationValidation = [
    (0, express_validator_1.param)('id').isInt({ min: 1 }).withMessage('材料ID必须为正整数'),
    (0, express_validator_1.body)('quantity').isFloat({ min: 0.01 }).withMessage('操作数量必须大于0'),
    (0, express_validator_1.body)('operation').isIn(['in', 'out']).withMessage('操作类型无效'),
    (0, express_validator_1.body)('remarks').optional().isLength({ max: 500 }).withMessage('备注长度不能超过500字符'),
    (0, express_validator_1.body)('orderId').optional().isInt({ min: 1 }).withMessage('订单ID必须为正整数'),
];
exports.stockLockValidation = [
    (0, express_validator_1.body)('materialId').isInt({ min: 1 }).withMessage('材料ID必须为正整数'),
    (0, express_validator_1.body)('lockQuantity').isFloat({ min: 0.01 }).withMessage('锁定数量必须大于0'),
    (0, express_validator_1.body)('lockReason').isIn(Object.values(types_1.StockLockReason)).withMessage('锁定原因无效'),
    (0, express_validator_1.body)('orderId').optional().isInt({ min: 1 }).withMessage('订单ID必须为正整数'),
    (0, express_validator_1.body)('remarks').optional().isLength({ max: 500 }).withMessage('备注长度不能超过500字符'),
];
const updateMaterialStatus = async (material) => {
    let newStatus;
    const availableQuantity = Number(material.stockQuantity) - Number(material.lockedQuantity);
    if (availableQuantity <= 0) {
        newStatus = types_1.MaterialStatus.OUT_OF_STOCK;
    }
    else if (availableQuantity <= Number(material.warningThreshold)) {
        newStatus = types_1.MaterialStatus.LOW_STOCK;
    }
    else {
        newStatus = types_1.MaterialStatus.IN_STOCK;
    }
    if (material.status !== newStatus) {
        await material.update({ status: newStatus });
    }
};
const createMaterial = async (req, res, next) => {
    const transaction = await database_1.default.transaction();
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            await transaction.rollback();
            return next(new errorHandler_1.ValidationError('参数验证失败'));
        }
        const { batchNo, name, type, specification, unit, stockQuantity, warningThreshold, unitPrice, supplier, remarks } = req.body;
        const existing = await Material_1.default.findOne({ where: { batchNo }, transaction });
        if (existing) {
            await transaction.rollback();
            return next(new errorHandler_1.AppError(`批次号 ${batchNo} 已存在`, 400));
        }
        const material = await Material_1.default.create({
            batchNo,
            name,
            type,
            specification,
            unit,
            stockQuantity: stockQuantity || 0,
            warningThreshold: warningThreshold || 10,
            unitPrice: unitPrice || 0,
            supplier,
            remarks,
            status: types_1.MaterialStatus.IN_STOCK,
        }, { transaction });
        await updateMaterialStatus(material);
        await transaction.commit();
        await (0, operationLog_1.createOperationLog)(req, res, types_1.LogModule.MATERIAL, types_1.OperationType.CREATE, material.id, `创建材料: ${material.name}`);
        logger_1.default.info(`材料创建成功: ${material.name}, 批次号: ${material.batchNo}, 创建人: ${req.user?.username}`);
        res.json((0, response_1.successResponse)(material, '材料创建成功'));
    }
    catch (error) {
        await transaction.rollback();
        next(error);
    }
};
exports.createMaterial = createMaterial;
const getMaterialList = async (req, res, next) => {
    try {
        const { page = 1, pageSize = 10, name, batchNo, type, status, supplier, minStock, maxStock, minAvailable, maxAvailable, sortBy = 'createdAt', sortOrder = 'desc', } = req.query;
        const where = {};
        if (name)
            where.name = { [sequelize_1.Op.like]: `%${name}%` };
        if (batchNo)
            where.batchNo = { [sequelize_1.Op.like]: `%${batchNo}%` };
        if (type)
            where.type = type;
        if (status)
            where.status = status;
        if (supplier)
            where.supplier = { [sequelize_1.Op.like]: `%${supplier}%` };
        if (minStock !== undefined || maxStock !== undefined) {
            where.stockQuantity = {};
            if (minStock !== undefined)
                where.stockQuantity[sequelize_1.Op.gte] = Number(minStock);
            if (maxStock !== undefined)
                where.stockQuantity[sequelize_1.Op.lte] = Number(maxStock);
        }
        const validSortFields = ['name', 'batchNo', 'type', 'stockQuantity', 'lockedQuantity', 'status', 'createdAt', 'updatedAt'];
        const orderField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
        const orderDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';
        const { count, rows } = await Material_1.default.findAndCountAll({
            where,
            offset: (Number(page) - 1) * Number(pageSize),
            limit: Number(pageSize),
            order: [[orderField, orderDirection]],
        });
        const materialsWithAvailable = rows.map(material => ({
            ...material.toJSON(),
            availableQuantity: Number(material.stockQuantity) - Number(material.lockedQuantity),
        }));
        let filteredRows = materialsWithAvailable;
        if (minAvailable !== undefined || maxAvailable !== undefined) {
            filteredRows = materialsWithAvailable.filter((m) => {
                if (minAvailable !== undefined && m.availableQuantity < Number(minAvailable))
                    return false;
                if (maxAvailable !== undefined && m.availableQuantity > Number(maxAvailable))
                    return false;
                return true;
            });
        }
        const lowStockCount = await Material_1.default.count({
            where: { status: { [sequelize_1.Op.in]: [types_1.MaterialStatus.LOW_STOCK, types_1.MaterialStatus.OUT_OF_STOCK] } },
        });
        res.json({
            ...(0, response_1.successResponse)(filteredRows),
            data: {
                list: filteredRows,
                total: count,
                page: Number(page),
                pageSize: Number(pageSize),
                lowStockCount,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMaterialList = getMaterialList;
const getMaterialById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const material = await Material_1.default.findByPk(id);
        if (!material) {
            return next(new errorHandler_1.NotFoundError('材料不存在'));
        }
        const availableQuantity = Number(material.stockQuantity) - Number(material.lockedQuantity);
        const activeLocks = await StockLock_1.default.findAll({
            where: { materialId: id, isActive: true },
            order: [['createdAt', 'DESC']],
            limit: 10,
        });
        res.json((0, response_1.successResponse)({
            ...material.toJSON(),
            availableQuantity,
            activeLocks,
        }));
    }
    catch (error) {
        next(error);
    }
};
exports.getMaterialById = getMaterialById;
const updateMaterial = async (req, res, next) => {
    const transaction = await database_1.default.transaction();
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            await transaction.rollback();
            return next(new errorHandler_1.ValidationError('参数验证失败'));
        }
        const { id } = req.params;
        const material = await Material_1.default.findByPk(id, { transaction });
        if (!material) {
            await transaction.rollback();
            return next(new errorHandler_1.NotFoundError('材料不存在'));
        }
        const { batchNo, name, type, specification, unit, stockQuantity, warningThreshold, unitPrice, supplier, remarks, status } = req.body;
        if (batchNo && batchNo !== material.batchNo) {
            const existing = await Material_1.default.findOne({ where: { batchNo }, transaction });
            if (existing) {
                await transaction.rollback();
                return next(new errorHandler_1.AppError(`批次号 ${batchNo} 已存在`, 400));
            }
        }
        await material.update({
            batchNo: batchNo !== undefined ? batchNo : material.batchNo,
            name: name !== undefined ? name : material.name,
            type: type !== undefined ? type : material.type,
            specification: specification !== undefined ? specification : material.specification,
            unit: unit !== undefined ? unit : material.unit,
            stockQuantity: stockQuantity !== undefined ? stockQuantity : material.stockQuantity,
            warningThreshold: warningThreshold !== undefined ? warningThreshold : material.warningThreshold,
            unitPrice: unitPrice !== undefined ? unitPrice : material.unitPrice,
            supplier: supplier !== undefined ? supplier : material.supplier,
            remarks: remarks !== undefined ? remarks : material.remarks,
            status: status !== undefined ? status : material.status,
        }, { transaction });
        await updateMaterialStatus(material);
        await transaction.commit();
        await (0, operationLog_1.createOperationLog)(req, res, types_1.LogModule.MATERIAL, types_1.OperationType.UPDATE, material.id, `更新材料: ${material.name}`);
        logger_1.default.info(`材料更新成功: ${material.name}, 操作人: ${req.user?.username}`);
        res.json((0, response_1.successResponse)(material, '材料更新成功'));
    }
    catch (error) {
        await transaction.rollback();
        next(error);
    }
};
exports.updateMaterial = updateMaterial;
const updateStock = async (req, res, next) => {
    const transaction = await database_1.default.transaction();
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            await transaction.rollback();
            return next(new errorHandler_1.ValidationError('参数验证失败'));
        }
        const { id } = req.params;
        const { quantity, operation, remarks, orderId } = req.body;
        const material = await Material_1.default.findByPk(id, { transaction });
        if (!material) {
            await transaction.rollback();
            return next(new errorHandler_1.NotFoundError('材料不存在'));
        }
        if (material.status === types_1.MaterialStatus.DISCONTINUED) {
            await transaction.rollback();
            return next(new errorHandler_1.AppError('该材料已停用，无法进行库存操作', 400));
        }
        let newStock = Number(material.stockQuantity);
        if (operation === 'in') {
            newStock += Number(quantity);
            logger_1.default.info(`材料入库: ${material.name}, 数量: +${quantity}, 操作人: ${req.user?.username}`);
        }
        else {
            const availableQuantity = Number(material.stockQuantity) - Number(material.lockedQuantity);
            if (availableQuantity < Number(quantity)) {
                await transaction.rollback();
                return next(new errorHandler_1.AppError(`可用库存不足，当前可用: ${availableQuantity}${material.unit}，出库数量: ${quantity}${material.unit}`, 400));
            }
            newStock -= Number(quantity);
            logger_1.default.info(`材料出库: ${material.name}, 数量: -${quantity}, 操作人: ${req.user?.username}`);
        }
        await material.update({ stockQuantity: newStock }, { transaction });
        await updateMaterialStatus(material);
        await transaction.commit();
        await (0, operationLog_1.createOperationLog)(req, res, types_1.LogModule.MATERIAL, operation === 'in' ? types_1.OperationType.STOCK_IN : types_1.OperationType.STOCK_OUT, material.id, `${operation === 'in' ? '入库' : '出库'}材料: ${material.name}, 数量: ${quantity}${material.unit}`);
        const availableQuantity = Number(material.stockQuantity) - Number(material.lockedQuantity);
        res.json((0, response_1.successResponse)({
            ...material.toJSON(),
            availableQuantity,
        }, operation === 'in' ? '入库成功' : '出库成功'));
    }
    catch (error) {
        await transaction.rollback();
        next(error);
    }
};
exports.updateStock = updateStock;
const lockStock = async (req, res, next) => {
    const transaction = await database_1.default.transaction();
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            await transaction.rollback();
            return next(new errorHandler_1.ValidationError('参数验证失败'));
        }
        const { materialId, lockQuantity, lockReason, orderId, orderItemId, remarks } = req.body;
        const material = await Material_1.default.findByPk(materialId, { transaction });
        if (!material) {
            await transaction.rollback();
            return next(new errorHandler_1.NotFoundError('材料不存在'));
        }
        if (material.status === types_1.MaterialStatus.DISCONTINUED) {
            await transaction.rollback();
            return next(new errorHandler_1.AppError('该材料已停用，无法锁定库存', 400));
        }
        const availableQuantity = Number(material.stockQuantity) - Number(material.lockedQuantity);
        if (availableQuantity < Number(lockQuantity)) {
            await transaction.rollback();
            return next(new errorHandler_1.AppError(`可用库存不足，当前可用: ${availableQuantity}${material.unit}，锁定数量: ${lockQuantity}${material.unit}`, 400));
        }
        const stockLock = await StockLock_1.default.create({
            materialId,
            orderId,
            orderItemId,
            lockQuantity,
            lockReason,
            lockedBy: req.user.userId,
            lockedByName: req.user.realName || req.user.username,
            remarks,
        }, { transaction });
        await material.update({ lockedQuantity: Number(material.lockedQuantity) + Number(lockQuantity) }, { transaction });
        await updateMaterialStatus(material);
        await transaction.commit();
        await (0, operationLog_1.createOperationLog)(req, res, types_1.LogModule.MATERIAL, types_1.OperationType.STOCK_LOCK, material.id, `锁定材料库存: ${material.name}, 数量: ${lockQuantity}${material.unit}`);
        logger_1.default.info(`库存锁定成功: ${material.name}, 锁定数量: ${lockQuantity}, 操作人: ${req.user?.username}`);
        res.json((0, response_1.successResponse)(stockLock, '库存锁定成功'));
    }
    catch (error) {
        await transaction.rollback();
        next(error);
    }
};
exports.lockStock = lockStock;
const unlockStock = async (req, res, next) => {
    const transaction = await database_1.default.transaction();
    try {
        const { id } = req.params;
        const stockLock = await StockLock_1.default.findByPk(id, { transaction });
        if (!stockLock) {
            await transaction.rollback();
            return next(new errorHandler_1.NotFoundError('锁定记录不存在'));
        }
        if (!stockLock.isActive) {
            await transaction.rollback();
            return next(new errorHandler_1.AppError('该锁定记录已失效', 400));
        }
        const material = await Material_1.default.findByPk(stockLock.materialId, { transaction });
        if (material) {
            const newLockedQuantity = Math.max(0, Number(material.lockedQuantity) - Number(stockLock.lockQuantity));
            await material.update({ lockedQuantity: newLockedQuantity }, { transaction });
            await updateMaterialStatus(material);
        }
        await stockLock.update({
            isActive: false,
            unlockedAt: new Date(),
            unlockedBy: req.user.userId,
        }, { transaction });
        await transaction.commit();
        await (0, operationLog_1.createOperationLog)(req, res, types_1.LogModule.MATERIAL, types_1.OperationType.STOCK_UNLOCK, stockLock.materialId, `解锁材料库存: ${material?.name || '未知'}, 数量: ${stockLock.lockQuantity}`);
        logger_1.default.info(`库存解锁成功: 锁定ID ${id}, 操作人: ${req.user?.username}`);
        res.json((0, response_1.successResponse)(null, '库存解锁成功'));
    }
    catch (error) {
        await transaction.rollback();
        next(error);
    }
};
exports.unlockStock = unlockStock;
const batchUpdateStock = async (req, res, next) => {
    const transaction = await database_1.default.transaction();
    try {
        const { items, operation, orderId, remarks } = req.body;
        if (!Array.isArray(items) || items.length === 0) {
            await transaction.rollback();
            return next(new errorHandler_1.ValidationError('请选择要操作的材料'));
        }
        if (!['in', 'out'].includes(operation)) {
            await transaction.rollback();
            return next(new errorHandler_1.ValidationError('操作类型无效'));
        }
        const results = [];
        for (const item of items) {
            const material = await Material_1.default.findByPk(item.id, { transaction });
            if (!material) {
                await transaction.rollback();
                return next(new errorHandler_1.NotFoundError(`材料ID ${item.id} 不存在`));
            }
            if (material.status === types_1.MaterialStatus.DISCONTINUED) {
                await transaction.rollback();
                return next(new errorHandler_1.AppError(`材料"${material.name}"已停用，无法进行库存操作`, 400));
            }
            let newStock = Number(material.stockQuantity);
            if (operation === 'in') {
                newStock += Number(item.quantity);
            }
            else {
                const availableQuantity = Number(material.stockQuantity) - Number(material.lockedQuantity);
                if (availableQuantity < Number(item.quantity)) {
                    await transaction.rollback();
                    return next(new errorHandler_1.AppError(`材料"${material.name}"可用库存不足，当前可用: ${availableQuantity}${material.unit}，出库数量: ${item.quantity}${material.unit}`, 400));
                }
                newStock -= Number(item.quantity);
            }
            await material.update({ stockQuantity: newStock }, { transaction });
            await updateMaterialStatus(material);
            results.push(material);
        }
        await transaction.commit();
        for (const material of results) {
            await (0, operationLog_1.createOperationLog)(req, res, types_1.LogModule.MATERIAL, operation === 'in' ? types_1.OperationType.STOCK_IN : types_1.OperationType.STOCK_OUT, material.id, `批量${operation === 'in' ? '入库' : '出库'}: ${material.name}`);
        }
        res.json((0, response_1.successResponse)(results, `批量${operation === 'in' ? '入库' : '出库'}成功，共处理${items.length}条记录`));
    }
    catch (error) {
        await transaction.rollback();
        next(error);
    }
};
exports.batchUpdateStock = batchUpdateStock;
const getLowStockMaterials = async (_req, res, next) => {
    try {
        const materials = await Material_1.default.findAll({
            where: {
                status: { [sequelize_1.Op.in]: [types_1.MaterialStatus.LOW_STOCK, types_1.MaterialStatus.OUT_OF_STOCK] },
            },
            order: [['stockQuantity', 'ASC']],
        });
        const grouped = {
            outOfStock: materials.filter(m => m.status === types_1.MaterialStatus.OUT_OF_STOCK),
            lowStock: materials.filter(m => m.status === types_1.MaterialStatus.LOW_STOCK),
        };
        res.json((0, response_1.successResponse)({
            total: materials.length,
            outOfStockCount: grouped.outOfStock.length,
            lowStockCount: grouped.lowStock.length,
            ...grouped,
        }));
    }
    catch (error) {
        next(error);
    }
};
exports.getLowStockMaterials = getLowStockMaterials;
const getMaterialStatistics = async (_req, res, next) => {
    try {
        const totalCount = await Material_1.default.count();
        const inStockCount = await Material_1.default.count({ where: { status: types_1.MaterialStatus.IN_STOCK } });
        const lowStockCount = await Material_1.default.count({ where: { status: types_1.MaterialStatus.LOW_STOCK } });
        const outOfStockCount = await Material_1.default.count({ where: { status: types_1.MaterialStatus.OUT_OF_STOCK } });
        const discontinuedCount = await Material_1.default.count({ where: { status: types_1.MaterialStatus.DISCONTINUED } });
        const totalValue = await Material_1.default.sum(database_1.default.literal('stockQuantity * unitPrice'), { where: { status: { [sequelize_1.Op.ne]: types_1.MaterialStatus.DISCONTINUED } } });
        const totalLockedValue = await Material_1.default.sum(database_1.default.literal('lockedQuantity * unitPrice'), { where: { status: { [sequelize_1.Op.ne]: types_1.MaterialStatus.DISCONTINUED } } });
        const typeStats = await Material_1.default.findAll({
            attributes: [
                'type',
                [database_1.default.fn('COUNT', database_1.default.col('id')), 'count'],
                [database_1.default.fn('SUM', database_1.default.col('stockQuantity')), 'totalStock'],
                [database_1.default.fn('SUM', database_1.default.col('lockedQuantity')), 'totalLocked'],
                [database_1.default.fn('SUM', database_1.default.literal('stockQuantity * unitPrice')), 'totalValue'],
            ],
            group: ['type'],
        });
        res.json((0, response_1.successResponse)({
            overview: {
                totalCount,
                inStockCount,
                lowStockCount,
                outOfStockCount,
                discontinuedCount,
                totalValue: totalValue || 0,
                totalLockedValue: totalLockedValue || 0,
            },
            byType: typeStats,
        }));
    }
    catch (error) {
        next(error);
    }
};
exports.getMaterialStatistics = getMaterialStatistics;
const deleteMaterial = async (req, res, next) => {
    const transaction = await database_1.default.transaction();
    try {
        const { id } = req.params;
        const material = await Material_1.default.findByPk(id, { transaction });
        if (!material) {
            await transaction.rollback();
            return next(new errorHandler_1.NotFoundError('材料不存在'));
        }
        const activeLocks = await StockLock_1.default.count({
            where: { materialId: id, isActive: true },
            transaction,
        });
        if (activeLocks > 0) {
            await transaction.rollback();
            return next(new errorHandler_1.AppError('该材料存在活跃的库存锁定，无法停用', 400));
        }
        await material.update({ status: types_1.MaterialStatus.DISCONTINUED }, { transaction });
        await transaction.commit();
        await (0, operationLog_1.createOperationLog)(req, res, types_1.LogModule.MATERIAL, types_1.OperationType.DELETE, material.id, `停用材料: ${material.name}`);
        logger_1.default.info(`材料停用成功: ${material.name}, 操作人: ${req.user?.username}`);
        res.json((0, response_1.successResponse)(null, '材料已停用'));
    }
    catch (error) {
        await transaction.rollback();
        next(error);
    }
};
exports.deleteMaterial = deleteMaterial;
//# sourceMappingURL=materialController.js.map