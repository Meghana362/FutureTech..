import httpx
from config import get_settings

settings = get_settings()
HF_API_BASE = "https://api-inference.huggingface.co/models"

HEADERS = {"Authorization": f"Bearer {settings.hf_api_key}"}

async def classify_fashion_image(image_bytes: bytes) -> list:
    """Use HF image classification for fashion items."""
    model = "microsoft/resnet-50"
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            f"{HF_API_BASE}/{model}",
            headers=HEADERS,
            content=image_bytes,
        )
        return response.json()

async def classify_clothing_type(image_bytes: bytes) -> list:
    """Specialized fashion clothing classifier."""
    model = "google/vit-base-patch16-224"
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            f"{HF_API_BASE}/{model}",
            headers=HEADERS,
            content=image_bytes,
        )
        return response.json()

async def generate_style_description(prompt: str) -> str:
    """Text generation for style descriptions."""
    model = "mistralai/Mistral-7B-Instruct-v0.2"
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(
            f"{HF_API_BASE}/{model}",
            headers=HEADERS,
            json={"inputs": prompt, "parameters": {"max_new_tokens": 300}},
        )
        data = response.json()
        if isinstance(data, list) and data:
            return data[0].get("generated_text", "")
        return str(data)
