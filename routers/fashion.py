from fastapi import APIRouter, HTTPException
from models.schemas import FashionRequest, FashionResponse, OutfitRequest
from utils.gemini_client import generate_fashion_advice
from utils.ibm_client import get_style_profile_analysis
import json

router = APIRouter()

@router.post("/recommend", response_model=FashionResponse)
async def get_fashion_recommendations(request: FashionRequest):
    """Get personalized fashion recommendations using Gemini + IBM AI."""
    try:
        # IBM WatsonX for style profile
        style_profile = await get_style_profile_analysis(request.dict())

        # Gemini for outfit suggestions
        gemini_prompt = f"""You are an elite AI fashion stylist. Generate 3 complete outfit recommendations for:
- Body Type: {request.body_type}
- Occasion: {request.occasion}
- Season: {request.season}
- Budget: {request.budget}
- Colors they love: {', '.join(request.colors)}
- Style keywords: {', '.join(request.style_keywords)}
- Gender: {request.gender}, Age: {request.age_range}

Return a JSON object with:
{{
  "outfit_recommendations": [
    {{
      "outfit_name": "...",
      "pieces": [{{"item": "...", "description": "...", "color": "...", "brand_tier": "..."}}],
      "styling_tip": "...",
      "occasion_fit": "...",
      "confidence": 85
    }}
  ],
  "color_palette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "key_pieces": ["piece1", "piece2", "piece3", "piece4", "piece5"],
  "styling_tips": ["tip1", "tip2", "tip3"]
}}
Return ONLY valid JSON, no extra text."""

        gemini_response = await generate_fashion_advice(gemini_prompt)

        # Parse Gemini JSON
        try:
            clean = gemini_response.strip().replace("```json", "").replace("```", "")
            data = json.loads(clean)
        except Exception:
            data = {}

        return FashionResponse(
            style_profile=style_profile,
            outfit_recommendations=data.get("outfit_recommendations", []),
            color_palette=data.get("color_palette", ["#000000", "#FFFFFF", "#C8B89A"]),
            key_pieces=data.get("key_pieces", []),
            styling_tips=data.get("styling_tips", []),
            ai_model_used="gemini + ibm_watsonx",
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/outfit-builder")
async def build_outfit(request: OutfitRequest):
    """Build a complete outfit around a base item."""
    try:
        prompt = f"""Build a complete, stylish outfit around this base item: "{request.base_item}"
Occasion: {request.occasion}, Season: {request.season}, Style: {request.style_preference}, Budget: {request.budget}

Return JSON:
{{
  "base_item": "...",
  "complete_outfit": [
    {{"piece": "...", "color": "...", "why_it_works": "..."}}
  ],
  "accessories": ["...", "..."],
  "shoes": "...",
  "bag": "...",
  "overall_vibe": "...",
  "styling_tip": "...",
  "total_budget_estimate": "..."
}}
ONLY valid JSON."""
        response = await generate_fashion_advice(prompt)
        clean = response.strip().replace("```json", "").replace("```", "")
        return json.loads(clean)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
