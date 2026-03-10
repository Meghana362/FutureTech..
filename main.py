from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.requests import Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import json
import base64
import httpx
from pathlib import Path
from typing import Optional
import google.generativeai as genai
from dotenv import load_dotenv
import random
from datetime import datetime

# Always resolve paths relative to THIS file, not the working directory
BASE_DIR = Path(__file__).resolve().parent

# Pillow is optional — only needed for image analysis
try:
    import PIL.Image
    import io as _pil_io
    PILLOW_AVAILABLE = True
except ImportError:
    PILLOW_AVAILABLE = False

load_dotenv(BASE_DIR / ".env")

app = FastAPI(title="StyleSense AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", "")

# In-memory storage (replace with DB in production)
user_profiles = {}
wardrobes = {}
saved_outfits = {}
outfit_ratings = {}
chat_histories = {}


def get_gemini_model():
    if not GEMINI_API_KEY:
        return None
    try:
        return genai.GenerativeModel('gemini-1.5-flash')
    except:
        return None


async def generate_ai_response(prompt: str, image_data: bytes = None) -> str:
    model = get_gemini_model()
    if not model:
        return generate_fallback_response(prompt)
    
    try:
        if image_data:
            if PILLOW_AVAILABLE:
                import io
                image = PIL.Image.open(io.BytesIO(image_data))
                response = model.generate_content([prompt, image])
            else:
                # Send as base64 inline data without PIL
                import base64
                img_b64 = base64.b64encode(image_data).decode()
                response = model.generate_content([
                    {"inline_data": {"mime_type": "image/jpeg", "data": img_b64}},
                    prompt
                ])
        else:
            response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return generate_fallback_response(prompt)


def generate_fallback_response(prompt: str) -> str:
    """Fallback responses when API is not available"""
    prompt_lower = prompt.lower()
    
    if "party" in prompt_lower:
        return """**Party Outfit Suggestion 🎉**

**Complete Look:**
- Black slim-fit blazer
- White crisp dress shirt
- Dark indigo slim jeans
- Chelsea boots (black)
- Silver watch accessory

**Style Tips:**
- Roll up your sleeves slightly for a relaxed vibe
- Add a pocket square for extra flair
- Choose cologne with woody/musky notes

**Color Palette:** Black + White + Dark Blue
**Vibe:** Smart Casual Party Ready ✨"""

    elif "wedding" in prompt_lower:
        return """**Wedding Outfit Suggestion 💍**

**Complete Look:**
- Light pastel blue linen suit
- White mandarin collar shirt
- Beige chinos (if casual wedding)
- Oxford shoes in tan/brown
- Subtle floral pocket square

**Style Tips:**
- Avoid white (reserved for bride)
- Opt for breathable fabrics
- Keep accessories minimal

**Color Palette:** Pastels + Neutrals
**Vibe:** Elegant & Respectful ✨"""

    elif "office" in prompt_lower or "formal" in prompt_lower:
        return """**Office Outfit Suggestion 💼**

**Complete Look:**
- Navy blue structured blazer
- Light blue Oxford shirt
- Charcoal grey trousers
- Brown leather derby shoes
- Leather belt matching shoes

**Style Tips:**
- Iron clothes the night before
- Keep fit well-tailored
- Minimal cologne

**Color Palette:** Navy + Grey + Brown
**Vibe:** Professional & Confident ✨"""

    elif "casual" in prompt_lower or "college" in prompt_lower:
        return """**Casual Outfit Suggestion 😎**

**Complete Look:**
- White graphic tee or polo
- Blue slim-fit jeans
- White sneakers (Nike/Adidas)
- Minimal watch
- Optional: light denim jacket

**Style Tips:**
- Clean, minimal look works best
- Fit is everything — avoid baggy
- White sneakers elevate any casual look

**Color Palette:** White + Blue + Denim
**Vibe:** Fresh & Effortless ✨"""

    elif "gym" in prompt_lower or "workout" in prompt_lower:
        return """**Gym Outfit Suggestion 💪**

**Complete Look:**
- Moisture-wicking performance tee
- Compression shorts or joggers
- Running shoes with good grip
- Athletic socks
- Cap/headband optional

**Style Tips:**
- Choose breathable fabrics
- Avoid cotton (retains sweat)
- Compression wear improves performance

**Color Palette:** Black + Neon accents
**Vibe:** Athletic & Motivated ✨"""

    elif "color" in prompt_lower or "match" in prompt_lower:
        return """**Color Matching Guide 🎨**

**Classic Combinations:**
- Navy Blue + White + Tan
- Black + Grey + Silver
- Olive Green + Beige + Brown
- Burgundy + Navy + Cream
- Mustard + Black + White

**Rules to Remember:**
- 60-30-10 rule: dominant/secondary/accent
- Neutrals always work as base
- Max 3 colors in one outfit
- Monochromatic looks = always elegant

**Pro Tip:** When in doubt, go monochrome ✨"""

    elif "trend" in prompt_lower:
        return """**Fashion Trends 2024 📊**

**Top Trending Styles:**
1. **Quiet Luxury** - Minimalist, high-quality basics
2. **Y2K Revival** - Low-rise, metallics, butterfly prints  
3. **Gorpcore** - Technical outdoor wear in daily fashion
4. **Coastal Grandmother** - Linen, pastels, relaxed elegance
5. **Dopamine Dressing** - Bold colors for mood boosting

**Trending Colors:**
- Mocha Mousse (Pantone 2025)
- Digital Lavender
- Matcha Green
- Butter Yellow

**Must-Have Items:**
- Oversized blazer
- Wide-leg trousers
- Ballet flats
- Barrel-leg jeans ✨"""

    else:
        return """**Style Recommendation ✨**

**General Outfit Advice:**
- Build a capsule wardrobe with versatile basics
- Invest in quality over quantity
- Fit matters more than brand
- Neutral colors mix and match easily

**Essential Pieces:**
- White t-shirt (2-3 good quality)
- Dark jeans (well-fitted)
- Navy blazer (works formal/casual)
- White sneakers + leather shoes
- 1-2 statement pieces

**Style Mantra:** Dress for confidence, not just trends ✨"""


