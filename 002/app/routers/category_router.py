from fastapi import APIRouter, HTTPException

from app.schemas.category import (
    CategoryCreate,
    CategoryListResponse,
    CategoryResponse,
    CategoryUpdate,
)
from app.schemas.common import ApiResponse
from app.services.category_service import category_service

router = APIRouter(prefix="/api/categories", tags=["物料分类管理"])


@router.get("", response_model=ApiResponse[CategoryListResponse])
def get_categories():
    categories = category_service.get_all()
    return ApiResponse(
        data=CategoryListResponse(
            items=[CategoryResponse.model_validate(c) for c in categories],
            total=len(categories),
        )
    )


@router.get("/{category_id}", response_model=ApiResponse[CategoryResponse])
def get_category(category_id: int):
    category = category_service.get_by_id(category_id)
    if not category:
        raise HTTPException(status_code=404, detail="分类不存在")
    return ApiResponse(data=CategoryResponse.model_validate(category))


@router.post("", response_model=ApiResponse[CategoryResponse], status_code=201)
def create_category(data: CategoryCreate):
    try:
        category = category_service.create(data)
        return ApiResponse(
            code=201,
            message="创建成功",
            data=CategoryResponse.model_validate(category),
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{category_id}", response_model=ApiResponse[CategoryResponse])
def update_category(category_id: int, data: CategoryUpdate):
    try:
        category = category_service.update(category_id, data)
        if not category:
            raise HTTPException(status_code=404, detail="分类不存在")
        return ApiResponse(
            message="更新成功",
            data=CategoryResponse.model_validate(category),
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{category_id}", response_model=ApiResponse[None])
def delete_category(category_id: int):
    try:
        success = category_service.delete(category_id)
        if not success:
            raise HTTPException(status_code=404, detail="分类不存在")
        return ApiResponse(message="删除成功")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
