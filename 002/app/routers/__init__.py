from app.routers.material_router import router as material_router
from app.routers.category_router import router as category_router
from app.routers.inventory_router import router as inventory_router
from app.routers.log_router import router as log_router

__all__ = [
    "material_router",
    "category_router",
    "inventory_router",
    "log_router",
]
