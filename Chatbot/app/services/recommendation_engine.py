from typing import List, Dict, Optional
from app.models.schemas import UserPreferences, FitnessGoal, DietaryPreference, FlavorPreference
from app.data.products import get_all_products

class RecommendationEngine:
    def __init__(self):
        self.products = get_all_products()
    
    def calculate_score(self, product: Dict, preferences: UserPreferences) -> float:
        """Calculate a relevance score for a product based on user preferences."""
        score = 0.0
        max_score = 100.0
        
        # Fitness goal matching (40 points)
        if preferences.fitness_goal:
            goal_map = {
                FitnessGoal.MUSCLE_GAIN: "muscle_gain",
                FitnessGoal.WEIGHT_LOSS: "weight_loss",
                FitnessGoal.LEAN_MUSCLE: "lean_muscle",
                FitnessGoal.MASS_GAIN: "mass_gain",
                FitnessGoal.MAINTENANCE: "maintenance",
                FitnessGoal.RECOVERY: "recovery"
            }
            goal_str = goal_map.get(preferences.fitness_goal)
            if goal_str and goal_str in product.get("best_for", []):
                score += 40
            
            # Category bonus based on goal
            category = product.get("category", "")
            if preferences.fitness_goal == FitnessGoal.MASS_GAIN:
                if category == "mass_gainer":
                    score += 10
            elif preferences.fitness_goal == FitnessGoal.WEIGHT_LOSS:
                if category == "isolate":
                    score += 10
                # Penalize high calorie products
                if product.get("calories_per_serving", 0) > 200:
                    score -= 15
            elif preferences.fitness_goal == FitnessGoal.LEAN_MUSCLE:
                if category == "isolate":
                    score += 10
        
        # Dietary preference matching (30 points)
        if preferences.dietary_preference and preferences.dietary_preference != DietaryPreference.NONE:
            dietary_map = {
                DietaryPreference.VEGAN: "vegan",
                DietaryPreference.VEGETARIAN: "vegetarian",
                DietaryPreference.LACTOSE_FREE: "lactose_free",
                DietaryPreference.GLUTEN_FREE: "gluten_free",
                DietaryPreference.HALAL: "halal"
            }
            dietary_str = dietary_map.get(preferences.dietary_preference)
            dietary_info = product.get("dietary_info", [])
            
            if preferences.dietary_preference == DietaryPreference.VEGAN:
                if "vegan" in dietary_info:
                    score += 30
                else:
                    return -1  # Exclude non-vegan products
            elif preferences.dietary_preference == DietaryPreference.VEGETARIAN:
                if "vegetarian" in dietary_info or "vegan" in dietary_info:
                    score += 30
                # Most whey products are vegetarian by default
                elif product.get("category") in ["whey_protein", "isolate", "casein"]:
                    score += 20
            elif dietary_str and dietary_str in dietary_info:
                score += 30
        
        # Flavor preference matching (15 points)
        if preferences.flavor_preference:
            flavor_map = {
                FlavorPreference.CHOCOLATE: "chocolate",
                FlavorPreference.VANILLA: "vanilla",
                FlavorPreference.STRAWBERRY: "strawberry",
                FlavorPreference.BANANA: "banana",
                FlavorPreference.COOKIES_CREAM: "cookies_cream",
                FlavorPreference.UNFLAVORED: "unflavored"
            }
            flavor_str = flavor_map.get(preferences.flavor_preference)
            if flavor_str and flavor_str in product.get("flavors", []):
                score += 15
        
        # Budget consideration (10 points)
        if preferences.budget_range:
            price = product.get("price", 0)
            if preferences.budget_range == "low" and price <= 40:
                score += 10
            elif preferences.budget_range == "medium" and 40 < price <= 55:
                score += 10
            elif preferences.budget_range == "high" and price > 55:
                score += 10
        
        # Rating bonus (5 points)
        rating = product.get("rating", 0)
        score += (rating / 5) * 5
        
        # Allergy check - exclude products with allergens
        if preferences.allergies:
            for allergy in preferences.allergies:
                allergy_lower = allergy.lower()
                if allergy_lower == "lactose" and "lactose_free" not in product.get("dietary_info", []):
                    if product.get("category") not in ["plant_based"]:
                        return -1
                if allergy_lower == "gluten" and "gluten_free" not in product.get("dietary_info", []):
                    return -1
        
        return min(score, max_score)
    
    def get_recommendations(self, preferences: UserPreferences, limit: int = 5) -> List[Dict]:
        """Get product recommendations based on user preferences."""
        scored_products = []
        
        for product in self.products:
            score = self.calculate_score(product, preferences)
            if score >= 0:  # Exclude products with negative scores (filtered out)
                scored_products.append({
                    **product,
                    "match_score": round(score, 2)
                })
        
        # Sort by score descending
        scored_products.sort(key=lambda x: x["match_score"], reverse=True)
        
        return scored_products[:limit]
    
    def get_recommendation_explanation(self, product: Dict, preferences: UserPreferences) -> str:
        """Generate an explanation for why this product was recommended."""
        reasons = []
        
        if preferences.fitness_goal:
            goal_names = {
                FitnessGoal.MUSCLE_GAIN: "muscle gain",
                FitnessGoal.WEIGHT_LOSS: "weight loss",
                FitnessGoal.LEAN_MUSCLE: "lean muscle building",
                FitnessGoal.MASS_GAIN: "mass gain",
                FitnessGoal.MAINTENANCE: "maintenance",
                FitnessGoal.RECOVERY: "recovery"
            }
            goal_name = goal_names.get(preferences.fitness_goal, "")
            if goal_name:
                reasons.append(f"great for {goal_name}")
        
        if preferences.dietary_preference and preferences.dietary_preference != DietaryPreference.NONE:
            reasons.append(f"meets your {preferences.dietary_preference.value.replace('_', ' ')} requirements")
        
        if product.get("rating", 0) >= 4.5:
            reasons.append("highly rated by customers")
        
        protein = product.get("protein_per_serving", 0)
        if protein >= 24:
            reasons.append(f"provides {protein}g protein per serving")
        
        if not reasons:
            reasons.append("matches your preferences")
        
        return f"This product is {', '.join(reasons)}."


recommendation_engine = RecommendationEngine()
