"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockLockReason = exports.LogModule = exports.OperationType = exports.LedgerStatus = exports.CategoryStatus = exports.MaterialType = exports.MaterialStatus = exports.OrderStatus = exports.PermissionLevel = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["ADMIN"] = "admin";
    UserRole["CUSTOMER_SERVICE"] = "customer_service";
    UserRole["WAREHOUSE_ADMIN"] = "warehouse_admin";
    UserRole["WAREHOUSE"] = "warehouse";
    UserRole["FINANCE"] = "finance";
})(UserRole || (exports.UserRole = UserRole = {}));
var PermissionLevel;
(function (PermissionLevel) {
    PermissionLevel["READ"] = "read";
    PermissionLevel["WRITE"] = "write";
    PermissionLevel["DELETE"] = "delete";
    PermissionLevel["AUDIT"] = "audit";
    PermissionLevel["ALL"] = "all";
})(PermissionLevel || (exports.PermissionLevel = PermissionLevel = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING_PAYMENT"] = "pending_payment";
    OrderStatus["PAID"] = "paid";
    OrderStatus["PRODUCING"] = "producing";
    OrderStatus["QUALITY_CHECKING"] = "quality_checking";
    OrderStatus["SHIPPED"] = "shipped";
    OrderStatus["COMPLETED"] = "completed";
    OrderStatus["CANCELLED"] = "cancelled";
    OrderStatus["REFUNDING"] = "refunding";
    OrderStatus["REFUNDED"] = "refunded";
    OrderStatus["EXPIRED"] = "expired";
    OrderStatus["RETURNING"] = "returning";
    OrderStatus["RETURNED"] = "returned";
    OrderStatus["PARTIAL_RETURNED"] = "partial_returned";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var MaterialStatus;
(function (MaterialStatus) {
    MaterialStatus["IN_STOCK"] = "in_stock";
    MaterialStatus["LOW_STOCK"] = "low_stock";
    MaterialStatus["OUT_OF_STOCK"] = "out_of_stock";
    MaterialStatus["LOCKED"] = "locked";
    MaterialStatus["DISCONTINUED"] = "discontinued";
})(MaterialStatus || (exports.MaterialStatus = MaterialStatus = {}));
var MaterialType;
(function (MaterialType) {
    MaterialType["FABRIC"] = "fabric";
    MaterialType["FILLING"] = "filling";
    MaterialType["HARDWARE"] = "hardware";
    MaterialType["SIZE"] = "size";
    MaterialType["OTHER"] = "other";
})(MaterialType || (exports.MaterialType = MaterialType = {}));
var CategoryStatus;
(function (CategoryStatus) {
    CategoryStatus["ACTIVE"] = "active";
    CategoryStatus["INACTIVE"] = "inactive";
    CategoryStatus["DISCONTINUED"] = "discontinued";
})(CategoryStatus || (exports.CategoryStatus = CategoryStatus = {}));
var LedgerStatus;
(function (LedgerStatus) {
    LedgerStatus["DRAFT"] = "draft";
    LedgerStatus["FINALIZED"] = "finalized";
    LedgerStatus["REJECTED"] = "rejected";
    LedgerStatus["ADJUSTED"] = "adjusted";
})(LedgerStatus || (exports.LedgerStatus = LedgerStatus = {}));
var OperationType;
(function (OperationType) {
    OperationType["CREATE"] = "create";
    OperationType["UPDATE"] = "update";
    OperationType["DELETE"] = "delete";
    OperationType["STATUS_CHANGE"] = "status_change";
    OperationType["STOCK_IN"] = "stock_in";
    OperationType["STOCK_OUT"] = "stock_out";
    OperationType["STOCK_LOCK"] = "stock_lock";
    OperationType["STOCK_UNLOCK"] = "stock_unlock";
    OperationType["RETURN"] = "return";
    OperationType["REFUND"] = "refund";
    OperationType["AUDIT"] = "audit";
    OperationType["EXPORT"] = "export";
})(OperationType || (exports.OperationType = OperationType = {}));
var LogModule;
(function (LogModule) {
    LogModule["USER"] = "user";
    LogModule["CATEGORY"] = "category";
    LogModule["PRODUCT"] = "product";
    LogModule["MATERIAL"] = "material";
    LogModule["ORDER"] = "order";
    LogModule["LEDGER"] = "ledger";
    LogModule["SYSTEM"] = "system";
})(LogModule || (exports.LogModule = LogModule = {}));
var StockLockReason;
(function (StockLockReason) {
    StockLockReason["ORDER_PRODUCTION"] = "order_production";
    StockLockReason["RESERVATION"] = "reservation";
    StockLockReason["QUALITY_CHECK"] = "quality_check";
    StockLockReason["OTHER"] = "other";
})(StockLockReason || (exports.StockLockReason = StockLockReason = {}));
//# sourceMappingURL=index.js.map