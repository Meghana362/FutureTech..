# ✦ StyleSense AI — Fashion Recommendation System

> Generative AI–Powered Personal Fashion Intelligence Platform

## 🚀 Quick Start

### 1. Prerequisites
- Python 3.9 or higher
- pip (Python package manager)

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure API Keys
```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your API keys
# GEMINI_API_KEY is required for AI features
```

**Get your Gemini API key free at:** https://aistudio.google.com/app/apikey

### 4. Run the Application
```bash
python main.py
```

Open your browser at: **http://localhost:8000**

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 👤 **Style Profile** | Set gender, body type, style preferences, budget |
| 🎉 **Occasion Outfits** | Party, Office, Wedding, College, Gym, Date |
| 🌦️ **Weather Fashion** | Real-time weather-based outfit suggestions |
| 📷 **Image Analysis** | Upload photo → AI analyzes and suggests matches |
| 🎨 **Color Matching** | Smart AI color combination recommendations |
| 👚 **Wardrobe Manager** | Add your clothes, get AI combo suggestions |
| 🤖 **AI Chatbot** | Interactive fashion stylist assistant |
| 📊 **Trend Analyzer** | Current fashion trends & seasonal insights |
| 📚 **AI Lookbook** | Generate personalized weekly style guides |
| ⭐ **Outfit Rating** | Rate AI suggestions to improve recommendations |
| 💾 **Save & Share** | Save favorites, download, share outfits |
| 🏆 **Style Score** | Gamified fashion profile scoring |
| 🎮 **Challenges** | Fashion achievement challenges |
| 🌗 **Dark/Light Mode** | Full theme toggle support |

---

## 🔑 API Keys Needed

| API | Required | Free Tier | Get It |
|-----|----------|-----------|--------|
| Google Gemini | ✅ Required | Yes (generous) | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| OpenWeatherMap | Optional | Yes (1000 calls/day) | [openweathermap.org](https://openweathermap.org/api) |

> **Note:** The app works without API keys using intelligent fallback responses!

---

## 📁 Project Structure

```
stylesense/
├── main.py              # FastAPI backend + all API routes
├── requirements.txt     # Python dependencies
├── .env.example        # Environment variables template
├── .env                # Your actual API keys (create this)
├── templates/
│   └── index.html      # Main frontend (single-page app)
└── static/
    ├── css/
    │   └── style.css   # Complete styling (dark/light theme)
    └── js/
        └── app.js      # Frontend logic + API calls
```

---

## 🛠️ Technologies Used

- **Backend:** FastAPI, Python, Uvicorn
- **AI:** Google Gemini 1.5 Flash
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Weather:** OpenWeatherMap API
- **Fonts:** Playfair Display, DM Sans (Google Fonts)
- **Design:** CSS Custom Properties, CSS Grid, Flexbox

---

## 🌐 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Main web app |
| `/api/profile/save` | POST | Save user profile |
| `/api/outfit/occasion` | POST | Occasion-based outfit |
| `/api/outfit/analyze-image` | POST | Analyze uploaded image |
| `/api/weather/fashion` | POST | Weather-based fashion |
| `/api/trends` | POST | Fashion trends |
| `/api/chat` | POST | AI chatbot message |
| `/api/wardrobe/add` | POST | Add wardrobe item |
| `/api/wardrobe/suggest` | POST | AI wardrobe combos |
| `/api/outfit/rate` | POST | Rate an outfit |
| `/api/outfit/save` | POST | Save outfit |
| `/api/color/match` | POST | Color combinations |
| `/api/lookbook/generate` | POST | Generate lookbook |
| `/api/daily-tip` | GET | Daily fashion tip |
| `/api/style-score/{user_id}` | GET | Style gamification score |

---

## 💡 Tips

- All AI features work without API keys using smart fallback responses
- With Gemini API key, responses are highly personalized
- Profile completion unlocks better AI recommendations
- Use the wardrobe manager + AI suggestions for outfit planning
- The chatbot remembers conversation context

---

Made with ❤️ by StyleSense AI Team
