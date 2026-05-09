from fastapi import APIRouter, HTTPException, Path, Query

from app.models.response import ApiResponse
from app.models.supply import ValuableLevel, SupplyStatus
from app.schemas.supply import SupplyCreate, SupplyUpdate, SupplyQuery
from app.services.supply_service import SupplyService

router = APIRouter(prefix="/supplies", tags=["用品管理"])
service = SupplyService()


@router.post("", response_model=ApiResponse)
def create_supply(data: SupplyCreate):
    result = service.create_supply(data)
    if not result.success:
        raise HTTPException(status_code=result.code, detail=result.error)
    return ApiResponse.created(data=result.data, message="创建成功")


@router.get("", response_model=ApiResponse)
def list_supplies():
    supplies = service.get_all_supplies()
    return ApiResponse.success(data=[s.to_dict() for s in supplies], message="查询成功")


@router.get("/low-stock", response_model=ApiResponse)
def list_low_stock_supplies():
    supplies = service.get_low_stock_supplies()
    return ApiResponse.success(data=[s.to_dict() for s in supplies], message="查询成功")


@router.get("/expired", response_model=ApiResponse)
def list_expired_supplies():
    supplies = service.get_expired_supplies()
    return ApiResponse.success(data=[s.to_dict() for s in supplies], message="查询成功")


@router.get("/expiring-soon", response_model=ApiResponse)
def list_expiring_soon_supplies(days: int = Query(default=30, ge=1)):
    supplies = service.get_expiring_soon_supplies(days)
    return ApiResponse.success(data=[s.to_dict() for s in supplies], message="查询成功")


@router.get("/valuable", response_model=ApiResponse)
def list_valuable_supplies():
    supplies = service.get_valuable_supplies()
    return ApiResponse.success(data=[s.to_dict() for s in supplies], message="查询成功")


@router.get("/{supply_id}/status", response_model=ApiResponse)
def get_supply_status(supply_id: int = Path(..., ge=1)):
    status_info = service.get_supply_status_info(supply_id)
    if status_info is None:
        raise HTTPException(status_code=404, detail="用品不存在")
    return ApiResponse.success(data=status_info, message="查询成功")


@router.get("/{supply_id}", response_model=ApiResponse)
def get_supply(supply_id: int = Path(..., ge=1)):
    supply = service.get_supply_by_id(supply_id)
    if not supply:
        raise HTTPException(status_code=404, detail="用品不存在")
    return ApiResponse.success(data=supply.to_dict(), message="查询成功")


@router.put("/{supply_id}", response_model=ApiResponse)
def update_supply(data: SupplyUpdate, supply_id: int = Path(..., ge=1)):
    result = service.update_supply(supply_id, data)
    if not result.success:
        raise HTTPException(status_code=result.code, detail=result.error)
    return ApiResponse.success(data=result.data, message="更新成功")


@router.delete("/{supply_id}", response_model=ApiResponse)
def delete_supply(supply_id: int = Path(..., ge=1)):
    result = service.delete_supply(supply_id)
    if not result.success:
        raise HTTPException(status_code=result.code, detail=result.error)
    return ApiResponse.success(message="删除成功")


@router.post("/query", response_model=ApiResponse)
def query_supplies(query: SupplyQuery):
    result = service.query_supplies(query)
    return ApiResponse.success(data=result, message="查询成功")
