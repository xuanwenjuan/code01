from datetime import date
from typing import Dict, Any, Tuple

from app.models.supply import Supply, SupplyStatus


class StatusManager:
    @staticmethod
    def _get_status_priority(status: SupplyStatus) -> int:
        priority_map = {
            SupplyStatus.SCRAPPED: 100,
            SupplyStatus.DAMAGED: 90,
            SupplyStatus.EXPIRED: 80,
            SupplyStatus.LOW_STOCK: 50,
            SupplyStatus.NORMAL: 10
        }
        return priority_map.get(status, 0)

    @staticmethod
    def _is_terminal_status(status: SupplyStatus) -> bool:
        return status in [SupplyStatus.SCRAPPED]

    @staticmethod
    def _is_damaged_status(status: SupplyStatus) -> bool:
        return status in [SupplyStatus.DAMAGED]

    @staticmethod
    def can_transition(from_status: SupplyStatus, to_status: SupplyStatus) -> bool:
        if StatusManager._is_terminal_status(from_status):
            return False
        if StatusManager._is_terminal_status(to_status):
            return True
        if StatusManager._is_damaged_status(from_status):
            return to_status in [SupplyStatus.DAMAGED, SupplyStatus.SCRAPPED, SupplyStatus.NORMAL, SupplyStatus.LOW_STOCK]
        return True

    @staticmethod
    def calculate_status_based_on_conditions(
        supply: Supply, 
        today: date | None = None,
        is_damaged: bool = False,
        is_scrapped: bool = False
    ) -> SupplyStatus:
        today = today or date.today()
        if is_scrapped:
            return SupplyStatus.SCRAPPED
        if StatusManager._is_terminal_status(supply.status):
            return supply.status
        if is_damaged:
            return SupplyStatus.DAMAGED
        if StatusManager._is_damaged_status(supply.status):
            if supply.stock <= 0:
                return SupplyStatus.SCRAPPED
            return SupplyStatus.DAMAGED
        if supply.expiry_date and today > supply.expiry_date:
            return SupplyStatus.EXPIRED
        if supply.stock <= supply.min_stock:
            return SupplyStatus.LOW_STOCK
        return SupplyStatus.NORMAL

    @staticmethod
    def update_supply_status(
        supply: Supply,
        operation_type: str,
        stock_change: int,
        is_damaged: bool = False,
        is_scrapped: bool = False,
        today: date | None = None
    ) -> Tuple[SupplyStatus, str]:
        old_status = supply.status
        today = today or date.today()
        new_status = old_status
        transition_reason = "状态无变化"
        if is_scrapped:
            new_status = SupplyStatus.SCRAPPED
            transition_reason = "完全报废，库存清零"
        elif is_damaged:
            if supply.stock <= 0:
                new_status = SupplyStatus.SCRAPPED
                transition_reason = "损坏且库存清零，转为已报废"
            else:
                new_status = SupplyStatus.DAMAGED
                transition_reason = "部分损坏"
        else:
            new_status = StatusManager.calculate_status_based_on_conditions(supply, today)
            if old_status == new_status:
                transition_reason = "状态无变化"
            elif new_status == SupplyStatus.EXPIRED:
                transition_reason = "已过保质期"
            elif new_status == SupplyStatus.LOW_STOCK:
                transition_reason = f"库存低于最低阈值（{supply.min_stock}）"
            elif new_status == SupplyStatus.NORMAL:
                if old_status == SupplyStatus.LOW_STOCK:
                    transition_reason = "库存恢复正常"
                elif old_status == SupplyStatus.EXPIRED:
                    transition_reason = "保质期更新"
                elif old_status == SupplyStatus.DAMAGED:
                    transition_reason = "损坏物品已恢复"
                else:
                    transition_reason = "状态正常"
        if not StatusManager.can_transition(old_status, new_status):
            return old_status, f"无法从{old_status.value}转换到{new_status.value}"
        return new_status, transition_reason

    @staticmethod
    def get_status_info(supply: Supply, today: date | None = None) -> Dict[str, Any]:
        today = today or date.today()
        is_expired = supply.is_expired(today) if hasattr(supply, 'is_expired') else (supply.expiry_date and today > supply.expiry_date)
        days_until_expiry = None
        if supply.expiry_date:
            days_until_expiry = (supply.expiry_date - today).days
        is_low_stock = supply.stock <= supply.min_stock
        is_expiring_soon = days_until_expiry is not None and 0 <= days_until_expiry <= 30
        alert_level = "无保质期"
        if supply.expiry_date:
            if is_expired:
                alert_level = "已过期"
            elif days_until_expiry <= 7:
                alert_level = "紧急"
            elif days_until_expiry <= 30:
                alert_level = "提醒"
            elif days_until_expiry <= 90:
                alert_level = "关注"
            else:
                alert_level = "正常"
        return {
            "current_status": supply.status.value if hasattr(supply.status, "value") else str(supply.status),
            "is_expired": is_expired,
            "is_expiring_soon": is_expiring_soon,
            "is_low_stock": is_low_stock,
            "days_until_expiry": days_until_expiry,
            "alert_level": alert_level,
            "stock_vs_min": {
                "current": supply.stock,
                "minimum": supply.min_stock,
                "deficit": max(0, supply.min_stock - supply.stock),
                "ratio": round(supply.stock / supply.min_stock, 2) if supply.min_stock > 0 else 0
            }
        }
