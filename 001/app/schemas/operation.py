from pydantic import BaseModel, Field
from app.models.operation import OperationType


class ReceiveRequest(BaseModel):
    supply_id: int
    quantity: int = Field(..., gt=0)
    operator: str = Field(..., min_length=1, max_length=50)
    reason: str = Field(default="", max_length=200)
    department: str = Field(default="", max_length=100)
    approved_by: str = Field(default="", max_length=50)


class ReturnRequest(BaseModel):
    supply_id: int
    quantity: int = Field(..., gt=0)
    operator: str = Field(..., min_length=1, max_length=50)
    reason: str = Field(default="", max_length=200)
    return_condition: str = Field(default="良好", max_length=50)


class WriteOffRequest(BaseModel):
    supply_id: int
    quantity: int = Field(..., gt=0)
    operator: str = Field(..., min_length=1, max_length=50)
    reason: str = Field(..., min_length=1, max_length=200)
    approved_by: str = Field(default="", max_length=50)


class ScrapRequest(BaseModel):
    supply_id: int
    quantity: int = Field(..., gt=0)
    operator: str = Field(..., min_length=1, max_length=50)
    reason: str = Field(..., min_length=1, max_length=200)
    damage_degree: str = Field(default="严重", max_length=50)
    approved_by: str = Field(default="", max_length=50)


class OperationLogResponse(BaseModel):
    id: int
    supply_id: int
    supply_name: str
    operation_type: OperationType
    quantity: int
    operator: str
    before_stock: int
    after_stock: int
    before_status: str
    after_status: str
    reason: str
    created_at: str
    department: str
    approved_by: str
    return_condition: str
    damage_degree: str

    class Config:
        from_attributes = True


class OperationQuery(BaseModel):
    supply_id: int | None = None
    operation_type: OperationType | None = None
    operator: str | None = None
    department: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
