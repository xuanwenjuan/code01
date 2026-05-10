from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class InventoryOperation(BaseModel):
    material_id: int
    quantity: int = Field(gt=0)
    operator: str
    remarks: Optional[str] = None
    batch_no: Optional[str] = None


class InboundOperation(InventoryOperation):
    pass


class OutboundOperation(InventoryOperation):
    require_approval: bool = False


class ReturnOperation(InventoryOperation):
    original_outbound_log_id: Optional[int] = None


class DamageOperation(InventoryOperation):
    reason: str


class BatchInventoryItem(BaseModel):
    material_id: int
    quantity: int = Field(gt=0)
    remarks: Optional[str] = None
    batch_no: Optional[str] = None


class BatchInboundOperation(BaseModel):
    items: List[BatchInventoryItem]
    operator: str
    batch_no: Optional[str] = None


class BatchOutboundOperation(BaseModel):
    items: List[BatchInventoryItem]
    operator: str
    batch_no: Optional[str] = None
    require_approval: bool = False
