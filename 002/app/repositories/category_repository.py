from typing import List, Optional

from app.models.category import MaterialCategory
from app.utils.persistence import persistence


class CategoryRepository:
    def __init__(self):
        self._categories: List[MaterialCategory] = []
        self._next_id: int = 1
        self._load_data()
    
    def _load_data(self) -> None:
        loaded = persistence.load("categories", MaterialCategory)
        if loaded:
            self._categories = loaded
            self._next_id = max(c.id for c in loaded) + 1
    
    def _save_data(self) -> None:
        persistence.save("categories", self._categories)
    
    def get_all(self) -> List[MaterialCategory]:
        return list(self._categories)
    
    def get_by_id(self, category_id: int) -> Optional[MaterialCategory]:
        for category in self._categories:
            if category.id == category_id:
                return category
        return None
    
    def get_by_code(self, code: str) -> Optional[MaterialCategory]:
        for category in self._categories:
            if category.code == code:
                return category
        return None
    
    def create(self, category: MaterialCategory) -> MaterialCategory:
        category.id = self._next_id
        self._next_id += 1
        self._categories.append(category)
        self._save_data()
        return category
    
    def update(self, category: MaterialCategory) -> Optional[MaterialCategory]:
        for i, cat in enumerate(self._categories):
            if cat.id == category.id:
                self._categories[i] = category
                self._save_data()
                return category
        return None
    
    def delete(self, category_id: int) -> bool:
        for i, category in enumerate(self._categories):
            if category.id == category_id:
                self._categories.pop(i)
                self._save_data()
                return True
        return False
    
    def count(self) -> int:
        return len(self._categories)


category_repository = CategoryRepository()
