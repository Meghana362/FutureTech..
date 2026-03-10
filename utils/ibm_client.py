import httpx
from config import get_settings

settings = get_settings()

async def get_ibm_token() -> str:
    """Get IBM IAM access token."""
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            "https://iam.cloud.ibm.com/identity/token",
            data={
                "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
                "apikey": settings.ibm_api_key,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        return response.json().get("access_token", "")

async def watsonx_generate(prompt: str, model_id: str = "ibm/granite-13b-instruct-v2") -> str:
    """Generate text using IBM WatsonX."""
    token = await get_ibm_token()
    url = f"{settings.ibm_url}/ml/v1/text/generation?version=2023-05-29"
    payload = {
        "model_id": model_id,
        "input": prompt,
        "parameters": {
            "decoding_method": "greedy",
            "max_new_tokens": 500,
            "temperature": 0.7,
        },
        "project_id": settings.ibm_project_id,
    }
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(url, json=payload, headers=headers)
        data = response.json()
        results = data.get("results", [])
        if results:
            return results[0].get("generated_text", "")
        return "Unable to generate response."

async def get_style_profile_analysis(preferences: dict) -> str:
    """Analyze user style profile using IBM Granite."""
    prompt = f"""You are a personal fashion stylist AI. Analyze the following user preferences and create a detailed style profile:

User Preferences:
- Body Type: {preferences.get('body_type', 'not specified')}
- Favorite Colors: {', '.join(preferences.get('colors', []))}
- Occasion: {preferences.get('occasion', 'casual')}
- Budget: {preferences.get('budget', 'moderate')}
- Style Keywords: {', '.join(preferences.get('style_keywords', []))}

Provide a comprehensive style profile with: signature style name, recommended silhouettes, must-have wardrobe pieces, color palette recommendation, and styling tips. Be specific and inspiring."""
    return await watsonx_generate(prompt)
