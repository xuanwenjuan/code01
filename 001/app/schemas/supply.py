from datetime import date
from pydantic import BaseModel, Field
from app.models.supply import ValuableLevel, SupplyStatus


class SupplyCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    category_id: int
    specification: str = Field(..., max_length=200)
    unit: str = Field(..., max_length=20)
    stock: int = Field(..., ge=0)
    location: str = Field(..., max_length=100)
    purchase_date: date
    expiry_date: date | None = None
    valuable_level: ValuableLevel = ValuableLevel.LOW
    min_stock: int = Field(default=10, ge=0)
    max_single_receive: int = Field(default=0, ge=0)
    require_approval: bool = False


class SupplyUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    category_id: int | None = None
    specification: str | None = Field(default=None, max_length=200)
    unit: str | None = Field(default=None, max_length=20)
    stock: int | None = Field(default=None, ge=0)
    location: str | None = Field(default=None, max_length=100)
    purchase_date: date | None = None
    expiry_date: date | None = None
    valuable_level: ValuableLevel | None = None
    min_stock: int | None = Field(default=None, ge=0)
    max_single_receive: int | None = Field(default=None, ge=0)
    require_approval: bool | None = None


class SupplyResponse(BaseModel):
    id: int
    name: str
    category_id: int
    specification: str
    unit: str
    stock: int
    location: str
    purchase_date: date
    expiry_date: date | None = None
    valuable_level: ValuableLevel
    status: SupplyStatus
    min_stock: int
    max_single_receive: int
    require_approval: bool

    class Config:
        from_attributes = True


class SupplyQuery(BaseModel):
    category_id: int | None = None
    valuable_level: ValuableLevel | None = None
    status: SupplyStatus | None = None
    min_stock_threshold: int | None = None
    max_stock_threshold: int | None = None
    is_expiring_soon: bool | None = None
    is_expired: bool | None = None
    require_approval: bool | None = None
    keyword: str | None = None
    sort_by: str | None = None
    sort_order: str = "asc"
