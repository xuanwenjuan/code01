from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.schemas.common import ApiResponse, PaginationParams
from app.schemas.material import (
    MaterialCreate,
    MaterialListResponse,
    MaterialResponse,
    MaterialUpdate,
)
from app.services.material_service import material_service

router = APIRouter(prefix="/api/materials", tags=["物料信息管理"])


@router.get("", response_model=ApiResponse[MaterialListResponse])
def get_materials(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
):
    materials, total = material_service.get_paginated(page, page_size)
    return ApiResponse(
        data=MaterialListResponse(
            items=[MaterialResponse.model_validate(m) for m in materials],
            total=total,
            page=page,
            page_size=page_size,
        )
    )


@router.get("/search", response_model=ApiResponse[MaterialListResponse])
def search_materials(
    category_id: Optional[int] = Query(None),
    min_stock: Optional[int] = Query(None),
    max_stock: Optional[int] = Query(None),
    material_level: Optional[str] = Query(None, description="ordinary/valuable/precious"),
    expiring_soon: Optional[bool] = Query(None, description="是否30天内过期"),
    keyword: Optional[str] = Query(None, description="按名称/规格/型号搜索"),
    low_stock: Optional[bool] = Query(None, description="是否低于最低库存"),
    high_stock: Optional[bool] = Query(None, description="是否高于最高库存"),
    out_of_stock: Optional[bool] = Query(None, description="是否缺货"),
    expired: Optional[bool] = Query(None, description="是否已过期"),
    location_code: Optional[str] = Query(None, description="按库位编号搜索"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
):
    filtered = material_service.filter(
        category_id=category_id,
        min_stock=min_stock,
        max_stock=max_stock,
        material_level=material_level,
        expiring_soon=expiring_soon,
        keyword=keyword,
        low_stock=low_stock,
        high_stock=high_stock,
        out_of_stock=out_of_stock,
        expired=expired,
        location_code=location_code,
    )
    
    total = len(filtered)
    start = (page - 1) * page_size
    end = start + page_size
    materials = filtered[start:end]
    
    return ApiResponse(
        data=MaterialListResponse(
            items=[MaterialResponse.model_validate(m) for m in materials],
            total=total,
            page=page,
            page_size=page_size,
        )
    )


@router.get("/{material_id}", response_model=ApiResponse[MaterialResponse])
def get_material(material_id: int):
    material = material_service.get_by_id(material_id)
    if not material:
        raise HTTPException(status_code=404, detail="物料不存在")
    return ApiResponse(data=MaterialResponse.model_validate(material))


@router.post("", response_model=ApiResponse[MaterialResponse], status_code=201)
def create_material(data: MaterialCreate):
    try:
        material = material_service.create(data)
        return ApiResponse(
            code=201,
            message="创建成功",
            data=MaterialResponse.model_validate(material),
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{material_id}", response_model=ApiResponse[MaterialResponse])
def update_material(material_id: int, data: MaterialUpdate):
    try:
        material = material_service.update(material_id, data)
        if not material:
            raise HTTPException(status_code=404, detail="物料不存在")
        return ApiResponse(
            message="更新成功",
            data=MaterialResponse.model_validate(material),
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{material_id}", response_model=ApiResponse[None])
def delete_material(material_id: int):
    success = material_service.delete(material_id)
    if not success:
        raise HTTPException(status_code=404, detail="物料不存在")
    return ApiResponse(message="删除成功")
