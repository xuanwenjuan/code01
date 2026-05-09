import json
import os
from datetime import date, datetime
from typing import Dict, List, Optional

from app.models.category import Category, CategoryType
from app.models.supply import Supply, ValuableLevel, SupplyStatus
from app.models.operation import OperationLog, OperationType


class MemoryStorage:
    _instance = None
    _data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        os.makedirs(self._data_dir, exist_ok=True)

        self.categories: Dict[int, Category] = {}
        self.supplies: Dict[int, Supply] = {}
        self.operation_logs: Dict[int, OperationLog] = {}

        self._next_category_id = 1
        self._next_supply_id = 1
        self._next_log_id = 1

        self._load_from_files()

        if not self.categories:
            self._init_default_categories()

    def _init_default_categories(self):
        default_categories = [
            {"name": "办公文具", "type": CategoryType.STATIONERY, "description": "笔、本、文件夹等办公文具"},
            {"name": "打印耗材", "type": CategoryType.ELECTRONIC, "description": "墨盒、硒鼓、打印纸等"},
            {"name": "办公设备", "type": CategoryType.EQUIPMENT, "description": "电脑、打印机、投影仪等"},
            {"name": "清洁用品", "type": CategoryType.CLEANING, "description": "纸巾、消毒液、垃圾袋等"},
        ]
        for cat_data in default_categories:
            category = Category(
                id=self._next_category_id,
                name=cat_data["name"],
                type=cat_data["type"],
                description=cat_data["description"]
            )
            self.categories[self._next_category_id] = category
            self._next_category_id += 1
        self._save_to_files()

    def _parse_date(self, date_str: Optional[str]) -> Optional[date]:
        if not date_str:
            return None
        return date.fromisoformat(date_str)

    def _parse_datetime(self, dt_str: Optional[str]) -> Optional[datetime]:
        if not dt_str:
            return None
        return datetime.fromisoformat(dt_str)

    def _load_from_files(self):
        categories_file = os.path.join(self._data_dir, "categories.json")
        supplies_file = os.path.join(self._data_dir, "supplies.json")
        logs_file = os.path.join(self._data_dir, "operation_logs.json")

        if os.path.exists(categories_file):
            with open(categories_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                max_id = 0
                for item in data:
                    category = Category(
                        id=item["id"],
                        name=item["name"],
                        type=CategoryType(item["type"]),
                        description=item.get("description", "")
                    )
                    self.categories[item["id"]] = category
                    if item["id"] > max_id:
                        max_id = item["id"]
                self._next_category_id = max_id + 1

        if os.path.exists(supplies_file):
            with open(supplies_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                max_id = 0
                for item in data:
                    supply = Supply(
                        id=item["id"],
                        name=item["name"],
                        category_id=item["category_id"],
                        specification=item["specification"],
                        unit=item["unit"],
                        stock=item["stock"],
                        location=item["location"],
                        purchase_date=self._parse_date(item["purchase_date"]),
                        expiry_date=self._parse_date(item.get("expiry_date")),
                        valuable_level=ValuableLevel(item["valuable_level"]),
                        status=SupplyStatus(item["status"]),
                        min_stock=item.get("min_stock", 10),
                        max_single_receive=item.get("max_single_receive", 0),
                        require_approval=item.get("require_approval", False)
                    )
                    self.supplies[item["id"]] = supply
                    if item["id"] > max_id:
                        max_id = item["id"]
                self._next_supply_id = max_id + 1

        if os.path.exists(logs_file):
            with open(logs_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                max_id = 0
                for item in data:
                    log = OperationLog(
                        id=item["id"],
                        supply_id=item["supply_id"],
                        supply_name=item["supply_name"],
                        operation_type=OperationType(item["operation_type"]),
                        quantity=item["quantity"],
                        operator=item["operator"],
                        before_stock=item["before_stock"],
                        after_stock=item["after_stock"],
                        before_status=item["before_status"],
                        after_status=item["after_status"],
                        reason=item.get("reason", ""),
                        created_at=self._parse_datetime(item["created_at"]),
                        department=item.get("department", ""),
                        approved_by=item.get("approved_by", ""),
                        return_condition=item.get("return_condition", ""),
                        damage_degree=item.get("damage_degree", "")
                    )
                    self.operation_logs[item["id"]] = log
                    if item["id"] > max_id:
                        max_id = item["id"]
                self._next_log_id = max_id + 1

    def _save_to_files(self):
        categories_file = os.path.join(self._data_dir, "categories.json")
        supplies_file = os.path.join(self._data_dir, "supplies.json")
        logs_file = os.path.join(self._data_dir, "operation_logs.json")

        with open(categories_file, "w", encoding="utf-8") as f:
            json.dump([cat.to_dict() for cat in self.categories.values()], f, ensure_ascii=False, indent=2)

        with open(supplies_file, "w", encoding="utf-8") as f:
            json.dump([s.to_dict() for s in self.supplies.values()], f, ensure_ascii=False, indent=2)

        with open(logs_file, "w", encoding="utf-8") as f:
            json.dump([log.to_dict() for log in self.operation_logs.values()], f, ensure_ascii=False, indent=2)

    def get_next_category_id(self) -> int:
        return self._next_category_id

    def increment_category_id(self):
        self._next_category_id += 1
        self._save_to_files()

    def get_next_supply_id(self) -> int:
        return self._next_supply_id

    def increment_supply_id(self):
        self._next_supply_id += 1
        self._save_to_files()

    def get_next_log_id(self) -> int:
        return self._next_log_id

    def increment_log_id(self):
        self._next_log_id += 1
        self._save_to_files()

    def save_category(self, category: Category):
        self.categories[category.id] = category
        self._save_to_files()

    def delete_category(self, category_id: int) -> bool:
        if category_id in self.categories:
            del self.categories[category_id]
            self._save_to_files()
            return True
        return False

    def get_all_categories(self) -> List[Category]:
        return list(self.categories.values())

    def get_category_by_id(self, category_id: int) -> Optional[Category]:
        return self.categories.get(category_id)

    def save_supply(self, supply: Supply):
        self.supplies[supply.id] = supply
        self._save_to_files()

    def delete_supply(self, supply_id: int) -> bool:
        if supply_id in self.supplies:
            del self.supplies[supply_id]
            self._save_to_files()
            return True
        return False

    def get_all_supplies(self) -> List[Supply]:
        return list(self.supplies.values())

    def get_supply_by_id(self, supply_id: int) -> Optional[Supply]:
        return self.supplies.get(supply_id)

    def save_operation_log(self, log: OperationLog):
        self.operation_logs[log.id] = log
        self._save_to_files()

    def get_all_operation_logs(self) -> List[OperationLog]:
        return list(self.operation_logs.values())

    def get_operation_logs_by_supply_id(self, supply_id: int) -> List[OperationLog]:
        return [log for log in self.operation_logs.values() if log.supply_id == supply_id]
