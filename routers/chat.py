from fastapi import APIRouter, HTTPException
from models.schemas import ChatRequest
from utils.groq_client import groq_chat

router = APIRouter()

SYSTEM_PROMPT = """You are StyleSense, an elite AI fashion stylist and personal shopper. 
You have encyclopedic knowledge of fashion history, current trends, body types, color theory, 
fabric science, and personal styling. You give confident, specific, actionable advice.
You know global fashion weeks, designer collections, and street style.
Always be warm, inspiring, and empowering. Never be vague — give real outfit ideas with specific pieces."""

@router.post("/message")
async def chat_with_stylist(request: ChatRequest):
    """Interactive AI fashion stylist chat using Groq."""
    try:
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        # Add conversation history
        for msg in request.history[-10:]:  # last 10 for context window
            messages.append({"role": msg.role, "content": msg.content})

        # Add user preferences context if provided
        context = ""
        if request.user_preferences:
            prefs = request.user_preferences
            context = (
                f"\n[User Profile: {prefs.body_type} body, loves {', '.join(prefs.colors)}, "
                f"{prefs.occasion} style, {prefs.budget} budget, "
                f"keywords: {', '.join(prefs.style_keywords)}]"
            )

        messages.append({
            "role": "user",
            "content": request.message + context
        })

        response = await groq_chat(messages)
        return {"reply": response, "model": "groq/llama3-70b"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
