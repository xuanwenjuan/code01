from datetime import date, timedelta
from enum import Enum


class ValuableLevel(str, Enum):
    LOW = "普通"
    MEDIUM = "贵重"
    HIGH = "特贵重"


class SupplyStatus(str, Enum):
    NORMAL = "正常"
    LOW_STOCK = "库存不足"
    EXPIRED = "已过期"
    DAMAGED = "已损坏"
    SCRAPPED = "已报废"


class Supply:
    def __init__(
        self,
        id: int,
        name: str,
        category_id: int,
        specification: str,
        unit: str,
        stock: int,
        location: str,
        purchase_date: date,
        expiry_date: date | None = None,
        valuable_level: ValuableLevel = ValuableLevel.LOW,
        status: SupplyStatus = SupplyStatus.NORMAL,
        min_stock: int = 10,
        max_single_receive: int = 0,
        require_approval: bool = False
    ):
        self.id = id
        self.name = name
        self.category_id = category_id
        self.specification = specification
        self.unit = unit
        self.stock = max(0, stock)
        self.location = location
        self.purchase_date = purchase_date
        self.expiry_date = expiry_date
        self.valuable_level = valuable_level
        self.status = status
        self.min_stock = max(0, min_stock)
        self.max_single_receive = max(0, max_single_receive)
        self.require_approval = require_approval

    def get_days_until_expiry(self, today: date | None = None) -> int | None:
        if not self.expiry_date:
            return None
        today = today or date.today()
        return (self.expiry_date - today).days

    def is_expired(self, today: date | None = None) -> bool:
        if not self.expiry_date:
            return False
        today = today or date.today()
        return today > self.expiry_date

    def is_expiring_soon(self, days: int = 30, today: date | None = None) -> bool:
        if not self.expiry_date:
            return False
        today = today or date.today()
        days_left = self.get_days_until_expiry(today)
        return days_left is not None and 0 <= days_left <= days

    def get_expiry_alert_level(self, today: date | None = None) -> str:
        if not self.expiry_date:
            return "无保质期"
        today = today or date.today()
        if self.is_expired(today):
            return "已过期"
        days_left = self.get_days_until_expiry(today)
        if days_left <= 7:
            return "紧急"
        elif days_left <= 30:
            return "提醒"
        elif days_left <= 90:
            return "关注"
        else:
            return "正常"

    def to_dict(self) -> dict:
        today = date.today()
        return {
            "id": self.id,
            "name": self.name,
            "category_id": self.category_id,
            "specification": self.specification,
            "unit": self.unit,
            "stock": self.stock,
            "location": self.location,
            "purchase_date": self.purchase_date.isoformat() if self.purchase_date else None,
            "expiry_date": self.expiry_date.isoformat() if self.expiry_date else None,
            "valuable_level": self.valuable_level.value if hasattr(self.valuable_level, "value") else self.valuable_level,
            "status": self.status.value if hasattr(self.status, "value") else self.status,
            "min_stock": self.min_stock,
            "max_single_receive": self.max_single_receive,
            "require_approval": self.require_approval,
            "days_until_expiry": self.get_days_until_expiry(today),
            "is_expired": self.is_expired(today),
            "is_expiring_soon": self.is_expiring_soon(today=today),
            "expiry_alert_level": self.get_expiry_alert_level(today),
            "is_low_stock": self.stock <= self.min_stock
        }
