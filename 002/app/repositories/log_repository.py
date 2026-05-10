from typing import List, Optional

from app.models.log import OperationLog
from app.utils.persistence import persistence


class LogRepository:
    def __init__(self):
        self._logs: List[OperationLog] = []
        self._next_id: int = 1
        self._load_data()
    
    def _load_data(self) -> None:
        loaded = persistence.load("logs", OperationLog)
        if loaded:
            self._logs = loaded
            self._next_id = max(l.id for l in loaded) + 1
    
    def _save_data(self) -> None:
        persistence.save("logs", self._logs)
    
    def get_all(self) -> List[OperationLog]:
        return list(self._logs)
    
    def get_by_id(self, log_id: int) -> Optional[OperationLog]:
        for log in self._logs:
            if log.id == log_id:
                return log
        return None
    
    def create(self, log: OperationLog) -> OperationLog:
        log.id = self._next_id
        self._next_id += 1
        self._logs.append(log)
        self._save_data()
        return log
    
    def get_by_material(self, material_id: int) -> List[OperationLog]:
        return [l for l in self._logs if l.material_id == material_id]
    
    def count(self) -> int:
        return len(self._logs)


log_repository = LogRepository()
