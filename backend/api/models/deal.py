from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Deal(Base):
    __tablename__ = 'deals'
    
    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(String)
    price = Column(Float, nullable=False)
    original_price = Column(Float, nullable=False)
    discount_percentage = Column(Float)
    retailer = Column(String, nullable=False)
    url = Column(String, nullable=False)
    image_url = Column(String)
    category = Column(String)
    quality_score = Column(Integer)
    timestamp = Column(DateTime, default=datetime.utcnow)
    metadata = Column(JSON)