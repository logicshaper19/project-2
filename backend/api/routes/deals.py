from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.deal import Deal
from ..schemas.deal import DealCreate, DealResponse
from ...scraper.deal_scraper import DealScraper
from ...scraper.deal_analyzer import DealAnalyzer

router = APIRouter()
scraper = DealScraper()
analyzer = DealAnalyzer()

@router.get("/deals", response_model=List[DealResponse])
async def get_deals(
    skip: int = 0,
    limit: int = 100,
    category: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(Deal)
    if category:
        query = query.filter(Deal.category == category)
    return query.offset(skip).limit(limit).all()

@router.post("/deals/refresh")
async def refresh_deals(db: Session = Depends(get_db)):
    deals = await scraper.scrape_deals()
    analyzed_deals = await analyzer.validate_deals(deals)
    
    for deal_data in analyzed_deals:
        deal = Deal(**deal_data)
        db.add(deal)
    
    db.commit()
    return {"message": f"Refreshed {len(analyzed_deals)} deals"}