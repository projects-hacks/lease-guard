from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.rent.estimator import RentEstimator

router = APIRouter()

class RentRequest(BaseModel):
    zipCode: str
    state: str
    bedrooms: int
    price: float

@router.post("/rent/analyze")
async def analyze_rent(request: RentRequest):
    estimator = RentEstimator()
    try:
        market_data = estimator.estimate_rent(request.zipCode, request.bedrooms, request.state)
        
        avg_price = market_data.get("average", 0)
        user_price = request.price
        
        # Calculate rating
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
        
        return {
            "market_stats": market_data,
            "analysis": {
                "rating": rating,
                "color": color,
                "difference": diff,
                "percentage_diff": (diff / avg_price) * 100 if avg_price else 0
            }
        }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