@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/api/profile/save")
async def save_profile(
    user_id: str = Form("default_user"),
    name: str = Form(""),
    gender: str = Form(""),
    age: str = Form(""),
    body_type: str = Form(""),
    favorite_colors: str = Form(""),
    preferred_style: str = Form(""),
    budget_range: str = Form(""),
    skin_tone: str = Form("")
):
    profile = {
        "name": name,
        "gender": gender,
        "age": age,
        "body_type": body_type,
        "favorite_colors": favorite_colors,
        "preferred_style": preferred_style,
        "budget_range": budget_range,
        "skin_tone": skin_tone,
        "created_at": datetime.now().isoformat()
    }
    user_profiles[user_id] = profile
    return {"status": "success", "message": "Profile saved!", "profile": profile}


@app.get("/api/profile/{user_id}")
async def get_profile(user_id: str):
    profile = user_profiles.get(user_id, {})
    return {"profile": profile}


@app.post("/api/outfit/occasion")
async def occasion_outfit(
    occasion: str = Form(...),
    gender: str = Form("unisex"),
    style_pref: str = Form(""),
    budget: str = Form(""),
    season: str = Form("any")
):
    profile_context = f"Gender: {gender}, Style: {style_pref}, Budget: {budget}, Season: {season}" if any([gender, style_pref, budget]) else ""
    
    prompt = f"""You are StyleSense AI, a professional fashion stylist.
    
Create a complete, detailed outfit recommendation for this occasion:
Occasion: {occasion}
{profile_context}

Provide:
1. Complete outfit with specific items (top, bottom, shoes, accessories)
2. Color combinations with hex codes
3. Styling tips
4. Where to shop (budget-friendly and premium options)
5. Why this works for the occasion

Format with emojis and make it engaging and practical."""

    response = await generate_ai_response(prompt)
    return {"recommendation": response, "occasion": occasion}


@app.post("/api/outfit/analyze-image")
async def analyze_outfit_image(
    file: UploadFile = File(...),
    user_id: str = Form("default_user")
):
    image_data = await file.read()
    
    prompt = """You are StyleSense AI analyzing a fashion image. Please:

1. **Identify the clothing items** visible in the image
2. **Describe colors and patterns** you see
3. **Suggest 3 complete outfit combinations** that would complement these items
4. **Rate the current styling** out of 10 with explanation
5. **Provide improvement tips**

Be specific, practical, and encouraging!"""

    response = await generate_ai_response(prompt, image_data)
    return {"analysis": response, "filename": file.filename}


@app.post("/api/weather/fashion")
async def weather_fashion(
    city: str = Form(...),
    gender: str = Form("unisex"),
    occasion: str = Form("casual")
):
    weather_info = {"temp": 25, "condition": "Clear", "description": "sunny weather"}
    
    if WEATHER_API_KEY:
        try:
            async with httpx.AsyncClient() as client:
                url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={WEATHER_API_KEY}&units=metric"
                res = await client.get(url, timeout=5.0)
                if res.status_code == 200:
                    data = res.json()
                    weather_info = {
                        "temp": data["main"]["temp"],
                        "condition": data["weather"][0]["main"],
                        "description": data["weather"][0]["description"],
                        "humidity": data["main"]["humidity"],
                        "wind": data["wind"]["speed"]
                    }
        except:
            pass
    
    prompt = f"""You are StyleSense AI. Suggest fashion for this weather:

City: {city}
Temperature: {weather_info['temp']}°C
Condition: {weather_info['condition']} ({weather_info.get('description', '')})
Person: {gender}
Occasion: {occasion}

Provide:
1. **What to wear** - complete outfit with specific items
2. **Fabrics to choose** - based on weather
3. **Colors that work** - for this weather/mood
4. **What to avoid** - and why
5. **Accessories** - for this weather

Make it practical and weather-appropriate!"""

    response = await generate_ai_response(prompt)
    return {
        "weather": weather_info,
        "city": city,
        "recommendation": response
    }


