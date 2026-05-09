from enum import Enum


class CategoryType(str, Enum):
    STATIONERY = "文具类"
    ELECTRONIC = "电子耗材类"
    EQUIPMENT = "办公设备类"
    CLEANING = "清洁用品类"


class Category:
    def __init__(self, id: int, name: str, type: CategoryType, description: str = ""):
        self.id = id
        self.name = name
        self.type = type
        self.description = description

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type.value if hasattr(self.type, "value") else self.type,
            "description": self.description
        }
