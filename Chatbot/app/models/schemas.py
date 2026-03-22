from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum

class FitnessGoal(str, Enum):
    MUSCLE_GAIN = "muscle_gain"
    WEIGHT_LOSS = "weight_loss"
    LEAN_MUSCLE = "lean_muscle"
    MASS_GAIN = "mass_gain"
    MAINTENANCE = "maintenance"
    RECOVERY = "recovery"

class DietaryPreference(str, Enum):
    NONE = "none"
    VEGETARIAN = "vegetarian"
    VEGAN = "vegan"
    LACTOSE_FREE = "lactose_free"
    GLUTEN_FREE = "gluten_free"
    HALAL = "halal"

class FlavorPreference(str, Enum):
    CHOCOLATE = "chocolate"
    VANILLA = "vanilla"
    STRAWBERRY = "strawberry"
    BANANA = "banana"
    COOKIES_CREAM = "cookies_cream"
    UNFLAVORED = "unflavored"
    OTHER = "other"

class ChatMessage(BaseModel):
    role: str = Field(..., description="Role of the message sender: 'user' or 'assistant'")
    content: str = Field(..., description="Content of the message")

class ChatRequest(BaseModel):
    message: str = Field(..., description="User's message")
    conversation_history: Optional[List[ChatMessage]] = Field(default=[], description="Previous conversation history")
    session_id: Optional[str] = Field(default=None, description="Session ID for tracking conversation")

class ChatResponse(BaseModel):
    response: str = Field(..., description="Chatbot's response")
    recommended_products: Optional[List[dict]] = Field(default=None, description="List of recommended products")
    extracted_preferences: Optional[dict] = Field(default=None, description="Extracted user preferences")
    session_id: str = Field(..., description="Session ID for tracking conversation")

class UserPreferences(BaseModel):
    fitness_goal: Optional[FitnessGoal] = None
    dietary_preference: Optional[DietaryPreference] = None
    flavor_preference: Optional[FlavorPreference] = None
    budget_range: Optional[str] = None  # "low", "medium", "high"
    weight: Optional[float] = None  # in kg
    experience_level: Optional[str] = None  # "beginner", "intermediate", "advanced"
    allergies: Optional[List[str]] = None

class Product(BaseModel):
    id: str
    name: str
    brand: str
    category: str  # "whey_protein", "mass_gainer", "isolate", "casein", "plant_based"
    price: float
    protein_per_serving: float  # grams
    calories_per_serving: float
    carbs_per_serving: float
    fat_per_serving: float
    servings: int
    flavors: List[str]
    dietary_info: List[str]  # ["lactose_free", "gluten_free", etc.]
    best_for: List[str]  # ["muscle_gain", "weight_loss", etc.]
    description: str
    rating: float
    image_url: Optional[str] = None

class ProductRecommendationRequest(BaseModel):
    preferences: UserPreferences
    limit: Optional[int] = Field(default=5, description="Maximum number of products to recommend")
