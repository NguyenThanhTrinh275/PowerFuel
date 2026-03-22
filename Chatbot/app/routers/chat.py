from fastapi import APIRouter, HTTPException
from app.models.schemas import ChatRequest, ChatResponse, ProductRecommendationRequest
from app.services.chat_service import chat_service
from app.services.recommendation_engine import recommendation_engine

router = APIRouter(prefix="/api/chat", tags=["Chat"])

@router.post("/message", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    """
    Send a message to the chatbot and get a response with product recommendations.
    """
    try:
        result = chat_service.generate_response(
            message=request.message,
            session_id=request.session_id,
            conversation_history=request.conversation_history
        )
        
        return ChatResponse(
            response=result["response"],
            recommended_products=result["recommended_products"],
            extracted_preferences=result["extracted_preferences"],
            session_id=result["session_id"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recommend")
async def get_recommendations(request: ProductRecommendationRequest):
    """
    Get product recommendations based on explicit user preferences.
    """
    try:
        recommendations = recommendation_engine.get_recommendations(
            preferences=request.preferences,
            limit=request.limit
        )
        
        return {
            "success": True,
            "recommendations": recommendations,
            "total": len(recommendations)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/session/{session_id}")
async def clear_session(session_id: str):
    """
    Clear a chat session to start fresh.
    """
    if session_id in chat_service.sessions:
        del chat_service.sessions[session_id]
        return {"success": True, "message": "Session cleared"}
    return {"success": False, "message": "Session not found"}
