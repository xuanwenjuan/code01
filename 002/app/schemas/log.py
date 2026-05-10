from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.models.enums import LogStatus, OperationType


class OperationLogResponse(BaseModel):
    id: int
    material_id: int
    operation_type: OperationType
    quantity: int
    operator: str
    operation_time: datetime
    previous_stock: int
    remaining_stock: int
    previous_status: Optional[str] = None
    new_status: Optional[str] = None
    remarks: Optional[str] = None
    status: LogStatus
    batch_no: Optional[str] = None
    stock_warning: Optional[str] = None
    expiry_warning: Optional[str] = None

    class Config:
        from_attributes = True


class OperationLogListResponse(BaseModel):
    items: List[OperationLogResponse]
    total: int
    page: int
    page_size: int
