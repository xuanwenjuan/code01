from datetime import datetime
from typing import List, Optional

from app.models.material import Material
from app.utils.persistence import persistence


class MaterialRepository:
    def __init__(self):
        self._materials: List[Material] = []
        self._next_id: int = 1
        self._load_data()
    
    def _load_data(self) -> None:
        loaded = persistence.load("materials", Material)
        if loaded:
            self._materials = loaded
            self._next_id = max(m.id for m in loaded) + 1
    
    def _save_data(self) -> None:
        persistence.save("materials", self._materials)
    
    def get_all(self) -> List[Material]:
        return list(self._materials)
    
    def get_by_id(self, material_id: int) -> Optional[Material]:
        for material in self._materials:
            if material.id == material_id:
                return material
        return None
    
    def create(self, material: Material) -> Material:
        material.id = self._next_id
        self._next_id += 1
        self._materials.append(material)
        self._save_data()
        return material
    
    def update(self, material: Material) -> Optional[Material]:
        for i, mat in enumerate(self._materials):
            if mat.id == material.id:
                self._materials[i] = material
                self._save_data()
                return material
        return None
    
    def delete(self, material_id: int) -> bool:
        for i, material in enumerate(self._materials):
            if material.id == material_id:
                self._materials.pop(i)
                self._save_data()
                return True
        return False
    
    def count(self) -> int:
        return len(self._materials)
    
    def get_by_category(self, category_id: int) -> List[Material]:
        return [m for m in self._materials if m.category_id == category_id]
    
    def update_stock(self, material_id: int, new_stock: int) -> Optional[Material]:
        material = self.get_by_id(material_id)
        if material:
            material.stock_quantity = new_stock
            material.updated_at = datetime.now()
            self._save_data()
            return material
        return None


material_repository = MaterialRepository()
