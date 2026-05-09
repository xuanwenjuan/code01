from pydantic import BaseModel, Field
from app.models.category import CategoryType


class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    type: CategoryType
    description: str = Field(default="", max_length=200)


class CategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=50)
    type: CategoryType | None = None
    description: str | None = Field(default=None, max_length=200)


class CategoryResponse(BaseModel):
    id: int
    name: str
    type: CategoryType
    description: str

    class Config:
        from_attributes = True
