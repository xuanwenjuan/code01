from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.schemas.common import ApiResponse
from app.schemas.log import OperationLogListResponse, OperationLogResponse
from app.services.log_service import log_service

router = APIRouter(prefix="/api/logs", tags=["操作履历日志"])


@router.get("", response_model=ApiResponse[OperationLogListResponse])
def get_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    material_id: Optional[int] = Query(None),
    operation_type: Optional[str] = Query(None, description="inbound/outbound/return/damage"),
    operator: Optional[str] = Query(None),
    start_time: Optional[datetime] = Query(None),
    end_time: Optional[datetime] = Query(None),
    batch_no: Optional[str] = Query(None),
    has_warning: Optional[bool] = Query(None),
):
    logs, total = log_service.get_paginated_filtered(
        page=page,
        page_size=page_size,
        material_id=material_id,
        operation_type=operation_type,
        operator=operator,
        start_time=start_time,
        end_time=end_time,
        batch_no=batch_no,
        has_warning=has_warning,
    )
    return ApiResponse(
        data=OperationLogListResponse(
            items=[OperationLogResponse.model_validate(l) for l in logs],
            total=total,
            page=page,
            page_size=page_size,
        )
    )


@router.get("/material/{material_id}", response_model=ApiResponse[OperationLogListResponse])
def get_logs_by_material(material_id: int):
    logs = log_service.get_by_material(material_id)
    return ApiResponse(
        data=OperationLogListResponse(
            items=[OperationLogResponse.model_validate(l) for l in logs],
            total=len(logs),
            page=1,
            page_size=len(logs),
        )
    )


@router.get("/{log_id}", response_model=ApiResponse[OperationLogResponse])
def get_log(log_id: int):
    log = log_service.get_by_id(log_id)
    if not log:
        raise HTTPException(status_code=404, detail="日志不存在")
    return ApiResponse(data=OperationLogResponse.model_validate(log))
