from fastapi import APIRouter, UploadFile, File, HTTPException
from models.schemas import ImageAnalysisResponse
from utils.gemini_client import analyze_image_with_gemini
from utils.hf_client import classify_fashion_image
import json

router = APIRouter()

@router.post("/analyze", response_model=ImageAnalysisResponse)
async def analyze_outfit_image(file: UploadFile = File(...)):
    """Analyze an uploaded outfit image using Gemini Vision + HuggingFace."""
    try:
        image_bytes = await file.read()
        mime_type = file.content_type or "image/jpeg"

        # Gemini Vision analysis
        prompt = """Analyze this fashion/outfit image in detail. Return a JSON object:
{
  "detected_items": ["item1", "item2", ...],
  "style_category": "e.g. Minimalist Casual / Avant-garde / Classic Business",
  "color_palette": ["#hex1", "#hex2", "#hex3"],
  "outfit_suggestions": "2-3 sentence suggestion to complement or improve this outfit",
  "style_improvements": "specific actionable improvements",
  "trend_alignment": "how this aligns with current 2024/2025 trends"
}
Return ONLY valid JSON."""

        gemini_result = await analyze_image_with_gemini(image_bytes, mime_type, prompt)

        # HuggingFace classification (best-effort)
        hf_labels = []
        try:
            hf_result = await classify_fashion_image(image_bytes)
            if isinstance(hf_result, list):
                hf_labels = [r.get("label", "") for r in hf_result[:3]]
        except Exception:
            pass

        # Parse Gemini
        try:
            clean = gemini_result.strip().replace("```json", "").replace("```", "")
            data = json.loads(clean)
        except Exception:
            data = {}

        detected = data.get("detected_items", [])
        if hf_labels:
            detected = list(set(detected + hf_labels))

        return ImageAnalysisResponse(
            detected_items=detected,
            style_category=data.get("style_category", ""),
            color_palette=data.get("color_palette", []),
            outfit_suggestions=data.get("outfit_suggestions", ""),
            style_improvements=data.get("style_improvements", ""),
            trend_alignment=data.get("trend_alignment", ""),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
