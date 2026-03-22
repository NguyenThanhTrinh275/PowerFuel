from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import chat, products

app = FastAPI(
    title="Whey Mass Store Chatbot API",
    description="AI-powered chatbot for recommending protein supplements based on user needs",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router)
app.include_router(products.router)

@app.get("/")
async def root():
    return {
        "message": "Welcome to Whey Mass Store Chatbot API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "chat": "/api/chat/message",
            "products": "/api/products",
            "recommendations": "/api/chat/recommend"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "chatbot-api"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
