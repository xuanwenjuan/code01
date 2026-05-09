from datetime import date, timedelta
from typing import List, Optional, Dict, Any

from app.models.supply import Supply, ValuableLevel, SupplyStatus
from app.schemas.supply import SupplyCreate, SupplyUpdate, SupplyQuery
from app.storage.memory_storage import MemoryStorage
from app.services.status_manager import StatusManager


class SupplyResult:
    def __init__(self, success: bool, data: Any = None, error: str = "", code: int = 200):
        self.success = success
        self.data = data
        self.error = error
        self.code = code


class SupplyService:
    def __init__(self):
        self.storage = MemoryStorage()

    def _update_all_statuses(self):
        today = date.today()
        for supply in self.storage.get_all_supplies():
            old_status = supply.status
            new_status = StatusManager.calculate_status_based_on_conditions(supply, today)
            if old_status != new_status:
                supply.status = new_status
                self.storage.save_supply(supply)

    def _validate_create_data(self, data: SupplyCreate) -> Optional[str]:
        if data.name.strip() == "":
            return "用品名称不能为空"
        if data.specification.strip() == "":
            return "规格不能为空"
        if data.unit.strip() == "":
            return "单位不能为空"
        if data.location.strip() == "":
            return "存放位置不能为空"
        if data.stock < 0:
            return "库存不能为负数"
        if data.min_stock < 0:
            return "最低库存不能为负数"
        if data.max_single_receive < 0:
            return "单次领用限制不能为负数"
        if data.expiry_date and data.purchase_date > data.expiry_date:
            return "采购日期不能晚于保质期"
        return None

    def create_supply(self, data: SupplyCreate) -> SupplyResult:
        validation_error = self._validate_create_data(data)
        if validation_error:
            return SupplyResult(success=False, error=validation_error, code=400)
        if not self.category_exists(data.category_id):
            return SupplyResult(success=False, error="分类不存在", code=400)
        if self.supply_exists(data.name):
            return SupplyResult(success=False, error="用品名称已存在", code=400)
        today = date.today()
        supply = Supply(
            id=self.storage.get_next_supply_id(),
            name=data.name.strip(),
            category_id=data.category_id,
            specification=data.specification.strip(),
            unit=data.unit.strip(),
            stock=data.stock,
            location=data.location.strip(),
            purchase_date=data.purchase_date,
            expiry_date=data.expiry_date,
            valuable_level=data.valuable_level,
            status=SupplyStatus.NORMAL,
            min_stock=data.min_stock,
            max_single_receive=data.max_single_receive,
            require_approval=data.require_approval
        )
        supply.status = StatusManager.calculate_status_based_on_conditions(supply, today)
        self.storage.save_supply(supply)
        self.storage.increment_supply_id()
        status_info = StatusManager.get_status_info(supply)
        return SupplyResult(
            success=True,
            data={
                "supply": supply.to_dict(),
                "status_info": status_info
            },
            code=201
        )

    def get_all_supplies(self) -> List[Supply]:
        self._update_all_statuses()
        return self.storage.get_all_supplies()

    def get_supply_by_id(self, supply_id: int) -> Optional[Supply]:
        self._update_all_statuses()
        return self.storage.get_supply_by_id(supply_id)

    def _validate_update_data(self, data: SupplyUpdate, existing_supply: Supply) -> Optional[str]:
        if data.name is not None and data.name.strip() == "":
            return "用品名称不能为空"
        if data.specification is not None and data.specification.strip() == "":
            return "规格不能为空"
        if data.unit is not None and data.unit.strip() == "":
            return "单位不能为空"
        if data.location is not None and data.location.strip() == "":
            return "存放位置不能为空"
        if data.stock is not None and data.stock < 0:
            return "库存不能为负数"
        if data.min_stock is not None and data.min_stock < 0:
            return "最低库存不能为负数"
        if data.max_single_receive is not None and data.max_single_receive < 0:
            return "单次领用限制不能为负数"
        return None

    def update_supply(self, supply_id: int, data: SupplyUpdate) -> SupplyResult:
        supply = self.storage.get_supply_by_id(supply_id)
        if not supply:
            return SupplyResult(success=False, error="用品不存在", code=404)
        validation_error = self._validate_update_data(data, supply)
        if validation_error:
            return SupplyResult(success=False, error=validation_error, code=400)
        if data.category_id is not None and not self.category_exists(data.category_id):
            return SupplyResult(success=False, error="分类不存在", code=400)
        if data.name is not None and self.supply_exists(data.name, exclude_id=supply_id):
            return SupplyResult(success=False, error="用品名称已存在", code=400)
        old_status = supply.status
        if data.name is not None:
            supply.name = data.name.strip()
        if data.category_id is not None:
            supply.category_id = data.category_id
        if data.specification is not None:
            supply.specification = data.specification.strip()
        if data.unit is not None:
            supply.unit = data.unit.strip()
        if data.stock is not None:
            supply.stock = max(0, data.stock)
        if data.location is not None:
            supply.location = data.location.strip()
        if data.purchase_date is not None:
            supply.purchase_date = data.purchase_date
        if data.expiry_date is not None:
            supply.expiry_date = data.expiry_date
        if data.valuable_level is not None:
            supply.valuable_level = data.valuable_level
        if data.min_stock is not None:
            supply.min_stock = max(0, data.min_stock)
        if data.max_single_receive is not None:
            supply.max_single_receive = max(0, data.max_single_receive)
        if data.require_approval is not None:
            supply.require_approval = data.require_approval
        today = date.today()
        new_status = StatusManager.calculate_status_based_on_conditions(supply, today)
        status_changed = old_status != new_status
        supply.status = new_status
        self.storage.save_supply(supply)
        status_info = StatusManager.get_status_info(supply)
        return SupplyResult(
            success=True,
            data={
                "supply": supply.to_dict(),
                "status_transition": {
                    "from": old_status.value if hasattr(old_status, "value") else str(old_status),
                    "to": new_status.value if hasattr(new_status, "value") else str(new_status),
                    "changed": status_changed
                },
                "status_info": status_info
            },
            code=200
        )

    def delete_supply(self, supply_id: int) -> SupplyResult:
        if not self.get_supply_by_id(supply_id):
            return SupplyResult(success=False, error="用品不存在", code=404)
        success = self.storage.delete_supply(supply_id)
        if not success:
            return SupplyResult(success=False, error="删除失败", code=500)
        return SupplyResult(success=True, code=200)

    def _apply_sort(self, supplies: List[Supply], sort_by: str, sort_order: str) -> List[Supply]:
        sort_fields = {
            "id": lambda x: x.id,
            "name": lambda x: x.name,
            "stock": lambda x: x.stock,
            "purchase_date": lambda x: x.purchase_date,
            "expiry_date": lambda x: x.expiry_date or date.max,
            "valuable_level": lambda x: x.valuable_level.value if hasattr(x.valuable_level, "value") else str(x.valuable_level),
            "min_stock": lambda x: x.min_stock,
            "days_until_expiry": lambda x: (x.expiry_date - date.today()).days if x.expiry_date else 999999
        }
        if sort_by in sort_fields:
            reverse = sort_order.lower() == "desc"
            return sorted(supplies, key=sort_fields[sort_by], reverse=reverse)
        return sorted(supplies, key=lambda x: x.id)

    def query_supplies(self, query: SupplyQuery) -> Dict[str, Any]:
        supplies = self.get_all_supplies()
        today = date.today()
        filtered = supplies
        if query.category_id is not None:
            filtered = [s for s in filtered if s.category_id == query.category_id]
        if query.valuable_level is not None:
            filtered = [s for s in filtered if s.valuable_level == query.valuable_level]
        if query.status is not None:
            filtered = [s for s in filtered if s.status == query.status]
        if query.min_stock_threshold is not None:
            filtered = [s for s in filtered if s.stock >= query.min_stock_threshold]
        if query.max_stock_threshold is not None:
            filtered = [s for s in filtered if s.stock <= query.max_stock_threshold]
        if query.is_expiring_soon is not None:
            soon = today + timedelta(days=30)
            if query.is_expiring_soon:
                filtered = [s for s in filtered if s.expiry_date and s.expiry_date <= soon and s.expiry_date >= today]
            else:
                filtered = [s for s in filtered if not s.expiry_date or s.expiry_date > soon]
        if query.is_expired is not None:
            if query.is_expired:
                filtered = [s for s in filtered if s.expiry_date and today > s.expiry_date]
            else:
                filtered = [s for s in filtered if not s.expiry_date or today <= s.expiry_date]
        if query.require_approval is not None:
            filtered = [s for s in filtered if s.require_approval == query.require_approval]
        if query.keyword is not None:
            keyword = query.keyword.lower().strip()
            if keyword:
                filtered = [s for s in filtered if keyword in s.name.lower() or keyword in s.specification.lower() or keyword in s.location.lower()]
        filtered = self._apply_sort(filtered, query.sort_by or "id", query.sort_order)
        return {
            "items": [s.to_dict() for s in filtered],
            "total": len(filtered),
            "summary": self._generate_summary(filtered, today)
        }

    def _generate_summary(self, supplies: List[Supply], today: date) -> Dict[str, Any]:
        total_stock = sum(s.stock for s in supplies)
        low_stock_count = sum(1 for s in supplies if s.stock <= s.min_stock)
        expired_count = sum(1 for s in supplies if s.expiry_date and today > s.expiry_date)
        expiring_soon = sum(1 for s in supplies if s.expiry_date and 0 <= (s.expiry_date - today).days <= 30)
        valuable_count = sum(1 for s in supplies if s.valuable_level != ValuableLevel.LOW)
        require_approval_count = sum(1 for s in supplies if s.require_approval)
        return {
            "total_stock": total_stock,
            "low_stock_count": low_stock_count,
            "expired_count": expired_count,
            "expiring_soon_count": expiring_soon,
            "valuable_count": valuable_count,
            "require_approval_count": require_approval_count,
            "status_breakdown": {
                "normal": sum(1 for s in supplies if s.status == SupplyStatus.NORMAL),
                "low_stock": sum(1 for s in supplies if s.status == SupplyStatus.LOW_STOCK),
                "expired": sum(1 for s in supplies if s.status == SupplyStatus.EXPIRED),
                "damaged": sum(1 for s in supplies if s.status == SupplyStatus.DAMAGED),
                "scrapped": sum(1 for s in supplies if s.status == SupplyStatus.SCRAPPED)
            }
        }

    def get_low_stock_supplies(self) -> List[Supply]:
        supplies = self.get_all_supplies()
        low_stock = [s for s in supplies if s.stock <= s.min_stock]
        low_stock.sort(key=lambda x: (x.min_stock - x.stock), reverse=True)
        return low_stock

    def get_expired_supplies(self) -> List[Supply]:
        supplies = self.get_all_supplies()
        today = date.today()
        expired = [s for s in supplies if s.expiry_date and today > s.expiry_date]
        expired.sort(key=lambda x: x.expiry_date if x.expiry_date else date.max)
        return expired

    def get_expiring_soon_supplies(self, days: int = 30) -> List[Supply]:
        supplies = self.get_all_supplies()
        today = date.today()
        soon = today + timedelta(days=days)
        expiring = [s for s in supplies if s.expiry_date and today <= s.expiry_date <= soon]
        expiring.sort(key=lambda x: x.expiry_date if x.expiry_date else date.max)
        return expiring

    def get_valuable_supplies(self) -> List[Supply]:
        supplies = self.get_all_supplies()
        valuable = [s for s in supplies if s.valuable_level in [ValuableLevel.MEDIUM, ValuableLevel.HIGH]]
        valuable.sort(key=lambda x: x.valuable_level.value if hasattr(x.valuable_level, "value") else str(x.valuable_level), reverse=True)
        return valuable

    def get_supply_status_info(self, supply_id: int) -> Optional[Dict[str, Any]]:
        supply = self.get_supply_by_id(supply_id)
        if not supply:
            return None
        return StatusManager.get_status_info(supply)

    def category_exists(self, category_id: int) -> bool:
        return self.storage.get_category_by_id(category_id) is not None

    def supply_exists(self, name: str, exclude_id: Optional[int] = None) -> bool:
        name_lower = name.lower().strip()
        for s in self.storage.get_all_supplies():
            if s.name.lower().strip() == name_lower and (exclude_id is None or s.id != exclude_id):
                return True
        return False
