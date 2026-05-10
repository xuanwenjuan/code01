from datetime import datetime
from typing import Any, Generic, List, Optional, TypeVar

from pydantic import BaseModel, Field

from app.models.enums import BusinessErrorCode

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    code: int = 200
    biz_code: str = BusinessErrorCode.SUCCESS.value
    message: str = "success"
    data: Optional[T] = None
    timestamp: datetime = Field(default_factory=datetime.now)


class SuccessResponse(ApiResponse[T]):
    code: int = 200
    biz_code: str = BusinessErrorCode.SUCCESS.value
    message: str = "success"


class CreatedResponse(ApiResponse[T]):
    code: int = 201
    biz_code: str = BusinessErrorCode.SUCCESS.value
    message: str = "created"


class ErrorResponse(BaseModel):
    code: int
    biz_code: str
    message: str
    data: Optional[Any] = None
    timestamp: datetime = Field(default_factory=datetime.now)


class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=10, ge=1, le=100)


class FilterParams(BaseModel):
    category_id: Optional[int] = None
    min_stock: Optional[int] = None
    max_stock: Optional[int] = None
    material_level: Optional[str] = None
    expiring_soon: Optional[bool] = None
    keyword: Optional[str] = None
    low_stock: Optional[bool] = None
    high_stock: Optional[bool] = None
    out_of_stock: Optional[bool] = None
    expired: Optional[bool] = None
    location_code: Optional[str] = None
    status: Optional[str] = None


class LogFilterParams(BaseModel):
    material_id: Optional[int] = None
    operation_type: Optional[str] = None
    operator: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    batch_no: Optional[str] = None
    has_warning: Optional[bool] = None
    status: Optional[str] = None


class InventoryStatsResponse(BaseModel):
    total_materials: int
    total_stock: int
    low_stock_count: int
    high_stock_count: int
    status_distribution: dict
    level_distribution: dict
    expiry_distribution: dict
    expiry_stats: dict
