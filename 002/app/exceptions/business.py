from app.models.enums import BusinessErrorCode


class BusinessException(Exception):
    def __init__(self, code: str, message: str, http_status: int = 400):
        self.code = code
        self.message = message
        self.http_status = http_status
        super().__init__(message)


class MaterialNotFoundException(BusinessException):
    def __init__(self, material_id: int):
        super().__init__(
            code=BusinessErrorCode.MATERIAL_NOT_FOUND.value,
            message=f"物料 {material_id} 不存在",
            http_status=404,
        )


class CategoryNotFoundException(BusinessException):
    def __init__(self, category_id: int):
        super().__init__(
            code=BusinessErrorCode.CATEGORY_NOT_FOUND.value,
            message=f"分类 {category_id} 不存在",
            http_status=404,
        )


class StockInsufficientException(BusinessException):
    def __init__(self, available: int, requested: int):
        super().__init__(
            code=BusinessErrorCode.STOCK_INSUFFICIENT.value,
            message=f"库存不足: 当前库存 {available}, 请求数量 {requested}",
            http_status=400,
        )


class MaterialExpiredException(BusinessException):
    def __init__(self, material_id: int, material_name: str, days_expired: int):
        super().__init__(
            code=BusinessErrorCode.MATERIAL_EXPIRED.value,
            message=f"物料 [{material_name}] (ID: {material_id}) 已过期 {days_expired} 天，禁止出库",
            http_status=400,
        )


class DuplicateCodeException(BusinessException):
    def __init__(self, code: str):
        super().__init__(
            code=BusinessErrorCode.DUPLICATE_CODE.value,
            message=f"编码 {code} 已存在",
            http_status=400,
        )


class CategoryHasMaterialsException(BusinessException):
    def __init__(self, category_id: int, material_count: int):
        super().__init__(
            code=BusinessErrorCode.CATEGORY_HAS_MATERIALS.value,
            message=f"分类 {category_id} 下存在 {material_count} 个物料，无法删除",
            http_status=400,
        )


class ValuableMaterialNeedApprovalException(BusinessException):
    def __init__(self, material_id: int, material_name: str, quantity: int, operator: str):
        super().__init__(
            code=BusinessErrorCode.VALUABLE_MATERIAL_NEED_APPROVAL.value,
            message=f"贵重物料出库需审批: 物料 [{material_name}] (ID: {material_id}) 数量 {quantity} 操作人 {operator}",
            http_status=403,
        )


class PreciousMaterialNeedVerifyException(BusinessException):
    def __init__(self, material_id: int, material_name: str, quantity: int, operator: str):
        super().__init__(
            code=BusinessErrorCode.PRECIOUS_MATERIAL_NEED_VERIFY.value,
            message=f"珍贵物料出库需双人复核: 物料 [{material_name}] (ID: {material_id}) 数量 {quantity} 操作人 {operator}",
            http_status=403,
        )
