"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commonValidations = exports.validateDateRange = exports.validatePagination = exports.validateId = exports.validate = void 0;
const express_validator_1 = require("express-validator");
const response_1 = require("../utils/response");
const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));
        const errors = (0, express_validator_1.validationResult)(req);
        if (errors.isEmpty()) {
            return next();
        }
        const formattedErrors = errors.array().map(err => ({
            field: err.path,
            message: err.msg,
            value: err.value,
        }));
        return res.status(400).json((0, response_1.validationErrorResponse)(formattedErrors));
    };
};
exports.validate = validate;
const validateId = (field = 'id') => {
    return (0, express_validator_1.param)(field).isInt({ min: 1 }).withMessage(`${field} 必须是正整数`);
};
exports.validateId = validateId;
const validatePagination = () => {
    return [
        (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('page 必须是正整数'),
        (0, express_validator_1.query)('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('pageSize 必须在 1-100 之间'),
        (0, express_validator_1.query)('sortBy').optional().isString().withMessage('sortBy 必须是字符串'),
        (0, express_validator_1.query)('sortOrder').optional().isIn(['asc', 'desc']).withMessage('sortOrder 必须是 asc 或 desc'),
    ];
};
exports.validatePagination = validatePagination;
const validateDateRange = (startField = 'startDate', endField = 'endDate') => {
    return [
        (0, express_validator_1.query)(startField).optional().isISO8601().withMessage(`${startField} 格式不正确`),
        (0, express_validator_1.query)(endField).optional().isISO8601().withMessage(`${endField} 格式不正确`),
    ];
};
exports.validateDateRange = validateDateRange;
exports.commonValidations = {
    requiredString: (field, min = 1, max = 255) => (0, express_validator_1.body)(field).notEmpty().withMessage(`${field} 不能为空`).trim().isLength({ min, max }).withMessage(`${field} 长度应在 ${min}-${max} 字符之间`),
    optionalString: (field, max = 255) => (0, express_validator_1.body)(field).optional().trim().isLength({ max }).withMessage(`${field} 长度不能超过 ${max} 字符`),
    requiredInt: (field, min = 1) => (0, express_validator_1.body)(field).isInt({ min }).withMessage(`${field} 必须是大于等于 ${min} 的整数`),
    optionalInt: (field, min = 0) => (0, express_validator_1.body)(field).optional().isInt({ min }).withMessage(`${field} 必须是大于等于 ${min} 的整数`),
    requiredFloat: (field, min = 0) => (0, express_validator_1.body)(field).isFloat({ min }).withMessage(`${field} 必须是大于等于 ${min} 的数字`),
    optionalFloat: (field, min = 0) => (0, express_validator_1.body)(field).optional().isFloat({ min }).withMessage(`${field} 必须是大于等于 ${min} 的数字`),
    requiredEmail: (field = 'email') => (0, express_validator_1.body)(field).isEmail().withMessage('邮箱格式不正确'),
    requiredPhone: (field = 'phone') => (0, express_validator_1.body)(field).optional().isLength({ max: 20 }).withMessage('电话长度不能超过 20 字符'),
    requiredEnum: (field, enumValues, enumName = field) => (0, express_validator_1.body)(field).isIn(enumValues).withMessage(`${enumName} 值无效，有效值：${enumValues.join(', ')}`),
    optionalEnum: (field, enumValues, enumName = field) => (0, express_validator_1.body)(field).optional().isIn(enumValues).withMessage(`${enumName} 值无效，有效值：${enumValues.join(', ')}`),
    requiredArray: (field, minLength = 1) => (0, express_validator_1.body)(field).isArray({ min: minLength }).withMessage(`${field} 必须是至少包含 ${minLength} 个元素的数组`),
    optionalArray: (field) => (0, express_validator_1.body)(field).optional().isArray().withMessage(`${field} 必须是数组格式`),
    requiredBoolean: (field) => (0, express_validator_1.body)(field).isBoolean().withMessage(`${field} 必须是布尔值`),
    optionalBoolean: (field) => (0, express_validator_1.body)(field).optional().isBoolean().withMessage(`${field} 必须是布尔值`),
    requiredUrl: (field) => (0, express_validator_1.body)(field).isURL().withMessage(`${field} 必须是有效的 URL`),
    optionalUrl: (field) => (0, express_validator_1.body)(field).optional().isURL().withMessage(`${field} 必须是有效的 URL`),
};
//# sourceMappingURL=validate.js.map