from google import genai
from google.genai import types
from config import get_settings

settings = get_settings()

def get_client():
    return genai.Client(api_key=settings.gemini_api_key)

async def generate_fashion_advice(prompt: str) -> str:
    client = get_client()
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )
    return response.text

async def analyze_image_with_gemini(image_bytes: bytes, mime_type: str, prompt: str) -> str:
    client = get_client()
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
            prompt
        ]
    )
    return response.text
