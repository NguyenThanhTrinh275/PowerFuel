from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from app.data.products import get_all_products, get_product_by_id, get_products_by_category, get_products_by_goal

router = APIRouter(prefix="/api/products", tags=["Products"])

@router.get("/")
async def list_products(
    category: Optional[str] = Query(None, description="Filter by category: whey_protein, mass_gainer, isolate, casein, plant_based"),
    goal: Optional[str] = Query(None, description="Filter by fitness goal: muscle_gain, weight_loss, lean_muscle, mass_gain, maintenance, recovery"),
    min_price: Optional[float] = Query(None, description="Minimum price"),
    max_price: Optional[float] = Query(None, description="Maximum price"),
    min_protein: Optional[float] = Query(None, description="Minimum protein per serving")
):
    """
    Get all products with optional filters.
    """
    products = get_all_products()
    
    if category:
        products = [p for p in products if p["category"] == category]
    
    if goal:
        products = [p for p in products if goal in p["best_for"]]
    
    if min_price is not None:
        products = [p for p in products if p["price"] >= min_price]
    
    if max_price is not None:
        products = [p for p in products if p["price"] <= max_price]
    
    if min_protein is not None:
        products = [p for p in products if p["protein_per_serving"] >= min_protein]
    
    return {
        "success": True,
        "products": products,
        "total": len(products)
    }

@router.get("/categories")
async def get_categories():
    """
    Get all available product categories.
    """
    return {
        "categories": [
            {"id": "whey_protein", "name": "Whey Protein", "description": "Fast-absorbing protein for muscle building"},
            {"id": "mass_gainer", "name": "Mass Gainer", "description": "High-calorie protein for weight gain"},
            {"id": "isolate", "name": "Whey Isolate", "description": "Pure protein with minimal carbs and fat"},
            {"id": "casein", "name": "Casein Protein", "description": "Slow-release protein for overnight recovery"},
            {"id": "plant_based", "name": "Plant-Based Protein", "description": "Vegan-friendly protein options"}
        ]
    }

@router.get("/goals")
async def get_fitness_goals():
    """
    Get all supported fitness goals.
    """
    return {
        "goals": [
            {"id": "muscle_gain", "name": "Muscle Gain", "description": "Build muscle mass and strength"},
            {"id": "weight_loss", "name": "Weight Loss", "description": "Lose fat while preserving muscle"},
            {"id": "lean_muscle", "name": "Lean Muscle", "description": "Build lean, defined muscle"},
            {"id": "mass_gain", "name": "Mass Gain", "description": "Maximum weight and size gain"},
            {"id": "maintenance", "name": "Maintenance", "description": "Maintain current physique"},
            {"id": "recovery", "name": "Recovery", "description": "Optimize post-workout recovery"}
        ]
    }

@router.get("/{product_id}")
async def get_product(product_id: str):
    """
    Get a specific product by ID.
    """
    product = get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {
        "success": True,
        "product": product
    }
