from fastapi import APIRouter, HTTPException, Path

from app.models.response import ApiResponse
from app.models.category import CategoryType
from app.schemas.category import CategoryCreate, CategoryUpdate
from app.services.category_service import CategoryService

router = APIRouter(prefix="/categories", tags=["分类管理"])
service = CategoryService()


@router.post("", response_model=ApiResponse)
def create_category(data: CategoryCreate):
    if service.category_exists(data.name):
        raise HTTPException(status_code=400, detail="分类名称已存在")
    category = service.create_category(data)
    return ApiResponse.created(data=category.to_dict())


@router.get("", response_model=ApiResponse)
def list_categories():
    categories = service.get_all_categories()
    return ApiResponse.success(data=[c.to_dict() for c in categories])


@router.get("/type/{type}", response_model=ApiResponse)
def list_categories_by_type(type: CategoryType):
    categories = service.get_categories_by_type(type)
    return ApiResponse.success(data=[c.to_dict() for c in categories])


@router.get("/{category_id}", response_model=ApiResponse)
def get_category(category_id: int = Path(..., ge=1)):
    category = service.get_category_by_id(category_id)
    if not category:
        raise HTTPException(status_code=404, detail="分类不存在")
    return ApiResponse.success(data=category.to_dict())


@router.put("/{category_id}", response_model=ApiResponse)
def update_category(data: CategoryUpdate, category_id: int = Path(..., ge=1)):
    if data.name is not None and service.category_exists(data.name, exclude_id=category_id):
        raise HTTPException(status_code=400, detail="分类名称已存在")
    category = service.update_category(category_id, data)
    if not category:
        raise HTTPException(status_code=404, detail="分类不存在")
    return ApiResponse.success(data=category.to_dict(), message="更新成功")


@router.delete("/{category_id}", response_model=ApiResponse)
def delete_category(category_id: int = Path(..., ge=1)):
    if not service.get_category_by_id(category_id):
        raise HTTPException(status_code=404, detail="分类不存在")
    success = service.delete_category(category_id)
    if not success:
        raise HTTPException(status_code=400, detail="该分类下存在用品，无法删除")
    return ApiResponse.success(message="删除成功")
