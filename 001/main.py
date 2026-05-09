from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.models.response import ApiResponse
from app.routers.category_router import router as category_router
from app.routers.supply_router import router as supply_router
from app.routers.operation_router import router as operation_router

app = FastAPI(
    title="企业办公用品管理接口服务",
    description="基于 FastAPI 的企业办公用品管理系统，包含分类管理、用品管理、领用核销、操作日志等功能",
    version="1.0.0"
)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content=ApiResponse.error(message=exc.detail, code=exc.status_code).model_dump()
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"] if loc != "body")
        errors.append(f"{field}: {error['msg']}")
    message = "参数验证失败: " + "; ".join(errors)
    return JSONResponse(
        status_code=422,
        content=ApiResponse.error(message=message, code=422).model_dump()
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content=ApiResponse.error(message=f"服务器内部错误: {str(exc)}", code=500).model_dump()
    )


app.include_router(category_router, prefix="/api/v1")
app.include_router(supply_router, prefix="/api/v1")
app.include_router(operation_router, prefix="/api/v1")


@app.get("/", response_model=ApiResponse)
def root():
    return ApiResponse.success(data={
        "name": "企业办公用品管理接口服务",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }, message="服务运行正常")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
