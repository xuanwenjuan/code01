from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.enums import MaterialLevelValue, MaterialStatus


class MaterialLevel(BaseModel):
    level: MaterialLevelValue = MaterialLevelValue.ORDINARY
    min_stock: int = 0
    max_stock: Optional[int] = None


class Material(BaseModel):
    id: int
    name: str
    specification: str
    model: str
    stock_quantity: int = 0
    location_code: str
    shelf_life: Optional[int] = None
    production_date: Optional[datetime] = None
    category_id: int
    level: MaterialLevel = Field(default_factory=MaterialLevel)
    status: MaterialStatus = MaterialStatus.NORMAL
    expiry_warning: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
