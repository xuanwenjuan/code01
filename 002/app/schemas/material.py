from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.models.enums import MaterialLevelValue, MaterialStatus


class MaterialLevelCreate(BaseModel):
    level: MaterialLevelValue = MaterialLevelValue.ORDINARY
    min_stock: int = 0
    max_stock: Optional[int] = None


class MaterialCreate(BaseModel):
    name: str
    specification: str
    model: str
    stock_quantity: int = 0
    location_code: str
    shelf_life: Optional[int] = None
    production_date: Optional[datetime] = None
    category_id: int
    level: Optional[MaterialLevelCreate] = None


class MaterialUpdate(BaseModel):
    name: Optional[str] = None
    specification: Optional[str] = None
    model: Optional[str] = None
    location_code: Optional[str] = None
    shelf_life: Optional[int] = None
    production_date: Optional[datetime] = None
    category_id: Optional[int] = None
    level: Optional[MaterialLevelCreate] = None


class MaterialResponse(BaseModel):
    id: int
    name: str
    specification: str
    model: str
    stock_quantity: int
    location_code: str
    shelf_life: Optional[int] = None
    production_date: Optional[datetime] = None
    category_id: int
    level: MaterialLevelCreate
    status: MaterialStatus
    expiry_warning: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MaterialListResponse(BaseModel):
    items: List[MaterialResponse]
    total: int
    page: int
    page_size: int
