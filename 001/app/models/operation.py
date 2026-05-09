from datetime import datetime
from enum import Enum


class OperationType(str, Enum):
    RECEIVE = "领用"
    RETURN = "归还"
    EXPIRE_WRITE_OFF = "过期核销"
    DAMAGE_SCRAP = "损坏报废"
    PURCHASE = "采购入库"


class OperationLog:
    def __init__(
        self,
        id: int,
        supply_id: int,
        supply_name: str,
        operation_type: OperationType,
        quantity: int,
        operator: str,
        before_stock: int,
        after_stock: int,
        before_status: str,
        after_status: str,
        reason: str = "",
        created_at: datetime | None = None,
        department: str = "",
        approved_by: str = "",
        return_condition: str = "",
        damage_degree: str = ""
    ):
        self.id = id
        self.supply_id = supply_id
        self.supply_name = supply_name
        self.operation_type = operation_type
        self.quantity = quantity
        self.operator = operator
        self.before_stock = before_stock
        self.after_stock = after_stock
        self.before_status = before_status
        self.after_status = after_status
        self.reason = reason
        self.created_at = created_at or datetime.now()
        self.department = department
        self.approved_by = approved_by
        self.return_condition = return_condition
        self.damage_degree = damage_degree

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "supply_id": self.supply_id,
            "supply_name": self.supply_name,
            "operation_type": self.operation_type.value if hasattr(self.operation_type, "value") else self.operation_type,
            "quantity": self.quantity,
            "operator": self.operator,
            "before_stock": self.before_stock,
            "after_stock": self.after_stock,
            "before_status": self.before_status,
            "after_status": self.after_status,
            "reason": self.reason,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "department": self.department,
            "approved_by": self.approved_by,
            "return_condition": self.return_condition,
            "damage_degree": self.damage_degree
        }
