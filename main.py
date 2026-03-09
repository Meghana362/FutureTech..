from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from routers import fashion, image_analysis, trends, chat

app = FastAPI(
    title="StyleSense API",
    description="Generative AI–Powered Fashion Recommendation System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

app.include_router(fashion.router, prefix="/api/fashion", tags=["Fashion"])
app.include_router(image_analysis.router, prefix="/api/image", tags=["Image Analysis"])
app.include_router(trends.router, prefix="/api/trends", tags=["Trends"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])

@app.get("/")
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/health")
async def health():
    return {"status": "ok", "service": "StyleSense"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
