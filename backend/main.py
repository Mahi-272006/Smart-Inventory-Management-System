import os
import requests
from fastapi import FastAPI
from postgrest import SyncPostgrestClient 
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import time
import os
import uvicorn
from datetime import datetime, timedelta

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. SETUP VARIABLES
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
NEWS_API_KEY = os.environ.get("NEWS_API_KEY")

# REFINED GLOBAL STATE: Tracks multipliers for each category independently
current_market_impact = {
    "General": 1.0,
    "Electronics": 1.0,
    "Furniture": 1.0,
    "multiplier": 1.0, # Average for global display
    "sentiment": "Stable",
    "articles": [],
    "count": 0
}

db = SyncPostgrestClient(f"{url}/rest/v1", headers={"apikey": key, "Authorization": f"Bearer {key}"})

# 2. DATA MODELS
class ProductCreate(BaseModel):
    name: str
    stock_level: int
    category: str
    price: float
    min_stock_threshold: int

class ProductUpdate(BaseModel):
    name: str = None
    stock_level: int = None
    category: str = None
    price: float = None
    avg_daily_sales: float = None  # Manual override for AI velocity
    min_stock_threshold: int = None
    lead_time_days: int = None

# 3. ROUTES

@app.get("/products")
def get_products():
    try:
        # Calculate the timestamp for 7 days ago
        seven_days_ago = (datetime.now() - timedelta(days=7)).isoformat()
        # 1. Fetch all products
        response = db.table("products").select("*").execute()
        
        products = response.data if response.data else []

        
        # Updated Step 2: Fetch ONLY sales from the last 7 days
        sales_response = db.table("sales_log") \
            .select("*") \
            .gte("created_at", seven_days_ago) \
            .execute()
        all_sales = sales_response.data or []

        for item in products:
            # Stats from product table
            stock = item.get('stock_level', 0)
            manual_avg = item.get('avg_daily_sales', 0.1)
            lead_time = item.get('lead_time_days', 3)
            
            # Filter sales for THIS specific product from our bulk list
            product_sales = [s for s in all_sales if s['product_id'] == item['id']]
            total_sales_7d = sum(s.get('quantity_sold', 0) for s in product_sales)
            recorded_velocity = total_sales_7d / 7
            
            # HYBRID LOGIC
            velocity_to_use = max(recorded_velocity, manual_avg, 0.01)
            
            # AI IMPACT
            item_cat = item.get('category', 'General')
            multiplier = current_market_impact.get(item_cat, 1.0)
            ai_vel = velocity_to_use * multiplier

            # MATH
            item['user_runway'] = round(stock / velocity_to_use) if velocity_to_use > 0 else 0
            item['ai_runway'] = round(stock / ai_vel) if ai_vel > 0 else 0
            item['target_stock'] = round(ai_vel * (30 + lead_time))
            item['stock_gap'] = max(0, item['target_stock'] - stock)
            
            # PRIORITY
            if item['ai_runway'] <= lead_time: item['ai_priority'] = "CRITICAL (DELAY)"
            elif item['ai_runway'] < 10: item['ai_priority'] = "URGENT"
            else: item['ai_priority'] = "STABLE"

            item['intelligence'] = {"multiplier": multiplier}

        return products 
    except Exception as e:
        print(f"CRITICAL ERROR: {e}")
        return []
    
@app.put("/update-product/{product_id}")
def update_product(product_id: int, updates: ProductUpdate):
    try:
        # exclude_unset=True prevents sending 'None' values to Supabase
        update_data = updates.dict(exclude_unset=True)
        
        if not update_data:
            return {"error": "No data provided"}

        # Perform the update
        response = db.table("products").update(update_data).eq("id", product_id).execute()
        
        print(f"✅ Product {product_id} updated: {update_data}")
        return {"status": "success", "data": response.data}
    except Exception as e:
        print(f"❌ Edit Error: {e}")
        return {"error": str(e)}
    

