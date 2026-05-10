from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class MaterialCategory(BaseModel):
    id: int
    name: str
    code: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    parent_id: Optional[int] = None
