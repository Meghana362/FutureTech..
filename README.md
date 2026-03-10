# StyleSense 👗✦
### Generative AI–Powered Fashion Recommendation System

---

## 🚀 Quick Start (VS Code Terminal)

### 1. Clone / Extract the project
```bash
cd stylesense
```

### 2. Create virtual environment
```bash
python -m venv venv
```

### 3. Activate virtual environment
```bash
# Windows
venv\Scripts\activate

# Mac / Linux
source venv/bin/activate
```

### 4. Install dependencies
```bash
pip install -r requirements.txt
```

### 5. Set up environment variables
```bash
cp .env.example .env
# Open .env and fill in your API keys
```

### 6. Run the server
```bash
uvicorn main:app --reload --port 8000
```

### 7. Open in browser
```
http://localhost:8000
```

---

## 🔑 API Keys Required

| Service | Where to Get |
|---|---|
| **Gemini** | https://aistudio.google.com/app/apikey |
| **Groq** | https://console.groq.com/keys |
| **HuggingFace** | https://huggingface.co/settings/tokens |
| **IBM WatsonX** | https://cloud.ibm.com/iam/apikeys |

---

## 📁 Project Structure

```
stylesense/
├── main.py                  # FastAPI app entry point
├── config.py                # Settings / env loader
├── requirements.txt
├── .env.example             # Copy to .env and fill keys
├── models/
│   └── schemas.py           # Pydantic request/response models
├── routers/
│   ├── fashion.py           # /api/fashion  — Gemini + IBM AI
│   ├── image_analysis.py    # /api/image    — Gemini Vision + HuggingFace
│   ├── trends.py            # /api/trends   — Groq LLaMA
│   └── chat.py              # /api/chat     — Groq LLaMA 70B
├── utils/
│   ├── gemini_client.py     # Google Gemini helper
│   ├── groq_client.py       # Groq LLaMA helper
│   ├── hf_client.py         # HuggingFace helper
│   └── ibm_client.py        # IBM WatsonX helper
├── templates/
│   └── index.html           # Single-page frontend
└── static/
    ├── css/style.css
    └── js/app.js
```

---

## 🤖 AI Models Used

| Feature | AI Model |
|---|---|
| Style Profile | IBM Granite (WatsonX) |
| Outfit Recommendations | Google Gemini 1.5 Flash |
| Image Analysis | Gemini 1.5 Flash Vision |
| Image Classification | HuggingFace ViT / ResNet |
| Trend Intelligence | Groq LLaMA 3 70B |
| AI Stylist Chat | Groq LLaMA 3 70B |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/fashion/recommend` | Personalized recommendations |
| POST | `/api/fashion/outfit-builder` | Build outfit from base item |
| POST | `/api/image/analyze` | Analyze outfit image |
| POST | `/api/trends/insights` | Seasonal trend report |
| GET  | `/api/trends/categories` | Available categories |
| POST | `/api/chat/message` | AI stylist chat |

### Interactive API Docs
```
http://localhost:8000/docs
```

---

## 🛠 Tech Stack
- **Backend**: FastAPI + Uvicorn
- **Frontend**: HTML5, CSS3, Vanilla JS
- **AI**: Google Gemini, Groq (LLaMA 3), IBM WatsonX, HuggingFace
- **Language**: Python 3.10+
