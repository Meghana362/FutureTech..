from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class BodyType(str, Enum):
    hourglass = "hourglass"
    pear = "pear"
    apple = "apple"
    rectangle = "rectangle"
    inverted_triangle = "inverted_triangle"

class Occasion(str, Enum):
    casual = "casual"
    formal = "formal"
    business = "business"
    party = "party"
    outdoor = "outdoor"
    athletic = "athletic"
    date = "date"

class Budget(str, Enum):
    budget = "budget"
    moderate = "moderate"
    premium = "premium"
    luxury = "luxury"

class Season(str, Enum):
    spring = "spring"
    summer = "summer"
    autumn = "autumn"
    winter = "winter"

# ── Request Models ────────────────────────────────────────────────────────────

class FashionRequest(BaseModel):
    body_type: Optional[BodyType] = BodyType.rectangle
    colors: List[str] = Field(default=["black", "white", "navy"])
    occasion: Occasion = Occasion.casual
    budget: Budget = Budget.moderate
    style_keywords: List[str] = Field(default=["classic", "minimal"])
    season: Season = Season.spring
    gender: str = "unisex"
    age_range: str = "25-35"

class OutfitRequest(BaseModel):
    base_item: str
    occasion: Occasion = Occasion.casual
    season: Season = Season.spring
    style_preference: str = "classic"
    budget: Budget = Budget.moderate

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []
    user_preferences: Optional[FashionRequest] = None

class TrendRequest(BaseModel):
    category: str = "womenswear"
    season: Season = Season.spring

# ── Response Models ───────────────────────────────────────────────────────────

class OutfitPiece(BaseModel):
    item: str
    description: str
    color: str
    brand_tier: str

class OutfitRecommendation(BaseModel):
    outfit_name: str
    pieces: List[OutfitPiece]
    styling_tip: str
    occasion_fit: str
    confidence: int

class FashionResponse(BaseModel):
    style_profile: str
    outfit_recommendations: List[dict] = []
    color_palette: List[str] = []
    key_pieces: List[str] = []
    styling_tips: List[str] = []
    ai_model_used: str = "gemini"

class ImageAnalysisResponse(BaseModel):
    detected_items: List[str] = []
    style_category: str = ""
    color_palette: List[str] = []
    outfit_suggestions: str = ""
    style_improvements: str = ""
    trend_alignment: str = ""

class TrendItem(BaseModel):
    name: str
    description: str
    key_pieces: List[str]
    color_palette: List[str]
    style_tip: str
    confidence_score: int

class TrendResponse(BaseModel):
    season: str
    category: str
    trends: List[TrendItem]
    overall_direction: str
