from fastapi import APIRouter, HTTPException
from models.schemas import TrendRequest, TrendResponse
from utils.groq_client import get_trend_insights
import json

router = APIRouter()

@router.post("/insights", response_model=TrendResponse)
async def get_trend_insights_endpoint(request: TrendRequest):
    """Get AI-powered fashion trend insights using Groq (LLaMA)."""
    try:
        raw = await get_trend_insights(request.category, request.season)
        clean = raw.strip().replace("```json", "").replace("```", "")
        data = json.loads(clean)

        trends = data if isinstance(data, list) else data.get("trends", [])
        overall = data.get("overall_direction", "Bold, expressive fashion with sustainable focus.")

        return TrendResponse(
            season=request.season,
            category=request.category,
            trends=trends,
            overall_direction=overall,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/categories")
async def get_trend_categories():
    return {
        "categories": [
            "womenswear", "menswear", "streetwear", "formal",
            "casual", "athleisure", "accessories", "footwear"
        ],
        "seasons": ["spring", "summer", "autumn", "winter"]
    }
