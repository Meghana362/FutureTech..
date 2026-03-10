from groq import Groq
from config import get_settings

settings = get_settings()

def get_groq_client():
    return Groq(api_key=settings.groq_api_key)

async def groq_chat(messages: list, model: str = "llama3-70b-8192") -> str:
    client = get_groq_client()
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0.7,
        max_tokens=1024,
    )
    return response.choices[0].message.content

async def get_trend_insights(category: str, season: str) -> str:
    messages = [
        {
            "role": "system",
            "content": (
                "You are StyleSense, an elite AI fashion curator with deep knowledge of global trends, "
                "runway collections, street style, and seasonal palettes. Provide actionable, specific, "
                "and inspiring fashion insights. Format responses as structured JSON."
            )
        },
        {
            "role": "user",
            "content": (
                f"Provide the top 5 fashion trends for {category} in {season}. "
                "For each trend include: name, description, key_pieces (list of 3), color_palette (list of 3 hex codes), "
                "style_tip, and a confidence_score (0-100). Return only valid JSON."
            )
        }
    ]
    return await groq_chat(messages)
