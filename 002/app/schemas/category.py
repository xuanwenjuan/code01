from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class CategoryCreate(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    parent_id: Optional[int] = None


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    parent_id: Optional[int] = None


class CategoryResponse(BaseModel):
    id: int
    name: str
    code: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    parent_id: Optional[int] = None

    class Config:
        from_attributes = True


class CategoryListResponse(BaseModel):
    items: List[CategoryResponse]
    total: int
