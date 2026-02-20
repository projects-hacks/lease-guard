from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.rent_radar.comparables import RentRadar

router = APIRouter()

class RentRequest(BaseModel):
    zipCode: str
    state: str
    bedrooms: int
    price: float

@router.post("/rent/analyze")
async def analyze_rent(request: RentRequest):
    """
    Analyzes rent fairness using You.com Search API for real market data.
    """
    radar = RentRadar()
    try:
        # 1. Get market data from You.com
        market_data = radar.search_comparables(request.zipCode, request.bedrooms, request.state)
        
        # 2. Get rent control info from You.com
        rent_laws = radar.search_rent_laws(request.state, request.zipCode)
        
        avg_price = market_data.get("average", 0)
        user_price = request.price
        
        # 3. Calculate rating
        if avg_price > 0:
            if user_price < avg_price * 0.9:
                rating = "Great Deal"
                color = "green"
            elif user_price > avg_price * 1.1:
                rating = "Overpriced"
                color = "red"
            else:
                rating = "Fair Market Value"
                color = "yellow"
            
            diff = user_price - avg_price
            pct = (diff / avg_price) * 100
        else:
            rating = "Insufficient Data"
            color = "yellow"
            diff = 0
            pct = 0
            
        return {
            "market_stats": {
                "average": market_data.get("average", 0),
                "min": market_data.get("min", 0),
                "max": market_data.get("max", 0),
                "confidence": market_data.get("confidence", "low"),
                "comparables": market_data.get("comparables", []),
                "market_summary": market_data.get("market_summary", ""),
            },
            "analysis": {
                "rating": rating,
                "color": color,
                "difference": diff,
                "percentage_diff": pct,
                "rent_control_applies": market_data.get("rent_control_applies", False),
                "max_legal_increase": market_data.get("max_legal_increase"),
            },
            "rent_laws": rent_laws,
            "sources": {
                "provider": "You.com Search API",
                "note": "Market data sourced from live web search results"
            }
        }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
