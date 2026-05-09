from datetime import date, datetime
from typing import List, Optional, Dict, Any

from app.models.supply import Supply, ValuableLevel, SupplyStatus
from app.models.operation import OperationLog, OperationType
from app.schemas.operation import ReceiveRequest, ReturnRequest, WriteOffRequest, ScrapRequest, OperationQuery
from app.storage.memory_storage import MemoryStorage
from app.services.status_manager import StatusManager


class OperationResult:
    def __init__(self, success: bool, data: Any = None, error: str = "", code: int = 200):
        self.success = success
        self.data = data
        self.error = error
        self.code = code

    def to_dict(self) -> Dict[str, Any]:
        if self.success:
            return {
                "success": True,
                "code": self.code,
                "data": self.data
            }
        return {
            "success": False,
            "code": self.code,
            "error": self.error
        }


class OperationService:
    def __init__(self):
        self.storage = MemoryStorage()

    def _get_status_value(self, supply: Supply) -> str:
        if hasattr(supply.status, "value"):
            return supply.status.value
        return str(supply.status)

    def _create_log(
        self,
        supply: Supply,
        op_type: OperationType,
        quantity: int,
        operator: str,
        reason: str,
        before_stock: int,
        after_stock: int,
        before_status: str,
        after_status: str,
        department: str = "",
        approved_by: str = "",
        return_condition: str = "",
        damage_degree: str = "",
        transition_reason: str = ""
    ) -> OperationLog:
        log = OperationLog(
            id=self.storage.get_next_log_id(),
            supply_id=supply.id,
            supply_name=supply.name,
            operation_type=op_type,
            quantity=quantity,
            operator=operator,
            before_stock=before_stock,
            after_stock=after_stock,
            before_status=before_status,
            after_status=after_status,
            reason=reason,
            department=department,
            approved_by=approved_by,
            return_condition=return_condition,
            damage_degree=damage_degree
        )
        self.storage.save_operation_log(log)
        self.storage.increment_log_id()
        return log

    def _update_stock(self, supply: Supply, delta: int) -> int:
        new_stock = max(0, supply.stock + delta)
        supply.stock = new_stock
        return new_stock

    def _check_receive_rules(self, supply: Supply, quantity: int, approved_by: str = "") -> Optional[str]:
        if supply.status == SupplyStatus.SCRAPPED:
            return "该用品已报废，无法领用"
        if supply.status == SupplyStatus.EXPIRED:
            return "该用品已过期，无法领用"
        if quantity <= 0:
            return "领用数量必须大于0"
        if supply.stock < quantity:
            return f"库存不足，当前库存为 {supply.stock}"
        if supply.max_single_receive > 0 and quantity > supply.max_single_receive:
            return f"单次领用数量超过限制，最大允许 {supply.max_single_receive}"
        if supply.valuable_level in [ValuableLevel.MEDIUM, ValuableLevel.HIGH]:
            if supply.valuable_level == ValuableLevel.MEDIUM and not approved_by:
                return "贵重用品领用需要审核人签字"
            if supply.valuable_level == ValuableLevel.HIGH:
                if not approved_by:
                    return "特贵重用品领用必须有审核人"
                if supply.stock - quantity < supply.min_stock:
                    return f"特贵重用品领用后将低于最低库存（{supply.min_stock}），需额外审批"
        if supply.require_approval and not approved_by:
            return "该用品领用需要审核"
        return None

    def receive_supply(self, request: ReceiveRequest) -> OperationResult:
        supply = self.storage.get_supply_by_id(request.supply_id)
        if not supply:
            return OperationResult(success=False, error="用品不存在", code=404)
        error = self._check_receive_rules(supply, request.quantity, request.approved_by)
        if error:
            return OperationResult(success=False, error=error, code=400)
        before_stock = supply.stock
        before_status = self._get_status_value(supply)
        new_stock = self._update_stock(supply, -request.quantity)
        new_status, transition_reason = StatusManager.update_supply_status(
            supply=supply,
            operation_type="receive",
            stock_change=-request.quantity
        )
        supply.status = new_status
        self.storage.save_supply(supply)
        log = self._create_log(
            supply=supply,
            op_type=OperationType.RECEIVE,
            quantity=request.quantity,
            operator=request.operator,
            reason=request.reason,
            before_stock=before_stock,
            after_stock=new_stock,
            before_status=before_status,
            after_status=self._get_status_value(supply),
            department=request.department,
            approved_by=request.approved_by,
            transition_reason=transition_reason
        )
        status_info = StatusManager.get_status_info(supply)
        return OperationResult(
            success=True,
            data={
                "supply": supply.to_dict(),
                "log": log.to_dict(),
                "status_transition": {
                    "from": before_status,
                    "to": self._get_status_value(supply),
                    "reason": transition_reason
                },
                "stock_change": {
                    "before": before_stock,
                    "after": new_stock,
                    "delta": -request.quantity
                },
                "current_status_info": status_info
            },
            code=200
        )

    def _check_return_rules(self, supply: Supply, quantity: int) -> Optional[str]:
        if supply.status == SupplyStatus.SCRAPPED:
            return "该用品已报废，无法归还"
        if quantity <= 0:
            return "归还数量必须大于0"
        return None

    def return_supply(self, request: ReturnRequest) -> OperationResult:
        supply = self.storage.get_supply_by_id(request.supply_id)
        if not supply:
            return OperationResult(success=False, error="用品不存在", code=404)
        error = self._check_return_rules(supply, request.quantity)
        if error:
            return OperationResult(success=False, error=error, code=400)
        before_stock = supply.stock
        before_status = self._get_status_value(supply)
        new_stock = self._update_stock(supply, request.quantity)
        is_damaged = request.return_condition in ["损坏", "严重损坏", "部分损坏"]
        if supply.status == SupplyStatus.DAMAGED and request.return_condition in ["良好", "完好"]:
            new_status, transition_reason = StatusManager.update_supply_status(
                supply=supply,
                operation_type="return",
                stock_change=request.quantity,
                is_damaged=False
            )
        else:
            new_status, transition_reason = StatusManager.update_supply_status(
                supply=supply,
                operation_type="return",
                stock_change=request.quantity,
                is_damaged=is_damaged
            )
        supply.status = new_status
        self.storage.save_supply(supply)
        log = self._create_log(
            supply=supply,
            op_type=OperationType.RETURN,
            quantity=request.quantity,
            operator=request.operator,
            reason=request.reason,
            before_stock=before_stock,
            after_stock=new_stock,
            before_status=before_status,
            after_status=self._get_status_value(supply),
            return_condition=request.return_condition,
            transition_reason=transition_reason
        )
        status_info = StatusManager.get_status_info(supply)
        return OperationResult(
            success=True,
            data={
                "supply": supply.to_dict(),
                "log": log.to_dict(),
                "status_transition": {
                    "from": before_status,
                    "to": self._get_status_value(supply),
                    "reason": transition_reason
                },
                "stock_change": {
                    "before": before_stock,
                    "after": new_stock,
                    "delta": request.quantity
                },
                "return_condition": request.return_condition,
                "current_status_info": status_info
            },
            code=200
        )

    def _check_write_off_rules(self, supply: Supply, quantity: int, approved_by: str = "") -> Optional[str]:
        if quantity <= 0:
            return "核销数量必须大于0"
        if supply.stock < quantity:
            return f"库存不足，当前库存为 {supply.stock}"
        if not approved_by and supply.valuable_level != ValuableLevel.LOW:
            return "非普通用品核销需要审核"
        return None

    def write_off_expired(self, request: WriteOffRequest) -> OperationResult:
        supply = self.storage.get_supply_by_id(request.supply_id)
        if not supply:
            return OperationResult(success=False, error="用品不存在", code=404)
        error = self._check_write_off_rules(supply, request.quantity, request.approved_by)
        if error:
            return OperationResult(success=False, error=error, code=400)
        before_stock = supply.stock
        before_status = self._get_status_value(supply)
        new_stock = self._update_stock(supply, -request.quantity)
        today = date.today()
        is_expired = supply.expiry_date and today > supply.expiry_date
        if new_stock == 0:
            new_status = SupplyStatus.EXPIRED
            transition_reason = "库存已核销完毕，标记为已过期"
        else:
            new_status = StatusManager.calculate_status_based_on_conditions(supply, today)
            if is_expired:
                new_status = SupplyStatus.EXPIRED
                transition_reason = "部分核销，仍有过期库存"
            else:
                transition_reason = "部分核销，剩余库存状态重新计算"
        supply.status = new_status
        self.storage.save_supply(supply)
        log = self._create_log(
            supply=supply,
            op_type=OperationType.EXPIRE_WRITE_OFF,
            quantity=request.quantity,
            operator=request.operator,
            reason=request.reason,
            before_stock=before_stock,
            after_stock=new_stock,
            before_status=before_status,
            after_status=self._get_status_value(supply),
            approved_by=request.approved_by,
            transition_reason=transition_reason
        )
        status_info = StatusManager.get_status_info(supply)
        return OperationResult(
            success=True,
            data={
                "supply": supply.to_dict(),
                "log": log.to_dict(),
                "status_transition": {
                    "from": before_status,
                    "to": self._get_status_value(supply),
                    "reason": transition_reason
                },
                "stock_change": {
                    "before": before_stock,
                    "after": new_stock,
                    "delta": -request.quantity
                },
                "write_off_info": {
                    "is_expired": is_expired,
                    "approved_by": request.approved_by
                },
                "current_status_info": status_info
            },
            code=200
        )

    def _check_scrap_rules(self, supply: Supply, quantity: int, approved_by: str = "") -> Optional[str]:
        if quantity <= 0:
            return "报废数量必须大于0"
        if supply.stock < quantity:
            return f"库存不足，当前库存为 {supply.stock}"
        if not approved_by:
            return "报废操作需要审核人签字"
        return None

    def scrap_damaged(self, request: ScrapRequest) -> OperationResult:
        supply = self.storage.get_supply_by_id(request.supply_id)
        if not supply:
            return OperationResult(success=False, error="用品不存在", code=404)
        error = self._check_scrap_rules(supply, request.quantity, request.approved_by)
        if error:
            return OperationResult(success=False, error=error, code=400)
        before_stock = supply.stock
        before_status = self._get_status_value(supply)
        new_stock = self._update_stock(supply, -request.quantity)
        is_scrapped = new_stock == 0
        new_status, transition_reason = StatusManager.update_supply_status(
            supply=supply,
            operation_type="scrap",
            stock_change=-request.quantity,
            is_damaged=not is_scrapped,
            is_scrapped=is_scrapped
        )
        supply.status = new_status
        self.storage.save_supply(supply)
        log = self._create_log(
            supply=supply,
            op_type=OperationType.DAMAGE_SCRAP,
            quantity=request.quantity,
            operator=request.operator,
            reason=request.reason,
            before_stock=before_stock,
            after_stock=new_stock,
            before_status=before_status,
            after_status=self._get_status_value(supply),
            approved_by=request.approved_by,
            damage_degree=request.damage_degree,
            transition_reason=transition_reason
        )
        status_info = StatusManager.get_status_info(supply)
        return OperationResult(
            success=True,
            data={
                "supply": supply.to_dict(),
                "log": log.to_dict(),
                "status_transition": {
                    "from": before_status,
                    "to": self._get_status_value(supply),
                    "reason": transition_reason
                },
                "stock_change": {
                    "before": before_stock,
                    "after": new_stock,
                    "delta": -request.quantity
                },
                "scrap_info": {
                    "is_fully_scrapped": is_scrapped,
                    "damage_degree": request.damage_degree,
                    "approved_by": request.approved_by
                },
                "current_status_info": status_info
            },
            code=200
        )

    def purchase_supply(self, supply_id: int, quantity: int, operator: str, reason: str = "") -> OperationResult:
        supply = self.storage.get_supply_by_id(supply_id)
        if not supply:
            return OperationResult(success=False, error="用品不存在", code=404)
        if quantity <= 0:
            return OperationResult(success=False, error="采购数量必须大于0", code=400)
        before_stock = supply.stock
        before_status = self._get_status_value(supply)
        new_stock = self._update_stock(supply, quantity)
        new_status, transition_reason = StatusManager.update_supply_status(
            supply=supply,
            operation_type="purchase",
            stock_change=quantity
        )
        supply.status = new_status
        self.storage.save_supply(supply)
        log = self._create_log(
            supply=supply,
            op_type=OperationType.PURCHASE,
            quantity=quantity,
            operator=operator,
            reason=reason,
            before_stock=before_stock,
            after_stock=new_stock,
            before_status=before_status,
            after_status=self._get_status_value(supply),
            transition_reason=transition_reason
        )
        status_info = StatusManager.get_status_info(supply)
        return OperationResult(
            success=True,
            data={
                "supply": supply.to_dict(),
                "log": log.to_dict(),
                "status_transition": {
                    "from": before_status,
                    "to": self._get_status_value(supply),
                    "reason": transition_reason
                },
                "stock_change": {
                    "before": before_stock,
                    "after": new_stock,
                    "delta": quantity
                },
                "current_status_info": status_info
            },
            code=200
        )

    def get_all_logs(self) -> List[OperationLog]:
        return sorted(self.storage.get_all_operation_logs(), key=lambda x: x.created_at, reverse=True)

    def get_logs_by_supply_id(self, supply_id: int) -> List[OperationLog]:
        logs = self.storage.get_operation_logs_by_supply_id(supply_id)
        return sorted(logs, key=lambda x: x.created_at, reverse=True)

    def query_logs(self, query: OperationQuery) -> Dict[str, Any]:
        logs = self.storage.get_all_operation_logs()
        filtered = logs
        if query.supply_id is not None:
            filtered = [l for l in filtered if l.supply_id == query.supply_id]
        if query.operation_type is not None:
            filtered = [l for l in filtered if l.operation_type == query.operation_type]
        if query.operator is not None:
            filtered = [l for l in filtered if query.operator.lower() in l.operator.lower()]
        if query.department is not None:
            filtered = [l for l in filtered if query.department.lower() in l.department.lower()]
        if query.start_date is not None:
            try:
                start = datetime.fromisoformat(query.start_date)
                filtered = [l for l in filtered if l.created_at >= start]
            except (ValueError, TypeError):
                pass
        if query.end_date is not None:
            try:
                end = datetime.fromisoformat(query.end_date)
                filtered = [l for l in filtered if l.created_at <= end]
            except (ValueError, TypeError):
                pass
        filtered.sort(key=lambda x: x.created_at, reverse=True)
        total = len(filtered)
        start_idx = (query.page - 1) * query.page_size
        end_idx = start_idx + query.page_size
        page_logs = filtered[start_idx:end_idx]
        total_pages = (total + query.page_size - 1) // query.page_size if total > 0 else 0
        return {
            "items": [l.to_dict() for l in page_logs],
            "pagination": {
                "total": total,
                "page": query.page,
                "page_size": query.page_size,
                "total_pages": total_pages,
                "has_next": query.page < total_pages,
                "has_prev": query.page > 1
            }
        }
