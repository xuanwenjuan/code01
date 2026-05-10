from datetime import datetime

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.routers import (
    category_router,
    inventory_router,
    log_router,
    material_router,
)
from app.exceptions import BusinessException
from app.models.enums import BusinessErrorCode

app = FastAPI(
    title="仓库物料库存管理接口服务",
    description="基于 FastAPI 的仓库物料库存管理系统，支持物料分类管理、物料信息管理、出入库操作和操作日志",
    version="2.0.0",
)


@app.exception_handler(BusinessException)
async def business_exception_handler(request: Request, exc: BusinessException):
    return JSONResponse(
        status_code=exc.http_status,
        content={
            "code": exc.http_status,
            "biz_code": exc.code,
            "message": exc.message,
            "data": None,
            "timestamp": datetime.now().isoformat(),
        },
    )


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    return JSONResponse(
        status_code=400,
        content={
            "code": 400,
            "biz_code": BusinessErrorCode.PARAM_ERROR.value,
            "message": str(exc),
            "data": None,
            "timestamp": datetime.now().isoformat(),
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        loc = ".".join([str(x) for x in err["loc"] if x != "body"])
        errors.append(f"{loc}: {err['msg']}")
    
    return JSONResponse(
        status_code=422,
        content={
            "code": 422,
            "biz_code": BusinessErrorCode.PARAM_ERROR.value,
            "message": "; ".join(errors),
            "data": None,
            "timestamp": datetime.now().isoformat(),
        },
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "code": exc.status_code,
            "biz_code": BusinessErrorCode.SYSTEM_ERROR.value if exc.status_code >= 500 else BusinessErrorCode.PARAM_ERROR.value,
            "message": exc.detail,
            "data": None,
            "timestamp": datetime.now().isoformat(),
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "code": 500,
            "biz_code": BusinessErrorCode.SYSTEM_ERROR.value,
            "message": f"服务器内部错误",
            "data": None,
            "timestamp": datetime.now().isoformat(),
        },
    )


@app.get("/", tags=["健康检查"])
async def root():
    return {
        "code": 200,
        "biz_code": BusinessErrorCode.SUCCESS.value,
        "message": "success",
        "data": {
            "service": "仓库物料库存管理接口服务",
            "version": "2.0.0",
            "status": "running",
        },
        "timestamp": datetime.now().isoformat(),
    }


@app.get("/health", tags=["健康检查"])
async def health():
    return {
        "code": 200,
        "biz_code": BusinessErrorCode.SUCCESS.value,
        "message": "success",
        "data": {"status": "healthy"},
        "timestamp": datetime.now().isoformat(),
    }


app.include_router(category_router)
app.include_router(material_router)
app.include_router(inventory_router)
app.include_router(log_router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
