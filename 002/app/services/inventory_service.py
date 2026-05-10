from datetime import datetime, timedelta
from typing import List, Optional, Tuple

from app.models.enums import (
    ExpiryLevel,
    LogStatus,
    MaterialLevelValue,
    MaterialStatus,
    OperationType,
)
from app.models.log import OperationLog
from app.models.material import Material
from app.repositories import log_repository, material_repository
from app.schemas.inventory import (
    BatchInboundOperation,
    BatchOutboundOperation,
    DamageOperation,
    InboundOperation,
    OutboundOperation,
    ReturnOperation,
)
from app.exceptions import (
    MaterialExpiredException,
    MaterialNotFoundException,
    StockInsufficientException,
    ValuableMaterialNeedApprovalException,
    PreciousMaterialNeedVerifyException,
)


class InventoryService:
    def __init__(self):
        self.material_repo = material_repository
        self.log_repo = log_repository
    
    def _get_expiry_info(self, material: Material) -> Tuple[ExpiryLevel, Optional[str], int]:
        if material.shelf_life is None or material.production_date is None:
            return ExpiryLevel.NORMAL, None, 0
        
        now = datetime.now()
        expiry_date = material.production_date + timedelta(days=material.shelf_life)
        days_to_expiry = (expiry_date - now).days
        
        if days_to_expiry < 0:
            return ExpiryLevel.EXPIRED, f"已过期 {-days_to_expiry} 天", -days_to_expiry
        elif days_to_expiry <= 7:
            return ExpiryLevel.WARNING_7D, f"7天内过期: 还剩 {days_to_expiry} 天", days_to_expiry
        elif days_to_expiry <= 30:
            return ExpiryLevel.WARNING_30D, f"30天内过期: 还剩 {days_to_expiry} 天", days_to_expiry
        else:
            return ExpiryLevel.NORMAL, None, days_to_expiry
    
    def _get_stock_status(self, material: Material) -> Tuple[MaterialStatus, Optional[str]]:
        warnings = []
        
        if material.stock_quantity == 0:
            return MaterialStatus.OUT_OF_STOCK, "库存为0"
        
        if material.level.min_stock is not None and material.stock_quantity < material.level.min_stock:
            warnings.append(f"低库存: {material.stock_quantity} < {material.level.min_stock}")
        elif material.level.max_stock is not None and material.stock_quantity > material.level.max_stock:
            warnings.append(f"高库存: {material.stock_quantity} > {material.level.max_stock}")
        
        expiry_level, expiry_warning, _ = self._get_expiry_info(material)
        if expiry_level == ExpiryLevel.EXPIRED:
            return MaterialStatus.EXPIRED, expiry_warning
        elif expiry_level in [ExpiryLevel.WARNING_7D, ExpiryLevel.WARNING_30D]:
            warnings.append(expiry_warning)
        
        if warnings:
            if any("低库存" in w for w in warnings):
                return MaterialStatus.LOW_STOCK, " | ".join(warnings)
            elif any("高库存" in w for w in warnings):
                return MaterialStatus.HIGH_STOCK, " | ".join(warnings)
            else:
                return MaterialStatus.EXPIRING_SOON, " | ".join(warnings)
        
        return MaterialStatus.NORMAL, None
    
    def _update_material_status(self, material: Material) -> Tuple[MaterialStatus, Optional[str]]:
        status, warning = self._get_stock_status(material)
        material.status = status
        material.expiry_warning = warning
        material.updated_at = datetime.now()
        self.material_repo.update(material)
        return status, warning
    
    def _check_valuable_material(self, material: Material, quantity: int, operator: str) -> Optional[str]:
        level = material.level.level
        if level == MaterialLevelValue.PRECIOUS:
            return f"珍贵物料出库: 物料 [{material.name}] 数量 [{quantity}] 操作人 [{operator}] - 需双人复核"
        elif level == MaterialLevelValue.VALUABLE:
            return f"贵重物料出库: 物料 [{material.name}] 数量 [{quantity}] 操作人 [{operator}] - 需主管审批"
        return None
    
    def _validate_outbound(self, material: Material, quantity: int, operator: str, require_approval: bool = False) -> None:
        if quantity <= 0:
            raise ValueError("出库数量必须大于0")
        
        if quantity > material.stock_quantity:
            raise StockInsufficientException(material.stock_quantity, quantity)
        
        expiry_level, expiry_warning, days_expired = self._get_expiry_info(material)
        if expiry_level == ExpiryLevel.EXPIRED:
            raise MaterialExpiredException(material.id, material.name, -days_expired)
        
        level = material.level.level
        if level == MaterialLevelValue.PRECIOUS and not require_approval:
            raise PreciousMaterialNeedVerifyException(material.id, material.name, quantity, operator)
        elif level == MaterialLevelValue.VALUABLE and not require_approval:
            raise ValuableMaterialNeedApprovalException(material.id, material.name, quantity, operator)
    
    def _create_log(
        self,
        material_id: int,
        operation_type: OperationType,
        quantity: int,
        operator: str,
        previous_stock: int,
        remaining_stock: int,
        previous_status: Optional[MaterialStatus] = None,
        new_status: Optional[MaterialStatus] = None,
        remarks: Optional[str] = None,
        batch_no: Optional[str] = None,
        stock_warning: Optional[str] = None,
        expiry_warning: Optional[str] = None,
        log_status: LogStatus = LogStatus.SUCCESS,
    ) -> OperationLog:
        log = OperationLog(
            id=0,
            material_id=material_id,
            operation_type=operation_type,
            quantity=quantity,
            operator=operator,
            previous_stock=previous_stock,
            remaining_stock=remaining_stock,
            previous_status=previous_status.value if previous_status else None,
            new_status=new_status.value if new_status else None,
            remarks=remarks,
            status=log_status,
            batch_no=batch_no,
            stock_warning=stock_warning,
            expiry_warning=expiry_warning,
        )
        return self.log_repo.create(log)
    
    def _get_material(self, material_id: int) -> Material:
        material = self.material_repo.get_by_id(material_id)
        if not material:
            raise MaterialNotFoundException(material_id)
        return material
    
    def inbound(self, data: InboundOperation) -> OperationLog:
        material = self._get_material(data.material_id)
        
        if data.quantity <= 0:
            raise ValueError("入库数量必须大于0")
        
        previous_stock = material.stock_quantity
        previous_status = material.status
        
        new_stock = material.stock_quantity + data.quantity
        self.material_repo.update_stock(data.material_id, new_stock)
        
        new_status, stock_warning = self._update_material_status(material)
        _, expiry_warning, _ = self._get_expiry_info(material)
        
        return self._create_log(
            material_id=data.material_id,
            operation_type=OperationType.INBOUND,
            quantity=data.quantity,
            operator=data.operator,
            previous_stock=previous_stock,
            remaining_stock=new_stock,
            previous_status=previous_status,
            new_status=new_status,
            remarks=data.remarks,
            batch_no=data.batch_no,
            stock_warning=stock_warning,
            expiry_warning=expiry_warning,
        )
    
    def outbound(self, data: OutboundOperation) -> OperationLog:
        material = self._get_material(data.material_id)
        
        self._validate_outbound(material, data.quantity, data.operator, data.require_approval)
        
        previous_stock = material.stock_quantity
        previous_status = material.status
        
        valuable_notice = self._check_valuable_material(material, data.quantity, data.operator)
        
        new_stock = material.stock_quantity - data.quantity
        self.material_repo.update_stock(data.material_id, new_stock)
        
        new_status, stock_warning = self._update_material_status(material)
        _, expiry_warning, _ = self._get_expiry_info(material)
        
        remarks = data.remarks or ""
        if valuable_notice:
            if remarks:
                remarks = f"{remarks} | {valuable_notice}"
            else:
                remarks = valuable_notice
        
        return self._create_log(
            material_id=data.material_id,
            operation_type=OperationType.OUTBOUND,
            quantity=data.quantity,
            operator=data.operator,
            previous_stock=previous_stock,
            remaining_stock=new_stock,
            previous_status=previous_status,
            new_status=new_status,
            remarks=remarks if remarks else None,
            batch_no=data.batch_no,
            stock_warning=stock_warning,
            expiry_warning=expiry_warning,
        )
    
    def return_material(self, data: ReturnOperation) -> OperationLog:
        material = self._get_material(data.material_id)
        
        if data.quantity <= 0:
            raise ValueError("退货数量必须大于0")
        
        if data.original_outbound_log_id is not None:
            original_log = self.log_repo.get_by_id(data.original_outbound_log_id)
            if not original_log:
                raise ValueError(f"原始出库记录 {data.original_outbound_log_id} 不存在")
        
        previous_stock = material.stock_quantity
        previous_status = material.status
        
        new_stock = material.stock_quantity + data.quantity
        self.material_repo.update_stock(data.material_id, new_stock)
        
        new_status, stock_warning = self._update_material_status(material)
        _, expiry_warning, _ = self._get_expiry_info(material)
        
        remarks = data.remarks or ""
        if data.original_outbound_log_id:
            if remarks:
                remarks = f"{remarks} | 关联出库记录ID: {data.original_outbound_log_id}"
            else:
                remarks = f"关联出库记录ID: {data.original_outbound_log_id}"
        
        return self._create_log(
            material_id=data.material_id,
            operation_type=OperationType.RETURN,
            quantity=data.quantity,
            operator=data.operator,
            previous_stock=previous_stock,
            remaining_stock=new_stock,
            previous_status=previous_status,
            new_status=new_status,
            remarks=remarks if remarks else None,
            batch_no=data.batch_no,
            stock_warning=stock_warning,
            expiry_warning=expiry_warning,
        )
    
    def damage(self, data: DamageOperation) -> OperationLog:
        material = self._get_material(data.material_id)
        
        if data.quantity <= 0:
            raise ValueError("报损数量必须大于0")
        
        if data.quantity > material.stock_quantity:
            raise StockInsufficientException(material.stock_quantity, data.quantity)
        
        previous_stock = material.stock_quantity
        previous_status = material.status
        
        new_stock = material.stock_quantity - data.quantity
        self.material_repo.update_stock(data.material_id, new_stock)
        
        new_status, stock_warning = self._update_material_status(material)
        _, expiry_warning, _ = self._get_expiry_info(material)
        
        remarks = data.remarks or ""
        if remarks:
            remarks = f"{remarks} | 报损原因: {data.reason}"
        else:
            remarks = f"报损原因: {data.reason}"
        
        return self._create_log(
            material_id=data.material_id,
            operation_type=OperationType.DAMAGE,
            quantity=data.quantity,
            operator=data.operator,
            previous_stock=previous_stock,
            remaining_stock=new_stock,
            previous_status=previous_status,
            new_status=new_status,
            remarks=remarks,
            batch_no=data.batch_no,
            stock_warning=stock_warning,
            expiry_warning=expiry_warning,
        )
    
    def batch_inbound(self, data: BatchInboundOperation) -> List[OperationLog]:
        results = []
        for item in data.items:
            op = InboundOperation(
                material_id=item.material_id,
                quantity=item.quantity,
                operator=data.operator,
                remarks=item.remarks,
                batch_no=item.batch_no or data.batch_no,
            )
            log = self.inbound(op)
            results.append(log)
        return results
    
    def batch_outbound(self, data: BatchOutboundOperation) -> List[OperationLog]:
        results = []
        for item in data.items:
            op = OutboundOperation(
                material_id=item.material_id,
                quantity=item.quantity,
                operator=data.operator,
                remarks=item.remarks,
                batch_no=item.batch_no or data.batch_no,
                require_approval=data.require_approval,
            )
            log = self.outbound(op)
            results.append(log)
        return results
    
    def get_inventory_stats(self) -> dict:
        materials = self.material_repo.get_all()
        
        total_stock = sum(m.stock_quantity for m in materials)
        total_materials = len(materials)
        
        status_count = {
            MaterialStatus.NORMAL.value: 0,
            MaterialStatus.LOW_STOCK.value: 0,
            MaterialStatus.OUT_OF_STOCK.value: 0,
            MaterialStatus.HIGH_STOCK.value: 0,
            MaterialStatus.EXPIRING_SOON.value: 0,
            MaterialStatus.EXPIRED.value: 0,
        }
        
        level_distribution = {
            MaterialLevelValue.ORDINARY.value: 0,
            MaterialLevelValue.VALUABLE.value: 0,
            MaterialLevelValue.PRECIOUS.value: 0,
        }
        
        expiry_distribution = {
            ExpiryLevel.NORMAL.value: 0,
            ExpiryLevel.WARNING_7D.value: 0,
            ExpiryLevel.WARNING_30D.value: 0,
            ExpiryLevel.EXPIRED.value: 0,
        }
        
        low_stock_count = 0
        high_stock_count = 0
        
        for m in materials:
            status, _ = self._get_stock_status(m)
            status_count[status.value] += 1
            
            level_distribution[m.level.level.value] += 1
            
            if m.level.min_stock is not None and m.stock_quantity < m.level.min_stock:
                low_stock_count += 1
            if m.level.max_stock is not None and m.stock_quantity > m.level.max_stock:
                high_stock_count += 1
            
            expiry_level, _, _ = self._get_expiry_info(m)
            if m.shelf_life is not None and m.production_date is not None:
                expiry_distribution[expiry_level.value] += 1
            else:
                expiry_distribution[ExpiryLevel.NORMAL.value] += 1
        
        return {
            "total_materials": total_materials,
            "total_stock": total_stock,
            "low_stock_count": low_stock_count,
            "high_stock_count": high_stock_count,
            "status_distribution": status_count,
            "level_distribution": level_distribution,
            "expiry_distribution": expiry_distribution,
            "expiry_stats": {
                "normal": expiry_distribution[ExpiryLevel.NORMAL.value],
                "warning_7d": expiry_distribution[ExpiryLevel.WARNING_7D.value],
                "warning_30d": expiry_distribution[ExpiryLevel.WARNING_30D.value],
                "expired": expiry_distribution[ExpiryLevel.EXPIRED.value],
            },
        }


inventory_service = InventoryService()
