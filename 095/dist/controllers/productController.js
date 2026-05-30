"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchUpdateProductStatus = exports.deleteProduct = exports.updateProduct = exports.getProductById = exports.getProductList = exports.createProduct = exports.updateProductValidation = exports.createProductValidation = void 0;
const express_validator_1 = require("express-validator");
const Product_1 = __importDefault(require("../models/Product"));
const Category_1 = __importDefault(require("../models/Category"));
const response_1 = require("../utils/response");
const errorHandler_1 = require("../middleware/errorHandler");
const types_1 = require("../types");
const sequelize_1 = require("sequelize");
const categoryController_1 = require("./categoryController");
exports.createProductValidation = [
    (0, express_validator_1.body)('name').notEmpty().withMessage('产品名称不能为空').trim().isLength({ min: 1, max: 200 }).withMessage('产品名称长度应在1-200字符之间'),
    (0, express_validator_1.body)('code').notEmpty().withMessage('产品编码不能为空').trim().isLength({ min: 1, max: 50 }).withMessage('产品编码长度应在1-50字符之间'),
    (0, express_validator_1.body)('categoryId').isInt({ min: 1 }).withMessage('分类ID必须为正整数'),
    (0, express_validator_1.body)('basePrice').isFloat({ min: 0 }).withMessage('基础价格必须为非负数字'),
    (0, express_validator_1.body)('customFee').optional().isFloat({ min: 0 }).withMessage('定制费用必须为非负数字'),
    (0, express_validator_1.body)('description').optional().isLength({ max: 2000 }).withMessage('描述长度不能超过2000字符'),
    (0, express_validator_1.body)('sortOrder').optional().isInt({ min: 0 }).withMessage('排序必须是非负整数'),
];
exports.updateProductValidation = [
    (0, express_validator_1.param)('id').isInt({ min: 1 }).withMessage('产品ID必须为正整数'),
    ...exports.createProductValidation,
];
const createProduct = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return next(new errorHandler_1.AppError(errors.array()[0].msg, 400));
        }
        const { name, code, categoryId, description, basePrice, customFee, images, sortOrder } = req.body;
        const category = await Category_1.default.findByPk(categoryId);
        if (!category) {
            return next(new errorHandler_1.AppError('分类不存在', 404));
        }
        if (category.status === types_1.CategoryStatus.DISCONTINUED) {
            return next(new errorHandler_1.AppError(`该类目"${category.name}"已停产，无法在该类目下创建产品`, 400));
        }
        const hasDiscontinued = await (0, categoryController_1.hasDiscontinuedAncestor)(categoryId);
        if (hasDiscontinued) {
            const chain = await (0, categoryController_1.getCategoryChain)(categoryId);
            const discontinuedNames = chain
                .filter(c => c.status === types_1.CategoryStatus.DISCONTINUED)
                .map(c => c.name)
                .join('、');
            return next(new errorHandler_1.AppError(`类目链中存在已停产的类目[${discontinuedNames}]，无法创建产品`, 400));
        }
        const existing = await Product_1.default.findOne({ where: { code } });
        if (existing) {
            return next(new errorHandler_1.AppError('产品编码已存在', 400));
        }
        const product = await Product_1.default.create({
            name,
            code,
            categoryId,
            description,
            basePrice,
            customFee: customFee || 0,
            images: images || [],
            isActive: true,
            sortOrder: sortOrder || 0,
        });
        res.json((0, response_1.successResponse)(product, '产品创建成功'));
    }
    catch (error) {
        next(error);
    }
};
exports.createProduct = createProduct;
const getProductList = async (req, res, next) => {
    try {
        const { page = 1, pageSize = 10, name, code, categoryId, isActive, minPrice, maxPrice } = req.query;
        const where = {};
        if (name)
            where.name = { [sequelize_1.Op.like]: `%${name}%` };
        if (code)
            where.code = { [sequelize_1.Op.like]: `%${code}%` };
        if (categoryId)
            where.categoryId = categoryId;
        if (isActive !== undefined)
            where.isActive = isActive === 'true';
        if (minPrice !== undefined || maxPrice !== undefined) {
            where.basePrice = {};
            if (minPrice !== undefined)
                where.basePrice[sequelize_1.Op.gte] = Number(minPrice);
            if (maxPrice !== undefined)
                where.basePrice[sequelize_1.Op.lte] = Number(maxPrice);
        }
        const { count, rows } = await Product_1.default.findAndCountAll({
            where,
            offset: (Number(page) - 1) * Number(pageSize),
            limit: Number(pageSize),
            order: [['sortOrder', 'ASC'], ['id', 'DESC']],
            include: [{ model: Category_1.default, as: 'category', attributes: ['id', 'name', 'status'] }],
        });
        res.json((0, response_1.paginatedResponse)(rows, count, Number(page), Number(pageSize)));
    }
    catch (error) {
        next(error);
    }
};
exports.getProductList = getProductList;
const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await Product_1.default.findByPk(id, {
            include: [{ model: Category_1.default, as: 'category', attributes: ['id', 'name', 'status'] }],
        });
        if (!product) {
            return next(new errorHandler_1.AppError('产品不存在', 404));
        }
        const chain = await (0, categoryController_1.getCategoryChain)(product.categoryId);
        res.json((0, response_1.successResponse)({
            ...product.toJSON(),
            categoryChain: chain.map(c => ({ id: c.id, name: c.name, status: c.status })),
        }));
    }
    catch (error) {
        next(error);
    }
};
exports.getProductById = getProductById;
const updateProduct = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return next(new errorHandler_1.AppError(errors.array()[0].msg, 400));
        }
        const { id } = req.params;
        const { name, code, categoryId, description, basePrice, customFee, images, isActive, sortOrder } = req.body;
        const product = await Product_1.default.findByPk(id);
        if (!product) {
            return next(new errorHandler_1.AppError('产品不存在', 404));
        }
        if (categoryId !== undefined) {
            const category = await Category_1.default.findByPk(categoryId);
            if (!category) {
                return next(new errorHandler_1.AppError('分类不存在', 404));
            }
            if (category.status === types_1.CategoryStatus.DISCONTINUED) {
                return next(new errorHandler_1.AppError(`该类目"${category.name}"已停产，无法将产品转移到该类目`, 400));
            }
            const hasDiscontinued = await (0, categoryController_1.hasDiscontinuedAncestor)(categoryId);
            if (hasDiscontinued) {
                const chain = await (0, categoryController_1.getCategoryChain)(categoryId);
                const discontinuedNames = chain
                    .filter(c => c.status === types_1.CategoryStatus.DISCONTINUED)
                    .map(c => c.name)
                    .join('、');
                return next(new errorHandler_1.AppError(`类目链中存在已停产的类目[${discontinuedNames}]，无法转移产品`, 400));
            }
        }
        if (code && code !== product.code) {
            const existing = await Product_1.default.findOne({ where: { code } });
            if (existing) {
                return next(new errorHandler_1.AppError('产品编码已存在', 400));
            }
        }
        await product.update({
            name: name !== undefined ? name : product.name,
            code: code !== undefined ? code : product.code,
            categoryId: categoryId !== undefined ? categoryId : product.categoryId,
            description: description !== undefined ? description : product.description,
            basePrice: basePrice !== undefined ? basePrice : product.basePrice,
            customFee: customFee !== undefined ? customFee : product.customFee,
            images: images !== undefined ? images : product.images,
            isActive: isActive !== undefined ? isActive : product.isActive,
            sortOrder: sortOrder !== undefined ? sortOrder : product.sortOrder,
        });
        res.json((0, response_1.successResponse)(product, '产品更新成功'));
    }
    catch (error) {
        next(error);
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await Product_1.default.findByPk(id);
        if (!product) {
            return next(new errorHandler_1.AppError('产品不存在', 404));
        }
        await product.update({ isActive: false });
        res.json((0, response_1.successResponse)(null, '产品已停用'));
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProduct = deleteProduct;
const batchUpdateProductStatus = async (req, res, next) => {
    try {
        const { ids, isActive } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return next(new errorHandler_1.AppError('请选择要操作的产品', 400));
        }
        if (typeof isActive !== 'boolean') {
            return next(new errorHandler_1.AppError('状态值无效', 400));
        }
        await Product_1.default.update({ isActive }, { where: { id: { [sequelize_1.Op.in]: ids } } });
        res.json((0, response_1.successResponse)(null, `批量更新${ids.length}个产品状态成功`));
    }
    catch (error) {
        next(error);
    }
};
exports.batchUpdateProductStatus = batchUpdateProductStatus;
//# sourceMappingURL=productController.js.map