from fastapi import APIRouter, HTTPException

from app.schemas.common import ApiResponse, InventoryStatsResponse
from app.schemas.inventory import (
    BatchInboundOperation,
    BatchOutboundOperation,
    DamageOperation,
    InboundOperation,
    OutboundOperation,
    ReturnOperation,
)
from app.schemas.log import OperationLogListResponse, OperationLogResponse
from app.services.inventory_service import inventory_service

router = APIRouter(prefix="/api/inventory", tags=["物料出入库管理"])


@router.post("/inbound", response_model=ApiResponse[OperationLogResponse])
def inbound(data: InboundOperation):
    try:
        log = inventory_service.inbound(data)
        return ApiResponse(
            message="入库成功",
            data=OperationLogResponse.model_validate(log),
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/outbound", response_model=ApiResponse[OperationLogResponse])
def outbound(data: OutboundOperation):
    try:
        log = inventory_service.outbound(data)
        return ApiResponse(
            message="出库成功",
            data=OperationLogResponse.model_validate(log),
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/return", response_model=ApiResponse[OperationLogResponse])
def return_material(data: ReturnOperation):
    try:
        log = inventory_service.return_material(data)
        return ApiResponse(
            message="退货入库成功",
            data=OperationLogResponse.model_validate(log),
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/damage", response_model=ApiResponse[OperationLogResponse])
def damage(data: DamageOperation):
    try:
        log = inventory_service.damage(data)
        return ApiResponse(
            message="报损成功",
            data=OperationLogResponse.model_validate(log),
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/batch-inbound", response_model=ApiResponse[OperationLogListResponse])
def batch_inbound(data: BatchInboundOperation):
    try:
        logs = inventory_service.batch_inbound(data)
        return ApiResponse(
            message=f"批量入库成功，共处理 {len(logs)} 条",
            data=OperationLogListResponse(
                items=[OperationLogResponse.model_validate(l) for l in logs],
                total=len(logs),
                page=1,
                page_size=len(logs),
            ),
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/batch-outbound", response_model=ApiResponse[OperationLogListResponse])
def batch_outbound(data: BatchOutboundOperation):
    try:
        logs = inventory_service.batch_outbound(data)
        return ApiResponse(
            message=f"批量出库成功，共处理 {len(logs)} 条",
            data=OperationLogListResponse(
                items=[OperationLogResponse.model_validate(l) for l in logs],
                total=len(logs),
                page=1,
                page_size=len(logs),
            ),
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/stats", response_model=ApiResponse[InventoryStatsResponse])
def get_inventory_stats():
    stats = inventory_service.get_inventory_stats()
    return ApiResponse(
        data=InventoryStatsResponse(**stats),
    )
