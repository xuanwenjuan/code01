from datetime import datetime, timedelta
from typing import List, Optional

from app.models.material import Material, MaterialLevel
from app.repositories import category_repository, material_repository
from app.schemas.material import MaterialCreate, MaterialUpdate


class MaterialService:
    def __init__(self):
        self.repository = material_repository
        self.category_repo = category_repository
    
    def get_all(self) -> List[Material]:
        return self.repository.get_all()
    
    def get_by_id(self, material_id: int) -> Optional[Material]:
        return self.repository.get_by_id(material_id)
    
    def get_paginated(self, page: int, page_size: int) -> tuple[List[Material], int]:
        all_materials = self.repository.get_all()
        total = len(all_materials)
        start = (page - 1) * page_size
        end = start + page_size
        return all_materials[start:end], total
    
    def create(self, data: MaterialCreate) -> Material:
        category = self.category_repo.get_by_id(data.category_id)
        if not category:
            raise ValueError(f"分类 {data.category_id} 不存在")
        
        if data.stock_quantity < 0:
            raise ValueError("库存数量不能为负数")
        
        level = MaterialLevel()
        if data.level:
            level = MaterialLevel(
                level=data.level.level,
                min_stock=data.level.min_stock,
                max_stock=data.level.max_stock,
            )
        
        material = Material(
            id=0,
            name=data.name,
            specification=data.specification,
            model=data.model,
            stock_quantity=data.stock_quantity,
            location_code=data.location_code,
            shelf_life=data.shelf_life,
            production_date=data.production_date,
            category_id=data.category_id,
            level=level,
        )
        return self.repository.create(material)
    
    def update(self, material_id: int, data: MaterialUpdate) -> Optional[Material]:
        existing = self.repository.get_by_id(material_id)
        if not existing:
            return None
        
        if data.category_id is not None:
            category = self.category_repo.get_by_id(data.category_id)
            if not category:
                raise ValueError(f"分类 {data.category_id} 不存在")
        
        if data.name is not None:
            existing.name = data.name
        if data.specification is not None:
            existing.specification = data.specification
        if data.model is not None:
            existing.model = data.model
        if data.location_code is not None:
            existing.location_code = data.location_code
        if data.shelf_life is not None:
            existing.shelf_life = data.shelf_life
        if data.production_date is not None:
            existing.production_date = data.production_date
        if data.category_id is not None:
            existing.category_id = data.category_id
        if data.level is not None:
            existing.level = MaterialLevel(
                level=data.level.level,
                min_stock=data.level.min_stock,
                max_stock=data.level.max_stock,
            )
        
        existing.updated_at = datetime.now()
        
        return self.repository.update(existing)
    
    def delete(self, material_id: int) -> bool:
        return self.repository.delete(material_id)
    
    def count(self) -> int:
        return self.repository.count()
    
    def _is_expired(self, material: Material) -> bool:
        if material.shelf_life is None or material.production_date is None:
            return False
        now = datetime.now()
        expiry_date = material.production_date + timedelta(days=material.shelf_life)
        return now > expiry_date
    
    def _is_expiring_soon(self, material: Material, days: int = 30) -> bool:
        if material.shelf_life is None or material.production_date is None:
            return False
        now = datetime.now()
        expiry_date = material.production_date + timedelta(days=material.shelf_life)
        days_to_expiry = (expiry_date - now).days
        return 0 <= days_to_expiry <= days
    
    def _is_low_stock(self, material: Material) -> bool:
        if material.level.min_stock is None:
            return False
        return material.stock_quantity < material.level.min_stock
    
    def _is_high_stock(self, material: Material) -> bool:
        if material.level.max_stock is None:
            return False
        return material.stock_quantity > material.level.max_stock
    
    def filter(
        self,
        category_id: Optional[int] = None,
        min_stock: Optional[int] = None,
        max_stock: Optional[int] = None,
        material_level: Optional[str] = None,
        expiring_soon: Optional[bool] = None,
        keyword: Optional[str] = None,
        low_stock: Optional[bool] = None,
        high_stock: Optional[bool] = None,
        out_of_stock: Optional[bool] = None,
        expired: Optional[bool] = None,
        location_code: Optional[str] = None,
    ) -> List[Material]:
        materials = self.repository.get_all()
        
        if category_id is not None:
            materials = [m for m in materials if m.category_id == category_id]
        
        if min_stock is not None:
            materials = [m for m in materials if m.stock_quantity >= min_stock]
        
        if max_stock is not None:
            materials = [m for m in materials if m.stock_quantity <= max_stock]
        
        if material_level is not None:
            materials = [m for m in materials if m.level.level.value == material_level]
        
        if expiring_soon is not None:
            if expiring_soon:
                materials = [m for m in materials if self._is_expiring_soon(m)]
            else:
                materials = [m for m in materials if not self._is_expiring_soon(m)]
        
        if low_stock is not None:
            if low_stock:
                materials = [m for m in materials if self._is_low_stock(m)]
            else:
                materials = [m for m in materials if not self._is_low_stock(m)]
        
        if high_stock is not None:
            if high_stock:
                materials = [m for m in materials if self._is_high_stock(m)]
            else:
                materials = [m for m in materials if not self._is_high_stock(m)]
        
        if out_of_stock is not None:
            if out_of_stock:
                materials = [m for m in materials if m.stock_quantity == 0]
            else:
                materials = [m for m in materials if m.stock_quantity > 0]
        
        if expired is not None:
            if expired:
                materials = [m for m in materials if self._is_expired(m)]
            else:
                materials = [m for m in materials if not self._is_expired(m)]
        
        if location_code is not None:
            location_lower = location_code.lower()
            materials = [m for m in materials if location_lower in m.location_code.lower()]
        
        if keyword is not None:
            keyword_lower = keyword.lower()
            materials = [
                m for m in materials
                if keyword_lower in m.name.lower()
                or keyword_lower in m.model.lower()
                or keyword_lower in m.specification.lower()
            ]
        
        return materials


material_service = MaterialService()
