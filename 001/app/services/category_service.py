from typing import List, Optional

from app.models.category import Category, CategoryType
from app.schemas.category import CategoryCreate, CategoryUpdate
from app.storage.memory_storage import MemoryStorage


class CategoryService:
    def __init__(self):
        self.storage = MemoryStorage()

    def create_category(self, data: CategoryCreate) -> Category:
        category = Category(
            id=self.storage.get_next_category_id(),
            name=data.name,
            type=data.type,
            description=data.description
        )
        self.storage.save_category(category)
        self.storage.increment_category_id()
        return category

    def get_all_categories(self) -> List[Category]:
        return self.storage.get_all_categories()

    def get_category_by_id(self, category_id: int) -> Optional[Category]:
        return self.storage.get_category_by_id(category_id)

    def get_categories_by_type(self, type: CategoryType) -> List[Category]:
        return [c for c in self.storage.get_all_categories() if c.type == type]

    def update_category(self, category_id: int, data: CategoryUpdate) -> Optional[Category]:
        category = self.storage.get_category_by_id(category_id)
        if not category:
            return None
        if data.name is not None:
            category.name = data.name
        if data.type is not None:
            category.type = data.type
        if data.description is not None:
            category.description = data.description
        self.storage.save_category(category)
        return category

    def delete_category(self, category_id: int) -> bool:
        supplies = [s for s in self.storage.get_all_supplies() if s.category_id == category_id]
        if supplies:
            return False
        return self.storage.delete_category(category_id)

    def category_exists(self, name: str, exclude_id: Optional[int] = None) -> bool:
        for c in self.storage.get_all_categories():
            if c.name == name and (exclude_id is None or c.id != exclude_id):
                return True
        return False