@app.get("/market-news")
def get_universal_market_news():
    global current_market_impact
    try:
        # 1. DYNAMIC CATEGORY EXTRACTION
        # Finds every unique category in your 457 products automatically
        db_res = db.table("products").select("category").execute()
        active_categories = list(set([p['category'] for p in db_res.data if p.get('category')]))

        # 2. FETCH NEWS (Always works, no rate limits here)
        indian_context = "India economy retail demand "
        category_string = " OR ".join(active_categories[:3]) # Searches for specific categories in India
        # The AI looks at all your unique categories automatically
        search_query = f"({indian_context}) AND ({category_string})"

        # We use the 'everything' endpoint but sort by 'relevancy'
        url = (
            f"https://newsapi.org/v2/everything?q={search_query}"
            f"&domains=economictimes.indiatimes.com,livemint.com,business-standard.com"
            f"&language=en&sortBy=relevancy&pageSize=15&apiKey={NEWS_API_KEY}"
        )
        response = requests.get(url).json()
        articles = response.get("articles", [])

        if not articles: 
            return current_market_impact

        # These keywords are used to 'score' the news text locally
        # 3. INDIAN MARKET SENTIMENT DICTIONARY
        keywords = {
            "Positive": [
                "growth", "surge", "boom", "festive season", "diwali sales", 
                "budget boost", "expansion", "rbi rate cut", "gst relief", "high demand",
                "trending," "viral," "fashion-forward," "consumer preference"
            ],
            "Negative": [
                "slowdown", "inflation", "supply crunch", "monsoon deficit", 
                "rbi rate hike", "spending drop", "economic contraction", "tax hike"
                "outdated," "declining interest," "overstock"
            ]
        }

        # Storage for category scores
        scores = {cat: [] for cat in active_categories}
        scores["General"] = []

        # 4. LOCAL KEYWORD ANALYSIS
        for art in articles:
            text = (art['title'] + " " + (art['description'] or "")).lower()
            
            # Calculate base sentiment for this article
            sentiment = 1.0
            # Macro-economic weight: If the news is about the general economy, it carries more weight
            macro_multiplier = 1.3 if any(x in text for x in ["rbi", "economy", "gdp", "inflation"]) else 1.0
            if any(w in text for w in keywords["Positive"]): sentiment = 1.6*macro_multiplier
            elif any(w in text for w in keywords["Negative"]): sentiment = 0.6/macro_multiplier

            # Check which category this news belongs to
            matched = False
            for cat in active_categories:
                if cat.lower() in text:
                    scores[cat].append(sentiment)
                    matched = True
            
            if not matched:
                scores["General"].append(sentiment)

        # 5. CALCULATE MULTIPLIERS
        def calc_avg(s_list): return round(sum(s_list)/len(s_list), 2) if s_list else 1.0

        category_impacts = {cat: calc_avg(scores[cat]) for cat in active_categories}
        
        # Calculate Global Multiplier
        all_vals = [v for sublist in scores.values() for v in sublist]
        global_avg = round(sum(all_vals)/len(all_vals), 2) if all_vals else 1.0

        # Update the Global State for your Dashboard
        current_market_impact = {
            **category_impacts,
            "General": calc_avg(scores["General"]),
            "multiplier": global_avg,
            "sentiment": "Strong Growth" if global_avg > 1.2 else "Stable" if global_avg > 0.8 else "Contraction",
            "articles": articles,
            "count": len(articles)
        }
        
        print(f"✅ Market Analysis Updated (Local Keywords: {len(active_categories)} Categories)")
        return current_market_impact

    except Exception as e:
        print(f"❌ Error in Market News: {e}")
        return current_market_impact
    
# Updated Sell route in main.py
@app.post("/sell-product/{product_id}")
def sell_product(product_id: int, quantity: int = 1): # Added quantity parameter
    try:
        # 1. Fetch current stock
        res = db.table("products").select("stock_level").eq("id", product_id).execute()
        if not res.data: return {"error": "Product not found"}
        
        current_stock = res.data[0]['stock_level']
        
        # 2. Subtract the bulk quantity
        new_stock = max(0, current_stock - quantity)
        db.table("products").update({"stock_level": new_stock}).eq("id", product_id).execute()
        
        # 3. LOG THE BULK SALE: The AI needs this total to know demand is high
        db.table("sales_log").insert({
            "product_id": product_id, 
            "quantity_sold": quantity 
        }).execute()
        
        return {"status": "success", "new_stock": new_stock}
    except Exception as e:
        return {"error": str(e)}

@app.post("/add-product")
def add_product(item: ProductCreate):
    try:
        new_row = {
            "name": item.name, 
            "stock_level": item.stock_level,
            "category": item.category,
            "price": item.price,
            "min_stock_threshold": item.min_stock_threshold
        }
        response = db.table("products").insert(new_row).execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        return {"error": str(e)}

@app.get("/alerts")
def get_alerts():
    try:
        response = db.table("products").select("*").execute()
        products = response.data or []
        critical_alerts = []
        
        for item in products:
            # Get real velocity
            sales_res = db.table("sales_log").select("quantity_sold").eq("product_id", item['id']).execute()
            total_sold = sum(s.get('quantity_sold', 0) for s in (sales_res.data or []))
            base_vel = max(0.1, total_sold / 7)
            
            # Category-specific multiplier
            item_cat = item.get('category', 'General')
            cat_multiplier = current_market_impact.get(item_cat, 1.0)
            
            ai_vel = base_vel * cat_multiplier
            stock = item.get('stock_level', 0)
            days_left = round(stock / ai_vel) if ai_vel > 0 else 99
            
            if days_left <= 5:
                critical_alerts.append({
                    "name": item.get('name'),
                    "message": f"CRITICAL: {item.get('name')} only has {days_left} days left!"
                })
        return critical_alerts
    except Exception as e:
        return []
    
@app.delete("/delete-product/{product_id}")
def delete_product(product_id: int):
    try:
        # 1. First, delete all sales associated with this product
        db.table("sales_log").delete().eq("product_id", product_id).execute()
        
        # 2. Now that the logs are gone, delete the actual product
        db.table("products").delete().eq("id", product_id).execute()
        
        print(f"✅ Product {product_id} and its sales history deleted.")
        return {"status": "success"}
    except Exception as e:
        print(f"❌ Delete Error: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)