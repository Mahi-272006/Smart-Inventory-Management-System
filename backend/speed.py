import random
import os
import requests
import json
import time

# 1. Setup Credentials
# Make sure these are set in your terminal or replace with strings for a quick test
url = "https://nlyvivelvwbzskefxxob.supabase.co"
key = "sb_publishable_48VH2B_KCbR70N01jrwXlA_zWoK0HMH"

# Ensure the URL is the REST endpoint
# If your URL is 'https://xyz.supabase.co', this makes it 'https://xyz.supabase.co/rest/v1/products'
api_url = f"{url.rstrip('/')}/rest/v1/products"

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

# 2. Prepare 100 Products
categories = ["Electronics", "Furniture", "Clothing", "General"]
test_products = []

print("🚀 Preparing 100 high-intelligence test cases...")

# Use the current time to ensure names are always unique
timestamp = int(time.time())

for i in range(100):
    test_products.append({
        # Adding a timestamp makes the name unique every time you run it
        "name": f"Product-{timestamp}-{i}", 
        "category": random.choice(categories),
        "stock_level": random.randint(0, 150),
        "avg_daily_sales": round(random.uniform(0.5, 4.0), 2),
        "lead_time_days": random.randint(2, 12)
    })

# 3. Direct Injection via POST request
try:
    # We send the data in two batches of 50 to ensure Supabase doesn't timeout
    for i in range(0, 100, 50):
        batch = test_products[i:i+50]
        response = requests.post(api_url, headers=headers, data=json.dumps(batch))
        response.raise_for_status()
    
    print("✅ Success: 100 diverse products injected directly into Supabase!")
    print("🔗 Open your Dashboard to see the new Data Cloud.")

except Exception as e:
    print(f"❌ Error during injection: {e}")
    if hasattr(e, 'response') and e.response is not None:
        print(f"Details: {e.response.text}")