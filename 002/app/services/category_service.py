from datetime import datetime
from typing import List, Optional

from app.models.category import MaterialCategory
from app.repositories import category_repository, material_repository
from app.schemas.category import CategoryCreate, CategoryUpdate


class CategoryService:
    def __init__(self):
        self.repository = category_repository
        self.material_repo = material_repository
    
    def get_all(self) -> List[MaterialCategory]:
        return self.repository.get_all()
    
    def get_by_id(self, category_id: int) -> Optional[MaterialCategory]:
        return self.repository.get_by_id(category_id)
    
    def create(self, data: CategoryCreate) -> MaterialCategory:
        existing = self.repository.get_by_code(data.code)
        if existing:
            raise ValueError(f"分类编码 {data.code} 已存在")
        
        if data.parent_id is not None:
            parent = self.repository.get_by_id(data.parent_id)
            if not parent:
                raise ValueError(f"父分类 {data.parent_id} 不存在")
        
        category = MaterialCategory(
            id=0,
            name=data.name,
            code=data.code,
            description=data.description,
            parent_id=data.parent_id,
        )
        return self.repository.create(category)
    
    def update(self, category_id: int, data: CategoryUpdate) -> Optional[MaterialCategory]:
        existing = self.repository.get_by_id(category_id)
        if not existing:
            return None
        
        if data.code is not None:
            code_exists = self.repository.get_by_code(data.code)
            if code_exists and code_exists.id != category_id:
                raise ValueError(f"分类编码 {data.code} 已存在")
        
        if data.parent_id is not None:
            if data.parent_id == category_id:
                raise ValueError("父分类不能是自己")
            parent = self.repository.get_by_id(data.parent_id)
            if not parent:
                raise ValueError(f"父分类 {data.parent_id} 不存在")
        
        if data.name is not None:
            existing.name = data.name
        if data.code is not None:
            existing.code = data.code
        if data.description is not None:
            existing.description = data.description
        if data.parent_id is not None:
            existing.parent_id = data.parent_id
        
        existing.updated_at = datetime.now()
        
        return self.repository.update(existing)
    
    def delete(self, category_id: int) -> bool:
        materials = self.material_repo.get_by_category(category_id)
        if materials:
            raise ValueError(f"分类下存在物料，无法删除")
        
        return self.repository.delete(category_id)
    
    def count(self) -> int:
        return self.repository.count()


category_service = CategoryService()
