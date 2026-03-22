import re
import uuid
from typing import Dict, List, Optional, Tuple
from app.models.schemas import (
    UserPreferences, FitnessGoal, DietaryPreference, 
    FlavorPreference, ChatMessage
)
from app.services.recommendation_engine import recommendation_engine
from app.config import settings

class ChatService:
    def __init__(self):
        self.sessions: Dict[str, Dict] = {}
        
        # Keywords for intent detection
        self.goal_keywords = {
            FitnessGoal.MUSCLE_GAIN: ["muscle", "build muscle", "gain muscle", "bigger", "strength", "strong"],
            FitnessGoal.WEIGHT_LOSS: ["lose weight", "weight loss", "cut", "cutting", "lean out", "slim", "diet", "fat loss"],
            FitnessGoal.LEAN_MUSCLE: ["lean", "lean muscle", "toned", "definition", "ripped", "shredded"],
            FitnessGoal.MASS_GAIN: ["mass", "bulk", "bulking", "gain weight", "size", "heavy", "hard gainer", "skinny"],
            FitnessGoal.MAINTENANCE: ["maintain", "maintenance", "keep", "stay"],
            FitnessGoal.RECOVERY: ["recovery", "recover", "post workout", "after workout"]
        }
        
        self.dietary_keywords = {
            DietaryPreference.VEGAN: ["vegan", "plant based", "plant-based", "no animal", "no dairy", "no milk"],
            DietaryPreference.VEGETARIAN: ["vegetarian", "veggie", "no meat"],
            DietaryPreference.LACTOSE_FREE: ["lactose free", "lactose intolerant", "no lactose", "dairy free"],
            DietaryPreference.GLUTEN_FREE: ["gluten free", "no gluten", "celiac"],
            DietaryPreference.HALAL: ["halal"]
        }
        
        self.flavor_keywords = {
            FlavorPreference.CHOCOLATE: ["chocolate", "choco", "cocoa"],
            FlavorPreference.VANILLA: ["vanilla"],
            FlavorPreference.STRAWBERRY: ["strawberry", "berry"],
            FlavorPreference.BANANA: ["banana"],
            FlavorPreference.COOKIES_CREAM: ["cookies", "oreo", "cookies and cream", "cookies & cream"],
            FlavorPreference.UNFLAVORED: ["unflavored", "no flavor", "plain", "natural"]
        }
        
        self.budget_keywords = {
            "low": ["cheap", "budget", "affordable", "inexpensive", "low cost", "under 40", "save money"],
            "medium": ["moderate", "mid-range", "average price", "reasonable"],
            "high": ["premium", "best quality", "top", "high end", "expensive", "money is not"]
        }
        
        self.experience_keywords = {
            "beginner": ["beginner", "new", "first time", "starting", "never used", "just started", "newbie"],
            "intermediate": ["intermediate", "some experience", "been training", "few months", "year"],
            "advanced": ["advanced", "experienced", "professional", "athlete", "competing", "years"]
        }
    
    def get_or_create_session(self, session_id: Optional[str] = None) -> Tuple[str, Dict]:
        """Get existing session or create a new one."""
        if session_id and session_id in self.sessions:
            return session_id, self.sessions[session_id]
        
        new_session_id = session_id or str(uuid.uuid4())
        self.sessions[new_session_id] = {
            "preferences": UserPreferences(),
            "conversation_stage": "greeting",
            "asked_questions": [],
            "recommendations_given": False
        }
        return new_session_id, self.sessions[new_session_id]
    
    def extract_preferences(self, message: str, current_preferences: UserPreferences) -> UserPreferences:
        """Extract user preferences from message."""
        message_lower = message.lower()
        
        # Extract fitness goal
        if not current_preferences.fitness_goal:
            for goal, keywords in self.goal_keywords.items():
                if any(kw in message_lower for kw in keywords):
                    current_preferences.fitness_goal = goal
                    break
        
        # Extract dietary preference
        if not current_preferences.dietary_preference or current_preferences.dietary_preference == DietaryPreference.NONE:
            for diet, keywords in self.dietary_keywords.items():
                if any(kw in message_lower for kw in keywords):
                    current_preferences.dietary_preference = diet
                    break
        
        # Extract flavor preference
        if not current_preferences.flavor_preference:
            for flavor, keywords in self.flavor_keywords.items():
                if any(kw in message_lower for kw in keywords):
                    current_preferences.flavor_preference = flavor
                    break
        
        # Extract budget
        if not current_preferences.budget_range:
            for budget, keywords in self.budget_keywords.items():
                if any(kw in message_lower for kw in keywords):
                    current_preferences.budget_range = budget
                    break
        
        # Extract experience level
        if not current_preferences.experience_level:
            for exp, keywords in self.experience_keywords.items():
                if any(kw in message_lower for kw in keywords):
                    current_preferences.experience_level = exp
                    break
        
        # Extract weight if mentioned
        weight_match = re.search(r'(\d+)\s*(?:kg|kilos?|pounds?|lbs?)', message_lower)
        if weight_match and not current_preferences.weight:
            weight = float(weight_match.group(1))
            # Convert pounds to kg if needed
            if 'lb' in message_lower or 'pound' in message_lower:
                weight = weight * 0.453592
            current_preferences.weight = weight
        
        # Extract allergies
        allergy_patterns = ["allergic to", "allergy to", "can't have", "cannot have", "intolerant to"]
        for pattern in allergy_patterns:
            if pattern in message_lower:
                # Extract what comes after the pattern
                idx = message_lower.index(pattern) + len(pattern)
                rest = message_lower[idx:].strip()
                # Get the first word/phrase
                allergy = rest.split()[0] if rest.split() else None
                if allergy and not current_preferences.allergies:
                    current_preferences.allergies = [allergy]
                elif allergy:
                    current_preferences.allergies.append(allergy)
        
        return current_preferences
    
    def get_next_question(self, session_data: Dict) -> Optional[str]:
        """Determine the next question to ask based on missing preferences."""
        preferences = session_data["preferences"]
        asked = session_data["asked_questions"]
        
        questions = {
            "goal": ("What's your fitness goal? (e.g., build muscle, lose weight, gain mass, recovery)", 
                     preferences.fitness_goal is None),
            "dietary": ("Do you have any dietary preferences or restrictions? (e.g., vegan, lactose-free, gluten-free)", 
                        preferences.dietary_preference is None and "goal" in asked),
            "flavor": ("What flavor do you prefer? (e.g., chocolate, vanilla, strawberry)", 
                       preferences.flavor_preference is None and "dietary" in asked),
            "budget": ("What's your budget range? (budget-friendly, moderate, or premium)", 
                       preferences.budget_range is None and "flavor" in asked)
        }
        
        for key, (question, should_ask) in questions.items():
            if should_ask and key not in asked:
                session_data["asked_questions"].append(key)
                return question
        
        return None
    
    def has_enough_info(self, preferences: UserPreferences) -> bool:
        """Check if we have enough information to make recommendations."""
        # At minimum, we need a fitness goal to make recommendations
        return preferences.fitness_goal is not None
    
    def generate_response(self, message: str, session_id: Optional[str] = None, 
                         conversation_history: List[ChatMessage] = None) -> Dict:
        """Generate chatbot response."""
        session_id, session_data = self.get_or_create_session(session_id)
        
        # Check for greeting
        greeting_keywords = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "start"]
        is_greeting = any(kw in message.lower() for kw in greeting_keywords) and len(message.split()) <= 5
        
        if is_greeting and session_data["conversation_stage"] == "greeting":
            session_data["conversation_stage"] = "gathering_info"
            return {
                "response": "Hello! Welcome to the Whey Mass Store! 💪 I'm here to help you find the perfect protein supplement. "
                           "What's your fitness goal? Are you looking to build muscle, lose weight, gain mass, or something else?",
                "recommended_products": None,
                "extracted_preferences": None,
                "session_id": session_id
            }
        
        # Extract preferences from message
        session_data["preferences"] = self.extract_preferences(message, session_data["preferences"])
        
        # Check for direct product questions
        product_query_keywords = ["recommend", "suggest", "what should", "which product", "best product", 
                                  "show me", "find me", "looking for", "need a", "want a"]
        is_product_query = any(kw in message.lower() for kw in product_query_keywords)
        
        # If we have enough info or user is asking for recommendations
        if self.has_enough_info(session_data["preferences"]) and (is_product_query or len(session_data["asked_questions"]) >= 2):
            recommendations = recommendation_engine.get_recommendations(
                session_data["preferences"], 
                limit=3
            )
            
            if recommendations:
                session_data["recommendations_given"] = True
                response = self._format_recommendations(recommendations, session_data["preferences"])
                
                return {
                    "response": response,
                    "recommended_products": recommendations,
                    "extracted_preferences": {
                        "fitness_goal": session_data["preferences"].fitness_goal.value if session_data["preferences"].fitness_goal else None,
                        "dietary_preference": session_data["preferences"].dietary_preference.value if session_data["preferences"].dietary_preference else None,
                        "flavor_preference": session_data["preferences"].flavor_preference.value if session_data["preferences"].flavor_preference else None,
                        "budget_range": session_data["preferences"].budget_range
                    },
                    "session_id": session_id
                }
        
        # Ask next question if we need more info
        next_question = self.get_next_question(session_data)
        if next_question:
            # Acknowledge what we understood
            ack = self._generate_acknowledgment(session_data["preferences"])
            return {
                "response": f"{ack} {next_question}",
                "recommended_products": None,
                "extracted_preferences": None,
                "session_id": session_id
            }
        
        # Default response if we can't understand
        return {
            "response": "I'd love to help you find the perfect protein supplement! Could you tell me more about your fitness goals? "
                       "For example, are you trying to build muscle, lose weight, or gain mass?",
            "recommended_products": None,
            "extracted_preferences": None,
            "session_id": session_id
        }
    
    def _generate_acknowledgment(self, preferences: UserPreferences) -> str:
        """Generate an acknowledgment of understood preferences."""
        parts = []
        
        if preferences.fitness_goal:
            goal_names = {
                FitnessGoal.MUSCLE_GAIN: "building muscle",
                FitnessGoal.WEIGHT_LOSS: "losing weight",
                FitnessGoal.LEAN_MUSCLE: "getting lean muscle",
                FitnessGoal.MASS_GAIN: "gaining mass",
                FitnessGoal.MAINTENANCE: "maintaining your physique",
                FitnessGoal.RECOVERY: "recovery"
            }
            parts.append(f"you're focused on {goal_names.get(preferences.fitness_goal, 'your goals')}")
        
        if preferences.dietary_preference and preferences.dietary_preference != DietaryPreference.NONE:
            parts.append(f"you need {preferences.dietary_preference.value.replace('_', '-')} options")
        
        if preferences.flavor_preference:
            parts.append(f"you like {preferences.flavor_preference.value.replace('_', ' ')} flavor")
        
        if parts:
            return f"Great, I understand that {', and '.join(parts)}!"
        return "Got it!"
    
    def _format_recommendations(self, recommendations: List[Dict], preferences: UserPreferences) -> str:
        """Format product recommendations into a response."""
        response = "Based on your preferences, here are my top recommendations:\n\n"
        
        for i, product in enumerate(recommendations, 1):
            explanation = recommendation_engine.get_recommendation_explanation(product, preferences)
            response += f"**{i}. {product['name']}** by {product['brand']}\n"
            response += f"   💰 ${product['price']:.2f} | 🥤 {product['protein_per_serving']}g protein/serving\n"
            response += f"   ⭐ {product['rating']}/5 | 📦 {product['servings']} servings\n"
            response += f"   {explanation}\n\n"
        
        response += "Would you like more details about any of these products, or would you like me to find alternatives?"
        
        return response


chat_service = ChatService()
