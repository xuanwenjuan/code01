from fastapi import APIRouter, HTTPException, Path, Query

from app.models.response import ApiResponse
from app.models.operation import OperationType
from app.schemas.operation import ReceiveRequest, ReturnRequest, WriteOffRequest, ScrapRequest, OperationQuery
from app.services.operation_service import OperationService

router = APIRouter(prefix="/operations", tags=["领用与核销"])
service = OperationService()


@router.post("/receive", response_model=ApiResponse)
def receive_supply(request: ReceiveRequest):
    result = service.receive_supply(request)
    if not result.success:
        raise HTTPException(status_code=result.code, detail=result.error)
    return ApiResponse.success(data=result.data, message="领用成功")


@router.post("/return", response_model=ApiResponse)
def return_supply(request: ReturnRequest):
    result = service.return_supply(request)
    if not result.success:
        raise HTTPException(status_code=result.code, detail=result.error)
    return ApiResponse.success(data=result.data, message="归还成功")


@router.post("/write-off", response_model=ApiResponse)
def write_off_expired(request: WriteOffRequest):
    result = service.write_off_expired(request)
    if not result.success:
        raise HTTPException(status_code=result.code, detail=result.error)
    return ApiResponse.success(data=result.data, message="核销成功")


@router.post("/scrap", response_model=ApiResponse)
def scrap_damaged(request: ScrapRequest):
    result = service.scrap_damaged(request)
    if not result.success:
        raise HTTPException(status_code=result.code, detail=result.error)
    return ApiResponse.success(data=result.data, message="报废成功")


@router.post("/purchase", response_model=ApiResponse)
def purchase_supply(
    supply_id: int = Query(..., ge=1),
    quantity: int = Query(..., gt=0),
    operator: str = Query(..., min_length=1, max_length=50),
    reason: str = Query(default="", max_length=200)
):
    result = service.purchase_supply(supply_id, quantity, operator, reason)
    if not result.success:
        raise HTTPException(status_code=result.code, detail=result.error)
    return ApiResponse.success(data=result.data, message="采购入库成功")


@router.get("/logs", response_model=ApiResponse)
def list_logs(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100)
):
    query = OperationQuery(page=page, page_size=page_size)
    result = service.query_logs(query)
    return ApiResponse.success(data=result, message="查询成功")


@router.get("/logs/supply/{supply_id}", response_model=ApiResponse)
def get_logs_by_supply(supply_id: int = Path(..., ge=1)):
    logs = service.get_logs_by_supply_id(supply_id)
    return ApiResponse.success(data=[l.to_dict() for l in logs], message="查询成功")


@router.post("/logs/query", response_model=ApiResponse)
def query_logs(query: OperationQuery):
    result = service.query_logs(query)
    return ApiResponse.success(data=result, message="查询成功")
