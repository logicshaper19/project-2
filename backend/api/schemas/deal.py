from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict

class DealBase(BaseModel):
    title: str
    description: Optional[str] = None
    price: float
    original_price: float
    discount_percentage: float
    retailer: str
    url: str
    image_url: Optional[str] = None
    category: Optional[str] = None
    quality_score: Optional[int] = None

class DealCreate(DealBase):
    pass

class DealResponse(DealBase):
    id: int
    timestamp: datetime
    metadata: Optional[Dict] = None

    class Config:
        from_attributes = True