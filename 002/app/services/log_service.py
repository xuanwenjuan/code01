from datetime import datetime
from typing import List, Optional

from app.models.log import OperationLog
from app.repositories import log_repository


class LogService:
    def __init__(self):
        self.repository = log_repository
    
    def get_all(self) -> List[OperationLog]:
        return self.repository.get_all()
    
    def get_by_id(self, log_id: int) -> Optional[OperationLog]:
        return self.repository.get_by_id(log_id)
    
    def get_paginated(self, page: int, page_size: int) -> tuple[List[OperationLog], int]:
        all_logs = self.repository.get_all()
        all_logs.sort(key=lambda x: x.operation_time, reverse=True)
        total = len(all_logs)
        start = (page - 1) * page_size
        end = start + page_size
        return all_logs[start:end], total
    
    def get_by_material(self, material_id: int) -> List[OperationLog]:
        logs = self.repository.get_by_material(material_id)
        logs.sort(key=lambda x: x.operation_time, reverse=True)
        return logs
    
    def filter(
        self,
        material_id: Optional[int] = None,
        operation_type: Optional[str] = None,
        operator: Optional[str] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        batch_no: Optional[str] = None,
        has_warning: Optional[bool] = None,
    ) -> List[OperationLog]:
        logs = self.repository.get_all()
        logs.sort(key=lambda x: x.operation_time, reverse=True)
        
        if material_id is not None:
            logs = [l for l in logs if l.material_id == material_id]
        
        if operation_type is not None:
            logs = [l for l in logs if l.operation_type.value == operation_type]
        
        if operator is not None:
            operator_lower = operator.lower()
            logs = [l for l in logs if operator_lower in l.operator.lower()]
        
        if start_time is not None:
            logs = [l for l in logs if l.operation_time >= start_time]
        
        if end_time is not None:
            logs = [l for l in logs if l.operation_time <= end_time]
        
        if batch_no is not None:
            batch_lower = batch_no.lower()
            logs = [l for l in logs if l.batch_no and batch_lower in l.batch_no.lower()]
        
        if has_warning is not None:
            if has_warning:
                logs = [l for l in logs if l.stock_warning is not None]
            else:
                logs = [l for l in logs if l.stock_warning is None]
        
        return logs
    
    def get_paginated_filtered(
        self,
        page: int,
        page_size: int,
        material_id: Optional[int] = None,
        operation_type: Optional[str] = None,
        operator: Optional[str] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        batch_no: Optional[str] = None,
        has_warning: Optional[bool] = None,
    ) -> tuple[List[OperationLog], int]:
        filtered = self.filter(
            material_id=material_id,
            operation_type=operation_type,
            operator=operator,
            start_time=start_time,
            end_time=end_time,
            batch_no=batch_no,
            has_warning=has_warning,
        )
        
        total = len(filtered)
        start = (page - 1) * page_size
        end = start + page_size
        return filtered[start:end], total
    
    def count(self) -> int:
        return self.repository.count()


log_service = LogService()
