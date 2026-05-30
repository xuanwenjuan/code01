"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initScheduler = void 0;
const node_schedule_1 = __importDefault(require("node-schedule"));
const models_1 = require("../models");
const types_1 = require("../types");
const sequelize_1 = require("sequelize");
const logger_1 = __importDefault(require("../config/logger"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const initScheduler = () => {
    const timeoutMinutes = parseInt(process.env.ORDER_TIMEOUT_MINUTES || '30');
    node_schedule_1.default.scheduleJob('*/5 * * * *', async () => {
        try {
            logger_1.default.info('执行订单超时检查任务');
            const timeoutTime = new Date(Date.now() - timeoutMinutes * 60 * 1000);
            const expiredOrders = await models_1.Order.findAll({
                where: {
                    status: types_1.OrderStatus.PENDING_PAYMENT,
                    createdAt: { [sequelize_1.Op.lte]: timeoutTime },
                },
            });
            for (const order of expiredOrders) {
                await order.update({ status: types_1.OrderStatus.EXPIRED });
                const systemUser = await models_1.User.findOne({ where: { role: 'admin' } });
                await models_1.OrderLog.create({
                    orderId: order.id,
                    operatorId: systemUser?.id || 1,
                    operatorName: '系统',
                    previousStatus: types_1.OrderStatus.PENDING_PAYMENT,
                    newStatus: types_1.OrderStatus.EXPIRED,
                    action: '订单超时自动取消',
                });
                logger_1.default.info(`订单 ${order.orderNo} 已超时自动取消`);
            }
        }
        catch (error) {
            logger_1.default.error('订单超时检查任务执行失败:', error);
        }
    });
    node_schedule_1.default.scheduleJob('0 9 * * *', async () => {
        try {
            logger_1.default.info('执行库存预警检查任务');
            const { Material, MaterialStatus } = await Promise.resolve().then(() => __importStar(require('../models')));
            const lowStockMaterials = await Material.findAll({
                where: {
                    status: { [sequelize_1.Op.in]: [MaterialStatus.LOW_STOCK, MaterialStatus.OUT_OF_STOCK] },
                },
            });
            if (lowStockMaterials.length > 0) {
                logger_1.default.warn(`发现 ${lowStockMaterials.length} 个库存预警材料:`, lowStockMaterials.map((m) => `${m.name}(${m.batchNo}): ${m.stockQuantity}`).join(', '));
            }
        }
        catch (error) {
            logger_1.default.error('库存预警检查任务执行失败:', error);
        }
    });
    logger_1.default.info('定时任务已启动');
};
exports.initScheduler = initScheduler;
//# sourceMappingURL=index.js.map