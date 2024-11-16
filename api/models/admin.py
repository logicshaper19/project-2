from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, JSON
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class AdminStats(Base):
    __tablename__ = 'admin_stats'
    
    id = Column(Integer, primary_key=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    total_customers = Column(Integer, default=0)
    total_revenue = Column(Float, default=0.0)
    total_deals = Column(Integer, default=0)
    total_stores = Column(Integer, default=0)
    total_savings = Column(Float, default=0.0)
    customer_growth = Column(Float, default=0.0)
    revenue_growth = Column(Float, default=0.0)
    deal_growth = Column(Float, default=0.0)
    store_growth = Column(Float, default=0.0)
    category_distribution = Column(JSON)
    revenue_by_day = Column(JSON)

class Customer(Base):
    __tablename__ = 'customers'
    
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)
    name = Column(String)
    joined_date = Column(DateTime, default=datetime.utcnow)
    total_spent = Column(Float, default=0.0)
    is_premium = Column(Boolean, default=False)
    preferences = Column(JSON)
    last_login = Column(DateTime)
    
class Payment(Base):
    __tablename__ = 'payments'
    
    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer)
    amount = Column(Float)
    currency = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    stripe_payment_id = Column(String)
    status = Column(String)