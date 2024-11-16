from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from ..database import get_db
from ..models.admin import AdminStats, Customer, Payment
from ..schemas.admin import AdminStatsResponse, CustomerResponse, PaymentResponse

router = APIRouter()

@router.get("/stats", response_model=AdminStatsResponse)
async def get_admin_stats(db: Session = Depends(get_db)):
    """Get current admin statistics"""
    stats = db.query(AdminStats).order_by(AdminStats.timestamp.desc()).first()
    if not stats:
        raise HTTPException(status_code=404, detail="No stats found")
    return stats

@router.get("/customers", response_model=List[CustomerResponse])
async def get_customers(
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    db: Session = Depends(get_db)
):
    """Get customer list with optional search"""
    query = db.query(Customer)
    if search:
        query = query.filter(
            (Customer.name.ilike(f"%{search}%")) |
            (Customer.email.ilike(f"%{search}%"))
        )
    return query.offset(skip).limit(limit).all()

@router.get("/revenue", response_model=List[PaymentResponse])
async def get_revenue_data(
    start_date: datetime = None,
    end_date: datetime = None,
    db: Session = Depends(get_db)
):
    """Get revenue data within date range"""
    if not start_date:
        start_date = datetime.now() - timedelta(days=30)
    if not end_date:
        end_date = datetime.now()
        
    return db.query(Payment)\
        .filter(Payment.timestamp.between(start_date, end_date))\
        .order_by(Payment.timestamp.desc())\
        .all()

@router.get("/dashboard")
async def get_dashboard_data(db: Session = Depends(get_db)):
    """Get all dashboard data in a single request"""
    stats = db.query(AdminStats).order_by(AdminStats.timestamp.desc()).first()
    recent_customers = db.query(Customer)\
        .order_by(Customer.joined_date.desc())\
        .limit(10)\
        .all()
    recent_payments = db.query(Payment)\
        .order_by(Payment.timestamp.desc())\
        .limit(10)\
        .all()
        
    return {
        "stats": stats,
        "recent_customers": recent_customers,
        "recent_payments": recent_payments,
        "customer_count": db.query(Customer).count(),
        "total_revenue": db.query(Payment).filter(Payment.status == "succeeded").with_entities(func.sum(Payment.amount)).scalar() or 0
    }