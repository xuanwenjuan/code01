from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.enums import LogStatus, OperationType


class OperationLog(BaseModel):
    id: int
    material_id: int
    operation_type: OperationType
    quantity: int
    operator: str
    operation_time: datetime = Field(default_factory=datetime.now)
    previous_stock: int
    remaining_stock: int
    previous_status: Optional[str] = None
    new_status: Optional[str] = None
    remarks: Optional[str] = None
    status: LogStatus = LogStatus.SUCCESS
    batch_no: Optional[str] = None
    stock_warning: Optional[str] = None
    expiry_warning: Optional[str] = None