@app.post("/api/trends")
async def get_trends(
    season: str = Form("current"),
    style: str = Form("general"),
    gender: str = Form("unisex")
):
    current_month = datetime.now().strftime("%B %Y")
    
    prompt = f"""You are StyleSense AI trend analyst. Analyze and present fashion trends for:

Time: {current_month}
Season: {season}
Style Category: {style}
For: {gender}

Provide:
1. **Top 5 Trending Outfits** with descriptions
2. **Trending Colors of the Season** (with hex codes)
3. **Must-Have Pieces** right now
4. **Style Movements** (e.g., quiet luxury, Y2K, etc.)
5. **Celebrity Style Inspiration**
6. **How to incorporate trends** on any budget

Make it exciting and current!"""

    response = await generate_ai_response(prompt)
    return {"trends": response, "season": season, "generated_at": datetime.now().isoformat()}


@app.post("/api/chat")
async def chat_assistant(
    message: str = Form(...),
    user_id: str = Form("default_user"),
    history: str = Form("[]")
):
    profile = user_profiles.get(user_id, {})
    profile_context = ""
    if profile:
        profile_context = f"User profile: {profile.get('name', 'User')}, {profile.get('gender', '')}, prefers {profile.get('preferred_style', 'any')} style, budget: {profile.get('budget_range', 'any')}"
    
    chat_history = json.loads(history) if history else []
    
    system_prompt = f"""You are StyleSense AI, a friendly and expert fashion stylist chatbot. 
You give personalized, practical fashion advice with enthusiasm.
{profile_context}

You help with: outfit recommendations, color matching, occasion dressing, trend advice, wardrobe building, style tips.
Keep responses concise but detailed. Use emojis. Be encouraging and positive."""

    conversation = system_prompt + "\n\n"
    for msg in chat_history[-6:]:
        role = "User" if msg["role"] == "user" else "StyleSense AI"
        conversation += f"{role}: {msg['content']}\n"
    conversation += f"User: {message}\nStyleSense AI:"

    response = await generate_ai_response(conversation)
    return {"response": response, "user_id": user_id}


@app.post("/api/wardrobe/add")
async def add_to_wardrobe(
    user_id: str = Form("default_user"),
    item_name: str = Form(...),
    category: str = Form(...),
    color: str = Form(""),
    brand: str = Form(""),
    occasion: str = Form("")
):
    if user_id not in wardrobes:
        wardrobes[user_id] = []
    
    item = {
        "id": f"item_{len(wardrobes[user_id]) + 1}",
        "name": item_name,
        "category": category,
        "color": color,
        "brand": brand,
        "occasion": occasion,
        "added_at": datetime.now().isoformat()
    }
    wardrobes[user_id].append(item)
    return {"status": "success", "item": item, "total_items": len(wardrobes[user_id])}


@app.get("/api/wardrobe/{user_id}")
async def get_wardrobe(user_id: str):
    items = wardrobes.get(user_id, [])
    return {"items": items, "total": len(items)}


@app.post("/api/wardrobe/suggest")
async def suggest_from_wardrobe(user_id: str = Form("default_user"), occasion: str = Form("casual")):
    items = wardrobes.get(user_id, [])
    
    if not items:
        return {"suggestions": "Your wardrobe is empty! Add some items first to get personalized combination suggestions."}
    
    items_text = "\n".join([f"- {item['name']} ({item['category']}, {item['color']})" for item in items])
    
    prompt = f"""You are StyleSense AI wardrobe stylist.

The user has these clothes in their wardrobe:
{items_text}

Create 5 different outfit combinations for: {occasion}

For each combination:
1. List the specific items to wear
2. Why this combination works
3. Accessories to add
4. Rating out of 10

Be creative and use the actual items listed!"""

    response = await generate_ai_response(prompt)
    return {"suggestions": response}


@app.post("/api/outfit/rate")
async def rate_outfit(
    outfit_id: str = Form(...),
    rating: int = Form(...),
    user_id: str = Form("default_user"),
    comment: str = Form("")
):
    if user_id not in outfit_ratings:
        outfit_ratings[user_id] = []
    
    outfit_ratings[user_id].append({
        "outfit_id": outfit_id,
        "rating": rating,
        "comment": comment,
        "timestamp": datetime.now().isoformat()
    })
    return {"status": "success", "message": "Rating saved!", "rating": rating}


