from typing import Any, Generic, TypeVar
from pydantic import BaseModel

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    code: int
    message: str
    data: T | None = None

    @classmethod
    def success(cls, data: Any = None, message: str = "操作成功") -> "ApiResponse":
        return cls(code=200, message=message, data=data)

    @classmethod
    def created(cls, data: Any = None, message: str = "创建成功") -> "ApiResponse":
        return cls(code=201, message=message, data=data)

    @classmethod
    def error(cls, message: str = "操作失败", code: int = 400) -> "ApiResponse":
        return cls(code=code, message=message, data=None)

    @classmethod
    def not_found(cls, message: str = "资源不存在") -> "ApiResponse":
        return cls(code=404, message=message, data=None)

    @classmethod
    def forbidden(cls, message: str = "无权操作") -> "ApiResponse":
        return cls(code=403, message=message, data=None)
