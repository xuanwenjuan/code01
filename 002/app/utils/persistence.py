import json
import os
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class DataPersistence:
    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        os.makedirs(data_dir, exist_ok=True)
        
    def _get_file_path(self, name: str) -> str:
        return os.path.join(self.data_dir, f"{name}.json")
    
    def save(self, name: str, data: List[BaseModel]) -> None:
        file_path = self._get_file_path(name)
        try:
            json_data = [item.model_dump() for item in data]
            for item in json_data:
                for key, value in item.items():
                    if isinstance(value, datetime):
                        item[key] = value.isoformat()
                    elif isinstance(value, BaseModel):
                        item[key] = value.model_dump()
            
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(json_data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Error saving data to {file_path}: {e}")
    
    def load(self, name: str, model_class: type) -> List[Any]:
        file_path = self._get_file_path(name)
        if not os.path.exists(file_path):
            return []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                json_data = json.load(f)
            
            items = []
            for item in json_data:
                for key, value in item.items():
                    if isinstance(value, dict) and 'level' in value and 'min_stock' in value:
                        continue
                    if isinstance(value, str) and len(value) >= 19:
                        try:
                            parsed = datetime.fromisoformat(value)
                            item[key] = parsed
                        except ValueError:
                            pass
                items.append(model_class(**item))
            
            return items
        except Exception as e:
            print(f"Error loading data from {file_path}: {e}")
            return []
    
    def clear(self, name: str) -> None:
        file_path = self._get_file_path(name)
        if os.path.exists(file_path):
            os.remove(file_path)


persistence = DataPersistence()
