import uvicorn
from app.config import settings

if __name__ == "__main__":
    print(f"🚀 Starting Whey Mass Store Chatbot Server...")
    print(f"📍 Server running at http://{settings.HOST}:{settings.PORT}")
    print(f"📚 API Documentation: http://localhost:{settings.PORT}/docs")
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
