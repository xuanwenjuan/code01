from enum import Enum


class MaterialLevelValue(str, Enum):
    ORDINARY = "ordinary"
    VALUABLE = "valuable"
    PRECIOUS = "precious"


class OperationType(str, Enum):
    INBOUND = "inbound"
    OUTBOUND = "outbound"
    RETURN = "return"
    DAMAGE = "damage"


class MaterialStatus(str, Enum):
    NORMAL = "normal"
    LOW_STOCK = "low_stock"
    OUT_OF_STOCK = "out_of_stock"
    HIGH_STOCK = "high_stock"
    EXPIRING_SOON = "expiring_soon"
    EXPIRED = "expired"


class LogStatus(str, Enum):
    SUCCESS = "success"
    FAILED = "failed"
    PENDING_APPROVAL = "pending_approval"
    CANCELLED = "cancelled"


class BusinessErrorCode(str, Enum):
    SUCCESS = "00000"
    PARAM_ERROR = "10001"
    NOT_FOUND = "10002"
    STOCK_INSUFFICIENT = "20001"
    STOCK_NEGATIVE = "20002"
    MATERIAL_EXPIRED = "30001"
    MATERIAL_NOT_FOUND = "30002"
    CATEGORY_NOT_FOUND = "40001"
    CATEGORY_HAS_MATERIALS = "40002"
    DUPLICATE_CODE = "40003"
    VALUABLE_MATERIAL_NEED_APPROVAL = "50001"
    PRECIOUS_MATERIAL_NEED_VERIFY = "50002"
    SYSTEM_ERROR = "99999"


class ExpiryLevel(str, Enum):
    NORMAL = "normal"
    WARNING_7D = "warning_7d"
    WARNING_30D = "warning_30d"
    EXPIRED = "expired"