@app.post("/api/outfit/save")
async def save_outfit(
    user_id: str = Form("default_user"),
    outfit_data: str = Form(...),
    outfit_name: str = Form("My Outfit")
):
    if user_id not in saved_outfits:
        saved_outfits[user_id] = []
    
    outfit = {
        "id": f"outfit_{len(saved_outfits[user_id]) + 1}",
        "name": outfit_name,
        "data": outfit_data,
        "saved_at": datetime.now().isoformat()
    }
    saved_outfits[user_id].append(outfit)
    return {"status": "success", "outfit": outfit}


@app.get("/api/outfit/saved/{user_id}")
async def get_saved_outfits(user_id: str):
    outfits = saved_outfits.get(user_id, [])
    return {"outfits": outfits}


@app.post("/api/color/match")
async def color_match(base_color: str = Form(...), style: str = Form("any")):
    prompt = f"""You are StyleSense AI color expert.

Base color: {base_color}
Style: {style}

Provide:
1. **5 Perfect Color Combinations** with the base color
2. **Hex codes** for each suggested color
3. **Which items to pair** each color with
4. **Occasions** each combination suits
5. **Colors to AVOID** with this base

Format nicely with color names and practical examples!"""

    response = await generate_ai_response(prompt)
    return {"base_color": base_color, "combinations": response}


@app.post("/api/lookbook/generate")
async def generate_lookbook(
    theme: str = Form("weekly"),
    gender: str = Form("unisex"),
    style: str = Form("mixed")
):
    current_date = datetime.now().strftime("%B %d, %Y")
    
    prompt = f"""You are StyleSense AI creating an exclusive lookbook.

Date: {current_date}
Theme: {theme} lookbook
For: {gender}
Style: {style}

Create a complete lookbook with:
1. **Lookbook Title** (creative)
2. **5 Complete Outfits** (numbered looks)
   - Each with full outfit description
   - Color palette
   - Mood/vibe
   - Best occasion
3. **Style Notes** for the week
4. **Key Pieces** to invest in
5. **Trend Forecast**

Make it feel like a real fashion magazine feature!"""

    response = await generate_ai_response(prompt)
    return {"lookbook": response, "theme": theme, "date": current_date}


@app.get("/api/daily-tip")
async def get_daily_tip():
    tips = [
        "Invest in quality basics - a good white shirt, dark jeans, and leather shoes can take you anywhere! 👔",
        "The fit is everything. An expensive outfit in the wrong size looks worse than affordable clothes that fit perfectly! ✂️",
        "Build a capsule wardrobe: 10 versatile pieces that mix and match into 30+ outfits! 🎯",
        "Neutral colors (black, white, navy, grey, beige) always work together! 🎨",
        "A blazer instantly elevates any outfit from casual to smart casual! 🔥",
        "Accessorize wisely - one statement piece is better than wearing everything at once! 💫",
        "Take care of your clothes: iron, steam, and store properly to make them last longer! 👗",
        "Shop off-season for the best deals - winter clothes in spring, summer in fall! 🏷️",
        "When in doubt, dress one level up from what's expected! 🌟",
        "A great watch is the most versatile accessory you can own! ⌚"
    ]
    tip = random.choice(tips)
    return {"tip": tip, "date": datetime.now().strftime("%Y-%m-%d")}


@app.get("/api/style-score/{user_id}")
async def get_style_score(user_id: str):
    profile = user_profiles.get(user_id, {})
    wardrobe = wardrobes.get(user_id, [])
    ratings = outfit_ratings.get(user_id, [])
    outfits = saved_outfits.get(user_id, [])
    
    score = 0
    breakdown = {}
    
    if profile:
        score += 25
        breakdown["Profile Complete"] = 25
    if len(wardrobe) >= 5:
        score += 20
        breakdown["Wardrobe Items"] = 20
    elif wardrobe:
        score += 10
        breakdown["Wardrobe Items"] = 10
    if len(outfits) >= 3:
        score += 20
        breakdown["Saved Outfits"] = 20
    elif outfits:
        score += 10
        breakdown["Saved Outfits"] = 10
    if ratings:
        score += 15
        breakdown["Ratings Given"] = 15
    
    score = min(score + 20, 100)
    breakdown["Base Score"] = 20
    
    level = "Fashion Novice 🌱"
    if score >= 80:
        level = "Style Icon 👑"
    elif score >= 60:
        level = "Fashion Forward 🔥"
    elif score >= 40:
        level = "Style Explorer 🌟"
    
    return {"score": score, "level": level, "breakdown": breakdown}


if __name__ == "__main__":
    import sys
    os.chdir(BASE_DIR)  # ensure working dir is project root
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
