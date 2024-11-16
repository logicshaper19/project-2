from pydantic import BaseModel
from datetime import datetime
from typing import Dict, Optional

class AdminStatsResponse(BaseModel):
    total_customers: int
    total_revenue: float
    total_deals: int
    total_stores: int
    total_savings: float
    customer_growth: float
    revenue_growth: float
    deal_growth: float
    store_growth: float
    category_distribution: Dict
    revenue_by_day: Dict
    timestamp: datetime

    class Config:
        from_attributes = True

class CustomerResponse(BaseModel):
    id: int
    email: str
    name: str
    joined_date: datetime
    total_spent: float
    is_premium: bool
    last_login: Optional[datetime]

    class Config:
        from_attributes = True

class PaymentResponse(BaseModel):
    id: int
    customer_id: int
    amount: float
    currency: str
    timestamp: datetime
    status: str

    class Config:
        from_attributes = True